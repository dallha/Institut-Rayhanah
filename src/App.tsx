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

import PedagogyTab from "./components/PedagogyTab";
import AttendanceTab from "./components/AttendanceTab";
import KashfShahriTab from "./components/KashfShahriTab";
import MotivationTab from "./components/MotivationTab";
import InscriptionTab from "./components/InscriptionTab";
import ComptabiliteTab from "./components/ComptabiliteTab";
import PilotageTab from "./components/PilotageTab";
import ParametresTab from "./components/ParametresTab";

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
  FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
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

      if (["pilotage", "daara", "tresorerie", "parametres"].includes(main)) {
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
      if (lesson.evaluation === Evaluation.Excellent) scoreAward = 30;

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

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col font-sans pb-24" id="daara-erp-root">
      {/* Decorative premium gold & navy top line */}
      <div className="h-1.5 bg-[#0B1C30] w-full relative" id="top-emerald-accent">
        <div className="absolute top-0 right-0 left-1/2 h-full bg-[#D0A21C] w-1/2"></div>
      </div>

      {/* Main Header / TopAppBar following requested style */}
      <header className="bg-white shadow-xs border-b border-slate-100 py-4 px-4 md:px-8 sticky top-0 z-30 flex flex-col sm:flex-row justify-between items-center gap-4" id="daara-main-header">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-48 h-12 flex-shrink-0 flex items-center justify-start">
            <img 
              src="/logo.png" 
              alt="Logo Rayhanah" 
              className="max-w-full max-h-full object-contain"
            />
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

        {/* User profile & actions in header (Removed per user request) */}
        <div className="flex items-center gap-3">
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
                  setActiveTab(tab);
                  if (tab === "daara" && sub) setActiveDaaraSubTab(sub);
                }}
              />
            )}

            {/* DAARA TAB (Core Quranic Features + Inscriptions) */}
            {activeTab === "daara" && (
              <div className="space-y-6">
                <div className="flex bg-white/85 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-slate-200/60 shadow-xs justify-center gap-4 max-w-4xl mx-auto w-full overflow-x-auto" id="daara-sub-tabs">
                  {[
                    { id: "inscriptions", label: "Inscriptions", icon: <UserPlus className="w-4 h-4" /> },
                    { id: "pedagogy", label: "Suivi Coranique", icon: <BookOpen className="w-4 h-4" /> },
                    { id: "attendance", label: "Présences", icon: <CalendarDays className="w-4 h-4" /> },
                    { id: "kashf", label: "Bulletins", icon: <FileCheck className="w-4 h-4" /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDaaraSubTab(tab.id)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                        activeDaaraSubTab === tab.id
                          ? "bg-[#0B1C30] text-white shadow-xs"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200/40"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {activeDaaraSubTab === "inscriptions" && (
                  <InscriptionTab
                    students={students}
                    halaqas={halaqas}
                    onEnrollStudent={handleEnrollStudent}
                  />
                )}

                {activeDaaraSubTab === "pedagogy" && (
                  <PedagogyTab
                    students={students}
                    halaqas={halaqas}
                    onUpdateStudent={handleUpdateStudent}
                    attendance={attendance}
                    lessons={lessons}
                  />
                )}

                {activeDaaraSubTab === "attendance" && (
                  <AttendanceTab
                    students={students}
                    halaqas={halaqas}
                    onClotureDay={handleClotureDay}
                  />
                )}

                {activeDaaraSubTab === "kashf" && (
                  <KashfShahriTab 
                    students={students} 
                    halaqas={halaqas} 
                    lessons={lessons} 
                    attendance={attendance} 
                  />
                )}
              </div>
            )}

            {/* TRESORERIE TAB */}
            {activeTab === "tresorerie" && (
              <ComptabiliteTab
                students={students}
                payments={payments}
                onAddPayment={handleAddPayment}
                unpaidThreshold={unpaidThreshold}
                onUpdateThreshold={saveUnpaidThreshold}
              />
            )}

            {/* PARAMETRES TAB */}
            {activeTab === "parametres" && (
              <ParametresTab />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* BOTTOM NAVIGATION (Mobile First UI) */}
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
            onClick={() => setActiveTab("daara")}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors cursor-pointer ${activeTab === "daara" ? "text-[#D0A21C]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Mosque className={`w-5 h-5 ${activeTab === "daara" ? "stroke-[2.5px]" : "stroke-2"}`} />
            <span className="text-[10px] font-bold">Daara</span>
          </button>

          <button 
            onClick={() => setActiveTab("tresorerie")}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors cursor-pointer relative ${activeTab === "tresorerie" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <div className="relative">
              <CreditCard className={`w-5 h-5 ${activeTab === "tresorerie" ? "stroke-[2.5px]" : "stroke-2"}`} />
              {unpaidAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-3 h-3 rounded-full flex items-center justify-center border border-white">
                  {unpaidAlertCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">Trésorerie</span>
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
    </div>
  );
}
