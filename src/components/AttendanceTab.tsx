/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Student, Halaqa, AttendanceStatus, Evaluation, EtapePedagogique, QuranLesson, AttendanceRecord } from "../types";
import { SURAHS, formatHizbFractionArabic } from "../quranData";
import { CheckCircle, AlertTriangle, XCircle, Save, Lock, ArrowRight, BookOpen, UserCheck } from "lucide-react";
import { motion } from "motion/react";

interface AttendanceTabProps {
  students: Student[];
  halaqas: Halaqa[];
  onClotureDay: (attendance: AttendanceRecord[], lessons: QuranLesson[]) => void;
}

interface RowState {
  studentId: string;
  status: AttendanceStatus;
  lessonType: "sourate" | "hizb";
  evaluation: Evaluation;
  
  // Sourate entry
  startSurah: number;
  startVerset: number;
  endSurah: number;
  endVerset: number;

  // Hizb entry
  startHizb: number;
  startHizbFraction: number;
  endHizb: number;
  endHizbFraction: number;
}

export default function AttendanceTab({ students, halaqas, onClotureDay }: AttendanceTabProps) {
  const [selectedHalaqa, setSelectedHalaqa] = useState<string>(halaqas[0]?.id || "h1");
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [isClotured, setIsClotured] = useState<boolean>(false);
  const [gridRows, setGridRows] = useState<RowState[]>([]);

  // Filter students for the selected Halaqa
  const halaqaStudents = students.filter(s => s.halaqaId === selectedHalaqa);

  // Initialize row states whenever Halaqa or Date changes
  useEffect(() => {
    const initialRows = halaqaStudents.map((student) => {
      const isTahajji = student.etape === EtapePedagogique.Tahajji;
      return {
        studentId: student.id,
        status: AttendanceStatus.Present,
        lessonType: "sourate" as const,
        evaluation: Evaluation.Naam,
        
        // Populate starting points from current student cursors
        startSurah: student.currentSurahNum || 114,
        startVerset: student.currentVersetNum || 1,
        endSurah: student.currentSurahNum || 114,
        endVerset: student.currentVersetNum || 1,

        startHizb: student.currentHizbNum || 60,
        startHizbFraction: student.currentHizbFraction || 0,
        endHizb: student.currentHizbNum || 60,
        endHizbFraction: student.currentHizbFraction || 0,
      };
    });
    setGridRows(initialRows);
    setIsClotured(false);
  }, [selectedHalaqa]);

  const updateRowStatus = (studentId: string, status: AttendanceStatus) => {
    setGridRows(prev =>
      prev.map(row => (row.studentId === studentId ? { ...row, status } : row))
    );
  };

  const updateRowField = (studentId: string, field: keyof RowState, value: any) => {
    setGridRows(prev =>
      prev.map(row => (row.studentId === studentId ? { ...row, [field]: value } : row))
    );
  };

  const handleCloture = () => {
    // Generate actual AttendanceRecord & QuranLesson list to dispatch
    const attendanceRecords: AttendanceRecord[] = [];
    const quranLessons: QuranLesson[] = [];

    gridRows.forEach((row) => {
      // 1. Attendance Record
      attendanceRecords.push({
        id: `att_${row.studentId}_${Date.now()}`,
        studentId: row.studentId,
        date: currentDate,
        status: row.status
      });

      // 2. Lesson (only if Present or Late, and not Tahajji)
      const student = students.find(s => s.id === row.studentId);
      if (student && student.etape !== EtapePedagogique.Tahajji && row.status !== AttendanceStatus.Absent) {
        quranLessons.push({
          id: `les_${row.studentId}_${Date.now()}`,
          studentId: row.studentId,
          date: currentDate,
          evaluation: row.evaluation,
          type: row.lessonType,
          startSurah: row.lessonType === "sourate" ? row.startSurah : undefined,
          startVerset: row.lessonType === "sourate" ? row.startVerset : undefined,
          endSurah: row.lessonType === "sourate" ? row.endSurah : undefined,
          endVerset: row.lessonType === "sourate" ? row.endVerset : undefined,
          startHizb: row.lessonType === "hizb" ? row.startHizb : undefined,
          startHizbFraction: row.lessonType === "hizb" ? row.startHizbFraction : undefined,
          endHizb: row.lessonType === "hizb" ? row.endHizb : undefined,
          endHizbFraction: row.lessonType === "hizb" ? row.endHizbFraction : undefined,
        });
      }
    });

    onClotureDay(attendanceRecords, quranLessons);
    setIsClotured(true);
  };

  return (
    <div className="space-y-6" id="attendance-container">
      {/* Configuration Header */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="attendance-config-header">
        <div id="attendance-header-meta">
          <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span>Cahier d'Appel & Dars Quotidien</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Saisie de présence et progression de la Halaqa</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto" id="attendance-config-controls">
          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Sélection Halaqa</label>
            <select
              id="attendance-halaqa-select"
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2 focus:outline-hidden font-semibold"
              value={selectedHalaqa}
              onChange={(e) => setSelectedHalaqa(e.target.value)}
            >
              {halaqas.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Date d'évaluation</label>
            <input
              type="date"
              id="attendance-date-input"
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-1.5 focus:outline-hidden font-semibold"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Cloture status notice */}
      {isClotured && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-bounce" id="attendance-clotured-banner">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>La journée pédagogique a été clôturée avec succès ! Les dossiers élèves et la scolarité ont été mis à jour de façon asynchrone.</span>
        </div>
      )}

      {/* Main Registry Sheet */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs" id="attendance-sheet-wrapper">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center" id="attendance-sheet-header">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Élèves de la Halaqa ({halaqaStudents.length})
          </span>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
            Étape Active
          </span>
        </div>

        {/* Unified Responsive List */}
        <div className="divide-y divide-slate-100" id="attendance-student-rows">
          {halaqaStudents.map((student) => {
            const row = gridRows.find(r => r.studentId === student.id);
            if (!row) return null;

            const isAbsent = row.status === AttendanceStatus.Absent;
            const isTahajji = student.etape === EtapePedagogique.Tahajji;

            return (
              <div
                key={student.id}
                className={`p-5 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${isAbsent ? "bg-slate-50/70 opacity-75" : "hover:bg-slate-50/30"}`}
                id={`attendance-row-${student.id}`}
              >
                {/* 1. Student Identity and Level */}
                <div className="flex items-center space-x-3 w-full lg:w-auto lg:min-w-[200px]" id={`row-identity-${student.id}`}>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    {student.firstName[0]}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800">{student.firstName} {student.lastName}</h5>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{student.matricule}</p>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded mt-1 inline-block">
                      {student.etape}
                    </span>
                  </div>
                </div>

                {/* 2. Attendance Selection (P, R, A) */}
                <div className="space-y-1" id={`row-attendance-${student.id}`}>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Présence</span>
                  <div className="flex items-center space-x-1.5 bg-slate-100/70 p-1 rounded-lg w-max" id={`attendance-btns-${student.id}`}>
                    <button
                      onClick={() => updateRowStatus(student.id, AttendanceStatus.Present)}
                      id={`btn-present-${student.id}`}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center space-x-1 ${row.status === AttendanceStatus.Present ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>PRÉSENT</span>
                    </button>
                    <button
                      onClick={() => updateRowStatus(student.id, AttendanceStatus.Late)}
                      id={`btn-late-${student.id}`}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center space-x-1 ${row.status === AttendanceStatus.Late ? "bg-white text-amber-700 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>RETARD</span>
                    </button>
                    <button
                      onClick={() => updateRowStatus(student.id, AttendanceStatus.Absent)}
                      id={`btn-absent-${student.id}`}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center space-x-1 ${row.status === AttendanceStatus.Absent ? "bg-rose-500 text-white shadow-xs" : "text-slate-500 hover:text-rose-600"}`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>ABSENT</span>
                    </button>
                  </div>
                </div>

                {/* 2. Pedagogical Inputs (if present) */}
                <div className="flex-1 w-full lg:w-auto lg:min-w-[280px]" id={`row-lesson-inputs-${student.id}`}>
                  {isAbsent ? (
                    <div className="flex items-center space-x-2 text-slate-400 bg-slate-100/50 p-3 rounded-lg border border-dashed border-slate-200">
                      <Lock className="w-4 h-4 text-slate-300" />
                      <span className="text-xs font-medium italic">Saisie bloquée car l'élève est déclaré ABSENT.</span>
                    </div>
                  ) : isTahajji ? (
                    <div className="flex items-center space-x-2 text-sky-700 bg-sky-50/50 p-3 rounded-lg border border-sky-100">
                      <BookOpen className="w-4 h-4 text-sky-500" />
                      <span className="text-xs font-medium">Phase d'alphabétisation (Tahajji) - Pas de leçon Coranique requise.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id={`lesson-inputs-grid-${student.id}`}>
                      {/* Range details */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Leçon du Jour (Dars)</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateRowField(student.id, "lessonType", "sourate")}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${row.lessonType === "sourate" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
                            >
                              Sourate
                            </button>
                            <button
                              onClick={() => updateRowField(student.id, "lessonType", "hizb")}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${row.lessonType === "hizb" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
                            >
                              Hizb
                            </button>
                          </div>
                        </div>

                        {row.lessonType === "sourate" ? (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                            {/* Start Surah */}
                            <div className="flex items-center space-x-1.5 bg-slate-50/50 p-1.5 rounded-lg border border-slate-100 sm:bg-transparent sm:p-0 sm:border-0 flex-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase min-w-[36px]">Début:</span>
                              <select
                                className="bg-white border border-slate-200 rounded p-1.5 text-[11px] flex-1 focus:outline-hidden font-medium"
                                value={row.startSurah}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  updateRowField(student.id, "startSurah", val);
                                  updateRowField(student.id, "endSurah", val);
                                }}
                              >
                                {SURAHS.map(s => (
                                  <option key={s.number} value={s.number}>
                                    {s.number}. {s.name} ({s.arabicName})
                                  </option>
                                ))}
                              </select>
                              <span className="text-slate-400 text-[10px]">v.</span>
                              <input
                                type="number"
                                className="bg-white border border-slate-200 rounded p-1.5 text-[11px] w-14 focus:outline-hidden text-center font-semibold"
                                min={1}
                                value={row.startVerset}
                                onChange={(e) => updateRowField(student.id, "startVerset", Number(e.target.value))}
                              />
                            </div>
                            
                            <div className="hidden sm:block">
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 mx-0.5" />
                            </div>

                            {/* End Surah */}
                            <div className="flex items-center space-x-1.5 bg-slate-50/50 p-1.5 rounded-lg border border-slate-100 sm:bg-transparent sm:p-0 sm:border-0 flex-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase min-w-[36px]">Fin:</span>
                              <select
                                className="bg-white border border-slate-200 rounded p-1.5 text-[11px] flex-1 focus:outline-hidden font-medium"
                                value={row.endSurah}
                                onChange={(e) => updateRowField(student.id, "endSurah", Number(e.target.value))}
                              >
                                {SURAHS.map(s => (
                                  <option key={s.number} value={s.number}>
                                    {s.number}. {s.name} ({s.arabicName})
                                  </option>
                                ))}
                              </select>
                              <span className="text-slate-400 text-[10px]">v.</span>
                              <input
                                type="number"
                                className="bg-white border border-slate-200 rounded p-1.5 text-[11px] w-14 focus:outline-hidden text-center font-semibold"
                                min={1}
                                value={row.endVerset}
                                onChange={(e) => updateRowField(student.id, "endVerset", Number(e.target.value))}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                            {/* Start Hizb */}
                            <div className="flex items-center space-x-1.5 bg-slate-50/50 p-1.5 rounded-lg border border-slate-100 sm:bg-transparent sm:p-0 sm:border-0 flex-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase min-w-[36px]">Début:</span>
                              <span className="text-slate-400 text-[10px]">H.</span>
                              <input
                                type="number"
                                className="bg-white border border-slate-200 rounded p-1.5 text-[11px] w-14 focus:outline-hidden text-center font-semibold"
                                min={1}
                                max={60}
                                value={row.startHizb}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  updateRowField(student.id, "startHizb", val);
                                  updateRowField(student.id, "endHizb", val);
                                }}
                              />
                              <select
                                className="bg-white border border-slate-200 rounded p-1.5 text-[11px] flex-1 focus:outline-hidden font-medium"
                                value={row.startHizbFraction}
                                onChange={(e) => updateRowField(student.id, "startHizbFraction", Number(e.target.value))}
                              >
                                <option value={0}>Début (بداية)</option>
                                <option value={0.25}>1/4 (ربع)</option>
                                <option value={0.50}>1/2 (نصف)</option>
                                <option value={0.75}>3/4 (ثلاثة)</option>
                                <option value={1.00}>Complet (حزب كامل)</option>
                              </select>
                            </div>

                            <div className="hidden sm:block">
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 mx-0.5" />
                            </div>

                            {/* End Hizb */}
                            <div className="flex items-center space-x-1.5 bg-slate-50/50 p-1.5 rounded-lg border border-slate-100 sm:bg-transparent sm:p-0 sm:border-0 flex-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase min-w-[36px]">Fin:</span>
                              <span className="text-slate-400 text-[10px]">H.</span>
                              <input
                                type="number"
                                className="bg-white border border-slate-200 rounded p-1.5 text-[11px] w-14 focus:outline-hidden text-center font-semibold"
                                min={1}
                                max={60}
                                value={row.endHizb}
                                onChange={(e) => updateRowField(student.id, "endHizb", Number(e.target.value))}
                              />
                              <select
                                className="bg-white border border-slate-200 rounded p-1.5 text-[11px] flex-1 focus:outline-hidden font-medium"
                                value={row.endHizbFraction}
                                onChange={(e) => updateRowField(student.id, "endHizbFraction", Number(e.target.value))}
                              >
                                <option value={0}>Début (بداية)</option>
                                <option value={0.25}>1/4 (ربع)</option>
                                <option value={0.50}>1/2 (نصف)</option>
                                <option value={0.75}>3/4 (ثلاثة)</option>
                                <option value={1.00}>Complet (حزب كامل)</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Evaluation selection */}
                      <div className="flex flex-col justify-end">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Évaluation</span>
                        <select
                          className="bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-700 font-semibold focus:outline-hidden w-full"
                          value={row.evaluation}
                          onChange={(e) => updateRowField(student.id, "evaluation", e.target.value)}
                        >
                          <option value={Evaluation.Naam}>Oui نعم (Validé) ⭐</option>
                          <option value={Evaluation.Lam}>Non لم (À refaire) ⚠️</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions for Cloture */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end" id="attendance-cloture-footer">
          <button
            onClick={handleCloture}
            disabled={halaqaStudents.length === 0 || isClotured}
            id="btn-attendance-cloture"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>CLÔTURER LA JOURNÉE PÉDAGOGIQUE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
