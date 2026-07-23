/**
 * HalaqatModule — Gestion complète des Halaqāt (Cercles Coraniques)
 * CRUD complet + Synchronisation Supabase Cloud temps réel
 */

import React, { useState, useMemo } from "react";
import { Halaqa, Student, EtapePedagogique } from "../types";
import { supabase } from "../lib/supabase";
import {
  Users, Plus, Edit3, Trash2, CheckCircle, XCircle, Save,
  BookOpen, Phone, Building2, Calendar, ShieldAlert, User,
  RefreshCw, Award, ChevronDown, ChevronUp, Search, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { calculateWestAfricanProgress } from "../quranData";

interface HalaqatModuleProps {
  halaqas: Halaqa[];
  students: Student[];
  onAddHalaqa: (h: Halaqa) => void;
  onUpdateHalaqa: (h: Halaqa) => void;
  onDeleteHalaqa: (id: string) => void;
}

const LEVEL_OPTIONS = [
  "Tahajji (Initiation)",
  "Hifz Débutant",
  "Hifz Intermédiaire",
  "Hifz Avancé",
  "Muraja'ah & Tathbit",
  "Cycle Mixte",
];

const BUILDING_OPTIONS = [
  "Bâtiment Principal — Mermoz",
  "Aile Est (Frères)",
  "Aile Ouest (Sœurs)",
  "Annexe Pédagogique",
  "Salle Climatisée 1",
  "Salle Climatisée 2",
];

const EMPTY_HALAQA: Omit<Halaqa, "id"> = {
  name: "",
  teacherName: "",
  maxCapacity: 20,
  building: BUILDING_OPTIONS[0],
  schedule: "08h00 - 14h00",
  level: LEVEL_OPTIONS[1],
  description: "",
  phoneTeacher: "",
  isActive: true,
};

export default function HalaqatModule({
  halaqas,
  students,
  onAddHalaqa,
  onUpdateHalaqa,
  onDeleteHalaqa,
}: HalaqatModuleProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Halaqa, "id">>(EMPTY_HALAQA);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchStudentTerm, setSearchStudentTerm] = useState("");
  const [syncStatus, setSyncStatus] = useState<null | "syncing" | "ok" | "error">(null);

  // ── Computed per-halaqa data ──────────────────────────────────────────────
  const halaqaStats = useMemo(() => {
    const map: Record<string, {
      students: Student[];
      occupied: number;
      percentage: number;
      hafizCount: number;
      avgHizb: number;
      avgProgress: number;
      totalDue: number;
    }> = {};

    for (const h of halaqas) {
      const hs = students.filter(s => s.halaqaId === h.id);
      const hafizCount = hs.filter(s => s.etape === EtapePedagogique.Hafiz).length;
      const hifz = hs.filter(s => s.currentHizbNum != null);
      const avgHizb = hifz.length > 0
        ? Math.round(hifz.reduce((acc, s) => acc + (s.currentHizbNum || 0), 0) / hifz.length)
        : 0;
      const avgProgress = hifz.length > 0
        ? Math.round(hifz.reduce((acc, s) => acc + calculateWestAfricanProgress(s.currentHizbNum, s.currentHizbFraction), 0) / hifz.length)
        : 0;
      const totalDue = hs.reduce((acc, s) => acc + (s.balanceDue || 0), 0);
      const occupied = hs.length;
      const percentage = Math.min(100, Math.round((occupied / (h.maxCapacity || 1)) * 100));
      map[h.id] = { students: hs, occupied, percentage, hafizCount, avgHizb, avgProgress, totalDue };
    }
    return map;
  }, [halaqas, students]);

  // ── Sync single Halaqa to Supabase ────────────────────────────────────────
  const syncToSupabase = async (h: Halaqa) => {
    setSyncStatus("syncing");
    const { error } = await supabase.from("Halaqa").upsert(h);
    if (error) {
      console.error("Supabase Halaqa sync error:", error);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus(null), 3000);
    } else {
      setSyncStatus("ok");
      setTimeout(() => setSyncStatus(null), 2000);
    }
  };

  const syncDeleteFromSupabase = async (id: string) => {
    await supabase.from("Halaqa").delete().eq("id", id);
  };

  // ── Form handlers ─────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_HALAQA);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (h: Halaqa) => {
    setForm({
      name: h.name,
      teacherName: h.teacherName,
      maxCapacity: h.maxCapacity,
      building: h.building || BUILDING_OPTIONS[0],
      schedule: h.schedule || "08h00 - 14h00",
      level: h.level || LEVEL_OPTIONS[1],
      description: h.description || "",
      phoneTeacher: h.phoneTeacher || "",
      isActive: h.isActive !== false,
    });
    setEditingId(h.id);
    setShowForm(true);
    setExpandedId(null);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.teacherName.trim()) {
      setSaveMsg({ ok: false, text: "Le nom du cercle et l'Oustaz sont obligatoires." });
      return;
    }
    setSaving(true);
    setSaveMsg(null);

    const halaqa: Halaqa = {
      id: editingId || `halaqa-${Date.now()}`,
      ...form,
    };

    if (editingId) {
      onUpdateHalaqa(halaqa);
    } else {
      onAddHalaqa(halaqa);
    }

    await syncToSupabase(halaqa);
    setSaving(false);
    setSaveMsg({ ok: true, text: editingId ? "Halaqa mise à jour et synchronisée ✓" : "Halaqa créée et synchronisée ✓" });
    setTimeout(() => {
      setShowForm(false);
      setEditingId(null);
      setSaveMsg(null);
    }, 1500);
  };

  const handleDelete = async (id: string) => {
    onDeleteHalaqa(id);
    await syncDeleteFromSupabase(id);
    setDeleteConfirmId(null);
    setExpandedId(null);
  };

  const handleToggleActive = async (h: Halaqa) => {
    const updated = { ...h, isActive: !h.isActive };
    onUpdateHalaqa(updated);
    await syncToSupabase(updated);
  };

  // ── Per-halaqa student list ───────────────────────────────────────────────
  const getFilteredStudentsForHalaqa = (hId: string) => {
    const hs = halaqaStats[hId]?.students || [];
    if (!searchStudentTerm) return hs;
    const q = searchStudentTerm.toLowerCase();
    return hs.filter(s => `${s.firstName} ${s.lastName} ${s.matricule}`.toLowerCase().includes(q));
  };

  const etapeColor = (etape: EtapePedagogique) => {
    switch (etape) {
      case EtapePedagogique.Tahajji: return "bg-sky-50 text-sky-700 border-sky-200";
      case EtapePedagogique.Hifz: return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case EtapePedagogique.Murajaah: return "bg-amber-50 text-amber-700 border-amber-200";
      case EtapePedagogique.Tathbit: return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case EtapePedagogique.Khatm: return "bg-purple-50 text-purple-700 border-purple-200";
      case EtapePedagogique.Hafiz: return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6" id="halaqat-module-container">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-xl text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#D0A21C]" />
            Gestion des Halaqāt
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {halaqas.length} cercle(s) · {students.length} élève(s) enregistrés — Sync Supabase Cloud en temps réel
          </p>
        </div>
        <div className="flex items-center gap-2">
          {syncStatus === "syncing" && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
              <RefreshCw className="w-3 h-3 animate-spin" />Synchronisation…
            </span>
          )}
          {syncStatus === "ok" && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
              <CheckCircle className="w-3 h-3" />Synchronisé
            </span>
          )}
          {syncStatus === "error" && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
              <AlertTriangle className="w-3 h-3" />Erreur sync
            </span>
          )}
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0B1C30] hover:bg-[#142d47] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nouveau Cercle
          </button>
        </div>
      </div>

      {/* ── Create / Edit Form Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-white border-2 border-[#0B1C30]/10 rounded-2xl p-6 shadow-lg space-y-5"
            id="halaqa-form-panel"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#D0A21C]" />
                {editingId ? "Modifier la Halaqa" : "Créer un nouveau Cercle Coranique"}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); setSaveMsg(null); }} className="cursor-pointer text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {saveMsg && (
              <div className={`flex items-center gap-2 text-xs font-bold p-3 rounded-lg ${saveMsg.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
                {saveMsg.ok ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {saveMsg.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom du cercle */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom du Cercle *</label>
                <input
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B1C30]"
                  placeholder="Ex: Halaqa Al-Furqān"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              {/* Oustaz */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Oustaz (Enseignant) *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B1C30]"
                    placeholder="Ex: Cheikh Abdoulaye Diop"
                    value={form.teacherName}
                    onChange={e => setForm(f => ({ ...f, teacherName: e.target.value }))}
                  />
                </div>
              </div>

              {/* Téléphone Oustaz */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Téléphone Oustaz</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B1C30]"
                    placeholder="+221 77 000 00 00"
                    value={form.phoneTeacher}
                    onChange={e => setForm(f => ({ ...f, phoneTeacher: e.target.value }))}
                  />
                </div>
              </div>

              {/* Capacité */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Capacité max (élèves)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0B1C30]"
                  value={form.maxCapacity}
                  onChange={e => setForm(f => ({ ...f, maxCapacity: Number(e.target.value) }))}
                />
              </div>

              {/* Niveau */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Niveau Pédagogique</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B1C30]"
                  value={form.level}
                  onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                >
                  {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* Bâtiment */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bâtiment / Salle</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B1C30]"
                    value={form.building}
                    onChange={e => setForm(f => ({ ...f, building: e.target.value }))}
                  >
                    {BUILDING_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Horaires */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Horaires</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B1C30]"
                    placeholder="Ex: 08h00 - 14h00"
                    value={form.schedule}
                    onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes / Description (optionnel)</label>
                <textarea
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B1C30] resize-none"
                  placeholder="Spécificités de ce cercle, objectifs pédagogiques, règles internes..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* Statut */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`w-10 h-5 rounded-full transition-colors flex items-center cursor-pointer ${form.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {form.isActive ? "Cercle Actif (visible dans les listes)" : "Cercle Archivé (inactif)"}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-60 shadow-sm"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Synchronisation Supabase…" : "Enregistrer & Synchroniser"}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingId(null); setSaveMsg(null); }}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Halaqa Cards ─────────────────────────────────────────────────── */}
      {halaqas.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-bold text-sm">Aucun cercle coranique enregistré</p>
          <p className="text-xs mt-1">Cliquez sur « Nouveau Cercle » pour commencer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {halaqas.map((h) => {
            const stats = halaqaStats[h.id] || { students: [], occupied: 0, percentage: 0, hafizCount: 0, avgHizb: 0, avgProgress: 0, totalDue: 0 };
            const isFull = stats.occupied >= h.maxCapacity;
            const isExpanded = expandedId === h.id;
            const filteredStudents = getFilteredStudentsForHalaqa(h.id);

            return (
              <motion.div
                key={h.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white border rounded-2xl shadow-xs overflow-hidden ${h.isActive === false ? "opacity-60 border-slate-200" : "border-slate-200"}`}
                id={`halaqa-card-${h.id}`}
              >
                {/* Card Header */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm text-slate-800">{h.name}</h3>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${h.isActive === false ? "bg-slate-100 text-slate-500 border-slate-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                          {h.isActive === false ? "Archivé" : "Actif"}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                        Oustaz : {h.teacherName}
                        {h.phoneTeacher && <span className="text-slate-400 font-medium ml-1">· {h.phoneTeacher}</span>}
                      </p>
                      {(h.building || h.schedule) && (
                        <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                          {h.building && <span className="flex items-center gap-0.5"><Building2 className="w-3 h-3 text-slate-400" />{h.building}</span>}
                          {h.schedule && <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3 text-slate-400" />{h.schedule}</span>}
                        </p>
                      )}
                      {h.level && <span className="text-[9px] font-bold bg-[#0B1C30]/5 text-[#0B1C30] px-2 py-0.5 rounded-md inline-block mt-1">{h.level}</span>}
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shrink-0 ml-2 ${isFull ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                      {stats.occupied} / {h.maxCapacity}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${isFull ? "bg-rose-500" : stats.percentage > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-medium text-slate-400">
                      <span>Occupation : <strong className="text-slate-700">{stats.percentage}%</strong></span>
                      <span>Hizb moy. : <strong className="text-slate-700">{stats.avgHizb || "—"}</strong></span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-amber-50 border border-amber-100 rounded-lg py-1.5">
                      <p className="text-[9px] font-bold text-amber-600 uppercase">Huffāz</p>
                      <p className="font-extrabold text-sm text-amber-800">👑 {stats.hafizCount}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg py-1.5">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Prog. Moy.</p>
                      <p className="font-extrabold text-sm text-slate-800">{stats.avgProgress}%</p>
                    </div>
                    <div className={`border rounded-lg py-1.5 ${stats.totalDue > 0 ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"}`}>
                      <p className={`text-[9px] font-bold uppercase ${stats.totalDue > 0 ? "text-rose-600" : "text-emerald-600"}`}>Impayés</p>
                      <p className={`font-extrabold text-sm ${stats.totalDue > 0 ? "text-rose-800" : "text-emerald-800"}`}>
                        {stats.totalDue > 0 ? `${stats.totalDue.toLocaleString()} F` : "✓"}
                      </p>
                    </div>
                  </div>

                  {h.description && (
                    <p className="text-[10px] text-slate-500 italic border-l-2 border-[#D0A21C] pl-2">{h.description}</p>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : h.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-all"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Liste des élèves
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => openEdit(h)}
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-[#0B1C30] bg-[#0B1C30]/5 hover:bg-[#0B1C30]/10 rounded-lg cursor-pointer transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleToggleActive(h)}
                      className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                        h.isActive === false
                          ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          : "text-slate-500 bg-slate-100 hover:bg-slate-200"
                      }`}
                    >
                      {h.isActive === false ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {h.isActive === false ? "Réactiver" : "Archiver"}
                    </button>
                    {deleteConfirmId === h.id ? (
                      <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1">
                        <span className="text-[10px] font-bold text-rose-700">Confirmer la suppression ?</span>
                        <button onClick={() => handleDelete(h.id)} className="text-[10px] font-black text-rose-700 hover:text-rose-900 cursor-pointer">Oui</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="text-[10px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer">Non</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(h.id)}
                        disabled={stats.occupied > 0}
                        title={stats.occupied > 0 ? `${stats.occupied} élève(s) encore affecté(s). Réaffectez-les d'abord.` : "Supprimer ce cercle"}
                        className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Expanded Student List ─────────────────────────────── */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-slate-50 border-t border-slate-200 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Rechercher un élève dans cette Halaqa..."
                              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0B1C30]"
                              value={searchStudentTerm}
                              onChange={e => setSearchStudentTerm(e.target.value)}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 shrink-0">{filteredStudents.length} élève(s)</span>
                        </div>

                        {filteredStudents.length === 0 ? (
                          <p className="text-center text-xs text-slate-400 py-4">Aucun élève dans ce cercle</p>
                        ) : (
                          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                            {filteredStudents.map(s => (
                              <div key={s.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-3 py-2 gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-7 h-7 rounded-full bg-[#0B1C30] text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">
                                    {s.firstName[0]}{s.lastName[0]}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-xs text-slate-800 truncate">{s.firstName} {s.lastName}</p>
                                    <p className="text-[9px] text-slate-400 font-medium">{s.matricule}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${etapeColor(s.etape)}`}>
                                    {s.etape === EtapePedagogique.Hafiz ? "👑 Hafiz" : s.etape}
                                  </span>
                                  {s.currentHizbNum && (
                                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                      Hizb {s.currentHizbNum}
                                    </span>
                                  )}
                                  {s.balanceDue > 0 && (
                                    <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                                      -{s.balanceDue.toLocaleString()} F
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
