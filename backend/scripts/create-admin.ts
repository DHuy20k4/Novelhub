import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const username = "admin";
  const email = "admin@novelhub.com";
  const password = "password123";
  const role = "admin"; // From schema: role @default("user")

  // Check if admin exists
  let admin = await prisma.user.findUnique({
    where: { username }
  });

  if (admin) {
    console.log(`User ${username} already exists. Updating role to admin...`);
    admin = await prisma.user.update({
      where: { username },
      data: { role: "admin" }
    });
    console.log("Updated existing admin user.");
  } else {
    console.log(`Creating new admin user...`);
    const passwordHash = await bcrypt.hash(password, 10);
    admin = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        displayName: "System Admin",
        role: "admin",
      }
    });
    console.log("Admin user created successfully.");
  }

  console.log("---");
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  console.log("---");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
