// Seed data for Mr Bubbles Express
import { storage } from "./storage";
import { hashPassword } from "./auth";

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    // Seed services
    const services = [
      {
        serviceId: "svc_laundry_kg",
        name: "Laundry (per kg)",
        description: "Regular washing and folding",
        pricePerUnit: "5.00",
        unit: "kg",
        currency: "EUR",
      },
      {
        serviceId: "svc_dry_clean",
        name: "Dry Cleaning",
        description: "Professional dry cleaning",
        pricePerUnit: "12.00",
        unit: "item",
        currency: "EUR",
      },
      {
        serviceId: "svc_shirt_press",
        name: "Shirt Press",
        description: "Professional shirt pressing",
        pricePerUnit: "3.50",
        unit: "item",
        currency: "EUR",
      },
      {
        serviceId: "svc_iron",
        name: "Ironing Service",
        description: "Complete ironing service",
        pricePerUnit: "8.00",
        unit: "kg",
        currency: "EUR",
      },
    ];

    for (const service of services) {
      try {
        await storage.createService(service);
        console.log(`✅ Created service: ${service.name}`);
      } catch (error) {
        // Service might already exist
      }
    }

    // Seed shops
    const shops = [
      {
        name: "Dublin Central Laundry",
        address: "123 O'Connell Street",
        city: "Dublin",
        eircode: "D01 XY45",
        contactEmail: "dublin@mrbubbles.ie",
        contactPhone: "+353 1 234 5678",
        isProcessingCenter: false,
      },
      {
        name: "Drogheda Express Clean",
        address: "45 West Street",
        city: "Drogheda",
        eircode: "A92 X7Y8",
        contactEmail: "drogheda@mrbubbles.ie",
        contactPhone: "+353 41 987 6543",
        isProcessingCenter: false,
      },
      {
        name: "Cork Processing Center",
        address: "78 Industrial Estate",
        city: "Cork",
        eircode: "T12 AB34",
        contactEmail: "cork@mrbubbles.ie",
        contactPhone: "+353 21 456 7890",
        isProcessingCenter: true,
      },
    ];

    for (const shop of shops) {
      try {
        await storage.createShop(shop);
        console.log(`✅ Created shop: ${shop.name}`);
      } catch (error) {
        // Shop might already exist
      }
    }

    // Seed default split policy
    try {
      await storage.createSplitPolicy({
        name: "Default EUR Policy",
        version: "2025-10-10",
        policyJson: {
          currency: "EUR",
          default: {
            origin_shop_pct: 0.2,
            processing_shop_pct: 0.55,
            driver_pct: 0.1,
            platform_pct: 0.15,
          },
          caps: {
            platform_min_cents: 50,
          },
          rounding: "HALF_UP_2DP",
        },
        isActive: true,
      });
      console.log("✅ Created default split policy");
    } catch (error) {
      // Policy might already exist
    }

    // Seed admin users
    const adminUsers = [
      {
        username: "benbubbles",
        password: "benbubbles",
        firstName: "Ben",
        lastName: "Bubbles",
        role: "admin" as const,
      },
      {
        username: "ronanbubbles",
        password: "ronanbubbles",
        firstName: "Ronan",
        lastName: "Bubbles",
        role: "admin" as const,
      },
    ];

    for (const admin of adminUsers) {
      try {
        const existingUser = await storage.getUserByUsername(admin.username);
        if (!existingUser) {
          const hashedPassword = await hashPassword(admin.password);
          await storage.createUser({
            username: admin.username,
            firstName: admin.firstName,
            lastName: admin.lastName,
            hashedPassword,
            role: admin.role,
            isSuperAdmin: true, // Super admins can access all portal types
          });
          console.log(`✅ Created super admin user: ${admin.username}`);
        } else {
          // Update existing admin users to be super admins
          await storage.updateUser(existingUser.id, { isSuperAdmin: true });
          console.log(`✅ Updated ${admin.username} to super admin`);
        }
      } catch (error) {
        console.error(`❌ Error creating admin user ${admin.username}:`, error);
      }
    }

    // Seed test customer users
    const testCustomers = [
      { username: "customer1", email: "customer1@test.com", phone: "+353871234001", firstName: "Emma", lastName: "Murphy", password: "test123" },
      { username: "customer2", email: "customer2@test.com", phone: "+353871234002", firstName: "Liam", lastName: "Kelly", password: "test123" },
      { username: "customer3", email: "customer3@test.com", phone: "+353871234003", firstName: "Sophie", lastName: "Ryan", password: "test123" },
      { username: "customer4", email: "customer4@test.com", phone: "+353871234004", firstName: "Jack", lastName: "Walsh", password: "test123" },
      { username: "customer5", email: "customer5@test.com", phone: "+353871234005", firstName: "Aoife", lastName: "Brennan", password: "test123" },
    ];

    for (const customer of testCustomers) {
      try {
        const existingUser = await storage.getUserByEmail(customer.email);
        if (!existingUser) {
          const hashedPassword = await hashPassword(customer.password);
          await storage.createUser({
            username: customer.username,
            email: customer.email,
            phone: customer.phone,
            firstName: customer.firstName,
            lastName: customer.lastName,
            hashedPassword,
            role: "customer",
          });
          console.log(`✅ Created test customer: ${customer.username}`);
        }
      } catch (error) {
        console.error(`❌ Error creating customer ${customer.username}:`, error);
      }
    }

    // Seed test driver users
    const testDrivers = [
      { username: "driver1", email: "driver1@test.com", phone: "+353871235001", firstName: "Cian", lastName: "McCarthy", password: "test123" },
      { username: "driver2", email: "driver2@test.com", phone: "+353871235002", firstName: "Ciara", lastName: "O'Brien", password: "test123" },
      { username: "driver3", email: "driver3@test.com", phone: "+353871235003", firstName: "Finn", lastName: "Doyle", password: "test123" },
      { username: "driver4", email: "driver4@test.com", phone: "+353871235004", firstName: "Niamh", lastName: "Sullivan", password: "test123" },
      { username: "driver5", email: "driver5@test.com", phone: "+353871235005", firstName: "Sean", lastName: "Murphy", password: "test123" },
    ];

    for (const driver of testDrivers) {
      try {
        const existingUser = await storage.getUserByEmail(driver.email);
        if (!existingUser) {
          const hashedPassword = await hashPassword(driver.password);
          await storage.createUser({
            username: driver.username,
            email: driver.email,
            phone: driver.phone,
            firstName: driver.firstName,
            lastName: driver.lastName,
            hashedPassword,
            role: "driver",
          });
          console.log(`✅ Created test driver: ${driver.username}`);
        }
      } catch (error) {
        console.error(`❌ Error creating driver ${driver.username}:`, error);
      }
    }

    // Create test orders with driver-customer connections
    const customer1 = await storage.getUserByEmail("customer1@test.com");
    const customer2 = await storage.getUserByEmail("customer2@test.com");
    const customer3 = await storage.getUserByEmail("customer3@test.com");
    const driver1 = await storage.getUserByEmail("driver1@test.com");
    const driver2 = await storage.getUserByEmail("driver2@test.com");

    if (customer1 && driver1) {
      try {
        const order1 = await storage.createOrder({
          customerId: customer1.id,
          addressLine1: "12 Green Hills",
          city: "Drogheda",
          eircode: "A92 X1Y2",
          totalCents: 2500,
          state: "confirmed",
          driverId: driver1.id,
        });
        console.log("✅ Created test order 1");

        // Create test message
        await storage.createMessage({
          orderId: order1.id,
          senderId: driver1.id,
          senderRole: "driver",
          message: "I'm on my way to pick up your laundry!",
          isRead: false,
        });
        console.log("✅ Created test message 1");
      } catch (error) {
        console.error("❌ Error creating test order 1:", error);
      }
    }

    if (customer2 && driver2) {
      try {
        const order2 = await storage.createOrder({
          customerId: customer2.id,
          addressLine1: "45 West Street",
          city: "Drogheda",
          eircode: "A92 B3C4",
          totalCents: 3600,
          state: "picked_up",
          driverId: driver2.id,
        });
        console.log("✅ Created test order 2");

        await storage.createMessage({
          orderId: order2.id,
          senderId: driver2.id,
          senderRole: "driver",
          message: "Your items are at the processing center",
          isRead: false,
        });
        console.log("✅ Created test message 2");
      } catch (error) {
        console.error("❌ Error creating test order 2:", error);
      }
    }

    if (customer3 && driver1) {
      try {
        const order3 = await storage.createOrder({
          customerId: customer3.id,
          addressLine1: "78 Main Road",
          city: "Drogheda",
          eircode: "A92 D5E6",
          totalCents: 1600,
          state: "confirmed",
          driverId: driver1.id,
        });
        console.log("✅ Created test order 3");

        await storage.createMessage({
          orderId: order3.id,
          senderId: driver1.id,
          senderRole: "driver",
          message: "I'll arrive in 5 minutes",
          isRead: false,
        });
        console.log("✅ Created test message 3");
      } catch (error) {
        console.error("❌ Error creating test order 3:", error);
      }
    }

    // Create PAID ORDER ready for driver acceptance (collection + delivery)
    const customer4 = await storage.getUserByEmail("customer4@test.com");
    if (customer4) {
      try {
        const paidOrder = await storage.createOrder({
          customerId: customer4.id,
          customerFullName: "Jack Walsh",
          customerPhone: "+353871234004",
          addressLine1: "25 Castle Street",
          addressLine2: "Apt 3B",
          city: "Drogheda",
          eircode: "A92 F7G8",
          subtotalCents: 3000, // €30.00 for 6kg laundry
          deliveryFeeCents: 500, // €5.00 delivery
          tipCents: 300, // €3.00 tip (10%)
          vatCents: 874, // 23% VAT on subtotal + delivery
          totalCents: 4674, // €46.74 total
          currency: "EUR",
          deliveryOption: "standard",
          deliveryInstructions: "Leave at reception desk",
          tipPercentage: 10,
          paymentMethod: "card",
          paymentIntentId: "pi_test_" + Date.now(),
          state: "confirmed", // PAID - ready for driver
          notes: "Collection AND Delivery - Full service (6kg laundry)",
        });
        console.log("✅ Created PAID order ready for driver acceptance");
        console.log(`   Order ID: ${paidOrder.id}`);
        console.log(`   Customer: Jack Walsh (+353871234004)`);
        console.log(`   Address: 25 Castle Street, Apt 3B, Drogheda`);
        console.log(`   Total: €46.74 (Collection + Delivery)`);
        console.log(`   Status: PAID & CONFIRMED - Awaiting driver acceptance`);
      } catch (error) {
        console.error("❌ Error creating paid order:", error);
      }
    }

    console.log("✅ Database seeding complete!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}
