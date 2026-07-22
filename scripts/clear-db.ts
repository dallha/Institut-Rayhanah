import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function clearDb() {
  console.log("Suppression des données...");
  await prisma.studentMedal.deleteMany();
  await prisma.quranLesson.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.paymentRecord.deleteMany();
  await prisma.student.deleteMany();
  await prisma.halaqa.deleteMany();
  console.log("Base de données nettoyée !");
}
clearDb().catch(console.error).finally(() => prisma.$disconnect());
