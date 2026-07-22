-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matricule" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "parentEmail" TEXT,
    "halaqaId" TEXT NOT NULL,
    "etape" TEXT NOT NULL,
    "currentSurahNum" INTEGER,
    "currentVersetNum" INTEGER,
    "currentHizbNum" INTEGER,
    "currentHizbFraction" REAL,
    "khatmatCount" INTEGER NOT NULL DEFAULT 0,
    "dailyWardHizbs" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "balanceDue" REAL NOT NULL DEFAULT 0,
    "monthlyFee" REAL NOT NULL DEFAULT 0,
    "age" INTEGER,
    "regime" TEXT,
    CONSTRAINT "Student_halaqaId_fkey" FOREIGN KEY ("halaqaId") REFERENCES "Halaqa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentMedal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    CONSTRAINT "StudentMedal_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Halaqa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "maxCapacity" INTEGER NOT NULL DEFAULT 20
);

-- CreateTable
CREATE TABLE "QuranLesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "evaluation" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startSurah" INTEGER,
    "startVerset" INTEGER,
    "endSurah" INTEGER,
    "endVerset" INTEGER,
    "startHizb" INTEGER,
    "startHizbFraction" REAL,
    "endHizb" INTEGER,
    "endHizbFraction" REAL,
    CONSTRAINT "QuranLesson_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "purpose" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "recordedBy" TEXT NOT NULL,
    CONSTRAINT "PaymentRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_matricule_key" ON "Student"("matricule");
