/**
 * HalaqaDetailView — Vue complète d'une Halaqa (Cercle Coranique)
 * Contrôle des élèves, niveau coranique, saisie de Dars, appel, et sync Supabase
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Student, Halaqa, EtapePedagogique, Evaluation,
  AttendanceStatus, AttendanceRecord, QuranLesson
} from "../types";
import { supabase } from "../lib/supabase";
import { SURAHS, HIZBS, formatHizbFractionArabic, calculateWestAfricanProgress, calculateVersesCount } from "../quranData";
import {
  ArrowLeft, UserCheck, BookOpen, Save, CheckCircle, XCircle,
  AlertTriangle, Users, GraduationCap, Award, Phone, Building2,
  Calendar, RefreshCw, Edit3, ChevronDown, ChevronUp, Clock,
  MessageSquare, Star, TrendingUp, ShieldAlert, Plus, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HalaqaDetailViewProps {
  halaqa: Halaqa;
  students: Student[];
  onBack: () => void;
  onUpdateStudent: (s: Student) => void;
  onClotureDay: (attendance: AttendanceRecord[], lessons: QuranLesson[]) => void;
}

type TabId = "apercu" | "appel" | "niveaux" | "historique";

const HIZB_FRACTIONS = [
  { value: 0, label: "0 (Début)" },
  { value: 0.25, label: "¼ ربع" },
  { value: 0.5, label: "½ نصف" },
  { value: 0.75, label: "¾ ثلاثة أرباع" },
];

const EVAL_OPTIONS = [
  { value: Evaluation.Naam, label: "✅ Naam (نعم) — Validé", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { value: Evaluation.Lam, label: "❌ Lam (لم) — Non validé", color: "text-rose-700 bg-rose-50 border-rose-200" },
];

export default function HalaqaDetailView({
  halaqa, students, onBack, onUpdateStudent, onClotureDay
}: HalaqaDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("apercu");
  const [syncMsg, setSyncMsg] = useState<null | { ok: boolean; text: string }>(null);
  
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [addingStudentId, setAddingStudentId] = useState<string | null>(null);

  // ── Students of this Halaqa ────────────────────────────────────────────
  const halaqaStudents = useMemo(
    () => students.filter(s => s.halaqaId === halaqa.id),
    [students, halaqa.id]
  );

  // ── APPEL STATE ────────────────────────────────────────────────────────
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split("T")[0]);
  const [isClotured, setIsClotured] = useState(false);
  interface RowState {
    studentId: string;
    status: AttendanceStatus;
    lessonType: "sourate" | "hizb";
    evaluation: Evaluation;
    startSurah: number; startVerset: number; endSurah: number; endVerset: number;
    startHizb: number; startHizbFraction: number; endHizb: number; endHizbFraction: number;
    murajaahActive: boolean;
    murajaahStartHizb: number; murajaahStartFraction: number; murajaahEndHizb: number; murajaahEndFraction: number; murajaahEvaluation: Evaluation;
    comments: string;
    expanded: boolean;
  }
  const [rows, setRows] = useState<RowState[]>([]);

  useEffect(() => {
    setRows(halaqaStudents.map(s => ({
      studentId: s.id,
      status: AttendanceStatus.Present,
      lessonType: "hizb",
      evaluation: Evaluation.Naam,
      startSurah: s.currentSurahNum || 114,
      startVerset: s.currentVersetNum || 1,
      endSurah: s.currentSurahNum || 114,
      endVerset: s.currentVersetNum || 1,
      startHizb: s.currentHizbNum || 60,
      startHizbFraction: s.currentHizbFraction || 0,
      endHizb: s.currentHizbNum || 60,
      endHizbFraction: s.currentHizbFraction || 0,
      murajaahActive: false,
      murajaahStartHizb: s.currentHizbNum || 60,
      murajaahStartFraction: 0,
      murajaahEndHizb: s.currentHizbNum || 60,
      murajaahEndFraction: 0,
      murajaahEvaluation: Evaluation.Naam,
      comments: "",
      expanded: false,
    })));
    setIsClotured(false);
  }, [halaqa.id, halaqaStudents.length]);

  const updateRow = (studentId: string, patch: Partial<RowState>) => {
    setRows(prev => prev.map(r => r.studentId === studentId ? { ...r, ...patch } : r));
  };

  const handleCloture = async () => {
    const attRecords: AttendanceRecord[] = [];
    const lessons: QuranLesson[] = [];
    const ts = Date.now();

    rows.forEach(row => {
      attRecords.push({
        id: `att_${row.studentId}_${ts}`,
        studentId: row.studentId,
        date: currentDate,
        status: row.status,
      });

      const s = students.find(st => st.id === row.studentId);
      if (s && s.etape !== EtapePedagogique.Tahajji && row.status !== AttendanceStatus.Absent) {
        const vCount = row.lessonType === "sourate"
          ? calculateVersesCount(row.startSurah, row.startVerset, row.endSurah, row.endVerset)
          : 0;
        lessons.push({
          id: `les_${row.studentId}_${ts}`,
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
          comments: row.comments,
        });
      }
    });

    onClotureDay(attRecords, lessons);

    // Sync to Supabase
    setSyncMsg(null);
    try {
      if (attRecords.length > 0) await supabase.from("AttendanceRecord").upsert(attRecords);
      if (lessons.length > 0) await supabase.from("QuranLesson").upsert(lessons);
      setSyncMsg({ ok: true, text: `✅ Journée clôturée et synchronisée — ${attRecords.length} présences, ${lessons.length} dars enregistrés` });
    } catch {
      setSyncMsg({ ok: false, text: "⚠️ Clôture locale réussie mais synchronisation Supabase en attente." });
    }
    setIsClotured(true);
  };

  // ── NIVEAUX STATE ──────────────────────────────────────────────────────
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [etapeVal, setEtapeVal] = useState<EtapePedagogique>(EtapePedagogique.Hifz);
  const [hizbVal, setHizbVal] = useState(60);
  const [fractionVal, setFractionVal] = useState(0);
  const [surahVal, setSurahVal] = useState(114);
  const [versetVal, setVersetVal] = useState(1);
  const [wardVal, setWardVal] = useState(0.5);
  const [khatmatVal, setKhatmatVal] = useState(0);
  const [savingLevel, setSavingLevel] = useState(false);

  const openLevelEdit = (s: Student) => {
    setEditingStudentId(s.id);
    setEtapeVal(s.etape);
    setHizbVal(s.currentHizbNum || 60);
    setFractionVal(s.currentHizbFraction || 0);
    setSurahVal(s.currentSurahNum || 114);
    setVersetVal(s.currentVersetNum || 1);
    setWardVal(s.dailyWardHizbs || 0.5);
    setKhatmatVal(s.khatmatCount || 0);
  };

  const handleSaveLevel = async (s: Student) => {
    setSavingLevel(true);
    const isTahajji = etapeVal === EtapePedagogique.Tahajji;
    const isHafiz = etapeVal === EtapePedagogique.Hafiz;
    const updated: Student = {
      ...s,
      etape: etapeVal,
      currentHizbNum: isTahajji ? undefined : hizbVal,
      currentHizbFraction: isTahajji ? undefined : fractionVal,
      currentSurahNum: isTahajji ? undefined : surahVal,
      currentVersetNum: isTahajji ? undefined : versetVal,
      dailyWardHizbs: wardVal,
      khatmatCount: isHafiz ? khatmatVal : 0,
      score: s.score + 10,
    };

    onUpdateStudent(updated);
    try {
      const { medals, ...clean } = updated;
      await supabase.from("Student").upsert(clean);
      setSyncMsg({ ok: true, text: `✅ Niveau de ${s.firstName} ${s.lastName} mis à jour et synchronisé.` });
    } catch {
      setSyncMsg({ ok: false, text: "Mise à jour locale, sync différée." });
    }
    setSavingLevel(false);
    setSavingLevel(false);
    setEditingStudentId(null);
    setTimeout(() => setSyncMsg(null), 3000);
  };

  const handleAddStudentToHalaqa = async (s: Student) => {
    setAddingStudentId(s.id);
    const updated: Student = { ...s, halaqaId: halaqa.id };
    onUpdateStudent(updated);
    try {
      const { medals, ...clean } = updated;
      await supabase.from("Student").upsert(clean);
      setSyncMsg({ ok: true, text: `✅ ${s.firstName} ${s.lastName} a été ajouté(e) au cercle avec succès.` });
    } catch {
      setSyncMsg({ ok: false, text: "Ajout local réussi, sync différée." });
    }
    setAddingStudentId(null);
    setShowAddStudent(false);
    setStudentSearch("");
    setTimeout(() => setSyncMsg(null), 3000);
  };

  // ── STATS ──────────────────────────────────────────────────────────────
  const hafizCount = halaqaStudents.filter(s => s.etape === EtapePedagogique.Hafiz).length;
  const hifzStudents = halaqaStudents.filter(s => s.currentHizbNum != null);
  const avgProgress = hifzStudents.length
    ? Math.round(hifzStudents.reduce((a, s) => a + calculateWestAfricanProgress(s.currentHizbNum, s.currentHizbFraction), 0) / hifzStudents.length)
    : 0;
  const totalDue = halaqaStudents.reduce((a, s) => a + (s.balanceDue || 0), 0);
  const presentToday = rows.filter(r => r.status !== AttendanceStatus.Absent).length;

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "apercu", label: "Aperçu", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "appel", label: "Appel & Dars", icon: <UserCheck className="w-4 h-4" /> },
    { id: "niveaux", label: "Niveaux & Hifz", icon: <BookOpen className="w-4 h-4" /> },
    { id: "historique", label: "Historique", icon: <Clock className="w-4 h-4" /> },
  ];

  const etapeColor = (e: EtapePedagogique) => {
    if (e === EtapePedagogique.Hafiz) return "bg-rose-50 text-rose-700 border-rose-200";
    if (e === EtapePedagogique.Hifz) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (e === EtapePedagogique.Murajaah) return "bg-amber-50 text-amber-700 border-amber-200";
    if (e === EtapePedagogique.Tathbit) return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (e === EtapePedagogique.Khatm) return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-sky-50 text-sky-700 border-sky-200";
  };

  return (
    <div className="space-y-5" id={`halaqa-detail-${halaqa.id}`}>
      {/* ── Back Header ───────────────────────────────────────────────── */}
      <div className="flex items-start gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0B1C30] bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl cursor-pointer transition-all shrink-0 mt-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-extrabold text-lg text-slate-800 truncate">{halaqa.name}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {halaqa.teacherName}
            </span>
            {halaqa.phoneTeacher && (
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {halaqa.phoneTeacher}
              </span>
            )}
            {halaqa.building && (
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> {halaqa.building}
              </span>
            )}
            {halaqa.schedule && (
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {halaqa.schedule}
              </span>
            )}
            {halaqa.level && (
              <span className="text-[10px] font-bold bg-[#0B1C30]/5 text-[#0B1C30] px-2 py-0.5 rounded-md">{halaqa.level}</span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black text-[#0B1C30]">{halaqaStudents.length}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">élèves</p>
        </div>
      </div>

      {/* Sync message */}
      <AnimatePresence>
        {syncMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-2 text-xs font-bold p-3 rounded-xl ${syncMsg.ok ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-amber-50 border border-amber-200 text-amber-800"}`}
          >
            {syncMsg.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            {syncMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sub Tabs ───────────────────────────────────────────────────── */}
      <div className="flex bg-white/90 backdrop-blur-sm px-2 py-2 rounded-2xl border border-slate-200/60 shadow-xs gap-1.5 overflow-x-auto [scrollbar-width:none]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id ? "bg-[#0B1C30] text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: APERÇU                                                     */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === "apercu" && (
        <div className="space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Élèves inscrits", value: halaqaStudents.length, sub: `Capacité: ${halaqa.maxCapacity}`, icon: <Users className="w-5 h-5" />, color: "bg-[#0B1C30]/5 text-[#0B1C30]" },
              { label: "Huffāz 👑", value: hafizCount, sub: "Mémorisateurs complets", icon: <GraduationCap className="w-5 h-5" />, color: "bg-amber-50 text-amber-700" },
              { label: "Progression Moy.", value: `${avgProgress}%`, sub: "Du Coran mémorisé", icon: <TrendingUp className="w-5 h-5" />, color: "bg-emerald-50 text-emerald-700" },
              { label: "Impayés", value: totalDue > 0 ? `${totalDue.toLocaleString()} F` : "Réglé ✓", sub: "Total solde dû", icon: <Award className="w-5 h-5" />, color: totalDue > 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700" },
            ].map((kpi, i) => (
              <div key={i} className={`${kpi.color} border border-current/10 rounded-2xl p-4 space-y-1`}>
                <div className="flex justify-between items-start">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{kpi.label}</p>
                  <span className="opacity-40">{kpi.icon}</span>
                </div>
                <p className="text-2xl font-black">{kpi.value}</p>
                <p className="text-[10px] opacity-60 font-medium">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Student roster summary */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Liste des Élèves</span>
                <span className="text-[10px] font-bold text-slate-400">{halaqaStudents.length} inscrits</span>
              </div>
              <button
                onClick={() => {
                  setShowAddStudent(!showAddStudent);
                  setStudentSearch("");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  showAddStudent 
                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    : "bg-[#0B1C30] text-white hover:bg-[#142d47]"
                }`}
              >
                {showAddStudent ? <XCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {showAddStudent ? "Fermer" : "Transférer un élève ici"}
              </button>
            </div>

            <AnimatePresence>
              {showAddStudent && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-slate-50 border-b border-slate-100"
                >
                  <div className="p-4 space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Rechercher par prénom, nom ou matricule..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B1C30]"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {students
                        .filter(s => s.halaqaId !== halaqa.id)
                        .filter(s => 
                          !studentSearch || 
                          `${s.firstName} ${s.lastName} ${s.matricule}`.toLowerCase().includes(studentSearch.toLowerCase())
                        )
                        .slice(0, 10)
                        .map(s => (
                          <div key={s.id} className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-lg">
                            <div>
                              <p className="font-bold text-xs text-slate-800">{s.firstName} {s.lastName}</p>
                              <p className="text-[10px] text-slate-500">{s.matricule} · {s.etape}</p>
                            </div>
                            <button
                              onClick={() => handleAddStudentToHalaqa(s)}
                              disabled={addingStudentId === s.id}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {addingStudentId === s.id ? "Ajout..." : "Ajouter"}
                            </button>
                          </div>
                      ))}
                      {students.filter(s => s.halaqaId !== halaqa.id).length === 0 && (
                        <p className="text-[10px] text-slate-400 text-center py-2">Tous les élèves sont déjà dans cette Halaqa.</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="divide-y divide-slate-50">
              {halaqaStudents.map(s => {
                const prog = calculateWestAfricanProgress(s.currentHizbNum, s.currentHizbFraction);
                return (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B1C30] to-[#142d47] text-white flex items-center justify-center text-[11px] font-extrabold shrink-0">
                        {s.firstName[0]}{s.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-800 truncate">{s.firstName} {s.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{s.matricule}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${etapeColor(s.etape)}`}>
                        {s.etape === EtapePedagogique.Hafiz ? "👑 Hafiz" : s.etape}
                      </span>
                      {s.currentHizbNum && (
                        <span className="text-[10px] font-bold text-slate-600">
                          Hizb {s.currentHizbNum} · {prog}%
                        </span>
                      )}
                      <button
                        onClick={() => { setActiveTab("niveaux"); openLevelEdit(s); }}
                        className="text-[10px] font-bold text-[#0B1C30] bg-[#0B1C30]/5 hover:bg-[#0B1C30]/10 px-2 py-1 rounded-lg cursor-pointer transition-all"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {halaqaStudents.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-8">Aucun élève affecté à cette Halaqa</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: APPEL & DARS                                               */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === "appel" && (
        <div className="space-y-4">
          {/* Config row */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-slate-800">Appel & Saisie des Dars</h3>
                <p className="text-[10px] text-slate-400">Cochez les présences et saisissez la leçon de chaque élève</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={currentDate}
                onChange={e => { setCurrentDate(e.target.value); setIsClotured(false); }}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
              />
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                {presentToday}/{rows.length} présents
              </span>
            </div>
          </div>

          {isClotured && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Journée clôturée avec succès. Les données ont été sauvegardées.
            </div>
          )}

          {/* Rows */}
          <div className="space-y-2">
            {rows.map(row => {
              const s = students.find(st => st.id === row.studentId);
              if (!s) return null;
              const isAbsent = row.status === AttendanceStatus.Absent;
              const isTahajji = s.etape === EtapePedagogique.Tahajji;

              return (
                <div key={row.studentId} className={`bg-white border rounded-2xl overflow-hidden shadow-xs transition-all ${isAbsent ? "opacity-60 border-slate-100" : "border-slate-200"}`}>
                  {/* Top row */}
                  <div className="flex items-center justify-between px-4 py-3 gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${isAbsent ? "bg-slate-200 text-slate-400" : "bg-emerald-100 text-emerald-800"}`}>
                        {s.firstName[0]}{s.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-800 truncate">{s.firstName} {s.lastName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-mono text-slate-400">{s.matricule}</span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${etapeColor(s.etape)}`}>
                            {s.etape === EtapePedagogique.Hafiz ? "👑 Hafiz" : s.etape}
                          </span>
                          {s.currentHizbNum && (
                            <span className="text-[9px] text-slate-500 font-medium">Hizb {s.currentHizbNum}{formatHizbFractionArabic(s.currentHizbFraction || 0)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Presence buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {[
                        { st: AttendanceStatus.Present, label: "Présent", icon: <CheckCircle className="w-3.5 h-3.5" />, cls: "text-emerald-700 ring-emerald-300" },
                        { st: AttendanceStatus.Late, label: "Retard", icon: <Clock className="w-3.5 h-3.5" />, cls: "text-amber-700 ring-amber-300" },
                        { st: AttendanceStatus.Absent, label: "Absent", icon: <XCircle className="w-3.5 h-3.5" />, cls: "text-rose-700 ring-rose-300" },
                      ].map(opt => (
                        <button
                          key={opt.st}
                          onClick={() => updateRow(row.studentId, { status: opt.st })}
                          className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                            row.status === opt.st
                              ? `bg-white ring-2 ${opt.cls} shadow-sm`
                              : "text-slate-400 hover:bg-slate-50"
                          }`}
                        >
                          {opt.icon}
                          <span className="hidden sm:inline">{opt.label}</span>
                        </button>
                      ))}
                      {!isTahajji && !isAbsent && (
                        <button
                          onClick={() => updateRow(row.studentId, { expanded: !row.expanded })}
                          className="ml-1 p-1.5 text-slate-400 hover:text-[#0B1C30] hover:bg-slate-100 rounded-lg cursor-pointer transition-all"
                        >
                          {row.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Dars entry */}
                  <AnimatePresence>
                    {row.expanded && !isAbsent && !isTahajji && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 bg-slate-50/60 border-t border-slate-100 space-y-4">

                          {/* Lesson type toggle */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Type de Dars :</span>
                            {["hizb", "sourate"].map(lt => (
                              <button
                                key={lt}
                                onClick={() => updateRow(row.studentId, { lessonType: lt as any })}
                                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                                  row.lessonType === lt
                                    ? "bg-[#0B1C30] text-white"
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                                }`}
                              >
                                {lt === "hizb" ? "📖 Hizb" : "📜 Sourate"}
                              </button>
                            ))}
                          </div>

                          {/* Hizb entry */}
                          {row.lessonType === "hizb" && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Hizb Début</label>
                                <div className="flex gap-1.5">
                                  <select
                                    value={row.startHizb}
                                    onChange={e => updateRow(row.studentId, { startHizb: Number(e.target.value) })}
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none"
                                  >
                                    {Array.from({ length: 60 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                                  </select>
                                  <select
                                    value={row.startHizbFraction}
                                    onChange={e => updateRow(row.studentId, { startHizbFraction: Number(e.target.value) })}
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none"
                                  >
                                    {HIZB_FRACTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Hizb Fin</label>
                                <div className="flex gap-1.5">
                                  <select
                                    value={row.endHizb}
                                    onChange={e => updateRow(row.studentId, { endHizb: Number(e.target.value) })}
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none"
                                  >
                                    {Array.from({ length: 60 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                                  </select>
                                  <select
                                    value={row.endHizbFraction}
                                    onChange={e => updateRow(row.studentId, { endHizbFraction: Number(e.target.value) })}
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none"
                                  >
                                    {HIZB_FRACTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Sourate entry */}
                          {row.lessonType === "sourate" && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">De (Sourate · Verset)</label>
                                <div className="flex gap-1.5">
                                  <select
                                    value={row.startSurah}
                                    onChange={e => updateRow(row.studentId, { startSurah: Number(e.target.value) })}
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none"
                                  >
                                    {SURAHS.map(s => <option key={s.number} value={s.number}>{s.number}. {s.name}</option>)}
                                  </select>
                                  <input
                                    type="number" min={1}
                                    value={row.startVerset}
                                    onChange={e => updateRow(row.studentId, { startVerset: Number(e.target.value) })}
                                    className="w-14 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">À (Sourate · Verset)</label>
                                <div className="flex gap-1.5">
                                  <select
                                    value={row.endSurah}
                                    onChange={e => updateRow(row.studentId, { endSurah: Number(e.target.value) })}
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none"
                                  >
                                    {SURAHS.map(s => <option key={s.number} value={s.number}>{s.number}. {s.name}</option>)}
                                  </select>
                                  <input
                                    type="number" min={1}
                                    value={row.endVerset}
                                    onChange={e => updateRow(row.studentId, { endVerset: Number(e.target.value) })}
                                    className="w-14 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Muraja'ah */}
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <div
                                onClick={() => updateRow(row.studentId, { murajaahActive: !row.murajaahActive })}
                                className={`w-8 h-4 rounded-full transition-colors flex items-center cursor-pointer ${row.murajaahActive ? "bg-indigo-500" : "bg-slate-300"}`}
                              >
                                <span className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform mx-0.5 ${row.murajaahActive ? "translate-x-3.5" : ""}`} />
                              </div>
                              <span className="text-[10px] font-bold text-slate-600">+ Muraja'ah (Révision) لمراجعة</span>
                            </label>
                            {row.murajaahActive && (
                              <div className="grid grid-cols-2 gap-2 pl-2 border-l-2 border-indigo-200">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-500 uppercase">Révision De Hizb</label>
                                  <div className="flex gap-1">
                                    <select value={row.murajaahStartHizb} onChange={e => updateRow(row.studentId, { murajaahStartHizb: Number(e.target.value) })}
                                      className="flex-1 bg-white border border-indigo-200 rounded-lg px-1.5 py-1 text-[10px] font-semibold focus:outline-none">
                                      {Array.from({ length: 60 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                    <select value={row.murajaahStartFraction} onChange={e => updateRow(row.studentId, { murajaahStartFraction: Number(e.target.value) })}
                                      className="flex-1 bg-white border border-indigo-200 rounded-lg px-1.5 py-1 text-[10px] font-semibold focus:outline-none">
                                      {HIZB_FRACTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                    </select>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-500 uppercase">Révision À Hizb</label>
                                  <div className="flex gap-1">
                                    <select value={row.murajaahEndHizb} onChange={e => updateRow(row.studentId, { murajaahEndHizb: Number(e.target.value) })}
                                      className="flex-1 bg-white border border-indigo-200 rounded-lg px-1.5 py-1 text-[10px] font-semibold focus:outline-none">
                                      {Array.from({ length: 60 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                    <select value={row.murajaahEndFraction} onChange={e => updateRow(row.studentId, { murajaahEndFraction: Number(e.target.value) })}
                                      className="flex-1 bg-white border border-indigo-200 rounded-lg px-1.5 py-1 text-[10px] font-semibold focus:outline-none">
                                      {HIZB_FRACTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Evaluation + Comments */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Évaluation</label>
                              <div className="flex gap-2">
                                {EVAL_OPTIONS.map(opt => (
                                  <button
                                    key={opt.value}
                                    onClick={() => updateRow(row.studentId, { evaluation: opt.value })}
                                    className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg border cursor-pointer transition-all ${
                                      row.evaluation === opt.value ? opt.color + " shadow-sm" : "border-slate-200 text-slate-400 hover:bg-slate-50"
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Commentaire Oustaz</label>
                              <input
                                type="text"
                                placeholder="Observations, points à retravailler…"
                                value={row.comments}
                                onChange={e => updateRow(row.studentId, { comments: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Clôture button */}
          {!isClotured && rows.length > 0 && (
            <button
              onClick={handleCloture}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-5 h-5" />
              Clôturer la journée — Enregistrer l'Appel & les Dars ({rows.filter(r => r.status !== AttendanceStatus.Absent).length} présents)
            </button>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: NIVEAUX & HIFZ                                             */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === "niveaux" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 font-medium">Cliquez sur un élève pour modifier son niveau coranique et sa progression.</p>
          {halaqaStudents.map(s => {
            const isEditing = editingStudentId === s.id;
            const prog = calculateWestAfricanProgress(s.currentHizbNum, s.currentHizbFraction);

            return (
              <div key={s.id} className={`bg-white border rounded-2xl overflow-hidden shadow-xs transition-all ${isEditing ? "border-[#0B1C30] ring-2 ring-[#0B1C30]/10" : "border-slate-200"}`}>
                {/* Header row */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => isEditing ? setEditingStudentId(null) : openLevelEdit(s)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center text-[11px] font-extrabold shrink-0">
                      {s.firstName[0]}{s.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-800">{s.firstName} {s.lastName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${etapeColor(s.etape)}`}>
                          {s.etape === EtapePedagogique.Hafiz ? "👑 Hafiz" : s.etape}
                        </span>
                        {s.currentHizbNum && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            Hizb {s.currentHizbNum}{formatHizbFractionArabic(s.currentHizbFraction || 0)} · {prog}%
                          </span>
                        )}
                        {s.currentSurahNum && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            S.{s.currentSurahNum}:{s.currentVersetNum}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Progress mini bar */}
                    <div className="hidden sm:flex flex-col items-end gap-1 w-20">
                      <span className="text-[9px] font-bold text-slate-500">{prog}%</span>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${prog}%` }} />
                      </div>
                    </div>
                    <Edit3 className={`w-4 h-4 transition-colors ${isEditing ? "text-[#0B1C30]" : "text-slate-300"}`} />
                  </div>
                </div>

                {/* Edit form */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-slate-50/60 border-t border-slate-100 px-4 py-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Étape pédagogique */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Étape Pédagogique</label>
                            <select
                              value={etapeVal}
                              onChange={e => setEtapeVal(e.target.value as EtapePedagogique)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B1C30]"
                            >
                              {Object.values(EtapePedagogique).map(ep => (
                                <option key={ep} value={ep}>{ep}</option>
                              ))}
                            </select>
                          </div>

                          {/* Ward journalier */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Ward Journalier (Hizbs/jour)</label>
                            <select
                              value={wardVal}
                              onChange={e => setWardVal(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none"
                            >
                              {[0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3].map(v => <option key={v} value={v}>{v} Hizb/jour</option>)}
                            </select>
                          </div>
                        </div>

                        {etapeVal !== EtapePedagogique.Tahajji && (
                          <div className="grid grid-cols-2 gap-4">
                            {/* Hizb actuel */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Hizb actuel (1-60)</label>
                              <div className="flex gap-2">
                                <select value={hizbVal} onChange={e => setHizbVal(Number(e.target.value))}
                                  className="flex-1 bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-bold focus:outline-none">
                                  {Array.from({ length: 60 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                                <select value={fractionVal} onChange={e => setFractionVal(Number(e.target.value))}
                                  className="flex-1 bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold focus:outline-none">
                                  {HIZB_FRACTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                              </div>
                            </div>

                            {/* Sourate actuelle */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Sourate · Verset actuel</label>
                              <div className="flex gap-2">
                                <select value={surahVal} onChange={e => setSurahVal(Number(e.target.value))}
                                  className="flex-1 bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold focus:outline-none">
                                  {SURAHS.map(su => <option key={su.number} value={su.number}>{su.number}. {su.name}</option>)}
                                </select>
                                <input type="number" min={1} value={versetVal} onChange={e => setVersetVal(Number(e.target.value))}
                                  className="w-16 bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-bold focus:outline-none text-center" />
                              </div>
                            </div>
                          </div>
                        )}

                        {etapeVal === EtapePedagogique.Hafiz && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre de Khatmāt (Clôtures)</label>
                            <input type="number" min={0} value={khatmatVal} onChange={e => setKhatmatVal(Number(e.target.value))}
                              className="w-32 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-extrabold text-amber-700 focus:outline-none" />
                          </div>
                        )}

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleSaveLevel(s)}
                            disabled={savingLevel}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0B1C30] hover:bg-[#142d47] text-white font-bold text-xs rounded-xl cursor-pointer transition-all disabled:opacity-60 shadow-sm"
                          >
                            {savingLevel ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            {savingLevel ? "Synchronisation…" : "Enregistrer & Sync Supabase"}
                          </button>
                          <button
                            onClick={() => setEditingStudentId(null)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: HISTORIQUE                                                  */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === "historique" && (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D0A21C]" />
            Historique de la Halaqa
          </h3>
          <div className="space-y-2">
            {halaqaStudents.map(s => (
              <div key={s.id} className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3">
                <div>
                  <p className="font-bold text-xs text-slate-800">{s.firstName} {s.lastName}</p>
                  <p className="text-[10px] text-slate-400">{s.matricule} · {s.etape}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-emerald-700">
                    {s.currentHizbNum ? `Hizb ${s.currentHizbNum}${formatHizbFractionArabic(s.currentHizbFraction || 0)}` : "Tahajji"}
                  </p>
                  <p className="text-[9px] text-slate-400">{calculateWestAfricanProgress(s.currentHizbNum, s.currentHizbFraction)}% du Coran</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 text-center pt-2">
            L'historique complet des leçons et des présences est disponible dans le Suivi Coranique &amp; les Bulletins Mensuels.
          </p>
        </div>
      )}
    </div>
  );
}
