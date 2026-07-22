/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Student, Halaqa, EtapePedagogique, AttendanceRecord, QuranLesson } from "../types";
import { SURAHS, HIZBS, calculateWestAfricanProgress, formatHizbFractionArabic } from "../quranData";
import { Search, Filter, BookOpen, GraduationCap, ChevronRight, Award, Plus, Calendar, Settings } from "lucide-react";
import { motion } from "motion/react";
import WeeklySummaryChart from "./WeeklySummaryChart";

interface PedagogyTabProps {
  students: Student[];
  halaqas: Halaqa[];
  onUpdateStudent: (updated: Student) => void;
  attendance: AttendanceRecord[];
  lessons: QuranLesson[];
}

export default function PedagogyTab({ 
  students, 
  halaqas, 
  onUpdateStudent,
  attendance,
  lessons
}: PedagogyTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHalaqa, setSelectedHalaqa] = useState("all");
  const [selectedEtape, setSelectedEtape] = useState("all");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Edit progress state
  const [etapeVal, setEtapeVal] = useState<EtapePedagogique>(EtapePedagogique.Hifz);
  const [hizbVal, setHizbVal] = useState<number>(60);
  const [fractionVal, setFractionVal] = useState<number>(0);
  const [surahVal, setSurahVal] = useState<number>(114);
  const [versetVal, setVersetVal] = useState<number>(1);
  const [wardVal, setWardVal] = useState<number>(0.5);
  const [khatmatVal, setKhatmatVal] = useState<number>(0);

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || student.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHalaqa = selectedHalaqa === "all" || student.halaqaId === selectedHalaqa;
    const matchesEtape = selectedEtape === "all" || student.etape === selectedEtape;
    return matchesSearch && matchesHalaqa && matchesEtape;
  });

  const getHalaqaName = (id: string) => {
    return halaqas.find((h) => h.id === id)?.name || "Non affecté";
  };

  const getEtapeBadgeColor = (etape: EtapePedagogique) => {
    switch (etape) {
      case EtapePedagogique.Tahajji:
        return "bg-sky-50 text-sky-700 border-sky-200";
      case EtapePedagogique.Hifz:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case EtapePedagogique.Murajaah:
        return "bg-amber-50 text-amber-700 border-amber-200";
      case EtapePedagogique.Tathbit:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case EtapePedagogique.Khatm:
        return "bg-purple-50 text-purple-700 border-purple-200 animate-pulse";
      case EtapePedagogique.Hafiz:
        return "bg-rose-50 text-rose-700 border-rose-200 font-bold";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getEtapeLabel = (etape: EtapePedagogique, gender?: string) => {
    switch (etape) {
      case EtapePedagogique.Tahajji:
        return "Tahajji (التهجي)";
      case EtapePedagogique.Hifz:
        return "Hifz (الحفظ)";
      case EtapePedagogique.Murajaah:
        return "Muraja'ah (المراجعة)";
      case EtapePedagogique.Tathbit:
        return "Tathbit (التثبيت)";
      case EtapePedagogique.Khatm:
        return "Khatm (الختم)";
      case EtapePedagogique.Hafiz:
        return gender === 'F' ? "Hafizat (حافظة) 👑" : "Hafiz (حافظ) 👑";
    }
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setEtapeVal(student.etape);
    setHizbVal(student.currentHizbNum || 60);
    setFractionVal(student.currentHizbFraction || 0);
    setSurahVal(student.currentSurahNum || 114);
    setVersetVal(student.currentVersetNum || 1);
    setWardVal(student.dailyWardHizbs);
    setKhatmatVal(student.khatmatCount);
  };

  const handleSaveChanges = () => {
    if (!editingStudent) return;

    const isHafiz = etapeVal === EtapePedagogique.Hafiz;
    const isTahajji = etapeVal === EtapePedagogique.Tahajji;

    const updated: Student = {
      ...editingStudent,
      etape: etapeVal,
      currentHizbNum: isTahajji ? undefined : hizbVal,
      currentHizbFraction: isTahajji ? undefined : fractionVal,
      currentSurahNum: isTahajji ? undefined : surahVal,
      currentVersetNum: isTahajji ? undefined : versetVal,
      dailyWardHizbs: wardVal,
      khatmatCount: isHafiz ? khatmatVal : 0,
      score: editingStudent.score + 10 // score point for update
    };

    // Auto Khatm trigger: if student hits Surah Al-Baqarah (2) and finishes it, prompt to transition
    if (updated.etape === EtapePedagogique.Hifz && updated.currentSurahNum === 2 && updated.currentHizbNum === 1 && updated.currentHizbFraction === 1) {
      updated.etape = EtapePedagogique.Khatm;
    }

    onUpdateStudent(updated);
    setEditingStudent(null);
  };

  // Aggregated Statistics
  const hifzStudents = students.filter(s => s.etape !== EtapePedagogique.Tahajji);
  const avgProgress = hifzStudents.length
    ? Math.round(hifzStudents.reduce((acc, s) => acc + calculateWestAfricanProgress(s.currentHizbNum, s.currentHizbFraction), 0) / hifzStudents.length)
    : 0;
  const hafizCount = students.filter(s => s.etape === EtapePedagogique.Hafiz).length;
  const tahajjiCount = students.filter(s => s.etape === EtapePedagogique.Tahajji).length;

  return (
    <div className="space-y-6" id="pedagogy-container">
      {/* Visual Analytics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="pedagogy-stats-grid">
        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-xs flex items-center space-x-4" id="stat-card-total">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Moyenne Coranique</p>
            <h3 className="text-2xl font-bold text-slate-800">{avgProgress}%</h3>
            <p className="text-xs text-emerald-600 font-medium">De mémorisation globale</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-xs flex items-center space-x-4" id="stat-card-hafiz">
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Mémorisateurs (Huffaz)</p>
            <h3 className="text-2xl font-bold text-slate-800">{hafizCount}</h3>
            <p className="text-xs text-rose-600 font-medium">Couronnés (100%)</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-xs flex items-center space-x-4" id="stat-card-tahajji">
          <div className="p-3 bg-sky-50 rounded-lg text-sky-600">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Tahajji (Abjad)</p>
            <h3 className="text-2xl font-bold text-slate-800">{tahajjiCount}</h3>
            <p className="text-xs text-sky-600 font-medium">Initiation à la lecture</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-xs flex items-center space-x-4" id="stat-card-total-students">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Élèves</p>
            <h3 className="text-2xl font-bold text-slate-800">{students.length}</h3>
            <p className="text-xs text-amber-600 font-medium">Inscrits actifs</p>
          </div>
        </div>
      </div>

      {/* Weekly summary visualization dashboard */}
      <WeeklySummaryChart students={students} attendance={attendance} lessons={lessons} />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4" id="pedagogy-filter-bar">
        <div className="relative flex-1" id="pedagogy-search-wrapper">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="pedagogy-search-input"
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 text-sm text-slate-700"
            placeholder="Rechercher par prénom, nom ou matricule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2" id="pedagogy-filter-selectors">
          <div className="flex items-center space-x-2" id="filter-halaqa-group">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              id="filter-halaqa-select"
              className="bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg p-2 focus:outline-hidden"
              value={selectedHalaqa}
              onChange={(e) => setSelectedHalaqa(e.target.value)}
            >
              <option value="all">Toutes les Halaqas</option>
              {halaqas.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <select
            id="filter-etape-select"
            className="bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg p-2 focus:outline-hidden"
            value={selectedEtape}
            onChange={(e) => setSelectedEtape(e.target.value)}
          >
            <option value="all">Toutes les Étapes</option>
            {Object.values(EtapePedagogique).map((et) => (
              <option key={et} value={et}>{getEtapeLabel(et)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="pedagogy-student-grid">
        {filteredStudents.map((student) => {
          const progress = student.etape === EtapePedagogique.Tahajji
            ? 0
            : calculateWestAfricanProgress(student.currentHizbNum, student.currentHizbFraction);
          
          return (
            <motion.div
              key={student.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300 relative"
              id={`student-card-${student.id}`}
            >
              <div className="p-5" id={`student-card-body-${student.id}`}>
                {/* Header info */}
                <div className="flex justify-between items-start mb-3" id={`student-card-header-${student.id}`}>
                  <div>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono font-medium">
                      {student.matricule}
                    </span>
                    <h4 className="text-base font-bold text-slate-800 mt-1">
                      {student.firstName} {student.lastName}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      {getHalaqaName(student.halaqaId)}
                    </p>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full border ${getEtapeBadgeColor(student.etape)}`}>
                    {getEtapeLabel(student.etape, student.gender)}
                  </span>
                </div>

                {/* Progress bar / Cursus details */}
                <div className="space-y-3 pt-2" id={`student-card-progress-sec-${student.id}`}>
                  {student.etape !== EtapePedagogique.Tahajji ? (
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                        <span>Progression Coranique</span>
                        <span className="font-bold text-emerald-600">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      {/* Current status markers */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-400 block font-medium">Curseur Actuel</span>
                          <span className="text-slate-700 font-semibold block mt-0.5 truncate">
                            {student.currentSurahNum ? `${SURAHS.find(s => s.number === student.currentSurahNum)?.name} (v. ${student.currentVersetNum || 1})` : "Non défini"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Hizb / Fraction</span>
                          <span className="text-slate-700 font-semibold block mt-0.5 truncate">
                            {student.currentHizbNum ? `Hizb ${student.currentHizbNum} (${formatHizbFractionArabic(student.currentHizbFraction || 0)})` : "Non défini"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-sky-50/50 border border-sky-100 p-3 rounded-lg text-xs text-sky-800 flex items-start space-x-2">
                      <span className="text-sky-600 font-bold text-base mt-0.5 font-serif">ا</span>
                      <div>
                        <p className="font-bold">Phase d'Alphabétisation</p>
                        <p className="text-[11px] text-sky-600/90 mt-0.5">Apprentissage de l'alphabet (Abjadiyya) et règles de phonétique (Qaidah Nooraniyah).</p>
                      </div>
                    </div>
                  )}

                  {/* Daily objectives */}
                  <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-100 mt-2 text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Objectif quotidien (Ward)</span>
                    </span>
                    <span className="font-bold text-slate-700">
                      {student.dailyWardHizbs > 0 ? `${student.dailyWardHizbs} Hizb(s)` : "Aucun"}
                    </span>
                  </div>

                  {student.etape === EtapePedagogique.Hafiz && (
                    <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                      <span className="flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>Khatmats complétées</span>
                      </span>
                      <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-mono">
                        {student.khatmatCount} Clôtures
                      </span>
                    </div>
                  )}
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => openEditModal(student)}
                  id={`btn-edit-student-${student.id}`}
                  className="w-full mt-4 bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-slate-600 text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Gérer la Progression & Curseur</span>
                </button>
              </div>
            </motion.div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="col-span-full text-center py-12 bg-slate-50 border border-slate-100 rounded-xl" id="no-students-found">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-slate-600 font-bold">Aucun élève trouvé</h4>
            <p className="text-slate-400 text-xs mt-1">Ajustez vos critères de recherche ou de filtre.</p>
          </div>
        )}
      </div>

      {/* Edit Modal (Asynchronous React State Updates) */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="pedagogy-edit-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Mise à jour Pédagogique</h3>
                <p className="text-emerald-100 text-xs font-medium">{editingStudent.firstName} {editingStudent.lastName} ({editingStudent.matricule})</p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full text-xs font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-slate-700 text-sm">
              {/* Etape Select */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Étape du Cursus</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-emerald-500"
                  value={etapeVal}
                  onChange={(e) => setEtapeVal(e.target.value as EtapePedagogique)}
                >
                  {Object.values(EtapePedagogique).map((et) => (
                    <option key={et} value={et}>{getEtapeLabel(et)}</option>
                  ))}
                </select>
              </div>

              {etapeVal !== EtapePedagogique.Tahajji && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {/* Surah Selector */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Sourate de Mémorisation</label>
                    <select
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden"
                      value={surahVal}
                      onChange={(e) => setSurahVal(Number(e.target.value))}
                    >
                      {[...SURAHS].reverse().map((s) => (
                        <option key={s.number} value={s.number}>
                          {s.number}. {s.name} ({s.arabicName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Verset Selector */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Verset Actuel</label>
                    <input
                      type="number"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden"
                      min={1}
                      max={SURAHS.find(s => s.number === surahVal)?.versesCount || 286}
                      value={versetVal}
                      onChange={(e) => setVersetVal(Number(e.target.value))}
                    />
                  </div>

                  {/* Hizb Selector */}
                  <div className="space-y-1 mt-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Hizb Actuel (1 à 60)</label>
                    <select
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden"
                      value={hizbVal}
                      onChange={(e) => setHizbVal(Number(e.target.value))}
                    >
                      {[...HIZBS].reverse().map((h) => (
                        <option key={h.number} value={h.number}>
                          الحزب {h.number}: {h.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hizb Fraction Selector */}
                  <div className="space-y-1 mt-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Fraction</label>
                    <select
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden"
                      value={fractionVal}
                      onChange={(e) => setFractionVal(Number(e.target.value))}
                    >
                      <option value={0}>Aucune fraction (Début)</option>
                      <option value={0.25}>1/4 ربع (0.25)</option>
                      <option value={0.50}>1/2 نصف (0.50)</option>
                      <option value={0.75}>3/4 ثلاثة أرباع (0.75)</option>
                      <option value={1.00}>Complet كامل (1.00)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Ward Select */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Objectif Quotidien (Ward) en Hizb</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-hidden"
                  value={wardVal}
                  onChange={(e) => setWardVal(Number(e.target.value))}
                >
                  <option value={0}>Pas d'objectif spécifique</option>
                  <option value={0.25}>1/4 de Hizb (un quart)</option>
                  <option value={0.5}>1/2 de Hizb (un demi)</option>
                  <option value={0.75}>3/4 de Hizb</option>
                  <option value={1}>1 Hizb complet</option>
                  <option value={1.5}>1.5 Hizbs</option>
                  <option value={2}>2 Hizbs complets</option>
                  <option value={3}>3 Hizbs complets</option>
                </select>
              </div>

              {etapeVal === EtapePedagogique.Hafiz && (
                <div className="space-y-1 bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>Clôtures du Coran (Khatmats)</span>
                  </label>
                  <p className="text-[11px] text-amber-700">Déclarez combien de fois cet élève a entièrement révisé et clôturé le Coran.</p>
                  <input
                    type="number"
                    className="w-full bg-white border border-amber-200 text-amber-900 rounded-lg p-2 mt-2 focus:outline-hidden focus:border-amber-400"
                    min={0}
                    value={khatmatVal}
                    onChange={(e) => setKhatmatVal(Number(e.target.value))}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end space-x-3">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-bold rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
              >
                Sauvegarder les modifications
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
