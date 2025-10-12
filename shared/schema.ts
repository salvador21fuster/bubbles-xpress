import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============= ENUMS =============

export const userRoleEnum = pgEnum('user_role', ['customer', 'driver', 'shop', 'franchise', 'admin']);

export const orderStateEnum = pgEnum('order_state', [
  'created',
  'confirmed', 
  'picked_up',
  'at_origin_shop',
  'subcontracted',
  'at_processing_shop',
  'washing',
  'drying',
  'pressing',
  'qc',
  'packed',
  'out_for_delivery',
  'delivered',
  'closed'
]);

export const scanTypeEnum = pgEnum('scan_type', [
  'pickup',
  'handoff.to_shop',
  'handoff.to_processing',
  'intake',
  'qc',
  'pack',
  'handoff.to_driver',
  'delivery'
]);

export const paymentMethodEnum = pgEnum('payment_method', ['card', 'cash', 'account']);

export const deliveryOptionEnum = pgEnum('delivery_option', ['standard', 'scheduled']);

// ============= SESSION & AUTH TABLES (Replit Auth) =============

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (supports both Replit Auth and email/password)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  username: varchar("username").unique(), // For admin/shop users
  phone: varchar("phone").unique(), // Required for customer/driver signup
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  hashedPassword: varchar("hashed_password"), // For email/password auth
  role: userRoleEnum("role").notNull().default('customer'),
  isSuperAdmin: boolean("is_super_admin").default(false), // Can access all portal types
  shopId: varchar("shop_id"), // If user is associated with a shop
  // Driver availability fields
  isActive: boolean("is_active").default(false), // Driver is currently available for pickups
  lastActiveAt: timestamp("last_active_at"), // Last time driver was active
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 7 }), // Current location
  currentLongitude: decimal("current_longitude", { precision: 10, scale: 7 }), // Current location
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ============= CORE BUSINESS TABLES =============

// Services table (laundry service types)
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceId: varchar("service_id").unique().notNull(), // e.g., "svc_laundry_kg"
  name: varchar("name").notNull(),
  description: text("description"),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit").notNull(), // e.g., "kg", "item"
  currency: varchar("currency").notNull().default('EUR'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).omit({ id: true, createdAt: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Shops table (launderettes/processing centers)
export const shops = pgTable("shops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  eircode: varchar("eircode"),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  isProcessingCenter: boolean("is_processing_center").default(false),
  
  // Franchise/Subscription details
  ownerId: varchar("owner_id"), // User ID of the shop owner
  franchiseName: varchar("franchise_name"), // Business/franchise name
  subscriptionTier: varchar("subscription_tier"), // 'free', 'silver', 'gold'
  subscriptionType: varchar("subscription_type"), // 'monthly' or 'yearly'
  subscriptionFee: integer("subscription_fee"), // Fee in cents (EUR)
  mrBubblesFeePercentage: integer("mr_bubbles_fee_percentage"), // Percentage fee to Mr Bubbles (5, 15, 25)
  subscriptionStatus: varchar("subscription_status").default('active'), // 'active', 'suspended', 'cancelled'
  paymentProcessed: boolean("payment_processed").default(false), // Fake payment confirmation
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertShopSchema = createInsertSchema(shops).omit({ id: true, createdAt: true });
export type InsertShop = z.infer<typeof insertShopSchema>;
export type Shop = typeof shops.$inferSelect;

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  driverId: varchar("driver_id"),
  originShopId: varchar("origin_shop_id"),
  processingShopId: varchar("processing_shop_id"),
  state: orderStateEnum("state").notNull().default('created'),
  
  // Customer Contact
  customerFullName: varchar("customer_full_name"),
  customerPhone: varchar("customer_phone"),
  
  // Pickup Schedule
  pickupDate: varchar("pickup_date"),
  timeWindow: varchar("time_window"),
  
  // Address
  addressLine1: varchar("address_line1").notNull(),
  addressLine2: varchar("address_line2"),
  city: varchar("city").notNull(),
  eircode: varchar("eircode"),
  
  // Pricing
  subtotalCents: integer("subtotal_cents").default(0),
  deliveryFeeCents: integer("delivery_fee_cents").default(0),
  tipCents: integer("tip_cents").default(0),
  vatCents: integer("vat_cents").default(0),
  totalCents: integer("total_cents").default(0),
  currency: varchar("currency").default('EUR'),
  
  // Uber Eats Style Checkout Fields
  deliveryOption: deliveryOptionEnum("delivery_option").default('standard'),
  scheduledDeliveryDate: varchar("scheduled_delivery_date"), // For scheduled deliveries
  scheduledDeliveryTime: varchar("scheduled_delivery_time"), // Time window for scheduled deliveries
  deliveryInstructions: text("delivery_instructions"), // "Meet at my door", etc.
  tipPercentage: integer("tip_percentage"), // 0, 10, 15, 20, 25, or custom
  
  paymentMethod: paymentMethodEnum("payment_method"),
  paymentIntentId: varchar("payment_intent_id"),
  
  // Metadata
  notes: text("notes"),
  confirmedAt: timestamp("confirmed_at"),
  pickedUpAt: timestamp("picked_up_at"),
  deliveredAt: timestamp("delivered_at"),
  closedAt: timestamp("closed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order Services (many-to-many relationship)
export const orderServices = pgTable("order_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  serviceId: varchar("service_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalCents: integer("total_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type OrderService = typeof orderServices.$inferSelect;

// Bags table
export const bags = pgTable("bags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  sequence: integer("sequence").notNull(),
  qrCode: varchar("qr_code").unique().notNull(),
  weightKg: decimal("weight_kg", { precision: 6, scale: 2 }),
  labelPrinted: boolean("label_printed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBagSchema = createInsertSchema(bags).omit({ id: true, createdAt: true });
export type InsertBag = z.infer<typeof insertBagSchema>;
export type Bag = typeof bags.$inferSelect;

// Items table (optional detailed tracking)
export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bagId: varchar("bag_id").notNull(),
  orderId: varchar("order_id").notNull(),
  description: text("description"),
  qrCode: varchar("qr_code").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Item = typeof items.$inferSelect;

// Scans table (audit trail)
export const scans = pgTable("scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: scanTypeEnum("type").notNull(),
  orderId: varchar("order_id"),
  bagId: varchar("bag_id"),
  itemId: varchar("item_id"),
  
  // Who scanned
  scannedBy: varchar("scanned_by").notNull(),
  scannedByRole: userRoleEnum("scanned_by_role").notNull(),
  
  // Location data
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  
  // Handoff parties
  fromPartyType: varchar("from_party_type"),
  fromPartyId: varchar("from_party_id"),
  toPartyType: varchar("to_party_type"),
  toPartyId: varchar("to_party_id"),
  
  // Evidence
  photoUrl: varchar("photo_url"),
  signature: text("signature"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScanSchema = createInsertSchema(scans).omit({ id: true, createdAt: true });
export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scans.$inferSelect;

// Subcontracts table
export const subcontracts = pgTable("subcontracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  fromShopId: varchar("from_shop_id").notNull(),
  toShopId: varchar("to_shop_id").notNull(),
  
  // Terms
  processingPct: decimal("processing_pct", { precision: 5, scale: 2 }).notNull(),
  slaHours: integer("sla_hours"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubcontractSchema = createInsertSchema(subcontracts).omit({ id: true, createdAt: true });
export type InsertSubcontract = z.infer<typeof insertSubcontractSchema>;
export type Subcontract = typeof subcontracts.$inferSelect;

// Split Policies table (versioned revenue sharing rules)
export const splitPolicies = pgTable("split_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  version: varchar("version").notNull(), // e.g., "2025-10-01"
  policyJson: jsonb("policy_json").notNull(), // Flexible policy structure
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SplitPolicy = typeof splitPolicies.$inferSelect;

// Splits table (calculated revenue distribution)
export const splits = pgTable("splits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  policyId: varchar("policy_id").notNull(),
  
  // Split amounts in cents
  originShopCents: integer("origin_shop_cents").notNull(),
  processingShopCents: integer("processing_shop_cents").notNull(),
  driverCents: integer("driver_cents").notNull(),
  platformCents: integer("platform_cents").notNull(),
  
  // Percentages used
  originShopPct: decimal("origin_shop_pct", { precision: 5, scale: 2 }),
  processingShopPct: decimal("processing_shop_pct", { precision: 5, scale: 2 }),
  driverPct: decimal("driver_pct", { precision: 5, scale: 2 }),
  platformPct: decimal("platform_pct", { precision: 5, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export type Split = typeof splits.$inferSelect;

// Invoice status enum
export const invoiceStatusEnum = pgEnum("invoice_status", ["pending", "paid", "cancelled"]);

// Invoices table
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  invoiceNumber: varchar("invoice_number").unique().notNull(),
  status: invoiceStatusEnum("status").notNull().default("pending"),
  
  subtotalCents: integer("subtotal_cents").notNull(),
  vatCents: integer("vat_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  currency: varchar("currency").default('EUR'),
  
  pdfUrl: varchar("pdf_url"),
  paidAt: timestamp("paid_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// ============= CART & CHECKOUT (UBER EATS STYLE) =============

// Carts table (shopping cart before checkout)
export const carts = pgTable("carts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  
  // Cart status
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCartSchema = createInsertSchema(carts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCart = z.infer<typeof insertCartSchema>;
export type Cart = typeof carts.$inferSelect;

// Cart Items table (items in shopping cart)
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cartId: varchar("cart_id").notNull(),
  serviceId: varchar("service_id").notNull(), // Reference to services table
  
  // Product details
  productCode: varchar("product_code").notNull(), // e.g., "DRESS", "SUIT2", "WDF"
  productName: varchar("product_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  
  // Pricing
  unitPriceCents: integer("unit_price_cents").notNull(),
  totalPriceCents: integer("total_price_cents").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

// ============= RELATIONS =============

export const usersRelations = relations(users, ({ many }) => ({
  ordersAsCustomer: many(orders, { relationName: 'customerOrders' }),
  ordersAsDriver: many(orders, { relationName: 'driverOrders' }),
  scans: many(scans),
  carts: many(carts),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
    relationName: 'customerOrders',
  }),
  driver: one(users, {
    fields: [orders.driverId],
    references: [users.id],
    relationName: 'driverOrders',
  }),
  originShop: one(shops, {
    fields: [orders.originShopId],
    references: [shops.id],
    relationName: 'originShopOrders',
  }),
  processingShop: one(shops, {
    fields: [orders.processingShopId],
    references: [shops.id],
    relationName: 'processingShopOrders',
  }),
  bags: many(bags),
  items: many(items),
  scans: many(scans),
  services: many(orderServices),
  subcontracts: many(subcontracts),
  splits: many(splits),
  invoices: many(invoices),
}));

export const bagsRelations = relations(bags, ({ one, many }) => ({
  order: one(orders, {
    fields: [bags.orderId],
    references: [orders.id],
  }),
  items: many(items),
  scans: many(scans),
}));

export const itemsRelations = relations(items, ({ one }) => ({
  bag: one(bags, {
    fields: [items.bagId],
    references: [bags.id],
  }),
  order: one(orders, {
    fields: [items.orderId],
    references: [orders.id],
  }),
}));

export const scansRelations = relations(scans, ({ one }) => ({
  order: one(orders, {
    fields: [scans.orderId],
    references: [orders.id],
  }),
  bag: one(bags, {
    fields: [scans.bagId],
    references: [bags.id],
  }),
  scannedByUser: one(users, {
    fields: [scans.scannedBy],
    references: [users.id],
  }),
}));

export const shopsRelations = relations(shops, ({ many }) => ({
  originOrders: many(orders, { relationName: 'originShopOrders' }),
  processingOrders: many(orders, { relationName: 'processingShopOrders' }),
  subcontractsFrom: many(subcontracts, { relationName: 'fromShopContracts' }),
  subcontractsTo: many(subcontracts, { relationName: 'toShopContracts' }),
}));

export const subcontractsRelations = relations(subcontracts, ({ one }) => ({
  order: one(orders, {
    fields: [subcontracts.orderId],
    references: [orders.id],
  }),
  fromShop: one(shops, {
    fields: [subcontracts.fromShopId],
    references: [shops.id],
    relationName: 'fromShopContracts',
  }),
  toShop: one(shops, {
    fields: [subcontracts.toShopId],
    references: [shops.id],
    relationName: 'toShopContracts',
  }),
}));

export const splitsRelations = relations(splits, ({ one }) => ({
  order: one(orders, {
    fields: [splits.orderId],
    references: [orders.id],
  }),
  policy: one(splitPolicies, {
    fields: [splits.policyId],
    references: [splitPolicies.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  order: one(orders, {
    fields: [invoices.orderId],
    references: [orders.id],
  }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  customer: one(users, {
    fields: [carts.customerId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  service: one(services, {
    fields: [cartItems.serviceId],
    references: [services.id],
  }),
}));
