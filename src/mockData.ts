/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Halaqa, EtapePedagogique, Evaluation, AttendanceRecord, PaymentRecord, AttendanceStatus, QuranLesson } from "./types";

export const INITIAL_HALAQAS: Halaqa[] = [
  { id: "h1", name: "Halaqa Cheikh Oumar", teacherName: "Cheikh Oumar Diallo", maxCapacity: 15 },
  { id: "h2", name: "Halaqa Oustaz Ahmad", teacherName: "Oustaz Ahmad Lo", maxCapacity: 20 },
  { id: "h3", name: "Halaqa Imam Souleymane", teacherName: "Imam Souleymane Ndiaye", maxCapacity: 10 }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "s1",
    matricule: "DK-2026-001",
    firstName: "Amadou",
    lastName: "Sall",
    parentName: "Moustapha Sall",
    parentPhone: "+221 77 123 45 67",
    parentEmail: "moustapha.sall@gmail.com",
    halaqaId: "h1",
    etape: EtapePedagogique.Hifz,
    currentSurahNum: 101, // Al-Qari'ah
    currentVersetNum: 1,
    currentHizbNum: 59,
    currentHizbFraction: 0.25,
    khatmatCount: 0,
    dailyWardHizbs: 0.5,
    medals: [
      { id: "m1", name: "Discipline Exemplaire", icon: "Award", date: "2026-06-15" }
    ],
    score: 120,
    balanceDue: 0,
    monthlyFee: 110000, // Internat
    age: 8,
    regime: "internat"
  },
  {
    id: "s2",
    matricule: "DK-2026-002",
    firstName: "Mariama",
    lastName: "Cissé",
    parentName: "Abdoulaye Cissé",
    parentPhone: "+221 78 456 12 34",
    parentEmail: "cisse.abdou@gmail.com",
    halaqaId: "h1",
    etape: EtapePedagogique.Tahajji,
    khatmatCount: 0,
    dailyWardHizbs: 0,
    medals: [],
    score: 45,
    balanceDue: 35000, // 1 month unpaid Externat
    monthlyFee: 35000, // Externat
    age: 6,
    regime: "externat"
  },
  {
    id: "s3",
    matricule: "DK-2026-003",
    firstName: "Ibrahim",
    lastName: "Thiam",
    parentName: "Ousmane Thiam",
    parentPhone: "+221 70 888 99 11",
    halaqaId: "h2",
    etape: EtapePedagogique.Hafiz,
    currentSurahNum: 2, // Al-Baqarah
    currentVersetNum: 286,
    currentHizbNum: 1,
    currentHizbFraction: 1.0,
    khatmatCount: 2,
    dailyWardHizbs: 2,
    medals: [
      { id: "m2", name: "Voix Exceptionnelle", icon: "Music", date: "2026-05-10" },
      { id: "m3", name: "Major de Promo", icon: "Crown", date: "2026-07-01" }
    ],
    score: 480,
    balanceDue: 0,
    monthlyFee: 110000, // Internat
    age: 9,
    regime: "internat"
  },
  {
    id: "s4",
    matricule: "DK-2026-004",
    firstName: "Fatoumata",
    lastName: "Diallo",
    parentName: "Boubacar Diallo",
    parentPhone: "+221 76 345 67 89",
    parentEmail: "bdiallo@outlook.com",
    halaqaId: "h2",
    etape: EtapePedagogique.Murajaah,
    currentSurahNum: 36, // Ya-Sin
    currentVersetNum: 1,
    currentHizbNum: 43,
    currentHizbFraction: 0.5,
    khatmatCount: 0,
    dailyWardHizbs: 1,
    medals: [
      { id: "m4", name: "Persévérance", icon: "Zap", date: "2026-07-12" }
    ],
    score: 210,
    balanceDue: 100000, // 2 months unpaid Demi-pension
    monthlyFee: 50000, // Demi-pension
    age: 7,
    regime: "demi-pension"
  },
  {
    id: "s5",
    matricule: "DK-2026-005",
    firstName: "Moustapha",
    lastName: "Gaye",
    parentName: "Abdou Gaye",
    parentPhone: "+221 77 987 65 43",
    halaqaId: "h3",
    etape: EtapePedagogique.Khatm,
    currentSurahNum: 3, // Ali 'Imran
    currentVersetNum: 1,
    currentHizbNum: 4,
    currentHizbFraction: 0.75,
    khatmatCount: 0,
    dailyWardHizbs: 1.5,
    medals: [],
    score: 350,
    balanceDue: 0,
    monthlyFee: 110000, // Internat
    age: 10,
    regime: "internat"
  },
  {
    id: "s6",
    matricule: "DK-2026-006",
    firstName: "Aïcha",
    lastName: "Ndiaye",
    parentName: "Khadim Ndiaye",
    parentPhone: "+221 77 444 33 22",
    parentEmail: "khadim.nd@gmail.com",
    halaqaId: "h1",
    etape: EtapePedagogique.Hifz,
    currentSurahNum: 55, // Ar-Rahman
    currentVersetNum: 1,
    currentHizbNum: 53,
    currentHizbFraction: 0.0,
    khatmatCount: 0,
    dailyWardHizbs: 0.75,
    medals: [
      { id: "m5", name: "Camarade Solidaire", icon: "Heart", date: "2026-06-20" }
    ],
    score: 185,
    balanceDue: 105000, // 3 months unpaid Externat
    monthlyFee: 35000, // Externat
    age: 5,
    regime: "externat"
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Attendance records for the past few days (Amadou Sall)
  { id: "att_1", studentId: "s1", date: "2026-07-18", status: AttendanceStatus.Present },
  { id: "att_2", studentId: "s1", date: "2026-07-19", status: AttendanceStatus.Present },
  { id: "att_3", studentId: "s1", date: "2026-07-20", status: AttendanceStatus.Present },
  
  // Mariama Cissé
  { id: "att_4", studentId: "s2", date: "2026-07-18", status: AttendanceStatus.Absent },
  { id: "att_5", studentId: "s2", date: "2026-07-19", status: AttendanceStatus.Present },
  { id: "att_6", studentId: "s2", date: "2026-07-20", status: AttendanceStatus.Present },

  // Ibrahim Thiam
  { id: "att_7", studentId: "s3", date: "2026-07-18", status: AttendanceStatus.Present },
  { id: "att_8", studentId: "s3", date: "2026-07-19", status: AttendanceStatus.Present },
  { id: "att_9", studentId: "s3", date: "2026-07-20", status: AttendanceStatus.Present },

  // Fatoumata Diallo
  { id: "att_10", studentId: "s4", date: "2026-07-18", status: AttendanceStatus.Present },
  { id: "att_11", studentId: "s4", date: "2026-07-19", status: AttendanceStatus.Late },
  { id: "att_12", studentId: "s4", date: "2026-07-20", status: AttendanceStatus.Present }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: "pay_1",
    studentId: "s1",
    date: "2026-07-05 09:30",
    amount: 110000,
    purpose: "Mensualité Juillet 2026",
    receiptNumber: "REC-2026-1054",
    recordedBy: "Secrétaire Fatou"
  },
  {
    id: "pay_2",
    studentId: "s3",
    date: "2026-07-02 11:15",
    amount: 110000,
    purpose: "Mensualité Juillet 2026",
    receiptNumber: "REC-2026-1042",
    recordedBy: "Secrétaire Fatou"
  },
  {
    id: "pay_3",
    studentId: "s5",
    date: "2026-07-08 14:00",
    amount: 110000,
    purpose: "Mensualité Juillet 2026",
    receiptNumber: "REC-2026-1068",
    recordedBy: "Secrétaire Fatou"
  }
];

export const INITIAL_LESSONS: QuranLesson[] = [
  {
    id: "les_1",
    studentId: "s1",
    date: "2026-07-20",
    evaluation: Evaluation.Excellent,
    type: "sourate",
    startSurah: 102,
    startVerset: 1,
    endSurah: 101,
    endVerset: 11
  },
  {
    id: "les_2",
    studentId: "s4",
    date: "2026-07-20",
    evaluation: Evaluation.Bien,
    type: "hizb",
    startHizb: 44,
    startHizbFraction: 0.25,
    endHizb: 43,
    endHizbFraction: 0.5
  },
  {
    id: "les_3",
    studentId: "s3",
    date: "2026-07-20",
    evaluation: Evaluation.Excellent,
    type: "hizb",
    startHizb: 2,
    startHizbFraction: 0.0,
    endHizb: 1,
    endHizbFraction: 1.0
  }
];

// Local Storage Helper functions to sustain persistence
export function getStoredData<T>(key: string, defaultData: T): T {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    return JSON.parse(stored) as T;
  } catch (e) {
    return defaultData;
  }
}

export function setStoredData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}
