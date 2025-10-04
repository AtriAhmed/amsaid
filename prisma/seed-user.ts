import { PrismaClient, Role } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // hash password
  const hashedPassword = await bcrypt.hash("password", 10);

  // create or update user
  const user = await prisma.user.upsert({
    where: { email: "atriahmed.1999@gmail.com" },
    update: {},
    create: {
      email: "atriahmed.1999@gmail.com",
      name: "Ahmed Atri",
      passwordHash: hashedPassword,
      role: Role.OWNER, // or Role.ADMIN / Role.MANAGER
    },
  });

  console.log("🎉 Seed completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`- User: ${user.email} (password: password, role: ${user.role})`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
