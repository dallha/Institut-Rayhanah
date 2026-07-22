import { Student, Halaqa, AttendanceRecord, QuranLesson, PaymentRecord, EtapePedagogique, Evaluation } from "./types";

// Nettoyé pour la production
export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_HALAQAS: Halaqa[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_LESSONS: QuranLesson[] = [];
export const INITIAL_PAYMENTS: PaymentRecord[] = [];

// Utilitaires de stockage local (plus utilisés car remplacés par l'API Postgres, gardés pour compatibilité de type si besoin)
export const getStoredData = (key: string, initialData: any) => initialData;
export const setStoredData = (key: string, data: any) => {};
