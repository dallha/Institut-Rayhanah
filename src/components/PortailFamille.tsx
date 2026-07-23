/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Student, 
  Halaqa, 
  AttendanceRecord, 
  QuranLesson, 
  PaymentRecord, 
  EtapePedagogique, 
  AttendanceStatus, 
  Evaluation 
} from "../types";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Award, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  TrendingUp, 
  Phone, 
  Mail, 
  Printer, 
  ShieldCheck, 
  Heart,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { calculateWestAfricanProgress } from "../quranData";

function getEtapeLabelFormat(etape: EtapePedagogique, gender?: string) {
  const isFemale = gender === "female" || gender === "F";
  switch (etape) {
    case EtapePedagogique.Tahajji:
      return "التهجي (Tahajji)";
    case EtapePedagogique.Hifz:
      return isFemale ? "حافضة (Hafiza - Mémorisation)" : "حافظ (Hafiz - Mémorisation)";
    case EtapePedagogique.Murajaah:
      return "المراجعة (Muraja'ah)";
    case EtapePedagogique.Tathbit:
      return "التثبيت (Tathbit)";
    case EtapePedagogique.Khatm:
      return "الختم (Khatm)";
    case EtapePedagogique.Hafiz:
      return isFemale ? "👑 حافضة (Hafiza certifiée)" : "👑 حافظ (Hafiz certifié)";
    default:
      return etape;
  }
}

interface PortailFamilleProps {
  students: Student[];
  halaqas: Halaqa[];
  attendance: AttendanceRecord[];
  lessons: QuranLesson[];
  payments: PaymentRecord[];
}

export default function PortailFamille({
  students,
  halaqas,
  attendance,
  lessons,
  payments
}: PortailFamilleProps) {
  const { t } = useTranslation();

  // Selected student state (defaults to first student)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [activeSubTab, setActiveSubTab] = useState<"apercu" | "pedagogie" | "assiduite" | "finance" | "honneur">("apercu");

  const student = useMemo(() => 
    students.find(s => s.id === selectedStudentId) || students[0],
    [students, selectedStudentId]
  );

  const halaqa = useMemo(() => 
    halaqas.find(h => h.id === student?.halaqaId),
    [halaqas, student]
  );

  // Filtered records for selected student
  const studentLessons = useMemo(() => 
    lessons.filter(l => l.studentId === student?.id).sort((a, b) => b.date.localeCompare(a.date)),
    [lessons, student]
  );

  const studentAttendance = useMemo(() => 
    attendance.filter(a => a.studentId === student?.id).sort((a, b) => b.date.localeCompare(a.date)),
    [attendance, student]
  );

  const studentPayments = useMemo(() => 
    payments.filter(p => p.studentId === student?.id).sort((a, b) => b.date.localeCompare(a.date)),
    [payments, student]
  );

  // Calculations
  const progressPercent = student ? calculateWestAfricanProgress(student.currentHizbNum, student.currentHizbFraction) : 0;
  
  const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
  const presentCount = studentAttendance.filter(a => a.status === AttendanceStatus.Present).length;
  const absentCount = studentAttendance.filter(a => a.status === AttendanceStatus.Absent).length;
  const lateCount = studentAttendance.filter(a => a.status === AttendanceStatus.Late).length;
  
  const attendanceRate = studentAttendance.length > 0
    ? Math.round((presentCount / studentAttendance.length) * 100)
    : 100;

  const validLessonsCount = studentLessons.filter(l => l.evaluation === Evaluation.Naam).length;

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-500">
        Aucun élève trouvé dans le système.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12" id="portail-famille-container">
      {/* ── HEADER BANNER ────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0B1C30] via-[#142d47] to-[#0B1C30] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 left-1/2 h-1 bg-[#D0A21C] opacity-80"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#D0A21C] font-bold text-xs uppercase tracking-widest mb-1">
              <Heart className="w-4 h-4 fill-[#D0A21C]" />
              <span>Portail Famille & Parents · Institut Rayhanah</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Espace de Suivi Parental
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Consultez en temps réel la progression coranique, le cahier d'appel, la trésorerie et le comportement de vos enfants.
            </p>
          </div>

          {/* Child Selector Dropdown / Badges */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 w-full md:w-auto">
            <label className="block text-[10px] font-extrabold uppercase text-[#D0A21C] mb-1 tracking-wider">
              Enfant sélectionné :
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-[#0B1C30] text-white border border-[#D0A21C]/40 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#D0A21C]"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.matricule})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── CHILD IDENTITY SUMMARY CARD ──────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl text-white flex items-center justify-center font-black text-2xl shadow-md ${
            student.gender === 'F' || student.gender === 'female' ? 'bg-gradient-to-tr from-pink-600 to-rose-400' : 'bg-gradient-to-tr from-[#0B1C30] to-blue-700'
          }`}>
            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {student.firstName} {student.lastName}
              </h2>
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {student.matricule}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                {getEtapeLabelFormat(student.etape, student.gender)}
              </span>
              <span>·</span>
              <span>Halaqa : <strong className="text-slate-800">{halaqa?.name || "Non affecté"}</strong></span>
              <span>·</span>
              <span>Oustaz : <strong className="text-slate-800">{halaqa?.teacherName || "Non assigné"}</strong></span>
            </div>
          </div>
        </div>

        {/* Filiation Badges */}
        <div className="flex flex-wrap gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 w-full md:w-auto text-xs">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Père</span>
            <span className="font-semibold text-slate-800">{student.fatherName || student.parentName}</span>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Mère</span>
            <span className="font-semibold text-slate-800">{student.motherName || "—"}</span>
          </div>
          {student.guardianName && (
            <div className="border-l border-slate-200 pl-3">
              <span className="block text-[10px] font-bold text-amber-600 uppercase">Tuteur ({student.guardianRelation || "Légal"})</span>
              <span className="font-bold text-amber-900">{student.guardianName}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── SUB-NAVIGATION TABS ─────────────────────────────────── */}
      <div className="flex bg-white/90 backdrop-blur-xs p-1.5 rounded-2xl border border-slate-200/80 shadow-xs justify-between gap-1 overflow-x-auto">
        {[
          { id: "apercu", label: "Vue d'ensemble", icon: <Users className="w-4 h-4" /> },
          { id: "pedagogie", label: "Suivi Coranique & Dars", icon: <BookOpen className="w-4 h-4" /> },
          { id: "assiduite", label: "Présences & Retards", icon: <Calendar className="w-4 h-4" /> },
          { id: "finance", label: "Comptabilité & Reçus", icon: <CreditCard className="w-4 h-4" /> },
          { id: "honneur", label: "Médailles & Récompenses", icon: <Award className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 min-w-[130px] px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === tab.id
                ? "bg-[#0B1C30] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: VUE D'ENSEMBLE (KPIs + Progress) ───────────────── */}
      {activeSubTab === "apercu" && (
        <div className="space-y-6">
          {/* Quick KPIs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Progression</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-800">{progressPercent}%</div>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">Hizb {student.currentHizbNum || 60} / 60</p>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Présence</span>
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-800">{attendanceRate}%</div>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">{presentCount} jours présents</p>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Score Engagement</span>
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-[#D0A21C]">{student.score} pts</div>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">{validLessonsCount} leçons validées</p>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Solde Dû</span>
                <CreditCard className="w-4 h-4 text-rose-500" />
              </div>
              <div className={`text-2xl font-black ${student.balanceDue > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {student.balanceDue.toLocaleString()} F
              </div>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">Mensualité : {student.monthlyFee.toLocaleString()} F</p>
            </div>
          </div>

          {/* West African Hizb Visual Gauge */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  Jauge de Mémorisation Coranique (60 Hizbs)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Niveau actuel : Hizb {student.currentHizbNum || 60} (Fraction {student.currentHizbFraction || 0})</p>
              </div>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                {progressPercent}% Accompli
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div 
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-[#0B1C30] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: SUIVI CORANIQUE & DARS ────────────────────────── */}
      {activeSubTab === "pedagogie" && (
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Journal des Dars & Révisions (Muraja'ah)
            </h3>
            <span className="text-xs font-bold text-slate-500">Total : {studentLessons.length} leçons</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Leçon (Dars)</th>
                  <th className="px-4 py-3">Évaluation</th>
                  <th className="px-4 py-3">Révision (Muraja'ah)</th>
                  <th className="px-4 py-3">Remarque Enseignant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {studentLessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{lesson.date}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {lesson.type === "sourate" ? (
                        <span>Sourate {lesson.startSurah} verset {lesson.startVerset} → {lesson.endVerset}</span>
                      ) : (
                        <span>Hizb {lesson.startHizb} ({lesson.startHizbFraction}) → Hizb {lesson.endHizb}</span>
                      )}
                      {lesson.versesCount && <span className="text-[10px] text-slate-400 block font-mono">({lesson.versesCount} versets récités)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-block ${
                        lesson.evaluation === Evaluation.Naam ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {lesson.evaluation === Evaluation.Naam ? "نعم Naam (Validé)" : "لم Lam (À refaire)"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {lesson.murajaahStartHizb ? (
                        <span className="font-semibold text-slate-700">Hizb {lesson.murajaahStartHizb} → {lesson.murajaahEndHizb}</span>
                      ) : (
                        <span className="text-slate-300 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 italic">
                      {lesson.comment || "Aucune remarque."}
                    </td>
                  </tr>
                ))}
                {studentLessons.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-medium">
                      Aucune leçon enregistrée pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: ASSIDUITÉ & PRÉSENCES ─────────────────────────── */}
      {activeSubTab === "assiduite" && (
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Historique de Présence
            </h3>
            <div className="flex gap-3 text-xs font-bold">
              <span className="text-emerald-600">Présents : {presentCount}</span>
              <span className="text-rose-600">Absents : {absentCount}</span>
              <span className="text-amber-600">Retards : {lateCount}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {studentAttendance.map((rec) => (
              <div 
                key={rec.id}
                className={`p-3.5 rounded-xl border flex justify-between items-center ${
                  rec.status === AttendanceStatus.Present ? "bg-emerald-50/50 border-emerald-200 text-emerald-900" :
                  rec.status === AttendanceStatus.Absent ? "bg-rose-50/50 border-rose-200 text-rose-900" :
                  "bg-amber-50/50 border-amber-200 text-amber-900"
                }`}
              >
                <div>
                  <span className="font-mono font-bold text-xs block">{rec.date}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Statut d'appel</span>
                </div>
                <span className="font-extrabold text-xs px-2.5 py-1 rounded-lg bg-white/80 shadow-xs">
                  {rec.status === AttendanceStatus.Present ? "Présent(e)" : rec.status === AttendanceStatus.Absent ? "Absent(e)" : "En Retard"}
                </span>
              </div>
            ))}
            {studentAttendance.length === 0 && (
              <div className="col-span-3 text-center py-8 text-slate-400">
                Aucun enregistrement d'appel pour l'instant.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: COMPTABILITÉ & REÇUS ─────────────────────────── */}
      {activeSubTab === "finance" && (
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Historique des Règlements & Cotisations
            </h3>
            <div className="text-right">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Règlement Enregistré</span>
              <span className="text-base font-extrabold text-emerald-700">{totalPaid.toLocaleString()} FCFA</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">N° Reçu</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Motif / Période</th>
                  <th className="px-4 py-3">Montant</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {studentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">{p.receiptNumber}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{p.date}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{p.purpose}</td>
                    <td className="px-4 py-3 font-extrabold text-emerald-700">{p.amount.toLocaleString()} FCFA</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => window.print()} 
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Reçu
                      </button>
                    </td>
                  </tr>
                ))}
                {studentPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-medium">
                      Aucun reçu enregistré pour cet élève.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 5: MÉDAILLES & TABLEAU D'HONNEUR ──────────────────── */}
      {activeSubTab === "honneur" && (
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Badges & Médailles Obtenus
            </h3>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {student.medals?.length || 0} Distinction(s)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(student.medals || []).map((m) => (
              <div key={m.id} className="bg-gradient-to-b from-amber-50/50 to-white border border-amber-200/80 p-4 rounded-2xl text-center space-y-2 shadow-xs">
                <div className="text-3xl">{m.icon}</div>
                <h4 className="font-extrabold text-xs text-slate-800">{m.name}</h4>
                <span className="text-[10px] text-slate-400 block font-mono">{m.date}</span>
              </div>
            ))}
            {(!student.medals || student.medals.length === 0) && (
              <div className="col-span-4 text-center py-8 text-slate-400 font-medium">
                Aucune médaille attribuée pour l'instant. L'élève continue de progresser ! 🌟
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
