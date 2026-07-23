import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Root route (API placeholder, since frontend will handle /)
app.get("/api", (req, res) => {
  res.send("Backend API is running.");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// GET all students
app.get("/api/students", async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        medals: true,
      },
    });
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST student
app.post("/api/students", async (req, res) => {
  try {
    const student = await prisma.student.create({
      data: req.body,
      include: { medals: true }
    });
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating student" });
  }
});

// POST batch import students
app.post("/api/students/import", async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const createdStudents = [];
    for (const studentData of students) {
      const { medals, ...data } = studentData;
      // Upsert student by id or matricule
      const student = await prisma.student.upsert({
        where: { id: data.id || `imp_${Date.now()}` },
        update: data,
        create: data
      });
      createdStudents.push(student);
    }
    res.json({ success: true, count: createdStudents.length });
  } catch (error) {
    console.error("Error importing students:", error);
    res.status(500).json({ error: "Error during batch import" });
  }
});

// PUT student
app.put("/api/students/:id", async (req, res) => {
  try {
    const { medals, ...data } = req.body;
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: {
        ...data,
        medals: medals ? {
          deleteMany: {},
          create: medals.map((m: any) => ({
            id: m.id,
            name: m.name,
            icon: m.icon,
            date: m.date
          }))
        } : undefined
      },
      include: { medals: true }
    });
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating student" });
  }
});

// GET halaqas
app.get("/api/halaqas", async (req, res) => {
  try {
    const halaqas = await prisma.halaqa.findMany();
    res.json(halaqas);
  } catch (error) { res.status(500).json({ error: "Internal server error" }); }
});

// GET attendance
app.get("/api/attendance", async (req, res) => {
  try {
    const records = await prisma.attendanceRecord.findMany();
    res.json(records);
  } catch (error) { res.status(500).json({ error: "Internal server error" }); }
});

// GET payments
app.get("/api/payments", async (req, res) => {
  try {
    const payments = await prisma.paymentRecord.findMany();
    res.json(payments);
  } catch (error) { res.status(500).json({ error: "Internal server error" }); }
});

// POST payments
app.post("/api/payments", async (req, res) => {
  try {
    const payment = await prisma.paymentRecord.create({ data: req.body });
    res.json(payment);
  } catch (error) { res.status(500).json({ error: "Error creating payment" }); }
});

// GET lessons
app.get("/api/lessons", async (req, res) => {
  try {
    const lessons = await prisma.quranLesson.findMany();
    res.json(lessons);
  } catch (error) { res.status(500).json({ error: "Internal server error" }); }
});

// POST cloture-day (batch insert attendance and lessons, update students)
app.post("/api/cloture-day", async (req, res) => {
  try {
    const { attendanceRecords, newLessons, updatedStudents } = req.body;

    await prisma.$transaction(async (tx) => {
      // Insert attendance
      if (attendanceRecords && attendanceRecords.length > 0) {
        await tx.attendanceRecord.createMany({ data: attendanceRecords });
      }
      
      // Insert lessons
      if (newLessons && newLessons.length > 0) {
        await tx.quranLesson.createMany({ data: newLessons });
      }

      // Update students (score, current hizb, etc)
      if (updatedStudents && updatedStudents.length > 0) {
        for (const s of updatedStudents) {
          const { id, medals, ...data } = s;
          await tx.student.update({
            where: { id },
            data: data
          });
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error closing day" });
  }
});

// --- SERVE FRONTEND (PRODUCTION) ---
// Sert les fichiers statiques compilés de Vite (dossier dist)
app.use(express.static(path.join(__dirname, "dist")));

// Pour toutes les autres requêtes (non-API), renvoyer l'index.html de React (SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start server
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
