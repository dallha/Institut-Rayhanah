/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Student, Halaqa, AttendanceStatus, Evaluation, EtapePedagogique, QuranLesson, AttendanceRecord } from "../types";
import { SURAHS, HIZBS, formatHizbFractionArabic, calculateVersesCount, getSurahByNum } from "../quranData";
import { CheckCircle, AlertTriangle, XCircle, Save, Lock, ArrowRight, BookOpen, UserCheck, MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

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

  // Muraja'ah
  murajaahActive: boolean;
  murajaahStartHizb: number;
  murajaahStartFraction: number;
  murajaahEndHizb: number;
  murajaahEndFraction: number;
  murajaahEvaluation: Evaluation;

  comments: string;
}

export default function AttendanceTab({ students, halaqas, onClotureDay }: AttendanceTabProps) {
  const { t } = useTranslation();
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

        murajaahActive: false,
        murajaahStartHizb: student.currentHizbNum || 60,
        murajaahStartFraction: 0,
        murajaahEndHizb: student.currentHizbNum || 60,
        murajaahEndFraction: 0,
        murajaahEvaluation: Evaluation.Naam,

        comments: ""
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
        
        let vCount = 0;
        if (row.lessonType === "sourate") {
          vCount = calculateVersesCount(row.startSurah, row.startVerset, row.endSurah, row.endVerset);
        }

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
          versesCount: vCount,
          murajaahStartHizb: row.murajaahActive ? row.murajaahStartHizb : undefined,
          murajaahStartFraction: row.murajaahActive ? row.murajaahStartFraction : undefined,
          murajaahEndHizb: row.murajaahActive ? row.murajaahEndHizb : undefined,
          murajaahEndFraction: row.murajaahActive ? row.murajaahEndFraction : undefined,
          murajaahEvaluation: row.murajaahActive ? row.murajaahEvaluation : undefined,
          comments: row.comments
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
            <span>{t('attendance.title')}</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1">{t('attendance.subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto" id="attendance-config-controls">
          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('attendance.selectHalaqa')}</label>
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
            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('attendance.evalDate')}</label>
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
          <span>{t('attendance.clotureSuccess')}</span>
        </div>
      )}

      {/* Main Registry Sheet */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs" id="attendance-sheet-wrapper">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center" id="attendance-sheet-header">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('attendance.studentsList')} ({halaqaStudents.length})
          </span>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
            {t('attendance.activeStage')}
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
                className={`transition-all ${isAbsent ? "opacity-60" : ""}`}
                id={`attendance-row-${student.id}`}
              >
                {/* ── Top bar: identity + presence ── */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-4 pb-3 ${isAbsent ? "bg-slate-50" : "bg-white"}`}>
                  <div className="flex items-center space-x-3" id={`row-identity-${student.id}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isAbsent ? "bg-slate-200 text-slate-400" : "bg-emerald-100 text-emerald-800"}`}>
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

                  <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl w-max" id={`attendance-btns-${student.id}`}>
                    <button
                      onClick={() => updateRowStatus(student.id, AttendanceStatus.Present)}
                      id={`btn-present-${student.id}`}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${row.status === AttendanceStatus.Present ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      PRÉSENT
                    </button>
                    <button
                      onClick={() => updateRowStatus(student.id, AttendanceStatus.Late)}
                      id={`btn-late-${student.id}`}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${row.status === AttendanceStatus.Late ? "bg-white text-amber-700 shadow-sm ring-1 ring-amber-200" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      RETARD
                    </button>
                    <button
                      onClick={() => updateRowStatus(student.id, AttendanceStatus.Absent)}
                      id={`btn-absent-${student.id}`}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${row.status === AttendanceStatus.Absent ? "bg-rose-500 text-white shadow-sm" : "text-slate-500 hover:text-rose-600"}`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      ABSENT
                    </button>
                  </div>
                </div>

                {/* ── Dars section (prominent card) ── */}
                <div className="px-4 pb-4 pt-1" id={`row-lesson-inputs-${student.id}`}>
                  {isAbsent ? (
                    <div className="flex items-center gap-2 bg-slate-100 border border-dashed border-slate-300 p-3 rounded-xl text-slate-400">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span className="text-xs italic">{t('attendance.absentBlocked')}</span>
                    </div>
                  ) : isTahajji ? (
                    <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 p-3 rounded-xl text-sky-700">
                      <BookOpen className="w-4 h-4 shrink-0 text-sky-500" />
                      <span className="text-xs font-medium">{t('attendance.tahajjiNoLesson')}</span>
                    </div>
                  ) : (
                    <div className="border-2 border-emerald-300 rounded-xl overflow-hidden shadow-sm" id={`lesson-inputs-grid-${student.id}`}>
                      
                      {/* Current Cursor Badge */}
                      <div className="px-4 py-1.5 bg-emerald-100 border-b border-emerald-200 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-800">
                          <span className="text-[10px] font-bold uppercase tracking-wider">{t('attendance.currentCursor')}:</span>
                          <span className="text-xs font-semibold">
                            Hizb {student.currentHizbNum || 60} {student.currentHizbFraction ? `(${formatHizbFractionArabic(student.currentHizbFraction)})` : ""} · {getSurahByNum(student.currentSurahNum || 114)?.arabicName} v.{student.currentVersetNum || 1}
                          </span>
                        </div>
                      </div>

                      {/* Green header bar (HIFZ) */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-600">
                        <div className="flex items-center gap-2 text-white">
                          <BookOpen className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">{t('attendance.lessonOfTheDay')}</span>
                          {row.lessonType === "sourate" && (
                            <span className="ml-2 bg-emerald-800/40 px-2 py-0.5 rounded text-[10px] font-mono">
                              📊 {calculateVersesCount(row.startSurah, row.startVerset, row.endSurah, row.endVerset)} {t('attendance.versesCount')}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => updateRowField(student.id, "lessonType", "sourate")}
                            className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${row.lessonType === "sourate" ? "bg-white text-emerald-800 shadow-sm" : "bg-emerald-700 text-emerald-100 hover:bg-emerald-500"}`}
                          >
                            Sourate
                          </button>
                          <button
                            onClick={() => updateRowField(student.id, "lessonType", "hizb")}
                            className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${row.lessonType === "hizb" ? "bg-white text-emerald-800 shadow-sm" : "bg-emerald-700 text-emerald-100 hover:bg-emerald-500"}`}
                          >
                            Hizb
                          </button>
                        </div>
                      </div>

                      {/* Body (HIFZ) */}
                      <div className="p-3 bg-emerald-50 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        {/* Sourate mode */}
                        {row.lessonType === "sourate" ? (
                          <div className="md:col-span-2 grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-1">{t('attendance.start')}</label>
                              <div className="flex gap-1">
                                <select
                                  className="bg-white border border-emerald-300 rounded-lg px-2 py-1.5 text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                                  value={row.startSurah}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    updateRowField(student.id, "startSurah", val);
                                    updateRowField(student.id, "endSurah", val);
                                  }}
                                >
                                  {SURAHS.map(s => (
                                    <option key={s.number} value={s.number}>{s.number}. {s.arabicName}</option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  placeholder="v."
                                  className="bg-white border border-emerald-300 rounded-lg px-2 py-1.5 text-xs w-14 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-center font-bold"
                                  min={1}
                                  value={row.startVerset}
                                  onChange={(e) => updateRowField(student.id, "startVerset", Number(e.target.value))}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-1">{t('attendance.end')}</label>
                              <div className="flex gap-1">
                                <select
                                  className="bg-white border border-emerald-300 rounded-lg px-2 py-1.5 text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                                  value={row.endSurah}
                                  onChange={(e) => updateRowField(student.id, "endSurah", Number(e.target.value))}
                                >
                                  {SURAHS.map(s => (
                                    <option key={s.number} value={s.number}>{s.number}. {s.arabicName}</option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  placeholder="v."
                                  className="bg-white border border-emerald-300 rounded-lg px-2 py-1.5 text-xs w-14 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-center font-bold"
                                  min={1}
                                  value={row.endVerset}
                                  onChange={(e) => updateRowField(student.id, "endVerset", Number(e.target.value))}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Hizb mode */
                          <div className="md:col-span-2 grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-1">{t('attendance.start')}</label>
                              <div className="flex gap-1">
                                <select
                                  className="bg-white border border-emerald-300 rounded-lg px-2 py-1.5 text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                                  value={row.startHizb}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    updateRowField(student.id, "startHizb", val);
                                    updateRowField(student.id, "endHizb", val);
                                  }}
                                >
                                  {HIZBS.map(h => (
                                    <option key={h.number} value={h.number}>الحزب {h.number}: {h.name}</option>
                                  ))}
                                </select>
                                <select
                                  className="bg-white border border-emerald-300 rounded-lg px-2 py-1.5 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                  value={row.startHizbFraction}
                                  onChange={(e) => updateRowField(student.id, "startHizbFraction", Number(e.target.value))}
                                >
                                  <option value={0}>بداية</option>
                                  <option value={0.25}>ربع</option>
                                  <option value={0.50}>نصف</option>
                                  <option value={0.75}>ثلاثة</option>
                                  <option value={1.00}>كامل</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-1">{t('attendance.end')}</label>
                              <div className="flex gap-1">
                                <select
                                  className="bg-white border border-emerald-300 rounded-lg px-2 py-1.5 text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                                  value={row.endHizb}
                                  onChange={(e) => updateRowField(student.id, "endHizb", Number(e.target.value))}
                                >
                                  {HIZBS.map(h => (
                                    <option key={h.number} value={h.number}>الحزب {h.number}: {h.name}</option>
                                  ))}
                                </select>
                                <select
                                  className="bg-white border border-emerald-300 rounded-lg px-2 py-1.5 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                  value={row.endHizbFraction}
                                  onChange={(e) => updateRowField(student.id, "endHizbFraction", Number(e.target.value))}
                                >
                                  <option value={0}>بداية</option>
                                  <option value={0.25}>ربع</option>
                                  <option value={0.50}>نصف</option>
                                  <option value={0.75}>ثلاثة</option>
                                  <option value={1.00}>كامل</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Evaluation */}
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-1">{t('attendance.evaluation')}</label>
                          <select
                            className={`w-full border-2 rounded-lg px-2 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${row.evaluation === Evaluation.Naam ? "bg-amber-50 border-amber-400 text-amber-800" : "bg-rose-50 border-rose-300 text-rose-700"}`}
                            value={row.evaluation}
                            onChange={(e) => updateRowField(student.id, "evaluation", e.target.value)}
                          >
                            <option value={Evaluation.Naam}>{t('attendance.evalNaam')}</option>
                            <option value={Evaluation.Lam}>{t('attendance.evalLam')}</option>
                          </select>
                        </div>
                      </div>

                      {/* MURAJA'AH SECTION */}
                      <div className="border-t border-emerald-200">
                        <div className="px-4 py-2 bg-indigo-50 flex items-center justify-between cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => updateRowField(student.id, "murajaahActive", !row.murajaahActive)}>
                          <div className="flex items-center gap-2 text-indigo-800">
                            <input type="checkbox" className="w-3.5 h-3.5 rounded border-indigo-400 text-indigo-600 focus:ring-indigo-500" checked={row.murajaahActive} readOnly />
                            <span className="text-xs font-bold uppercase tracking-widest">{t('attendance.murajaah')}</span>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600">{t('attendance.murajaahToggle')}</span>
                        </div>
                        
                        {row.murajaahActive && (
                          <div className="p-3 bg-indigo-50/50 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                            <div className="md:col-span-2 grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-indigo-800 uppercase mb-1">{t('attendance.start')}</label>
                                <div className="flex gap-1">
                                  <select
                                    className="bg-white border border-indigo-200 rounded-lg px-2 py-1.5 text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
                                    value={row.murajaahStartHizb}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      updateRowField(student.id, "murajaahStartHizb", val);
                                      updateRowField(student.id, "murajaahEndHizb", val);
                                    }}
                                  >
                                    {HIZBS.map(h => (
                                      <option key={h.number} value={h.number}>الحزب {h.number}: {h.name}</option>
                                    ))}
                                  </select>
                                  <select
                                    className="bg-white border border-indigo-200 rounded-lg px-2 py-1.5 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    value={row.murajaahStartFraction}
                                    onChange={(e) => updateRowField(student.id, "murajaahStartFraction", Number(e.target.value))}
                                  >
                                    <option value={0}>بداية</option>
                                    <option value={0.25}>ربع</option>
                                    <option value={0.50}>نصف</option>
                                    <option value={0.75}>ثلاثة</option>
                                    <option value={1.00}>كامل</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-indigo-800 uppercase mb-1">{t('attendance.end')}</label>
                                <div className="flex gap-1">
                                  <select
                                    className="bg-white border border-indigo-200 rounded-lg px-2 py-1.5 text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
                                    value={row.murajaahEndHizb}
                                    onChange={(e) => updateRowField(student.id, "murajaahEndHizb", Number(e.target.value))}
                                  >
                                    {HIZBS.map(h => (
                                      <option key={h.number} value={h.number}>الحزب {h.number}: {h.name}</option>
                                    ))}
                                  </select>
                                  <select
                                    className="bg-white border border-indigo-200 rounded-lg px-2 py-1.5 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    value={row.murajaahEndFraction}
                                    onChange={(e) => updateRowField(student.id, "murajaahEndFraction", Number(e.target.value))}
                                  >
                                    <option value={0}>بداية</option>
                                    <option value={0.25}>ربع</option>
                                    <option value={0.50}>نصف</option>
                                    <option value={0.75}>ثلاثة</option>
                                    <option value={1.00}>كامل</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            
                            {/* Murajaah Evaluation */}
                            <div>
                              <label className="block text-[10px] font-bold text-indigo-800 uppercase mb-1">{t('attendance.evaluation')}</label>
                              <select
                                className={`w-full border-2 rounded-lg px-2 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all ${row.murajaahEvaluation === Evaluation.Naam ? "bg-amber-50 border-amber-400 text-amber-800" : "bg-rose-50 border-rose-300 text-rose-700"}`}
                                value={row.murajaahEvaluation}
                                onChange={(e) => updateRowField(student.id, "murajaahEvaluation", e.target.value)}
                              >
                                <option value={Evaluation.Naam}>{t('attendance.evalNaam')}</option>
                                <option value={Evaluation.Lam}>{t('attendance.evalLam')}</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Comments / Tajweed section */}
                      <div className="bg-white p-2 border-t border-emerald-100 flex items-center">
                        <MessageSquare className="w-4 h-4 text-slate-400 mr-2" />
                        <input
                          type="text"
                          placeholder={t('attendance.commentsPlaceholder')}
                          className="w-full text-xs text-slate-700 border-none bg-transparent focus:outline-none focus:ring-0"
                          value={row.comments}
                          onChange={(e) => updateRowField(student.id, "comments", e.target.value)}
                        />
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
            <span>{t('attendance.clotureBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
