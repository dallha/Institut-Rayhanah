/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * StudentFile.tsx — Dossier complet d'un élève (vue & modification)
 */

import React, { useState, useMemo } from "react";
import { Student, Halaqa, EtapePedagogique, AttendanceRecord, QuranLesson, PaymentRecord, AttendanceStatus, Evaluation } from "../types";
import { SURAHS, HIZBS, calculateWestAfricanProgress, formatHizbFractionArabic } from "../quranData";
import {
  X, User, BookOpen, CreditCard, Calendar, Phone, Mail, Edit3, Save,
  Award, Star, TrendingUp, CheckCircle, XCircle, AlertTriangle, Hash,
  Users, GraduationCap, FileText, Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

/* ── helpers ─────────────────────────────────────── */
function getEtapeLabel(e: EtapePedagogique, gender?: string) {
  const isFemale = gender === "female" || gender === "F";
  const map: Record<EtapePedagogique, string> = {
    [EtapePedagogique.Tahajji]: "Tahajji — التهجي",
    [EtapePedagogique.Hifz]: "Hifz — الحفظ",
    [EtapePedagogique.Murajaah]: "Muraja'ah — المراجعة",
    [EtapePedagogique.Tathbit]: "Tathbit — التثبيت",
    [EtapePedagogique.Khatm]: "Khatm — الختم",
    [EtapePedagogique.Hafiz]: isFemale ? "Hafiza — حافظة" : "Hafiz — حافظ",
  };
  return map[e] ?? e;
}

function getEtapeColor(e: EtapePedagogique) {
  const map: Record<EtapePedagogique, string> = {
    [EtapePedagogique.Tahajji]: "bg-sky-100 text-sky-800 border-sky-200",
    [EtapePedagogique.Hifz]: "bg-emerald-100 text-emerald-800 border-emerald-200",
    [EtapePedagogique.Murajaah]: "bg-violet-100 text-violet-800 border-violet-200",
    [EtapePedagogique.Tathbit]: "bg-amber-100 text-amber-800 border-amber-200",
    [EtapePedagogique.Khatm]: "bg-orange-100 text-orange-800 border-orange-200",
    [EtapePedagogique.Hafiz]: "bg-rose-100 text-rose-800 border-rose-200",
  };
  return map[e] ?? "bg-slate-100 text-slate-800 border-slate-200";
}

function getInitials(s: Student) {
  return `${s.firstName[0]}${s.lastName[0]}`.toUpperCase();
}

function getAvatarColor(s: Student) {
  const colors = [
    "from-emerald-400 to-teal-600",
    "from-violet-400 to-purple-600",
    "from-amber-400 to-orange-600",
    "from-sky-400 to-blue-600",
    "from-rose-400 to-pink-600",
  ];
  const idx = s.id.charCodeAt(s.id.length - 1) % colors.length;
  return colors[idx];
}

/* ── prop types ──────────────────────────────────── */
interface StudentFileProps {
  student: Student;
  halaqas: Halaqa[];
  attendance: AttendanceRecord[];
  lessons: QuranLesson[];
  payments: PaymentRecord[];
  onClose: () => void;
  onUpdateStudent: (updated: Student) => void;
}

type TabId = "identite" | "pedagogie" | "presences" | "finances";

/* ══════════════════════════════════════════════════
   Component
══════════════════════════════════════════════════ */
export default function StudentFile({
  student, halaqas, attendance, lessons, payments, onClose, onUpdateStudent
}: StudentFileProps) {
  const { t } = useTranslation();

  // Lock body scroll while modal is open to prevent background scroll bleed
  React.useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const [activeTab, setActiveTab] = useState<TabId>("identite");
  const [editing, setEditing] = useState(false);

  // Editable form state
  const [form, setForm] = useState({
    firstName: student.firstName,
    lastName: student.lastName,
    parentName: student.parentName,
    parentPhone: student.parentPhone,
    parentEmail: student.parentEmail ?? "",
    age: student.age ?? 0,
    gender: student.gender ?? "male",
    nationality: student.nationality ?? "Sénégalaise",
    status: student.status ?? (student.etape === EtapePedagogique.Hafiz ? "hafiz" : "en_cours"),
    halaqaId: student.halaqaId,
    etape: student.etape,
    regime: student.regime ?? "externat",
    monthlyFee: student.monthlyFee,
    currentSurahNum: student.currentSurahNum ?? 1,
    currentVersetNum: student.currentVersetNum ?? 1,
    currentHizbNum: student.currentHizbNum ?? 60,
    currentHizbFraction: student.currentHizbFraction ?? 0,
    dailyWardHizbs: student.dailyWardHizbs,
    khatmatCount: student.khatmatCount,
  });

  const halaqa = halaqas.find(h => h.id === student.halaqaId);
  const progress = calculateWestAfricanProgress(student.currentHizbNum, student.currentHizbFraction);
  const medals = student.medals ?? [];
  const score = student.score ?? 0;
  const balanceDue = student.balanceDue ?? 0;

  // Student-specific records
  const studentLessons = useMemo(() =>
    lessons.filter(l => l.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20),
    [lessons, student.id]);

  const studentAttendance = useMemo(() =>
    attendance.filter(a => a.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30),
    [attendance, student.id]);

  const studentPayments = useMemo(() =>
    payments.filter(p => p.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date)),
    [payments, student.id]);

  const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
  const presentCount = studentAttendance.filter(a => a.status === AttendanceStatus.Present).length;
  const absentCount = studentAttendance.filter(a => a.status === AttendanceStatus.Absent).length;
  const attendanceRate = studentAttendance.length > 0
    ? Math.round((presentCount / studentAttendance.length) * 100)
    : 0;
  const naamCount = studentLessons.filter(l => l.evaluation === Evaluation.Naam).length;

  const handleSave = () => {
    onUpdateStudent({
      ...student,
      ...form,
      parentEmail: form.parentEmail || undefined,
    });
    setEditing(false);
  };

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "identite",  label: t('studentFile.tabIdentity'),   icon: <User className="w-4 h-4" /> },
    { id: "pedagogie", label: t('studentFile.tabPedagogy'),   icon: <BookOpen className="w-4 h-4" /> },
    { id: "presences", label: t('studentFile.tabAttendance'), icon: <Calendar className="w-4 h-4" /> },
    { id: "finances",  label: t('studentFile.tabFinances'),   icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-2 sm:p-4 pb-20 sm:pb-4 overflow-y-auto" id="student-file-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[82vh] sm:max-h-[92vh] flex flex-col overflow-hidden text-slate-800 border border-slate-200 my-auto shrink-0 relative z-10"
        id={`student-file-${student.id}`}
      >
        {/* ── HEADER ─────────────────────────────────── */}
        <div className="relative bg-gradient-to-r from-emerald-700 to-teal-800 p-4 sm:p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/10 hover:bg-white/25 text-white p-1.5 rounded-full transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 sm:gap-4 pr-6">
            {/* Avatar */}
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${getAvatarColor(student)} flex items-center justify-center text-base sm:text-xl font-bold text-white shadow-lg shrink-0`}>
              {getInitials(student)}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-xl font-bold truncate">{student.firstName} {student.lastName}</h2>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                {/* Matricule badge */}
                <span className="flex items-center gap-1 bg-white/20 text-white text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                  <Hash className="w-3 h-3" />
                  {student.matricule}
                </span>
                {/* Etape badge */}
                <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border ${getEtapeColor(student.etape)}`}>
                  {getEtapeLabel(student.etape, student.gender)}
                </span>
                {student.gender && (
                  <span className="text-[10px] text-emerald-200 font-medium">
                    {student.gender === "female" || student.gender === "F" ? t('studentFile.female') : t('studentFile.male')}
                  </span>
                )}
              </div>
              <p className="text-emerald-200 text-[11px] sm:text-xs mt-1 truncate">{halaqa?.name ?? "—"} · {student.age ? `${student.age} ${t('studentFile.yearsOld')}` : "—"}</p>
            </div>
          </div>

          {/* Quick KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 sm:mt-4">
            {[
              { label: t('studentFile.progression'), value: `${progress}%`, icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { label: t('studentFile.presence'), value: `${attendanceRate}%`, icon: <CheckCircle className="w-3.5 h-3.5" /> },
              { label: t('studentFile.score'), value: `${score} pts`, icon: <Star className="w-3.5 h-3.5" /> },
              { label: t('studentFile.balance'), value: `${balanceDue.toLocaleString()} F`, icon: <CreditCard className="w-3.5 h-3.5" /> },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white/10 rounded-xl p-1.5 sm:p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-200 mb-0.5">{kpi.icon}</div>
                <div className="text-xs sm:text-sm font-bold">{kpi.value}</div>
                <div className="text-[8px] sm:text-[9px] text-emerald-300 uppercase tracking-wider">{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABS ───────────────────────────────────── */}
        <div className="flex border-b border-slate-100 bg-white shrink-0 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setEditing(false); }}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── BODY ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* ──── TAB: IDENTITÉ ──── */}
          {activeTab === "identite" && (
            <div className="space-y-5">
              {/* Edit toggle */}
              <div className="flex justify-end">
                {editing ? (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-bold rounded-lg transition-all">{t('studentFile.cancel')}</button>
                    <button onClick={handleSave} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all">
                      <Save className="w-3.5 h-3.5" /> {t('studentFile.save')}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditing(true)} className="px-4 py-1.5 border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all">
                    <Edit3 className="w-3.5 h-3.5" /> {t('studentFile.edit')}
                  </button>
                )}
              </div>

              {/* Identity card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {t('studentFile.personalInfo')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t('school.firstName'), field: "firstName" as const },
                    { label: t('school.lastName'), field: "lastName" as const },
                  ].map(({ label, field }) => (
                    <div key={field}>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</label>
                      {editing ? (
                        <input
                          className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          value={form[field] as string}
                          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm font-semibold text-slate-800">{student[field]}</p>
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('school.age')}</label>
                    {editing ? (
                      <input type="number" min={4} max={30} className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" value={form.age} onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))} />
                    ) : (
                      <p className="text-sm font-semibold text-slate-800">{student.age ? `${student.age} ${t('studentFile.yearsOld')}` : "—"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('studentFile.gender')}</label>
                    {editing ? (
                      <select className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                        <option value="male">{t('studentFile.male')}</option>
                        <option value="female">{t('studentFile.female')}</option>
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-slate-800">{student.gender === "female" ? t('studentFile.female') : t('studentFile.male')}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('studentFile.regime')}</label>
                    {editing ? (
                      <select className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" value={form.regime} onChange={e => setForm(f => ({ ...f, regime: e.target.value as any }))}>
                        <option value="externat">{t('school.regimeExternat')}</option>
                        <option value="internat">{t('school.regimeInternat')}</option>
                        <option value="demi-pension">{t('school.regimeDemi')}</option>
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-slate-800 capitalize">{student.regime ?? "externat"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('school.nationality')}</label>
                    {editing ? (
                      <input
                        className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        value={form.nationality}
                        onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
                        placeholder="Ex: Sénégalaise, Mauritanienne..."
                      />
                    ) : (
                      <p className="text-sm font-semibold text-slate-800">{student.nationality ?? t('studentFile.defaultNationality')}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('studentFile.studentStatus')}</label>
                    {editing ? (
                      <select
                        className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 font-bold"
                        value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                      >
                        <option value="en_cours">📖 {t('studentFile.statusActive')}</option>
                        <option value="hafiz">👑 {t('studentFile.statusHafiz')}</option>
                        <option value="abandonne">⚠️ {t('studentFile.statusAbandoned')}</option>
                      </select>
                    ) : (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border inline-block ${
                        (student.status === "abandonne") ? "bg-rose-100 text-rose-700 border-rose-200" :
                        (student.status === "hafiz" || student.etape === EtapePedagogique.Hafiz) ? "bg-amber-100 text-amber-800 border-amber-200" :
                        "bg-emerald-100 text-emerald-700 border-emerald-200"
                      }`}>
                        {student.status === "abandonne" ? `⚠️ ${t('studentFile.abandoned')}` : (student.status === "hafiz" || student.etape === EtapePedagogique.Hafiz) ? `👑 Hafiz(a)` : `📖 ${t('studentFile.inProgress')}`}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Matricule</label>
                    <p className="text-sm font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg inline-block">{student.matricule}</p>
                  </div>
                </div>
              </div>

              {/* Parent info */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {t('studentFile.parentContact')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('school.parentName')}</label>
                    {editing ? (
                      <input className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" value={form.parentName} onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))} />
                    ) : (
                      <p className="text-sm font-semibold text-slate-800">{student.parentName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('school.phone')}</label>
                    {editing ? (
                      <input className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" value={form.parentPhone} onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))} />
                    ) : (
                      <a href={`tel:${student.parentPhone}`} className="text-sm font-semibold text-emerald-700 hover:underline flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {student.parentPhone}
                      </a>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('school.email')}</label>
                    {editing ? (
                      <input type="email" className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" value={form.parentEmail} onChange={e => setForm(f => ({ ...f, parentEmail: e.target.value }))} />
                    ) : student.parentEmail ? (
                      <a href={`mailto:${student.parentEmail}`} className="text-sm font-semibold text-emerald-700 hover:underline flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> {student.parentEmail}
                      </a>
                    ) : (
                      <p className="text-sm text-slate-400 italic">—</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Halaqa */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-3"><Users className="w-3.5 h-3.5" /> {t('studentFile.halaqaGroup')}</h3>
                {editing ? (
                  <select className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" value={form.halaqaId} onChange={e => setForm(f => ({ ...f, halaqaId: e.target.value }))}>
                    {halaqas.map(h => (
                      <option key={h.id} value={h.id}>{h.name} — {h.teacherName}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{halaqa?.name ?? "—"}</p>
                      <p className="text-xs text-slate-400">{t('studentFile.teacher')}: {halaqa?.teacherName ?? "—"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──── TAB: PÉDAGOGIE ──── */}
          {activeTab === "pedagogie" && (
            <div className="space-y-5">
              <div className="flex justify-end">
                {editing ? (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs font-bold rounded-lg">{t('studentFile.cancel')}</button>
                    <button onClick={handleSave} className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm">
                      <Save className="w-3.5 h-3.5" /> {t('studentFile.save')}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditing(true)} className="px-4 py-1.5 border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-bold rounded-lg flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" /> {t('studentFile.edit')}
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase">{t('studentFile.quranicProgression')}</span>
                  <span className="text-2xl font-black text-emerald-700">{progress}%</span>
                </div>
                <div className="w-full bg-emerald-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-emerald-600 mt-1">
                  {student.currentHizbNum
                    ? `Hizb ${student.currentHizbNum} · ${formatHizbFractionArabic(student.currentHizbFraction ?? 0)}`
                    : t('studentFile.positionUndefined')}
                </p>
              </div>

              {/* Etape */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">{t('studentFile.curriculumStage')}</label>
                {editing ? (
                  <select className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" value={form.etape} onChange={e => setForm(f => ({ ...f, etape: e.target.value as EtapePedagogique }))}>
                    {Object.values(EtapePedagogique).map(et => (
                      <option key={et} value={et}>{getEtapeLabel(et, form.gender)}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full border ${getEtapeColor(student.etape)}`}>
                    <GraduationCap className="w-4 h-4" />
                    {getEtapeLabel(student.etape, student.gender)}
                  </span>
                )}
              </div>

              {/* Quran position */}
              {form.etape !== EtapePedagogique.Tahajji && (
                <div className="border-2 border-emerald-300 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">الموقع القرآني — Position Actuelle</span>
                  </div>
                  <div className="p-4 bg-emerald-50 grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-1">Sourate</label>
                      {editing ? (
                        <select className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" value={form.currentSurahNum} onChange={e => setForm(f => ({ ...f, currentSurahNum: Number(e.target.value) }))}>
                          {SURAHS.map(s => <option key={s.number} value={s.number}>{s.number}. {s.name} ({s.arabicName})</option>)}
                        </select>
                      ) : (
                        <p className="text-sm font-bold text-emerald-800">
                          {student.currentSurahNum
                            ? `${student.currentSurahNum}. ${SURAHS.find(s => s.number === student.currentSurahNum)?.name} (${SURAHS.find(s => s.number === student.currentSurahNum)?.arabicName})`
                            : "—"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-1">Verset (آية)</label>
                      {editing ? (
                        <input type="number" min={1} className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 text-center font-bold" value={form.currentVersetNum} onChange={e => setForm(f => ({ ...f, currentVersetNum: Number(e.target.value) }))} />
                      ) : (
                        <p className="text-sm font-bold text-emerald-800">v.{student.currentVersetNum ?? "—"}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-1">Fraction</label>
                      {editing ? (
                        <select className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" value={form.currentHizbFraction} onChange={e => setForm(f => ({ ...f, currentHizbFraction: Number(e.target.value) }))}>
                          <option value={0}>بداية — Début</option>
                          <option value={0.25}>ربع — 1/4</option>
                          <option value={0.50}>نصف — 1/2</option>
                          <option value={0.75}>ثلاثة أرباع — 3/4</option>
                          <option value={1.00}>كامل — Complet</option>
                        </select>
                      ) : (
                        <p className="text-sm font-bold text-emerald-800">{formatHizbFractionArabic(student.currentHizbFraction ?? 0)}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-1">Hizb الحزب</label>
                      {editing ? (
                        <select className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" value={form.currentHizbNum} onChange={e => setForm(f => ({ ...f, currentHizbNum: Number(e.target.value) }))}>
                          {HIZBS.map(h => <option key={h.number} value={h.number}>الحزب {h.number}: {h.name}</option>)}
                        </select>
                      ) : (
                        <p className="text-sm font-bold text-emerald-800">
                          {student.currentHizbNum
                            ? `الحزب ${student.currentHizbNum}: ${HIZBS.find(h => h.number === student.currentHizbNum)?.name}`
                            : "—"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Ward */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">{t('studentFile.dailyObjective')}</label>
                {editing ? (
                  <select className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" value={form.dailyWardHizbs} onChange={e => setForm(f => ({ ...f, dailyWardHizbs: Number(e.target.value) }))}>
                    <option value={0}>{t('studentFile.noObjective')}</option>
                    <option value={0.25}>1/4 de Hizb</option>
                    <option value={0.5}>1/2 Hizb</option>
                    <option value={0.75}>3/4 de Hizb</option>
                    <option value={1}>1 Hizb complet</option>
                    <option value={1.5}>1.5 Hizbs</option>
                    <option value={2}>2 Hizbs</option>
                    <option value={3}>3 Hizbs</option>
                  </select>
                ) : (
                  <p className="text-sm font-semibold text-slate-800">{student.dailyWardHizbs > 0 ? `${student.dailyWardHizbs} Hizb(s)` : t('studentFile.none')}</p>
                )}
              </div>

              {/* Medals */}
              {medals.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-amber-700 uppercase mb-3 flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> {t('studentFile.medalsObtained')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {medals.map(m => (
                      <span key={m.id} className="flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                        <span>{m.icon}</span> {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Last lessons */}
              {studentLessons.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {t('studentFile.lastDars')}</h3>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {studentLessons.slice(0, 8).map(l => (
                      <div key={l.id} className="flex flex-col px-4 py-2.5 gap-1.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                              <p className="text-xs font-semibold text-slate-700">
                                {l.type === "sourate"
                                  ? `S.${l.startSurah} v.${l.startVerset} → S.${l.endSurah} v.${l.endVerset}`
                                  : `Hizb ${l.startHizb} → Hizb ${l.endHizb}`}
                              </p>
                              {l.versesCount !== undefined && l.versesCount > 0 && (
                                <span className="text-[9px] font-mono bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">
                                  {l.versesCount} v.
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{l.date}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${l.evaluation === Evaluation.Naam ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                            {l.evaluation === Evaluation.Naam ? "⭐ نعم" : "⚠️ لم"}
                          </span>
                        </div>
                        
                        {l.murajaahStartHizb && (
                          <div className="flex items-start justify-between mt-1 pt-1.5 border-t border-slate-50 border-dashed">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                              <p className="text-[11px] font-medium text-indigo-700">
                                Révision: Hizb {l.murajaahStartHizb} → {l.murajaahEndHizb}
                              </p>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${l.murajaahEvaluation === Evaluation.Naam ? "bg-indigo-100 text-indigo-700" : "bg-rose-50 text-rose-600"}`}>
                              {l.murajaahEvaluation === Evaluation.Naam ? "نعم" : "لم"}
                            </span>
                          </div>
                        )}

                        {l.comments && (
                          <div className="bg-slate-50 text-slate-500 text-[10px] px-2 py-1.5 rounded-md italic mt-0.5">
                            "{l.comments}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──── TAB: PRÉSENCES ──── */}
          {activeTab === "presences" && (
            <div className="space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-xl font-black text-emerald-700">{presentCount}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">{t('studentFile.presences')}</p>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
                  <XCircle className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                  <p className="text-xl font-black text-rose-600">{absentCount}</p>
                  <p className="text-[10px] text-rose-600 font-bold uppercase">{t('studentFile.absences')}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <TrendingUp className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                  <p className="text-xl font-black text-slate-700">{attendanceRate}%</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{t('studentFile.rate')}</p>
                </div>
              </div>

              {/* Attendance list */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase">{t('studentFile.attendanceHistory')}</h3>
                </div>
                {studentAttendance.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs p-6">{t('studentFile.noRecord')}</p>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {studentAttendance.map(a => (
                      <div key={a.id} className="flex items-center justify-between px-4 py-2.5">
                        <p className="text-xs font-mono text-slate-500">{a.date}</p>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          a.status === AttendanceStatus.Present ? "bg-emerald-100 text-emerald-700"
                          : a.status === AttendanceStatus.Late ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                        }`}>
                          {a.status === AttendanceStatus.Present ? <><CheckCircle className="w-3 h-3" /> {t('studentFile.present')}</>
                          : a.status === AttendanceStatus.Late ? <><AlertTriangle className="w-3 h-3" /> {t('studentFile.late')}</>
                          : <><XCircle className="w-3 h-3" /> {t('studentFile.absent')}</>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──── TAB: FINANCES ──── */}
          {activeTab === "finances" && (
            <div className="space-y-4">
              {/* Balance card */}
              <div className={`rounded-xl p-5 ${balanceDue > 0 ? "bg-rose-50 border-2 border-rose-300" : "bg-emerald-50 border-2 border-emerald-300"}`}>
                <p className={`text-xs font-bold uppercase mb-1 ${balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {balanceDue > 0 ? t('studentFile.balanceDue') : t('studentFile.accountUpToDate')}
                </p>
                <p className={`text-3xl font-black ${balanceDue > 0 ? "text-rose-700" : "text-emerald-700"}`}>
                  {balanceDue.toLocaleString()} FCFA
                </p>
                <p className="text-xs text-slate-500 mt-1">{t('studentFile.monthlyFee')}: {(student.monthlyFee ?? 0).toLocaleString()} FCFA / {t('studentFile.month')}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-slate-700">{totalPaid.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{t('studentFile.fcfaPaid')}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-slate-700">{studentPayments.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{t('studentFile.paymentsRecorded')}</p>
                </div>
              </div>

              {/* Payments list */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase">{t('studentFile.paymentsHistory')}</h3>
                </div>
                {studentPayments.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs p-6">{t('studentFile.noPayment')}</p>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {studentPayments.map(p => (
                      <div key={p.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{p.purpose}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{p.date} · Reçu #{p.receiptNumber}</p>
                        </div>
                        <span className="text-sm font-black text-emerald-700">+{p.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
