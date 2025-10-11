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

    console.log("✅ Database seeding complete!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}
