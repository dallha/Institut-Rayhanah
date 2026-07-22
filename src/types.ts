/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum EtapePedagogique {
  Tahajji = "Tahajji",     // Alphabétisation / التهجي
  Hifz = "Hifz",           // Mémorisation active / الحفظ
  Murajaah = "Murajaah",   // Révision / المراجعة
  Tathbit = "Tathbit",     // Consolidation / التثبيت
  Khatm = "Khatm",         // Clôture transitoire / الختم
  Hafiz = "Hafiz"          // Mémorisateur accompli / حافظ
}

export enum Evaluation {
  Naam = "Naam", // نعم (Validé)
  Lam = "Lam"    // لم (Non validé)
}

export enum AttendanceStatus {
  Present = "Present",     // حاضر
  Absent = "Absent",       // غائب
  Late = "Late"            // متأخر
}

export interface Student {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  gender?: string;
  halaqaId: string;
  etape: EtapePedagogique;
  
  // Progress indicators
  currentSurahNum?: number; // 1 to 114
  currentVersetNum?: number;
  currentHizbNum?: number;  // 1 to 60
  currentHizbFraction?: number; // 0 (0), 0.25 (ربع), 0.5 (نصف), 0.75 (ثلاثة أرباع), 1.0 (كامل)
  
  // Statistics and Gamification
  khatmatCount: number; // For Hafiz
  dailyWardHizbs: number; // Goal for Hafiz/Hifz
  medals: { id: string; name: string; icon: string; date: string }[];
  score: number; // Gamified engagement points
  
  // Financial status
  balanceDue: number; // Outstanding amount in FCFA/Euro
  monthlyFee: number;
  age?: number;
  regime?: "internat" | "externat" | "demi-pension";
  nationality?: string;
  status?: "en_cours" | "hafiz" | "abandonne";
}

export interface Halaqa {
  id: string;
  name: string;
  teacherName: string;
  maxCapacity: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  status: string;
}

export interface QuranLesson {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  evaluation: Evaluation;
  type: "sourate" | "hizb";
  
  // Sourate mode
  startSurah?: number;
  startVerset?: number;
  endSurah?: number;
  endVerset?: number;
  
  // Hizb mode
  startHizb?: number;
  startHizbFraction?: number;
  endHizb?: number;
  endHizbFraction?: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  date: string;
  amount: number;
  purpose: string; // e.g. "Mensualité Juillet 2026", "Frais d'inscription"
  receiptNumber: string;
  recordedBy: string;
}

export interface Surah {
  number: number;
  name: string; // French/Latin name, e.g. "An-Nas"
  arabicName: string; // e.g. "الناس"
  versesCount: number;
  hizbStart: number;
}
