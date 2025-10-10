// API routes for Mr Bubbles Express
// Reference: Postman collection and business requirements
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { signUpSchema, signInSchema, hashPassword, verifyPassword } from "./auth";
import { z } from "zod";

// ============= VALIDATION SCHEMAS =============

const orderStateSchema = z.enum([
  'created', 'confirmed', 'picked_up', 'at_origin_shop', 'subcontracted',
  'at_processing_shop', 'washing', 'drying', 'pressing', 'qc', 'packed',
  'out_for_delivery', 'delivered', 'closed'
]);

const createOrderSchema = z.object({
  customer: z.object({
    id: z.string().optional(),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    eircode: z.string().optional(),
  }),
  services: z.array(z.object({
    service_id: z.string(),
    quantity: z.number().positive(),
  })),
  payment_method: z.enum(['card', 'cash', 'account']),
  notes: z.string().optional(),
});

const createBagsSchema = z.object({
  bags: z.array(z.object({
    seq: z.number().int().positive(),
  })),
});

const createScanSchema = z.object({
  type: z.enum(['pickup', 'handoff.to_shop', 'handoff.to_processing', 'intake', 'qc', 'pack', 'handoff.to_driver', 'delivery']),
  order_id: z.string().optional(),
  bag_id: z.string().optional(),
  from_party: z.object({
    type: z.string(),
    id: z.string(),
  }).optional(),
  to_party: z.object({
    type: z.string(),
    id: z.string(),
  }).optional(),
  geo: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  weight_kg: z.number().optional(),
  notes: z.string().optional(),
});

const createSubcontractSchema = z.object({
  to_shop_id: z.string(),
  terms: z.object({
    processing_pct: z.number().min(0).max(1),
    sla_hours: z.number().int().positive().optional(),
  }),
});

const createPolicySchema = z.object({
  name: z.string(),
  version: z.string(),
  policy_json: z.object({
    currency: z.string(),
    default: z.object({
      origin_shop_pct: z.number(),
      processing_shop_pct: z.number(),
      driver_pct: z.number(),
      platform_pct: z.number(),
    }),
    caps: z.object({
      platform_min_cents: z.number().optional(),
    }).optional(),
    rounding: z.string().optional(),
  }),
});

// ============= HELPER FUNCTIONS =============

function validateOrderStateTransition(currentState: string, newState: string): boolean {
  const validTransitions: Record<string, string[]> = {
    'created': ['confirmed'],
    'confirmed': ['picked_up'],
    'picked_up': ['at_origin_shop'],
    'at_origin_shop': ['subcontracted', 'washing', 'at_processing_shop'],
    'subcontracted': ['at_processing_shop'],
    'at_processing_shop': ['washing'],
    'washing': ['drying'],
    'drying': ['pressing'],
    'pressing': ['qc'],
    'qc': ['packed'],
    'packed': ['out_for_delivery'],
    'out_for_delivery': ['delivered'],
    'delivered': ['closed'],
  };
  
  return validTransitions[currentState]?.includes(newState) || false;
}

// VAT rate for Ireland (23%)
const VAT_RATE = 0.23;

async function calculateOrderPricing(services: Array<{ service_id: string; quantity: number }>) {
  let subtotalCents = 0;
  
  for (const svc of services) {
    const service = await storage.getServiceByServiceId(svc.service_id);
    if (!service) {
      throw new Error(`Service not found: ${svc.service_id}`);
    }
    
    const unitPriceCents = Math.round(parseFloat(service.pricePerUnit) * 100);
    const itemTotalCents = Math.round(unitPriceCents * svc.quantity);
    subtotalCents += itemTotalCents;
  }
  
  const vatCents = Math.round(subtotalCents * VAT_RATE);
  const totalCents = subtotalCents + vatCents;
  
  return { subtotalCents, vatCents, totalCents };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // ============= AUTH ROUTES =============
  
  // Allow unauthenticated access to check login state
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ============= ORDER ROUTES =============
  
  // Create order (public endpoint for booking widget)
  app.post("/api/orders", async (req, res) => {
    try {
      const data = createOrderSchema.parse(req.body);

      // Calculate pricing
      const { subtotalCents, vatCents, totalCents } = await calculateOrderPricing(data.services);

      // Get or create customer
      let customerId = data.customer.id;
      if (!customerId) {
        // For public bookings, create a customer record
        const customer = await storage.upsertUser({
          email: data.customer.email,
          role: 'customer',
        });
        customerId = customer.id;
      }

      const order = await storage.createOrder({
        customerId,
        addressLine1: data.address.line1,
        addressLine2: data.address.line2 || null,
        city: data.address.city,
        eircode: data.address.eircode || null,
        state: 'created',
        paymentMethod: data.payment_method,
        notes: data.notes || null,
        subtotalCents,
        vatCents,
        totalCents,
        currency: 'EUR',
      });

      // Create order service records
      for (const svc of data.services) {
        const service = await storage.getServiceByServiceId(svc.service_id);
        if (service) {
          const unitPriceCents = Math.round(parseFloat(service.pricePerUnit) * 100);
          const itemTotalCents = Math.round(unitPriceCents * svc.quantity);
          
          await storage.createOrderService({
            orderId: order.id,
            serviceId: service.id,
            quantity: svc.quantity.toString(),
            unitPrice: service.pricePerUnit,
            totalCents: itemTotalCents,
          });
        }
      }

      res.json(order);
    } catch (error: any) {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Confirm order
  app.post("/api/orders/:id/confirm", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'shop' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Shop or Admin access required" });
      }

      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (!validateOrderStateTransition(order.state, 'confirmed')) {
        return res.status(400).json({ message: `Cannot transition from ${order.state} to confirmed` });
      }
      
      const updatedOrder = await storage.updateOrderState(req.params.id, 'confirmed');
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update order state
  app.patch("/api/orders/:id/state", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'shop' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Shop or Admin access required" });
      }

      const { state } = z.object({ state: orderStateSchema }).parse(req.body);
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (!validateOrderStateTransition(order.state, state)) {
        return res.status(400).json({ message: `Invalid state transition from ${order.state} to ${state}` });
      }
      
      const updatedOrder = await storage.updateOrderState(req.params.id, state);
      res.json(updatedOrder);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // ============= BAG ROUTES =============
  
  // Create bags for an order
  app.post("/api/orders/:id/bags", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'shop' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Shop or Admin access required" });
      }

      const data = createBagsSchema.parse(req.body);
      const orderId = req.params.id;

      const createdBags = [];
      for (const bagData of data.bags) {
        const bag = await storage.createBag({
          orderId,
          sequence: bagData.seq,
          qrCode: `mrbl://b/${orderId}/${bagData.seq}`,
          labelPrinted: false,
        });
        createdBags.push(bag);
      }

      res.json({ bags: createdBags });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // ============= SCAN ROUTES =============
  
  // Create scan event
  app.post("/api/scan", isAuthenticated, async (req: any, res) => {
    try {
      const data = createScanSchema.parse(req.body);
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      // Role-based scan authorization
      const allowedScansByRole: Record<string, string[]> = {
        'driver': ['pickup', 'delivery', 'handoff.to_shop', 'handoff.to_driver'],
        'shop': ['intake', 'qc', 'pack', 'handoff.to_shop', 'handoff.to_processing', 'handoff.to_driver'],
        'admin': ['pickup', 'handoff.to_shop', 'handoff.to_processing', 'intake', 'qc', 'pack', 'handoff.to_driver', 'delivery'],
        'customer': [], // Customers cannot perform scans
      };

      const userRole = user?.role || 'customer';
      const allowedScans = allowedScansByRole[userRole] || [];

      if (!allowedScans.includes(data.type)) {
        return res.status(403).json({ 
          message: `Forbidden: ${userRole} role cannot perform ${data.type} scans` 
        });
      }

      const scan = await storage.createScan({
        type: data.type as any,
        orderId: data.order_id || null,
        bagId: data.bag_id || null,
        scannedBy: userId,
        scannedByRole: user?.role || 'customer',
        latitude: data.geo?.lat ? data.geo.lat.toString() : null,
        longitude: data.geo?.lng ? data.geo.lng.toString() : null,
        fromPartyType: data.from_party?.type || null,
        fromPartyId: data.from_party?.id || null,
        toPartyType: data.to_party?.type || null,
        toPartyId: data.to_party?.id || null,
        notes: data.notes || null,
      });

      // Update order state based on scan type (only for authorized roles)
      if (data.order_id) {
        const order = await storage.getOrder(data.order_id);
        if (order) {
          let newState = null;
          if (data.type === 'handoff.to_shop' && validateOrderStateTransition(order.state, 'at_origin_shop')) {
            newState = 'at_origin_shop';
          }
          if (data.type === 'intake' && validateOrderStateTransition(order.state, 'at_origin_shop')) {
            newState = 'at_origin_shop';
          }
          if (data.type === 'pickup' && validateOrderStateTransition(order.state, 'picked_up')) {
            newState = 'picked_up';
          }
          if (data.type === 'delivery' && validateOrderStateTransition(order.state, 'delivered')) {
            newState = 'delivered';
          }

          if (newState) {
            await storage.updateOrderState(data.order_id, newState);
          }
        }
      }

      res.json(scan);
    } catch (error: any) {
      console.error("Error creating scan:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // ============= SUBCONTRACT ROUTES =============
  
  // Create subcontract
  app.post("/api/orders/:id/subcontract", isAuthenticated, async (req, res) => {
    try {
      const data = createSubcontractSchema.parse(req.body);
      const orderId = req.params.id;

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (!validateOrderStateTransition(order.state, 'subcontracted')) {
        return res.status(400).json({ message: `Cannot subcontract from state ${order.state}` });
      }

      const subcontract = await storage.createSubcontract({
        orderId,
        fromShopId: order.originShopId || '',
        toShopId: data.to_shop_id,
        processingPct: data.terms.processing_pct.toString(),
        slaHours: data.terms.sla_hours || null,
      });

      await storage.updateOrderState(orderId, 'subcontracted');

      res.json(subcontract);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // ============= SPLIT ROUTES =============
  
  // Calculate splits
  app.post("/api/splits/calculate", isAuthenticated, async (req, res) => {
    try {
      const { order_id } = req.query;
      if (!order_id || typeof order_id !== 'string') {
        return res.status(400).json({ message: "order_id is required" });
      }

      const policy = await storage.getActiveSplitPolicy();
      if (!policy) {
        return res.status(404).json({ message: "No active split policy found" });
      }

      const split = await storage.calculateSplit(order_id, policy.id);
      res.json(split);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= INVOICE ROUTES =============
  
  // Create invoice
  app.post("/api/orders/:id/invoice", isAuthenticated, async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const invoiceNumber = `INV-${Date.now()}-${orderId.slice(0, 8)}`;

      const invoice = await storage.createInvoice({
        orderId,
        invoiceNumber,
        subtotalCents: order.subtotalCents || 0,
        vatCents: order.vatCents || 0,
        totalCents: order.totalCents || 0,
        currency: order.currency || 'EUR',
        pdfUrl: null,
      });

      res.json(invoice);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= POLICY ROUTES (Admin) =============
  
  // Upload split policy
  app.post("/api/policies/split", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const data = createPolicySchema.parse(req.body);

      const policy = await storage.createSplitPolicy({
        name: data.name,
        version: data.version,
        policyJson: data.policy_json,
        isActive: true,
      });

      res.json(policy);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Get all policies
  app.get("/api/policies/split", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const policies = await storage.getAllSplitPolicies();
      res.json(policies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= AUDIT ROUTES (Admin) =============
  
  // Audit search
  app.get("/api/audit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin' && user?.role !== 'shop') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { entity_type, entity_id } = req.query;

      if (entity_type === 'order' && entity_id) {
        const scans = await storage.getScansByOrder(entity_id as string);
        res.json(scans);
      } else {
        res.json([]);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= CUSTOMER ROUTES =============
  
  // Get customer orders
  app.get("/api/customer/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrdersByCustomer(userId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= DRIVER ROUTES =============
  
  // Get driver orders
  app.get("/api/driver/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'driver') {
        return res.status(403).json({ message: "Forbidden: Driver access required" });
      }

      // Get all orders that need pickup or delivery
      const allOrders = await storage.getAllOrders();
      const driverOrders = allOrders.filter(o => 
        o.state === 'confirmed' || o.state === 'packed' || o.state === 'out_for_delivery' || o.state === 'delivered'
      );
      res.json(driverOrders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= SERVICE ROUTES =============
  
  // Get all services (public endpoint for booking)
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= SHOP ROUTES =============
  
  // Get orders for shop
  app.get("/api/shop/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'shop') {
        return res.status(403).json({ message: "Forbidden: Shop access required" });
      }

      const shopId = user.shopId;
      if (!shopId) {
        return res.status(400).json({ message: "User not associated with a shop" });
      }

      const orders = await storage.getOrdersByShop(shopId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= ADMIN ROUTES =============
  
  // Get all orders (admin)
  app.get("/api/admin/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all users (admin)
  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all splits (admin)
  app.get("/api/admin/splits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const splits = await storage.getAllSplits();
      res.json(splits);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= AUTHENTICATION ROUTES (Email/Password) =============
  
  // Sign up with email/password
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validation = signUpSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed",
          errors: validation.error.errors 
        });
      }

      const { email, username, phone, password, firstName, lastName, role } = validation.data;

      // Check if user already exists
      if (email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          return res.status(409).json({ message: "Email already registered" });
        }
      }
      if (username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          return res.status(409).json({ message: "Username already taken" });
        }
      }
      if (phone) {
        const existingUser = await storage.getUserByPhone(phone);
        if (existingUser) {
          return res.status(409).json({ message: "Phone number already registered" });
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const newUser = await storage.createUser({
        email: email || undefined,
        username: username || undefined,
        phone: phone || undefined,
        firstName,
        lastName,
        hashedPassword,
        role: role as any,
      });

      // Create session
      (req as any).session.user = {
        claims: {
          sub: newUser.id,
          email: newUser.email || newUser.username,
          first_name: newUser.firstName,
          last_name: newUser.lastName,
        }
      };

      res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        phone: newUser.phone,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Sign in with email/username/phone
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const validation = signInSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed",
          errors: validation.error.errors 
        });
      }

      const { identifier, password, role } = validation.data;

      // Find user by email, username, or phone
      const user = await storage.getUserByIdentifier(identifier);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user has password (might be Replit Auth user)
      if (!user.hashedPassword) {
        return res.status(401).json({ message: "Please use Replit sign-in" });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.hashedPassword);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check role matches
      if (user.role !== role) {
        return res.status(403).json({ message: `This account is registered as ${user.role}` });
      }

      // Create session
      (req as any).session.user = {
        claims: {
          sub: user.id,
          email: user.email || user.username,
          first_name: user.firstName,
          last_name: user.lastName,
        }
      };

      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
