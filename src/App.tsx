/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
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
  Palette
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Global Authentication State
  const [isAppAuthenticated, setIsAppAuthenticated] = useState<boolean>(false);
  const [loginUsername, setLoginUsername] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<boolean>(false);

  // Dynamic Institute Settings
  const [instituteName, setInstituteName] = useState<string>(() => 
    localStorage.getItem("daara_institute_name") || "Institut Rayhanah"
  );
  const [isDesignerModalOpen, setIsDesignerModalOpen] = useState<boolean>(false);

  const handleGlobalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === "directeur" && loginPassword === "Cheikh@66#") {
      setIsAppAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setLoginPassword("");
    }
  };

  const [activeTab, setActiveTab] = useState<string>("pilotage");
  const [activeDaaraSubTab, setActiveDaaraSubTab] = useState<string>("pedagogy");

  // Core global state loaded from local storage for durability
  const [students, setStudents] = useState<Student[]>([]);
  const [halaqas, setHalaqas] = useState<Halaqa[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [lessons, setLessons] = useState<QuranLesson[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [unpaidThreshold, setUnpaidThreshold] = useState<number>(15000);

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

  useEffect(() => {
    // Fetch data from API instead of localStorage
    Promise.all([
      fetch("/api/students").then(res => res.json()),
      fetch("/api/halaqas").then(res => res.json()),
      fetch("/api/attendance").then(res => res.json()),
      fetch("/api/lessons").then(res => res.json()),
      fetch("/api/payments").then(res => res.json())
    ]).then(([studentsData, halaqasData, attendanceData, lessonsData, paymentsData]) => {
      setStudents(studentsData);
      setHalaqas(halaqasData);
      setAttendance(attendanceData);
      setLessons(lessonsData);
      setPayments(paymentsData);
    }).catch(err => console.error("Error fetching data:", err));
    
    // Get stored unpaid threshold
    const storedThreshold = localStorage.getItem("daara_unpaid_threshold");
    if (storedThreshold !== null) {
      setUnpaidThreshold(Number(storedThreshold));
    }
  }, []);

  const saveUnpaidThreshold = (val: number) => {
    setUnpaidThreshold(val);
    localStorage.setItem("daara_unpaid_threshold", val.toString());
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    try {
      const res = await fetch(`/api/students/${updatedStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent)
      });
      const saved = await res.json();
      setStudents(students.map((s) => (s.id === saved.id ? saved : s)));
    } catch (err) { console.error("Error updating student", err); }
  };

  const handleEnrollStudent = async (newStudent: Student) => {
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent)
      });
      const saved = await res.json();
      setStudents([...students, saved]);
    } catch (err) { console.error("Error enrolling student", err); }
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
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPayment)
      });
      const saved = await res.json();
      setPayments([...payments, saved]);

      const student = students.find(s => s.id === saved.studentId);
      if (student) {
        handleUpdateStudent({
          ...student,
          balanceDue: Math.max(0, student.balanceDue - saved.amount)
        });
      }
    } catch (err) { console.error("Error adding payment", err); }
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
    }).filter(s => newLessons.some(l => l.studentId === s.id));

    try {
      await fetch("/api/cloture-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceRecords, newLessons, updatedStudents })
      });
      // Refresh all state to ensure consistency
      const [newAtt, newLes, newStu] = await Promise.all([
        fetch("/api/attendance").then(res => res.json()),
        fetch("/api/lessons").then(res => res.json()),
        fetch("/api/students").then(res => res.json()),
      ]);
      setAttendance(newAtt);
      setLessons(newLes);
      setStudents(newStu);
    } catch (err) { console.error("Error closing day", err); }
  };

  const unpaidAlertCount = students.filter(s => s.balanceDue > unpaidThreshold).length;

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
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Identifiant</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-[#D0A21C]" />
                    </div>
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0B1C30] focus:ring-2 focus:ring-[#0B1C30]/20 transition-all font-semibold text-slate-800 text-sm"
                      placeholder="Saisissez votre identifiant"
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
                    />
                  </div>
                  {loginError && (
                    <p className="text-rose-500 text-xs mt-2 font-bold flex items-center gap-1">
                      Identifiant ou mot de passe incorrect.
                    </p>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-[#0B1C30] text-white px-4 py-4 rounded-xl font-bold hover:bg-[#142d47] hover:shadow-xl hover:shadow-[#0B1C30]/20 transition-all duration-300 mt-4 flex justify-center items-center gap-2 text-sm"
                >
                  <Lock className="w-4 h-4" />
                  Déverrouiller le système
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
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col font-sans pb-24" id="daara-erp-root">
      {/* Decorative premium gold & navy top line */}
      <div className="h-1.5 bg-[#0B1C30] w-full relative" id="top-emerald-accent">
        <div className="absolute top-0 right-0 left-1/2 h-full bg-[#D0A21C] w-1/2"></div>
      </div>

      {/* Main Header / TopAppBar following requested style */}
      <header className="bg-white shadow-xs border-b border-slate-100 py-4 px-4 md:px-8 sticky top-0 z-30 flex flex-col sm:flex-row justify-between items-center gap-4" id="daara-main-header">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-12 flex-shrink-0 flex items-center justify-start gap-3">
            <img 
              src="/logo.png" 
              alt="Logo Rayhanah" 
              className="max-w-full max-h-full object-contain"
            />
            <div className="hidden md:flex flex-col border-l border-slate-200 pl-3">
              <span className="font-extrabold text-sm text-[#0B1C30] tracking-tight">{instituteName}</span>
              <span className="text-[9px] font-bold text-[#D0A21C] uppercase tracking-wider">Système ERP & Pédagogie</span>
            </div>
          </div>
        </div>

        {/* Global header search bar */}
        <div className="flex-1 max-w-md mx-4 w-full sm:w-auto">
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              placeholder="Rechercher des élèves, des dars ou des règlements..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-4 text-xs font-semibold text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-[#0B1C30]"
            />
          </div>
        </div>

        {/* User profile & actions in header */}
        <div className="hidden sm:flex items-center gap-3 bg-slate-50 p-1.5 pr-4 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
          <div className="w-8 h-8 rounded-full bg-[#0B1C30] flex items-center justify-center text-white font-bold text-xs shadow-inner border-2 border-white">
            CB
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#0B1C30] leading-tight">Cheikh Baye Kane</span>
            <span className="text-[8px] text-[#D0A21C] font-black uppercase tracking-wider">Directeur</span>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8" id="daara-main-workspace">
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-40 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-7xl mx-auto px-2">
          <button 
            onClick={() => setActiveTab("pilotage")}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors cursor-pointer ${activeTab === "pilotage" ? "text-[#0B1C30]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <LayoutDashboard className={`w-5 h-5 ${activeTab === "pilotage" ? "stroke-[2.5px]" : "stroke-2"}`} />
            <span className="text-[10px] font-bold">Pilotage</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("scolarite")}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors cursor-pointer relative ${activeTab === "scolarite" ? "text-[#0B1C30]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <div className="relative">
              <GraduationCap className={`w-5 h-5 ${activeTab === "scolarite" ? "stroke-[2.5px]" : "stroke-2"}`} />
              {unpaidAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-3 h-3 rounded-full flex items-center justify-center border border-white">
                  {unpaidAlertCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">Scolarité</span>
          </button>

          <button 
            onClick={() => setActiveTab("pedagogie")}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors cursor-pointer ${activeTab === "pedagogie" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Mosque className={`w-5 h-5 ${activeTab === "pedagogie" ? "stroke-[2.5px]" : "stroke-2"}`} />
            <span className="text-[10px] font-bold">Pédagogie</span>
          </button>

          <button 
            onClick={() => setActiveTab("honneur")}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors cursor-pointer ${activeTab === "honneur" ? "text-amber-500" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Trophy className={`w-5 h-5 ${activeTab === "honneur" ? "stroke-[2.5px]" : "stroke-2"}`} />
            <span className="text-[10px] font-bold">Honneur</span>
          </button>

          <button 
            onClick={() => setActiveTab("parametres")}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors cursor-pointer ${activeTab === "parametres" ? "text-[#0B1C30]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Settings className={`w-5 h-5 ${activeTab === "parametres" ? "stroke-[2.5px]" : "stroke-2"}`} />
            <span className="text-[10px] font-bold">Admin/RH</span>
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
