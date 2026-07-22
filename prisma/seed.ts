import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { 
  INITIAL_HALAQAS, 
  INITIAL_STUDENTS, 
  INITIAL_ATTENDANCE, 
  INITIAL_PAYMENTS, 
  INITIAL_LESSONS 
} from "../src/mockData.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Halaqas
  for (const h of INITIAL_HALAQAS) {
    await prisma.halaqa.upsert({
      where: { id: h.id },
      update: {},
      create: {
        id: h.id,
        name: h.name,
        teacherName: h.teacherName,
        maxCapacity: h.maxCapacity,
      },
    });
  }

  // 2. Students and Medals
  for (const s of INITIAL_STUDENTS) {
    await prisma.student.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        matricule: s.matricule,
        firstName: s.firstName,
        lastName: s.lastName,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        parentEmail: s.parentEmail,
        halaqaId: s.halaqaId,
        etape: s.etape,
        currentSurahNum: s.currentSurahNum,
        currentVersetNum: s.currentVersetNum,
        currentHizbNum: s.currentHizbNum,
        currentHizbFraction: s.currentHizbFraction,
        khatmatCount: s.khatmatCount,
        dailyWardHizbs: s.dailyWardHizbs,
        score: s.score,
        balanceDue: s.balanceDue,
        monthlyFee: s.monthlyFee,
        age: s.age,
        regime: s.regime,
        medals: {
          create: s.medals.map(m => ({
            id: m.id,
            name: m.name,
            icon: m.icon,
            date: m.date
          }))
        }
      },
    });
  }

  // 3. Attendance
  for (const a of INITIAL_ATTENDANCE) {
    await prisma.attendanceRecord.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        studentId: a.studentId,
        date: a.date,
        status: a.status
      }
    });
  }

  // 4. Payments
  for (const p of INITIAL_PAYMENTS) {
    await prisma.paymentRecord.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        studentId: p.studentId,
        date: p.date,
        amount: p.amount,
        purpose: p.purpose,
        receiptNumber: p.receiptNumber,
        recordedBy: p.recordedBy
      }
    });
  }

  // 5. Lessons
  for (const l of INITIAL_LESSONS) {
    await prisma.quranLesson.upsert({
      where: { id: l.id },
      update: {},
      create: {
        id: l.id,
        studentId: l.studentId,
        date: l.date,
        evaluation: l.evaluation,
        type: l.type,
        startSurah: l.startSurah,
        startVerset: l.startVerset,
        endSurah: l.endSurah,
        endVerset: l.endVerset,
        startHizb: l.startHizb,
        startHizbFraction: l.startHizbFraction,
        endHizb: l.endHizb,
        endHizbFraction: l.endHizbFraction
      }
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
