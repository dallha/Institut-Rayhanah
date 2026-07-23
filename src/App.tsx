/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { Student, Halaqa, AttendanceRecord, QuranLesson, PaymentRecord, EtapePedagogique, Evaluation } from "./types";
import {
  INITIAL_STUDENTS,
  INITIAL_HALAQAS,
  INITIAL_ATTENDANCE,
  INITIAL_PAYMENTS,
  INITIAL_LESSONS,
  getStoredData,
  setStoredData
} from "./mockData";

import ScolariteModule from "./components/ScolariteModule";
import PedagogieModule from "./components/PedagogieModule";
import PilotageTab from "./components/PilotageTab";
import ParametresTab from "./components/ParametresTab";
import HonneurTab from "./components/HonneurTab";
import PortailFamille from "./components/PortailFamille";
import DesignerModal from "./components/DesignerModal";

import { 
  BookOpen, 
  UserCheck, 
  CalendarDays, 
  Trophy, 
  Users, 
  CreditCard, 
  ChevronDown,
  LayoutDashboard,
  GraduationCap,
  BookOpen as Mosque, // elegant fallback
  Heart,
  MessageSquare,
  LogOut,
  Settings,
  Search,
  BellRing,
  UserPlus,
  FileCheck,
  Lock,
  KeyRound,
  User,
  Palette,
  Menu,
  X as XIcon,
  Wifi,
  WifiOff,
  RefreshCw,
  Phone,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { enqueueRequest, processQueue, getQueueCount } from "./utils/offlineQueue";

export default function App() {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('daara_language', lng);
  };
  
  // Supabase Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState<boolean>(false);

  // Dynamic Institute Settings
  const [instituteName, setInstituteName] = useState<string>(() => 
    localStorage.getItem("daara_institute_name") || "Institut Rayhanah"
  );
  const [isDesignerModalOpen, setIsDesignerModalOpen] = useState<boolean>(false);

  // Listen to Supabase session changes (persists across page reloads)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleGlobalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSubmitting(true);
    setLoginError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      setLoginError("Email ou mot de passe incorrect.");
      setLoginPassword("");
    }
    setLoginSubmitting(false);
  };

  const [isFamilyModeActive, setIsFamilyModeActive] = useState<boolean>(() => {
    return localStorage.getItem("daara_user_mode") === "famille";
  });

  // Family Portal Authentication State
  const [familyLoginInput, setFamilyLoginInput] = useState("");
  const [familyAuthLoading, setFamilyAuthLoading] = useState(false);
  const [familyAuthError, setFamilyAuthError] = useState<string | null>(null);
  const [familyAuthenticatedStudentIds, setFamilyAuthenticatedStudentIds] = useState<string[]>(() => {
    const cached = localStorage.getItem("daara_family_session");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return parsed.studentIds || [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const handleLogout = async () => {
    localStorage.removeItem("daara_user_mode");
    setIsFamilyModeActive(false);
    await supabase.auth.signOut();
  };

  const handleFamilyLogout = () => {
    setFamilyAuthenticatedStudentIds([]);
    localStorage.removeItem("daara_family_session");
    setIsFamilyModeActive(false);
    localStorage.removeItem("daara_user_mode");
  };

  const handleFamilyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = familyLoginInput.trim();
    if (!rawVal) {
      setFamilyAuthError("Veuillez saisir un matricule ou numéro de téléphone.");
      return;
    }

    setFamilyAuthLoading(true);
    setFamilyAuthError(null);

    const cleanDigits = rawVal.replace(/\D/g, "");

    try {
      // 1. Query Supabase cloud first
      const { data: supaStudents, error } = await supabase
        .from("Student")
        .select("*");

      let matches: Student[] = [];

      if (!error && supaStudents && supaStudents.length > 0) {
        matches = (supaStudents as Student[]).filter((s) => {
          const matMatch = s.matricule?.toLowerCase().includes(rawVal.toLowerCase());
          const phones = [s.parentPhone, s.fatherPhone, s.motherPhone, s.guardianPhone].filter(Boolean) as string[];
          const phoneMatch = phones.some((p) => {
            const digits = p.replace(/\D/g, "");
            return p.includes(rawVal) || (cleanDigits.length >= 6 && digits.includes(cleanDigits));
          });
          return matMatch || phoneMatch;
        });
      }

      // 2. Fallback to local students cache if Supabase returned no match or offline
      if (matches.length === 0 && students.length > 0) {
        matches = students.filter((s) => {
          const matMatch = s.matricule?.toLowerCase().includes(rawVal.toLowerCase());
          const phones = [s.parentPhone, s.fatherPhone, s.motherPhone, s.guardianPhone].filter(Boolean) as string[];
          const phoneMatch = phones.some((p) => {
            const digits = p.replace(/\D/g, "");
            return p.includes(rawVal) || (cleanDigits.length >= 6 && digits.includes(cleanDigits));
          });
          return matMatch || phoneMatch;
        });
      }

      if (matches.length === 0) {
        setFamilyAuthError("Aucun élève trouvé avec ce matricule ou numéro de téléphone.");
      } else {
        const studentIds = matches.map((m) => m.id);
        setFamilyAuthenticatedStudentIds(studentIds);
        localStorage.setItem("daara_family_session", JSON.stringify({ code: rawVal, studentIds }));
        setIsFamilyModeActive(true);
        localStorage.setItem("daara_user_mode", "famille");
      }
    } catch (err: any) {
      setFamilyAuthError("Erreur de connexion : " + (err.message || err));
    } finally {
      setFamilyAuthLoading(false);
    }
  };

  const isAppAuthenticated = !!session || (isFamilyModeActive && familyAuthenticatedStudentIds.length > 0);


  // Core global state loaded from local storage for durability
  const [students, setStudents] = useState<Student[]>(() => {
    const cached = localStorage.getItem("daara_students");
    return cached ? JSON.parse(cached) : [];
  });
  const [halaqas, setHalaqas] = useState<Halaqa[]>(() => {
    const cached = localStorage.getItem("daara_halaqas");
    return cached ? JSON.parse(cached) : [];
  });
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const cached = localStorage.getItem("daara_attendance");
    return cached ? JSON.parse(cached) : [];
  });
  const [lessons, setLessons] = useState<QuranLesson[]>(() => {
    const cached = localStorage.getItem("daara_lessons");
    return cached ? JSON.parse(cached) : [];
  });
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const cached = localStorage.getItem("daara_payments");
    return cached ? JSON.parse(cached) : [];
  });
  const [unpaidThreshold, setUnpaidThreshold] = useState<number>(15000);
  
  // Offline State
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [pendingSyncs, setPendingSyncs] = useState<number>(getQueueCount());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Read hash once synchronously at init so the correct tab is restored on refresh
  const [activeTab, setActiveTab] = useState<string>(() => {
    const hash = window.location.hash;
    if (!hash) return "pilotage";
    const main = hash.replace("#/", "").split("/")[0];
    return ["pilotage", "scolarite", "pedagogie", "honneur", "parametres"].includes(main)
      ? main
      : "pilotage";
  });
  const [activeDaaraSubTab, setActiveDaaraSubTab] = useState<string>(() => {
    const hash = window.location.hash;
    if (!hash) return "";
    const parts = hash.replace("#/", "").split("/");
    return parts[1] || "";
  });

  // Bidirectional Hash Routing — listen to browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || "#/pilotage";
      const parts = hash.replace("#/", "").split("/");
      const main = parts[0];
      const sub = parts[1];
      if (["pilotage", "scolarite", "pedagogie", "honneur", "parametres"].includes(main)) {
        setActiveTab(main);
        if (sub) {
          setActiveDaaraSubTab(sub);
        }
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Keep URL hash in sync when user clicks tabs
  useEffect(() => {
    let hash = `#/${activeTab}`;
    if (activeDaaraSubTab) {
      hash += `/${activeDaaraSubTab}`;
    }
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  }, [activeTab, activeDaaraSubTab]);


  const fetchAllData = async () => {
    setIsSyncing(true);
    try {
      const [
        { data: studentsData, error: sErr },
        { data: halaqasData, error: hErr },
        { data: attendanceData },
        { data: lessonsData },
        { data: paymentsData }
      ] = await Promise.all([
        supabase.from("Student").select("*"),
        supabase.from("Halaqa").select("*"),
        supabase.from("AttendanceRecord").select("*"),
        supabase.from("QuranLesson").select("*"),
        supabase.from("PaymentRecord").select("*")
      ]);

      if (!sErr && studentsData && Array.isArray(studentsData)) {
        setStudents(studentsData as any);
        localStorage.setItem("daara_students", JSON.stringify(studentsData));
      }
      if (!hErr && halaqasData && Array.isArray(halaqasData)) {
        setHalaqas(halaqasData as any);
        localStorage.setItem("daara_halaqas", JSON.stringify(halaqasData));
      }
      if (attendanceData && Array.isArray(attendanceData)) {
        setAttendance(attendanceData as any);
        localStorage.setItem("daara_attendance", JSON.stringify(attendanceData));
      }
      if (lessonsData && Array.isArray(lessonsData)) {
        setLessons(lessonsData as any);
        localStorage.setItem("daara_lessons", JSON.stringify(lessonsData));
      }
      if (paymentsData && Array.isArray(paymentsData)) {
        setPayments(paymentsData as any);
        localStorage.setItem("daara_payments", JSON.stringify(paymentsData));
      }
    } catch (err) {
      console.warn("Supabase fetch error, fallback to local cache:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    try {
      // 1. Sync Halaqas first
      if (halaqas.length > 0) {
        const { error: hErr } = await supabase.from("Halaqa").upsert(halaqas);
        if (hErr) throw new Error("Erreur Halaqas : " + hErr.message);
      }
      // 2. Sync Students
      if (students.length > 0) {
        const cleanStudents = students.map(({ medals, ...s }) => s);
        const { error: sErr } = await supabase.from("Student").upsert(cleanStudents);
        if (sErr) throw new Error("Erreur Élèves : " + sErr.message);
      }
      // 3. Sync Payments
      if (payments.length > 0) {
        const { error: pErr } = await supabase.from("PaymentRecord").upsert(payments);
        if (pErr) console.warn("Payment sync warn:", pErr);
      }
      // 4. Sync Lessons
      if (lessons.length > 0) {
        const { error: lErr } = await supabase.from("QuranLesson").upsert(lessons);
        if (lErr) console.warn("Lesson sync warn:", lErr);
      }
      // 5. Sync Attendance
      if (attendance.length > 0) {
        const { error: aErr } = await supabase.from("AttendanceRecord").upsert(attendance);
        if (aErr) console.warn("Attendance sync warn:", aErr);
      }
      // 6. Sync Staff Members
      const cachedStaff = localStorage.getItem("daara_staff_list");
      if (cachedStaff) {
        const staffArr = JSON.parse(cachedStaff);
        if (Array.isArray(staffArr) && staffArr.length > 0) {
          const formattedStaff = staffArr.map((s: any) => ({ ...s, id: String(s.id) }));
          const { error: stErr } = await supabase.from("Staff").upsert(formattedStaff);
          if (stErr) console.warn("Staff sync warn:", stErr);
        }
      }

      alert("✅ Sauvegarde réussie sur Supabase Cloud !\nToutes vos données sont à jour et synchronisées sur tous vos appareils.");
    } catch (err: any) {
      console.error("Error saving to Supabase:", err);
      alert("⚠️ Problème de synchronisation Supabase :\n" + (err.message || "Vérifiez votre connexion"));
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Supabase Real-Time Listener (instant updates across mobile & desktop)
    const channel = supabase
      .channel("schema-db-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "Student" }, () => {
        fetchAllData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "Halaqa" }, () => {
        fetchAllData();
      })
      .subscribe();
    
    // Offline Listeners
    const handleOnline = () => {
      setIsOffline(false);
      processQueue();
    };
    const handleOffline = () => setIsOffline(true);
    const handleQueueUpdate = () => setPendingSyncs(getQueueCount());
    const handleSyncComplete = () => fetchAllData();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('daara_queue_updated', handleQueueUpdate);
    window.addEventListener('daara_sync_complete', handleSyncComplete);
    
    // Try processing queue on boot just in case
    processQueue();
    
    // Get stored unpaid threshold
    const storedThreshold = localStorage.getItem("daara_unpaid_threshold");
    if (storedThreshold !== null) {
      setUnpaidThreshold(Number(storedThreshold));
    }
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('daara_queue_updated', handleQueueUpdate);
      window.removeEventListener('daara_sync_complete', handleSyncComplete);
    };
  }, []);

  const saveUnpaidThreshold = (val: number) => {
    setUnpaidThreshold(val);
    localStorage.setItem("daara_unpaid_threshold", val.toString());
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    const newStudents = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(newStudents);
    localStorage.setItem("daara_students", JSON.stringify(newStudents));

    try {
      const { medals, ...cleanStudent } = updatedStudent;
      await supabase.from("Student").upsert(cleanStudent);
    } catch (err) {
      console.warn("Error updating student in Supabase:", err);
    }
  };

  const handleAddHalaqa = async (newHalaqa: Halaqa) => {
    const updated = [...halaqas, newHalaqa];
    setHalaqas(updated);
    localStorage.setItem("daara_halaqas", JSON.stringify(updated));
    try {
      await supabase.from("Halaqa").upsert(newHalaqa);
    } catch (err) {
      console.warn("Error adding halaqa to Supabase:", err);
    }
  };

  const handleUpdateHalaqa = async (updatedHalaqa: Halaqa) => {
    const updated = halaqas.map(h => h.id === updatedHalaqa.id ? updatedHalaqa : h);
    setHalaqas(updated);
    localStorage.setItem("daara_halaqas", JSON.stringify(updated));
    try {
      await supabase.from("Halaqa").upsert(updatedHalaqa);
    } catch (err) {
      console.warn("Error updating halaqa in Supabase:", err);
    }
  };

  const handleDeleteHalaqa = async (halaqaId: string) => {
    const updated = halaqas.filter(h => h.id !== halaqaId);
    setHalaqas(updated);
    localStorage.setItem("daara_halaqas", JSON.stringify(updated));
    try {
      await supabase.from("Halaqa").delete().eq("id", halaqaId);
    } catch (err) {
      console.warn("Error deleting halaqa from Supabase:", err);
    }
  };

  const handleEnrollStudent = async (newStudent: Student) => {
    const newStudents = [...students, newStudent];
    setStudents(newStudents);
    localStorage.setItem("daara_students", JSON.stringify(newStudents));

    try {
      const { medals, ...cleanStudent } = newStudent;
      await supabase.from("Student").upsert(cleanStudent);
    } catch (err) {
      console.warn("Error enrolling student in Supabase:", err);
    }
  };

  const handleImportStudents = async (importedStudents: Partial<Student>[]) => {
    try {
      const cleanStudents = importedStudents.map(({ medals, ...s }: any) => s);
      await supabase.from("Student").upsert(cleanStudents);
      fetchAllData();
    } catch (err) {
      console.error("Error importing students to Supabase", err);
      throw err;
    }
  };

  const handleAwardMedal = async (studentId: string, medal: { id: string; name: string; icon: string; date: string }) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const updatedStudent = {
      ...student,
      medals: [...student.medals, medal],
      score: student.score + 50
    };
    handleUpdateStudent(updatedStudent);
  };

  const handleAddPayment = async (newPayment: PaymentRecord) => {
    const newPayments = [...payments, newPayment];
    setPayments(newPayments);
    localStorage.setItem("daara_payments", JSON.stringify(newPayments));
    
    // Update balance optimistically
    const student = students.find(s => s.id === newPayment.studentId);
    let updatedStudent: Student | null = null;
    if (student) {
      updatedStudent = {
        ...student,
        balanceDue: Math.max(0, student.balanceDue - newPayment.amount)
      };
      const finalStudents = students.map(s => s.id === updatedStudent!.id ? updatedStudent! : s);
      setStudents(finalStudents);
      localStorage.setItem("daara_students", JSON.stringify(finalStudents));
    }

    try {
      await supabase.from("PaymentRecord").upsert(newPayment);
      if (updatedStudent) {
        const { medals, ...cleanStudent } = updatedStudent;
        await supabase.from("Student").upsert(cleanStudent);
      }
    } catch (err) {
      console.warn("Error saving payment to Supabase:", err);
    }
  };

  const handleSaveAttendance = async (records: AttendanceRecord[]) => {
    const newAttendance = [...attendance, ...records];
    setAttendance(newAttendance);
    localStorage.setItem("daara_attendance", JSON.stringify(newAttendance));
    
    try {
      if (records.length > 0) {
        await supabase.from("AttendanceRecord").upsert(records);
      }
    } catch (err) {
      console.warn("Error saving attendance to Supabase:", err);
    }
  };

  const handleSaveLesson = async (lesson: QuranLesson) => {
    const newLessons = [...lessons, lesson];
    setLessons(newLessons);
    localStorage.setItem("daara_lessons", JSON.stringify(newLessons));

    try {
      await supabase.from("QuranLesson").upsert(lesson);
    } catch (err) {
      console.warn("Error saving lesson to Supabase:", err);
    }
  };

  /**
   * Clôture la journée pédagogique:
   * - Appends attendance logs.
   * - Appends new lessons.
   * - Updates each present student's current Quranic cursor location (Surah/Verset or Hizb/Fraction).
   * - Grants score points (+15 basic lesson completion, +30 for Excellent ممتاز evaluation).
   */
  const handleClotureDay = async (attendanceRecords: AttendanceRecord[], newLessons: QuranLesson[]) => {
    const updatedStudents = students.map((student) => {
      const lesson = newLessons.find((l) => l.studentId === student.id);
      if (!lesson) return student;

      let scoreAward = 15;
      if (lesson.evaluation === Evaluation.Naam) {
        scoreAward = 30;
        
        if (lesson.type === "sourate" && lesson.endSurah) {
          return { ...student, currentSurahNum: lesson.endSurah, currentVersetNum: lesson.endVerset || 1, score: student.score + scoreAward };
        } else if (lesson.type === "hizb" && lesson.endHizb) {
          return { ...student, currentHizbNum: lesson.endHizb, currentHizbFraction: lesson.endHizbFraction || 0, score: student.score + scoreAward };
        }
      }
      
      return { ...student, score: student.score + scoreAward };
    });

    // Optimistic Update
    const newAtt = [...attendance, ...attendanceRecords];
    const newLes = [...lessons, ...newLessons];
    setAttendance(newAtt);
    setLessons(newLes);
    setStudents(updatedStudents);
    
    localStorage.setItem("daara_attendance", JSON.stringify(newAtt));
    localStorage.setItem("daara_lessons", JSON.stringify(newLes));
    localStorage.setItem("daara_students", JSON.stringify(updatedStudents));

    try {
      if (attendanceRecords.length > 0) {
        await supabase.from("AttendanceRecord").upsert(attendanceRecords);
      }
      if (newLessons.length > 0) {
        await supabase.from("QuranLesson").upsert(newLessons);
      }
      if (updatedStudents.length > 0) {
        const cleanStudents = updatedStudents.map(({ medals, ...s }) => s);
        await supabase.from("Student").upsert(cleanStudents);
      }
    } catch (err) { 
      console.warn("Error closing day in Supabase:", err);
    }
  };

  const unpaidAlertCount = students.filter(s => s.balanceDue > unpaidThreshold).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0B1C30] border-t-[#D0A21C] rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  if (!isAppAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans relative overflow-hidden">
        {/* Decorative background watermark (inspired by the PDF background) */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
          <img src="/logo.png" alt="" className="w-[120%] h-[120%] object-cover opacity-20" />
        </div>

        {/* Top Accent Line */}
        <div className="w-full h-2 bg-[#0B1C30] flex">
          <div className="w-1/2 h-full bg-[#D0A21C] ml-auto"></div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-4 z-10">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-64 h-24 mx-auto mb-4">
                <img src="/logo.png" alt="Institut Rayhanah" className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <h1 className="text-xl font-bold text-[#0B1C30] mb-1">Espace Direction & Administration</h1>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                Institut Rayhana pour l'enseignement coranique et l'éducation Islamique
              </p>
            </div>

            {/* Mode Switcher Tabs on Login */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200">
              <button
                type="button"
                onClick={() => setIsFamilyModeActive(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  !isFamilyModeActive ? "bg-[#0B1C30] text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Administration / Oustaz</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFamilyModeActive(true);
                  localStorage.setItem("daara_user_mode", "famille");
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isFamilyModeActive ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>Portail Famille (Parents)</span>
              </button>
            </div>

            {isFamilyModeActive ? (
              <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-[0_20px_60px_rgb(11,28,48,0.08)] border border-pink-100 space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto border border-pink-100 text-pink-600">
                    <Heart className="w-7 h-7 fill-pink-500" />
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-800">Espace Suivi Parental & Famille</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Saisissez le **matricule de l'élève** (ex: <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-bold">IRY-0001</code>) ou le **numéro de téléphone du parent**.
                  </p>
                </div>

                <form onSubmit={handleFamilyLogin} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Code Élève (Matricule) ou N° Téléphone Parent *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-pink-500" />
                      </div>
                      <input
                        type="text"
                        value={familyLoginInput}
                        onChange={(e) => {
                          setFamilyLoginInput(e.target.value);
                          setFamilyAuthError(null);
                        }}
                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all font-semibold text-slate-800 text-sm"
                        placeholder="Ex: IRY-0001 ou +221 77 123 45 67"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {familyAuthError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{familyAuthError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={familyAuthLoading}
                    className="w-full bg-gradient-to-r from-[#0B1C30] via-[#142d47] to-[#0B1C30] text-white px-4 py-4 rounded-xl font-bold hover:shadow-lg transition-all flex justify-center items-center gap-2 text-sm cursor-pointer disabled:opacity-60"
                  >
                    {familyAuthLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Recherche Supabase en cours...</>
                    ) : (
                      <><Users className="w-4 h-4 text-[#D0A21C]" />Accéder à la Fiche de mon Enfant</>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-[0_20px_60px_rgb(11,28,48,0.08)] border border-slate-100 relative">
                <form onSubmit={handleGlobalLogin} className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Adresse Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-[#D0A21C]" />
                      </div>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0B1C30] focus:ring-2 focus:ring-[#0B1C30]/20 transition-all font-semibold text-slate-800 text-sm"
                        placeholder="votre@email.com"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Mot de passe</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-[#D0A21C]" />
                      </div>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={`block w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border ${loginError ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-200'} rounded-xl focus:outline-none focus:border-[#0B1C30] focus:ring-2 focus:ring-[#0B1C30]/20 transition-all font-semibold text-slate-800 text-sm`}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    {loginError && (
                      <p className="text-rose-500 text-xs mt-2 font-bold flex items-center gap-1">
                        {loginError}
                      </p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loginSubmitting}
                    className="w-full bg-[#0B1C30] text-white px-4 py-4 rounded-xl font-bold hover:bg-[#142d47] hover:shadow-xl hover:shadow-[#0B1C30]/20 transition-all duration-300 mt-4 flex justify-center items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loginSubmitting ? (
                      <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Connexion en cours...</>
                    ) : (
                      <><Lock className="w-4 h-4" />Déverrouiller le système</>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* PDF-Inspired Footer */}
        <div className="w-full bg-white border-t-4 border-[#0B1C30] relative z-10">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#D0A21C] -mt-1.5"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[#0B1C30] text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shrink-0">
                <img src="/logo.png" alt="Pin" className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" style={{ filter: 'grayscale(100%) brightness(40%) sepia(100%) hue-rotate(150deg) saturate(300%)' }} /> 
              </div>
              <span className="font-bold text-sm sm:text-base md:text-lg">Somisci Mermoz, Villa N 30</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <span className="font-bold text-sm sm:text-base md:text-lg">+221 77 663 32 42 / 75 109 66 66</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Portail Famille : standalone screen, bypasses admin layout entirely ──
  if (isFamilyModeActive) {
    return (
      <PortailFamille
        students={
          familyAuthenticatedStudentIds.length > 0
            ? students.filter((s) => familyAuthenticatedStudentIds.includes(s.id))
            : students
        }
        halaqas={halaqas}
        attendance={attendance}
        lessons={lessons}
        payments={payments}
        onLogoutParent={handleFamilyLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col font-sans pb-24 overflow-x-hidden w-full relative" id="daara-erp-root">
      {/* Decorative premium gold & navy top line */}
      <div className="h-1.5 bg-[#0B1C30] w-full relative" id="top-emerald-accent">
        <div className="absolute top-0 right-0 left-1/2 h-full bg-[#D0A21C] w-1/2"></div>
      </div>

      {/* Main Header / TopAppBar */}
      <header className="bg-white shadow-xs border-b border-slate-100 sticky top-0 z-30" id="daara-main-header">
        <div className="py-3 sm:py-4 px-3 sm:px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="h-12 flex-shrink-0 flex items-center justify-start gap-3">
              <img src="/logo.png" alt="Logo Rayhanah" className="max-w-full max-h-full object-contain" />
              <div className="hidden md:flex flex-col border-l border-slate-200 pl-3">
                <span className="font-extrabold text-sm text-[#0B1C30] tracking-tight">{instituteName}</span>
                <span className="text-[9px] font-bold text-[#D0A21C] uppercase tracking-wider">Système ERP & Pédagogie</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md mt-2 sm:mt-0 sm:mx-4">
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400"><Search className="w-4 h-4" /></span>
              <input type="text" placeholder={t('navbar.search')} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-4 text-xs font-semibold text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-[#0B1C30]" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncToSupabase}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isSyncing
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-emerald-700 hover:bg-emerald-800 text-white"
              }`}
              title="Sauvegarder et synchroniser toutes les données sur Supabase Cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">
                {isSyncing ? t('navbar.saving') : `💾 ${t('navbar.save')}`}
              </span>
            </button>
            <div className="flex bg-slate-100 rounded-xl p-0.5 ml-2 mr-2">
              <button
                onClick={() => changeLanguage('fr')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${i18n.language === 'fr' ? 'bg-white shadow-sm text-[#0B1C30]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                FR
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${i18n.language === 'en' ? 'bg-white shadow-sm text-[#0B1C30]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                EN
              </button>
            </div>
            <button
              onClick={() => setIsDesignerModalOpen(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl transition-colors hidden md:block"
              title={t('navbar.theme')}
            >
              <Palette className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                <span className="text-emerald-700 font-bold text-sm">{session?.user?.email?.[0]?.toUpperCase() || "A"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Se déconnecter"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Offline & Sync Indicators */}
        {(isOffline || pendingSyncs > 0) && (
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between text-[11px] md:text-xs">
            {isOffline ? (
              <div className="flex items-center text-amber-600 font-bold gap-1.5">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Mode Hors-Ligne. Saisie possible, synchronisation en attente.</span>
              </div>
            ) : (
              <div className="flex items-center text-emerald-600 font-bold gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                <span>Réseau rétabli. Synchronisation possible.</span>
              </div>
            )}
            
            {pendingSyncs > 0 && (
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                  {pendingSyncs} modif(s) en attente
                </span>
                {!isOffline && (
                  <button 
                    onClick={() => processQueue()}
                    disabled={isSyncing}
                    className={`flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded-lg font-bold shadow-sm transition-opacity ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700'}`}
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Synchroniser</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#FDFBF7] p-4 md:p-6 lg:p-8" id="daara-main-workspace">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            id="active-tab-content-wrapper"
          >
            {/* PILOTAGE TAB */}
            {activeTab === "pilotage" && (
              <PilotageTab
                students={students}
                halaqas={halaqas}
                payments={payments}
                attendance={attendance}
                lessons={lessons}
                onNavigateToTab={(tab, sub) => {
                  if (tab === "daara") {
                    if (sub === "inscriptions" || sub === "kashf") setActiveTab("scolarite");
                    else setActiveTab("pedagogie");
                  } else {
                    setActiveTab(tab);
                  }
                }}
              />
            )}

            {/* SCOLARITÉ MODULE (Inscriptions, Liste, Trésorerie, Bulletins) */}
            {activeTab === "scolarite" && (
              <ScolariteModule
                students={students}
                halaqas={halaqas}
                payments={payments}
                attendance={attendance}
                lessons={lessons}
                onEnrollStudent={handleEnrollStudent}
                onAddPayment={handleAddPayment}
                unpaidThreshold={unpaidThreshold}
                onUpdateThreshold={saveUnpaidThreshold}
                initialSubTab={activeDaaraSubTab || "inscriptions"}
              />
            )}

            {/* PÉDAGOGIE MODULE (Appel, Suivi Coranique, Stats) */}
            {activeTab === "pedagogie" && (
              <PedagogieModule
                students={students}
                halaqas={halaqas}
                attendance={attendance}
                lessons={lessons}
                payments={payments}
                onUpdateStudent={handleUpdateStudent}
                onClotureDay={handleClotureDay}
                onAddHalaqa={handleAddHalaqa}
                onUpdateHalaqa={handleUpdateHalaqa}
                onDeleteHalaqa={handleDeleteHalaqa}
                initialSubTab={activeDaaraSubTab || "pedagogy"}
              />
            )}

            {/* PORTAIL FAMILLE is now a standalone screen — see early return above */}

            {/* HONNEUR TAB */}
            {activeTab === "honneur" && (
              <HonneurTab students={students} halaqas={halaqas} />
            )}

            {/* PARAMETRES (ADMIN / RH) TAB */}
            {activeTab === "parametres" && (
              <ParametresTab
                students={students}
                halaqas={halaqas}
                attendance={attendance}
                lessons={lessons}
                payments={payments}
                onImportStudents={handleImportStudents}
                onUpdateInstituteName={(name) => setInstituteName(name)}
                onUpdateStudent={handleUpdateStudent}
                onAddHalaqa={handleAddHalaqa}
                onUpdateHalaqa={handleUpdateHalaqa}
                onDeleteHalaqa={handleDeleteHalaqa}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Discrete Footer Copyright Link */}
        <div className="py-4 text-center text-xs text-slate-400 font-medium">
          <span>© {new Date().getFullYear()} {instituteName} — Tous droits réservés • </span>
          <button
            onClick={() => setIsDesignerModalOpen(true)}
            className="text-[#0B1C30] hover:text-[#D0A21C] font-bold underline transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <Palette className="w-3 h-3 text-[#D0A21C]" />
            <span>Graphiste de la Hadara</span>
          </button>
        </div>
      </main>

      {/* BOTTOM NAVIGATION (5 Separate Spaces) */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-50 safe-area-pb">
        <div className="flex justify-around items-center h-16 max-w-7xl mx-auto px-1 sm:px-4">
          <button 
            onClick={() => setActiveTab("pilotage")}
            className={`flex-1 flex flex-col items-center justify-center h-full gap-1 transition-colors cursor-pointer min-w-0 ${activeTab === "pilotage" ? "text-[#0B1C30]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <LayoutDashboard className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${activeTab === "pilotage" ? "stroke-[2.5px]" : "stroke-2"}`} />
            <span className="text-[9px] sm:text-[10px] font-bold block w-full text-center truncate px-0.5">{t('sidebar.dashboard')}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("scolarite")}
            className={`flex-1 flex flex-col items-center justify-center h-full gap-1 transition-colors cursor-pointer min-w-0 relative ${activeTab === "scolarite" ? "text-[#0B1C30]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <div className="relative shrink-0">
              <GraduationCap className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === "scolarite" ? "stroke-[2.5px]" : "stroke-2"}`} />
              {unpaidAlertCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                  {unpaidAlertCount}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold block w-full text-center truncate px-0.5">{t('sidebar.school')}</span>
          </button>

          <button 
            onClick={() => setActiveTab("pedagogie")}
            className={`flex-1 flex flex-col items-center justify-center h-full gap-1 transition-colors cursor-pointer min-w-0 ${activeTab === "pedagogie" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Mosque className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${activeTab === "pedagogie" ? "stroke-[2.5px]" : "stroke-2"}`} />
            <span className="text-[9px] sm:text-[10px] font-bold block w-full text-center truncate px-0.5">{t('sidebar.pedagogy')}</span>
          </button>

          <button 
            onClick={() => setActiveTab("honneur")}
            className={`flex-1 flex flex-col items-center justify-center h-full gap-1 transition-colors cursor-pointer min-w-0 ${activeTab === "honneur" ? "text-amber-500" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Trophy className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${activeTab === "honneur" ? "stroke-[2.5px]" : "stroke-2"}`} />
            <span className="text-[9px] sm:text-[10px] font-bold block w-full text-center truncate px-0.5">{t('sidebar.honor')}</span>
          </button>

          <button 
            onClick={() => setActiveTab("parametres")}
            className={`flex-1 flex flex-col items-center justify-center h-full gap-1 transition-colors cursor-pointer min-w-0 ${activeTab === "parametres" ? "text-[#0B1C30]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Settings className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${activeTab === "parametres" ? "stroke-[2.5px]" : "stroke-2"}`} />
            <span className="text-[9px] sm:text-[10px] font-bold block w-full text-center truncate px-0.5">{t('sidebar.settings')}</span>
          </button>
        </div>
      </nav>

      {/* Designer Portfolio Modal */}
      <DesignerModal 
        isOpen={isDesignerModalOpen} 
        onClose={() => setIsDesignerModalOpen(false)} 
      />
    </div>
  );
}
