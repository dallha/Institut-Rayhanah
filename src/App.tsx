/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
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
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { enqueueRequest, processQueue, getQueueCount } from "./utils/offlineQueue";

export default function App() {
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isAppAuthenticated = !!session;

  const [activeTab, setActiveTab] = useState<string>("pilotage");
  const [activeDaaraSubTab, setActiveDaaraSubTab] = useState<string>("pedagogy");

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

  // Bidirectional Hash Routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || "#/pilotage";
      const parts = hash.replace("#/", "").split("/");
      const main = parts[0];
      const sub = parts[1];

      if (["pilotage", "daara", "tresorerie", "honneur", "parametres"].includes(main)) {
        setActiveTab(main);
        if (main === "daara" && sub) {
          if (["pedagogy", "attendance", "kashf", "motivation", "inscriptions"].includes(sub)) {
            setActiveDaaraSubTab(sub);
          }
        }
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Update hash when tabs/subtabs change
  useEffect(() => {
    let hash = `#/${activeTab}`;
    if (activeTab === "daara") {
      hash += `/${activeDaaraSubTab}`;
    }
    
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  }, [activeTab, activeDaaraSubTab]);

  const fetchAllData = () => {
    setIsSyncing(true);
    Promise.all([
      fetch("/api/students").then(res => res.json()),
      fetch("/api/halaqas").then(res => res.json()),
      fetch("/api/attendance").then(res => res.json()),
      fetch("/api/lessons").then(res => res.json()),
      fetch("/api/payments").then(res => res.json())
    ]).then(([studentsData, halaqasData, attendanceData, lessonsData, paymentsData]) => {
      setStudents(studentsData);
      localStorage.setItem("daara_students", JSON.stringify(studentsData));
      
      setHalaqas(halaqasData);
      localStorage.setItem("daara_halaqas", JSON.stringify(halaqasData));
      
      setAttendance(attendanceData);
      localStorage.setItem("daara_attendance", JSON.stringify(attendanceData));
      
      setLessons(lessonsData);
      localStorage.setItem("daara_lessons", JSON.stringify(lessonsData));
      
      setPayments(paymentsData);
      localStorage.setItem("daara_payments", JSON.stringify(paymentsData));
    }).catch(err => {
      console.error("Error fetching data (might be offline):", err);
    }).finally(() => {
      setIsSyncing(false);
    });
  };

  useEffect(() => {
    fetchAllData();
    
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
    // Optimistic UI Update
    const newStudents = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(newStudents);
    localStorage.setItem("daara_students", JSON.stringify(newStudents));

    try {
      const res = await fetch(`/api/students/${updatedStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent)
      });
      if (!res.ok) throw new Error("API Error");
      const saved = await res.json();
      const finalStudents = newStudents.map((s) => (s.id === saved.id ? saved : s));
      setStudents(finalStudents);
      localStorage.setItem("daara_students", JSON.stringify(finalStudents));
    } catch (err) {
      console.warn("Offline or error updating student. Queuing request...");
      enqueueRequest(`/api/students/${updatedStudent.id}`, "PUT", updatedStudent);
    }
  };

  const handleEnrollStudent = async (newStudent: Student) => {
    // Optimistic UI Update
    const newStudents = [...students, newStudent];
    setStudents(newStudents);
    localStorage.setItem("daara_students", JSON.stringify(newStudents));

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent)
      });
      if (!res.ok) throw new Error("API Error");
      const saved = await res.json();
      const finalStudents = students.map(s => s.id === newStudent.id ? saved : s); // Replace optimistic with real
      if (!students.find(s => s.id === newStudent.id)) finalStudents.push(saved);
      setStudents(finalStudents);
      localStorage.setItem("daara_students", JSON.stringify(finalStudents));
    } catch (err) {
      console.warn("Offline or error enrolling student. Queuing request...");
      enqueueRequest("/api/students", "POST", newStudent);
    }
  };

  const handleImportStudents = async (importedStudents: Partial<Student>[]) => {
    try {
      const res = await fetch("/api/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: importedStudents })
      });
      if (!res.ok) throw new Error("Échec import");
      
      // Re-fetch all students after import
      const refreshed = await fetch("/api/students").then(res => res.json());
      setStudents(refreshed);
    } catch (err) {
      console.error("Error importing students", err);
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
    if (student) {
      const updatedStudent = {
        ...student,
        balanceDue: Math.max(0, student.balanceDue - newPayment.amount)
      };
      setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
      localStorage.setItem("daara_students", JSON.stringify(students.map(s => s.id === updatedStudent.id ? updatedStudent : s)));
    }

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPayment)
      });
      if (!res.ok) throw new Error("API error");
      const saved = await res.json();
      const finalPayments = payments.map(p => p.id === newPayment.id ? saved : p);
      if (!payments.find(p => p.id === newPayment.id)) finalPayments.push(saved);
      setPayments(finalPayments);
      localStorage.setItem("daara_payments", JSON.stringify(finalPayments));
    } catch (err) {
      console.warn("Offline or error adding payment. Queuing request...");
      enqueueRequest("/api/payments", "POST", newPayment);
    }
  };

  const handleSaveAttendance = async (records: AttendanceRecord[]) => {
    const newAttendance = [...attendance, ...records];
    setAttendance(newAttendance);
    localStorage.setItem("daara_attendance", JSON.stringify(newAttendance));
    
    try {
      const res = await fetch("/api/attendance/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records })
      });
      if (!res.ok) throw new Error("API error");
      const saved = await res.json();
    } catch (err) {
      console.warn("Offline or error saving attendance. Queuing request...");
      enqueueRequest("/api/attendance/batch", "POST", { records });
    }
  };

  const handleSaveLesson = async (lesson: QuranLesson) => {
    const newLessons = [...lessons, lesson];
    setLessons(newLessons);
    localStorage.setItem("daara_lessons", JSON.stringify(newLessons));

    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lesson)
      });
      if (!res.ok) throw new Error("API Error");
      const saved = await res.json();
      const finalLessons = lessons.map(l => l.id === lesson.id ? saved : l);
      if (!lessons.find(l => l.id === lesson.id)) finalLessons.push(saved);
      setLessons(finalLessons);
      localStorage.setItem("daara_lessons", JSON.stringify(finalLessons));
    } catch (err) {
      console.warn("Offline or error saving lesson. Queuing request...");
      enqueueRequest("/api/lessons", "POST", lesson);
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
      if (lesson.evaluation === Evaluation.Naam) scoreAward = 30;

      if (lesson.type === "sourate" && lesson.endSurah) {
        return { ...student, currentSurahNum: lesson.endSurah, currentVersetNum: lesson.endVerset || 1, score: student.score + scoreAward };
      } else if (lesson.type === "hizb" && lesson.endHizb) {
        return { ...student, currentHizbNum: lesson.endHizb, currentHizbFraction: lesson.endHizbFraction || 0, score: student.score + scoreAward };
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
      const res = await fetch("/api/cloture-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceRecords, newLessons, updatedStudents: updatedStudents.filter(s => newLessons.some(l => l.studentId === s.id)) })
      });
      if (!res.ok) throw new Error("API error");
      // Refresh all state to ensure consistency
      const [finalAtt, finalLes, finalStu] = await Promise.all([
        fetch("/api/attendance").then(res => res.json()),
        fetch("/api/lessons").then(res => res.json()),
        fetch("/api/students").then(res => res.json()),
      ]);
      setAttendance(finalAtt);
      setLessons(finalLes);
      setStudents(finalStu);
      localStorage.setItem("daara_attendance", JSON.stringify(finalAtt));
      localStorage.setItem("daara_lessons", JSON.stringify(finalLes));
      localStorage.setItem("daara_students", JSON.stringify(finalStu));
    } catch (err) { 
      console.warn("Offline or error closing day. Queuing request...");
      enqueueRequest("/api/cloture-day", "POST", { attendanceRecords, newLessons, updatedStudents: updatedStudents.filter(s => newLessons.some(l => l.studentId === s.id)) });
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
              <input type="text" placeholder="Rechercher des élèves, des dars ou des règlements..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-4 text-xs font-semibold text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-[#0B1C30]" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDesignerModalOpen(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl transition-colors hidden md:block"
              title="Personnaliser le thème"
            >
              <Palette className="w-5 h-5" />
            </button>
            <div className="relative group">
              <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center cursor-pointer">
                <span className="text-emerald-700 font-bold text-sm">{session?.user?.email?.[0]?.toUpperCase() || "A"}</span>
              </div>
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
              />
            )}

            {/* PÉDAGOGIE MODULE (Appel, Suivi Coranique, Stats) */}
            {activeTab === "pedagogie" && (
              <PedagogieModule
                students={students}
                halaqas={halaqas}
                attendance={attendance}
                lessons={lessons}
                onUpdateStudent={handleUpdateStudent}
                onClotureDay={handleClotureDay}
              />
            )}

            {/* HONNEUR TAB */}
            {activeTab === "honneur" && (
              <HonneurTab students={students} halaqas={halaqas} />
            )}

            {/* PARAMETRES (ADMIN / RH) TAB */}
            {activeTab === "parametres" && (
              <ParametresTab
                students={students}
                onImportStudents={handleImportStudents}
                onUpdateInstituteName={(name) => setInstituteName(name)}
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
            <span className="text-[9px] sm:text-[10px] font-bold block w-full text-center truncate px-0.5">Pilotage</span>
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
            <span className="text-[9px] sm:text-[10px] font-bold block w-full text-center truncate px-0.5">Scolarité</span>
          </button>

          <button 
            onClick={() => setActiveTab("pedagogie")}
            className={`flex-1 flex flex-col items-center justify-center h-full gap-1 transition-colors cursor-pointer min-w-0 ${activeTab === "pedagogie" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Mosque className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${activeTab === "pedagogie" ? "stroke-[2.5px]" : "stroke-2"}`} />
            <span className="text-[9px] sm:text-[10px] font-bold block w-full text-center truncate px-0.5">Pédagogie</span>
          </button>

          <button 
            onClick={() => setActiveTab("honneur")}
            className={`flex-1 flex flex-col items-center justify-center h-full gap-1 transition-colors cursor-pointer min-w-0 ${activeTab === "honneur" ? "text-amber-500" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Trophy className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${activeTab === "honneur" ? "stroke-[2.5px]" : "stroke-2"}`} />
            <span className="text-[9px] sm:text-[10px] font-bold block w-full text-center truncate px-0.5">Honneur</span>
          </button>

          <button 
            onClick={() => setActiveTab("parametres")}
            className={`flex-1 flex flex-col items-center justify-center h-full gap-1 transition-colors cursor-pointer min-w-0 ${activeTab === "parametres" ? "text-[#0B1C30]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Settings className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${activeTab === "parametres" ? "stroke-[2.5px]" : "stroke-2"}`} />
            <span className="text-[9px] sm:text-[10px] font-bold block w-full text-center truncate px-0.5">Admin/RH</span>
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
