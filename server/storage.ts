// Database storage implementation for Mr Bubbles Express
// Reference: javascript_database and javascript_log_in_with_replit blueprints
import {
  users,
  orders,
  bags,
  items,
  scans,
  services,
  shops,
  subcontracts,
  splitPolicies,
  splits,
  invoices,
  orderServices,
  type User,
  type UpsertUser,
  type Order,
  type InsertOrder,
  type Bag,
  type InsertBag,
  type Scan,
  type InsertScan,
  type Service,
  type InsertService,
  type Shop,
  type InsertShop,
  type Subcontract,
  type InsertSubcontract,
  type SplitPolicy,
  type Split,
  type Invoice,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (supports both Replit Auth and email/password)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>; // Email, username, or phone
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  
  // Driver availability operations
  getActiveDrivers(): Promise<User[]>;
  updateDriverAvailability(driverId: string, isActive: boolean, latitude?: number, longitude?: number): Promise<User>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByShop(shopId: string): Promise<Order[]>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrdersByDriver(driverId: string): Promise<Order[]>;
  getAvailableOrdersForDriver(): Promise<Order[]>;
  assignOrderToDriver(orderId: string, driverId: string): Promise<Order>;
  updateOrderState(id: string, state: string): Promise<Order>;

  // Bag operations
  createBag(bag: InsertBag): Promise<Bag>;
  getBagsByOrder(orderId: string): Promise<Bag[]>;

  // Scan operations
  createScan(scan: InsertScan): Promise<Scan>;
  getScansByOrder(orderId: string): Promise<Scan[]>;

  // Service operations
  createService(service: InsertService): Promise<Service>;
  getAllServices(): Promise<Service[]>;
  getServiceByServiceId(serviceId: string): Promise<Service | undefined>;

  // Order Service operations
  createOrderService(orderService: Omit<typeof orderServices.$inferInsert, 'id' | 'createdAt'>): Promise<typeof orderServices.$inferSelect>;

  // Shop operations
  createShop(shop: InsertShop): Promise<Shop>;
  getAllShops(): Promise<Shop[]>;

  // Subcontract operations
  createSubcontract(subcontract: InsertSubcontract): Promise<Subcontract>;
  getSubcontractsByOrder(orderId: string): Promise<Subcontract[]>;

  // Split policy operations
  createSplitPolicy(policy: Omit<SplitPolicy, 'id' | 'createdAt'>): Promise<SplitPolicy>;
  getAllSplitPolicies(): Promise<SplitPolicy[]>;
  getActiveSplitPolicy(): Promise<SplitPolicy | undefined>;

  // Split operations
  calculateSplit(orderId: string, policyId: string): Promise<Split>;
  getSplitsByOrder(orderId: string): Promise<Split[]>;
  getAllSplits(): Promise<Split[]>;

  // Invoice operations
  createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice>;
  getInvoiceByOrder(orderId: string): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (supports both Replit Auth and email/password)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    // Try to find by email, username, or phone
    let user = await this.getUserByEmail(identifier);
    if (!user) user = await this.getUserByUsername(identifier);
    if (!user) user = await this.getUserByPhone(identifier);
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // If email is provided, check for existing user by email first
    if (userData.email) {
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        // Update existing user
        const [updated] = await db
          .update(users)
          .set({
            ...userData,
            updatedAt: new Date(),
          })
          .where(eq(users.email, userData.email))
          .returning();
        return updated;
      }
    }

    // If id is provided, try conflict on id
    if (userData.id) {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    }

    // Otherwise, just insert
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Driver availability operations
  async getActiveDrivers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(
        eq(users.role, 'driver'),
        eq(users.isActive, true)
      ))
      .orderBy(desc(users.lastActiveAt));
  }

  async updateDriverAvailability(
    driverId: string,
    isActive: boolean,
    latitude?: number,
    longitude?: number
  ): Promise<User> {
    const updates: Partial<UpsertUser> = {
      isActive,
      lastActiveAt: new Date(),
    };

    if (latitude !== undefined) {
      updates.currentLatitude = latitude.toString();
    }
    if (longitude !== undefined) {
      updates.currentLongitude = longitude.toString();
    }

    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, driverId))
      .returning();
    return user;
  }

  // Order operations
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByShop(shopId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.originShopId, shopId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByDriver(driverId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.driverId, driverId))
      .orderBy(desc(orders.createdAt));
  }

  async getAvailableOrdersForDriver(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(and(
        eq(orders.state, 'confirmed'),
        isNull(orders.driverId)
      ))
      .orderBy(desc(orders.createdAt));
  }

  async assignOrderToDriver(orderId: string, driverId: string): Promise<Order> {
    // Use conditional update to prevent race conditions
    const [order] = await db
      .update(orders)
      .set({ driverId, updatedAt: new Date() })
      .where(and(
        eq(orders.id, orderId),
        isNull(orders.driverId) // Only assign if no driver is assigned yet
      ))
      .returning();
    
    if (!order) {
      throw new Error("Order not available - already assigned or not found");
    }
    
    return order;
  }

  async updateOrderState(id: string, state: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ state: state as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Bag operations
  async createBag(bagData: InsertBag): Promise<Bag> {
    const [bag] = await db.insert(bags).values(bagData).returning();
    return bag;
  }

  async getBagsByOrder(orderId: string): Promise<Bag[]> {
    return await db.select().from(bags).where(eq(bags.orderId, orderId));
  }

  // Scan operations
  async createScan(scanData: InsertScan): Promise<Scan> {
    const [scan] = await db.insert(scans).values(scanData).returning();
    return scan;
  }

  async getScansByOrder(orderId: string): Promise<Scan[]> {
    return await db.select().from(scans).where(eq(scans.orderId, orderId)).orderBy(desc(scans.createdAt));
  }

  // Service operations
  async createService(serviceData: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(serviceData).returning();
    return service;
  }

  async getAllServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getServiceByServiceId(serviceId: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.serviceId, serviceId));
    return service;
  }

  // Order Service operations
  async createOrderService(orderServiceData: Omit<typeof orderServices.$inferInsert, 'id' | 'createdAt'>): Promise<typeof orderServices.$inferSelect> {
    const [orderService] = await db.insert(orderServices).values(orderServiceData).returning();
    return orderService;
  }

  // Shop operations
  async createShop(shopData: InsertShop): Promise<Shop> {
    const [shop] = await db.insert(shops).values(shopData).returning();
    return shop;
  }

  async getAllShops(): Promise<Shop[]> {
    return await db.select().from(shops);
  }

  // Subcontract operations
  async createSubcontract(subcontractData: InsertSubcontract): Promise<Subcontract> {
    const [subcontract] = await db.insert(subcontracts).values(subcontractData).returning();
    return subcontract;
  }

  async getSubcontractsByOrder(orderId: string): Promise<Subcontract[]> {
    return await db.select().from(subcontracts).where(eq(subcontracts.orderId, orderId));
  }

  // Split policy operations
  async createSplitPolicy(policyData: Omit<SplitPolicy, 'id' | 'createdAt'>): Promise<SplitPolicy> {
    const [policy] = await db.insert(splitPolicies).values(policyData).returning();
    return policy;
  }

  async getAllSplitPolicies(): Promise<SplitPolicy[]> {
    return await db.select().from(splitPolicies).orderBy(desc(splitPolicies.createdAt));
  }

  async getActiveSplitPolicy(): Promise<SplitPolicy | undefined> {
    const [policy] = await db.select().from(splitPolicies).where(eq(splitPolicies.isActive, true)).limit(1);
    return policy;
  }

  // Split operations
  async calculateSplit(orderId: string, policyId: string): Promise<Split> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error("Order not found");

    const policy = await db.select().from(splitPolicies).where(eq(splitPolicies.id, policyId)).limit(1);
    if (!policy[0]) throw new Error("Policy not found");

    const policyData = policy[0].policyJson as any;
    const totalCents = order.totalCents || 0;

    // Calculate splits based on policy
    const originShopPct = policyData.default.origin_shop_pct;
    const processingShopPct = policyData.default.processing_shop_pct;
    const driverPct = policyData.default.driver_pct;
    const platformPct = policyData.default.platform_pct;

    const originShopCents = Math.round(totalCents * originShopPct);
    const processingShopCents = Math.round(totalCents * processingShopPct);
    const driverCents = Math.round(totalCents * driverPct);
    let platformCents = Math.round(totalCents * platformPct);

    // Apply platform minimum
    if (policyData.caps?.platform_min_cents && platformCents < policyData.caps.platform_min_cents) {
      platformCents = policyData.caps.platform_min_cents;
    }

    const [split] = await db.insert(splits).values({
      orderId,
      policyId,
      originShopCents,
      processingShopCents,
      driverCents,
      platformCents,
      originShopPct: originShopPct.toString(),
      processingShopPct: processingShopPct.toString(),
      driverPct: driverPct.toString(),
      platformPct: platformPct.toString(),
    }).returning();

    return split;
  }

  async getSplitsByOrder(orderId: string): Promise<Split[]> {
    return await db.select().from(splits).where(eq(splits.orderId, orderId));
  }

  async getAllSplits(): Promise<Split[]> {
    return await db.select().from(splits).orderBy(desc(splits.createdAt));
  }

  // Invoice operations
  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(invoiceData).returning();
    return invoice;
  }

  async getInvoiceByOrder(orderId: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.orderId, orderId)).limit(1);
    return invoice;
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async updateInvoiceStatus(invoiceId: string, status: 'pending' | 'paid' | 'cancelled', paidAt?: Date): Promise<Invoice | undefined> {
    const [invoice] = await db
      .update(invoices)
      .set({ status, paidAt: paidAt || null })
      .where(eq(invoices.id, invoiceId))
      .returning();
    return invoice;
  }
}

export const storage = new DatabaseStorage();
