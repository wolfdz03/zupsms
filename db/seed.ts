import { db } from "./index";
import { users, students, settings } from "./schema";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create a coordinator user
    const passwordHash = await bcrypt.hash("coordinator123", 10);
    
    await db.insert(users).values({
      email: "coordinator@zupsms.com",
      passwordHash: passwordHash,
    });
    console.log("✅ Created coordinator user: coordinator@zupsms.com / coordinator123");

    // Create sample students
    await db.insert(students).values([
      {
        fullName: "Ahmed Benali",
        phone: "+33612345678",
        email: "ahmed.benali@example.com",
        dayOfWeek: "lundi",
        startTime: "14:00:00",
        isActive: true,
      },
      {
        fullName: "Fatima El Amrani",
        phone: "+33623456789",
        email: "fatima.elamrani@example.com",
        dayOfWeek: "lundi",
        startTime: "16:00:00",
        isActive: true,
      },
      {
        fullName: "Omar Chakir",
        phone: "+33634567890",
        email: "omar.chakir@example.com",
        dayOfWeek: "mardi",
        startTime: "10:00:00",
        isActive: true,
      },
      {
        fullName: "Salma Idrissi",
        phone: "+33645678901",
        email: "salma.idrissi@example.com",
        dayOfWeek: "mercredi",
        startTime: "15:30:00",
        isActive: false,
      },
      {
        fullName: "Youssef Alaoui",
        phone: "+33656789012",
        email: "youssef.alaoui@example.com",
        dayOfWeek: "jeudi",
        startTime: "11:00:00",
        isActive: true,
      },
      {
        fullName: "Nadia Berrada",
        phone: "+33667890123",
        email: "nadia.berrada@example.com",
        dayOfWeek: "vendredi",
        startTime: "13:00:00",
        isActive: true,
      },
      {
        fullName: "Karim Tazi",
        phone: "+33678901234",
        email: "karim.tazi@example.com",
        dayOfWeek: "samedi",
        startTime: "09:00:00",
        isActive: true,
      },
    ]);
    console.log("✅ Created sample students");

    // Create default settings
    await db.insert(settings).values({
      smsOffsetMinutes: 15,
      smsTemplate: "97775950-fe78-4b1b-98cd-13646067b704", // Sweego template ID
    });
    console.log("✅ Created default settings");

    console.log("🎉 Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();

