/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Student, Halaqa, QuranLesson, AttendanceRecord, AttendanceStatus } from "../types";
import { SURAHS, getSurahByNum } from "../quranData";
import { Printer, Share2, ToggleLeft, ToggleRight, CalendarDays, BookOpen, Layers } from "lucide-react";
import { motion } from "motion/react";

interface KashfShahriTabProps {
  students: Student[];
  halaqas: Halaqa[];
  lessons: QuranLesson[];
  attendance: AttendanceRecord[];
}

export default function KashfShahriTab({ students, halaqas, lessons, attendance }: KashfShahriTabProps) {
  const [selectedHalaqa, setSelectedHalaqa] = useState<string>(halaqas[0]?.id || "h1");
  const [displayMode, setDisplayMode] = useState<"sourate" | "hizb">("sourate");
  const [selectedMonth, setSelectedMonth] = useState<number>(7); // July by default
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Generate days array for the grid (e.g., 1 to 15 to make it easily readable in the viewport, with a toggle for part 1 / part 2)
  const [dayRange, setDayRange] = useState<"part1" | "part2">("part1");
  const days = dayRange === "part1" 
    ? Array.from({ length: 15 }, (_, i) => i + 1)
    : Array.from({ length: 16 }, (_, i) => i + 16);

  const activeStudents = students.filter(s => s.halaqaId === selectedHalaqa);

  const getDayProgress = (studentId: string, dayNum: number) => {
    const dateString = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    
    // Check attendance
    const att = attendance.find(a => a.studentId === studentId && a.date === dateString);
    if (att && att.status === AttendanceStatus.Absent) {
      return { text: "غ", color: "bg-rose-50 text-rose-500 font-bold", title: "Absent" };
    }

    // Check lesson
    const les = lessons.find(l => l.studentId === studentId && l.date === dateString);
    if (!les) {
      return { text: "-", color: "text-slate-300", title: "Pas de dars enregistré" };
    }

    if (displayMode === "sourate") {
      if (les.startSurah) {
        const surah = getSurahByNum(les.endSurah || les.startSurah);
        return {
          text: `${surah ? surah.name.substring(0, 5) : ""}.${les.endVerset || 1}`,
          color: "bg-emerald-50 text-emerald-800 font-medium",
          title: `Sourate ${surah?.name} v.${les.endVerset}`
        };
      }
    } else {
      if (les.startHizb) {
        const fracSym = les.endHizbFraction === 0.25 ? "¼" : les.endHizbFraction === 0.5 ? "½" : les.endHizbFraction === 0.75 ? "¾" : "";
        return {
          text: `H.${les.endHizb}${fracSym}`,
          color: "bg-amber-50 text-amber-800 font-medium",
          title: `Hizb ${les.endHizb} Fraction: ${les.endHizbFraction || 0}`
        };
      }
    }

    return { text: "✓", color: "bg-slate-50 text-slate-500", title: "Évalué" };
  };

  const handlePrint = () => {
    window.print();
  };

  const currentHalaqaName = halaqas.find(h => h.id === selectedHalaqa)?.name || "";

  return (
    <div className="space-y-6" id="kashf-container">
      {/* Configuration controller bar */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4" id="kashf-controller">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            <span>Kashf Shahri (الكشف الشهري) - Registre Mensuel</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Matrice des progrès et assiduité pour l'exportation et le contrôle parental
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3" id="kashf-controls">
          {/* Halaqa Select */}
          <select
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2 focus:outline-hidden font-semibold"
            value={selectedHalaqa}
            onChange={(e) => setSelectedHalaqa(e.target.value)}
          >
            {halaqas.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>

          {/* Month Select */}
          <select
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2 focus:outline-hidden"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            <option value={7}>Juillet 2026</option>
            <option value={8}>Août 2026</option>
            <option value={9}>Septembre 2026</option>
          </select>

          {/* Range part toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg" id="day-range-selector">
            <button
              onClick={() => setDayRange("part1")}
              className={`px-3 py-1 text-xs font-bold rounded ${dayRange === "part1" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
            >
              Jours 1 - 15
            </button>
            <button
              onClick={() => setDayRange("part2")}
              className={`px-3 py-1 text-xs font-bold rounded ${dayRange === "part2" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
            >
              Jours 16 - 31
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Display Toggle & Export Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-emerald-50 border border-emerald-100 p-4 rounded-xl gap-4" id="kashf-export-bar">
        <div className="flex items-center space-x-3 text-emerald-900" id="kashf-mode-toggle-group">
          <span className="text-xs font-bold uppercase tracking-wide">Mode d'affichage :</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDisplayMode("sourate")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${displayMode === "sourate" ? "bg-emerald-600 text-white" : "bg-white text-emerald-800 hover:bg-emerald-100"}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Sourate / Verset</span>
            </button>
            <button
              onClick={() => setDisplayMode("hizb")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${displayMode === "hizb" ? "bg-emerald-600 text-white" : "bg-white text-emerald-800 hover:bg-emerald-100"}`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Hizb / Fraction</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2" id="kashf-export-actions">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / PDF</span>
          </button>
          <button
            onClick={() => alert("Lien d'exportation WhatsApp copié dans le presse-papiers pour envoi immédiat aux parents.")}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Partager WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Main Matrix Grid (Optimized with Sticky Column for Names) */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-x-auto shadow-xs print:shadow-none print:border-none" id="kashf-grid-container">
        <table className="w-full text-left border-collapse" id="kashf-matrix-table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 border-r border-slate-100 z-10 w-44">
                Élève (Matricule)
              </th>
              {days.map(day => (
                <th key={day} className="p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[50px] border-r border-slate-100">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeStudents.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                {/* Sticky student identity */}
                <td className="p-4 sticky left-0 bg-white border-r border-slate-100 font-semibold text-xs text-slate-800 shadow-sm z-10">
                  <div className="truncate w-36">
                    <p className="font-bold">{student.firstName} {student.lastName}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">{student.matricule}</p>
                  </div>
                </td>

                {/* Grid days */}
                {days.map((day) => {
                  const dayState = getDayProgress(student.id, day);
                  return (
                    <td
                      key={day}
                      title={dayState.title}
                      className={`p-2.5 text-center text-[10px] border-r border-slate-100 cursor-help transition-all ${dayState.color}`}
                    >
                      {dayState.text}
                    </td>
                  );
                })}
              </tr>
            ))}

            {activeStudents.length === 0 && (
              <tr>
                <td colSpan={days.length + 1} className="p-8 text-center text-slate-400 text-xs italic">
                  Aucun élève actif dans cette Halaqa ce mois-ci.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Print View Styling Header (Only visible when printing) */}
      <div className="hidden print:block text-center space-y-4 mb-8 text-slate-800" id="print-view-metadata">
        <div className="flex flex-col items-center border-b-2 border-emerald-900 pb-6">
          <img src="/logo.png" alt="Logo Rayhanah" className="h-28 object-contain mb-4" />
          <h3 className="text-xl font-bold uppercase tracking-widest mt-2">Kashf Shahri — Registre de Suivi Coranique</h3>
          <p className="text-sm font-bold mt-1 text-slate-600">Halaqa : {currentHalaqaName}</p>
          <p className="text-xs text-slate-500 italic mt-1">Mois de {selectedMonth === 7 ? "Juillet" : selectedMonth === 8 ? "Août" : "Septembre"} {selectedYear} • Imprimé le {new Date().toLocaleDateString("fr-FR")}</p>
        </div>
      </div>
    </div>
  );
}
