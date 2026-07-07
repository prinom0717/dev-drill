import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const userid = process.env.SEED_ADMIN_USERID ?? "admin";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { userid },
    update: {
      password_hash: passwordHash,
      role: "admin",
      locked: false,
      failed_attempts: 0,
      deleted: false,
    },
    create: {
      userid,
      password_hash: passwordHash,
      role: "admin",
      locked: false,
      failed_attempts: 0,
      deleted: false,
    },
  });

  console.log(`Seeded admin user: ${userid}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
