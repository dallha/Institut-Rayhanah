/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Student, Halaqa, EtapePedagogique } from "../types";
import { 
  Users, 
  ShieldAlert, 
  GraduationCap, 
  ArrowRight, 
  UserPlus, 
  FileCheck, 
  Upload, 
  Info, 
  MapPin, 
  Phone, 
  Check, 
  ShieldCheck,
  FileText,
  AlertTriangle
} from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

interface InscriptionTabProps {
  students: Student[];
  halaqas: Halaqa[];
  onEnrollStudent: (newStudent: Student) => void;
}

export default function InscriptionTab({ students, halaqas, onEnrollStudent }: InscriptionTabProps) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState<number>(7);
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");

  // Detailed Filiation & Guardian
  const [fatherName, setFatherName] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherPhone, setMotherPhone] = useState("");
  const [hasDifferentGuardian, setHasDifferentGuardian] = useState(false);
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianRelation, setGuardianRelation] = useState("Oncle/Tante");

  const [halaqaId, setHalaqaId] = useState(halaqas[0]?.id || "h1");
  const [nationality, setNationality] = useState("Sénégalaise");
  const [etape, setEtape] = useState<EtapePedagogique>(EtapePedagogique.Tahajji);
  const [regime, setRegime] = useState<"internat" | "externat" | "demi-pension" | "cas_social">("internat");
  const [customMonthlyFee, setCustomMonthlyFee] = useState<number>(110000);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Files state
  const [birthCertFile, setBirthCertFile] = useState<File | null>(null);
  const [parentIdFile, setParentIdFile] = useState<File | null>(null);
  const [isDragCert, setIsDragCert] = useState(false);
  const [isDragId, setIsDragId] = useState(false);

  // Pricing scheme based on actual Daara data
  const regimePricing = {
    internat: { monthly: 110000, signup: 150000, label: "Internat Complet & Cas Réguliers", desc: "Logé, nourri, encadrement 24h/7 & cursus approfondi" },
    externat: { monthly: 35000, signup: 50000, label: "Externat Standard", desc: "Cours uniquement en journée (25 000 F - 50 000 F)" },
    "demi-pension": { monthly: 50000, signup: 50000, label: "Demi-Pension", desc: "Repas du midi inclus" },
    cas_social: { monthly: 50000, signup: 0, label: "Cas Social (Accompagnement)", desc: "Tarif réduit selon dossier (40 000 F - 80 000 F)" }
  };

  const handleDragCert = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragCert(true);
    } else if (e.type === "dragleave") {
      setIsDragCert(false);
    }
  };

  const handleDropCert = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragCert(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setBirthCertFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragId = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragId(true);
    } else if (e.type === "dragleave") {
      setIsDragId(false);
    }
  };

  const handleDropId = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragId(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setParentIdFile(e.dataTransfer.files[0]);
    }
  };

  // Auto matricule generation
  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !parentName || !parentPhone) {
      alert(t('school.missingFieldsMsg'));
      return;
    }

    if (!rulesAccepted) {
      alert(t('school.rulesNotAcceptedMsg'));
      return;
    }

    const count = students.length + 1;
    const matricule = `IRY-${String(count).padStart(4, "0")}`;

    const mainParentName = parentName || fatherName || (hasDifferentGuardian ? guardianName : "");
    const mainParentPhone = parentPhone || fatherPhone || (hasDifferentGuardian ? guardianPhone : "");

    const newStudent: Student = {
      id: `s_${Date.now()}`,
      matricule,
      firstName,
      lastName,
      parentName: mainParentName,
      parentPhone: mainParentPhone,
      parentEmail: parentEmail || undefined,
      fatherName: fatherName || undefined,
      fatherPhone: fatherPhone || undefined,
      motherName: motherName || undefined,
      motherPhone: motherPhone || undefined,
      guardianName: hasDifferentGuardian ? (guardianName || undefined) : undefined,
      guardianPhone: hasDifferentGuardian ? (guardianPhone || undefined) : undefined,
      guardianRelation: hasDifferentGuardian ? guardianRelation : undefined,
      halaqaId,
      etape,
      khatmatCount: 0,
      dailyWardHizbs: etape === EtapePedagogique.Tahajji ? 0 : 0.5,
      medals: [],
      score: 50, // Welcome points
      balanceDue: regimePricing[regime].signup, // Initial signup fee due on balance
      monthlyFee: customMonthlyFee || regimePricing[regime].monthly,
      age,
      regime,
      nationality
    };

    onEnrollStudent(newStudent);
    
    // Reset form
    setFirstName("");
    setLastName("");
    setAge(7);
    setParentName("");
    setParentPhone("");
    setParentEmail("");
    setFatherName("");
    setFatherPhone("");
    setMotherName("");
    setMotherPhone("");
    setHasDifferentGuardian(false);
    setGuardianName("");
    setGuardianPhone("");
    setRulesAccepted(false);
    setBirthCertFile(null);
    setParentIdFile(null);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 5000);
  };

  // Compute Halaqa Occupancies
  const getHalaqaOccupancy = (hId: string) => {
    return students.filter(s => s.halaqaId === hId).length;
  };

  const isAgeValid = age >= 5 && age <= 10;

  return (
    <div className="space-y-6" id="scolarite-container">
      {/* 1. Enroll Student Form (Workflow) */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs max-w-4xl mx-auto w-full space-y-6" id="enrollment-workflow">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <img src="/logo.png" alt="Logo Rayhanah" className="h-16 object-contain hidden sm:block" />
          <div>
            <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-1.5">
              <UserPlus className="w-5 h-5 text-[#0B1C30]" />
              <span>{t('school.enrollFormTitle')}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">{t('school.enrollFormSub')}</p>
          </div>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800 text-xs font-semibold flex items-center space-x-2" id="scolarite-success-alert">
            <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{t('school.successMsg')}</span>
          </div>
        )}

        <form onSubmit={handleEnroll} className="space-y-6 text-slate-700 text-sm" id="enroll-form">
          {/* Section: Identity */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-[#0B1C30] uppercase tracking-wider">{t('school.identityTitle')}</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="form-identity-sec">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500">{t('school.firstName')}</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-[#0B1C30]"
                  placeholder="Ex: Amadou"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500">{t('school.lastName')}</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-[#0B1C30]"
                  placeholder="Ex: Sall"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500">{t('school.age')}</label>
                  <input
                    type="number"
                    min="5"
                    max="10"
                    required
                    className={`w-full bg-slate-50 border rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-[#0B1C30] ${
                      !isAgeValid ? "border-rose-300 ring-rose-100 bg-rose-50" : "border-slate-200"
                    }`}
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500">{t('school.nationality')}</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-[#0B1C30]"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Filiation & Parents details */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <span className="block text-xs font-bold text-[#0B1C30] uppercase tracking-wider">Information des Parents & Filiation</span>
            
            {/* Father & Mother info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-600" /> Père</span>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Nom & Prénom du Père</label>
                    <input type="text" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" placeholder="Ex: Ousmane Sall" value={fatherName} onChange={e => setFatherName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Téléphone du Père</label>
                    <input type="tel" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" placeholder="Ex: +221 77 123 45 67" value={fatherPhone} onChange={e => setFatherPhone(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-pink-600" /> Mère</span>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Nom & Prénom de la Mère</label>
                    <input type="text" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" placeholder="Ex: Aminata Diallo" value={motherName} onChange={e => setMotherName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Téléphone de la Mère</label>
                    <input type="tel" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" placeholder="Ex: +221 78 987 65 43" value={motherPhone} onChange={e => setMotherPhone(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Checkbox for separate guardian */}
            <div className="pt-2">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDifferentGuardian}
                  onChange={(e) => setHasDifferentGuardian(e.target.checked)}
                  className="rounded text-[#0B1C30] focus:ring-[#0B1C30] h-4 w-4"
                />
                <span>Le tuteur légal est différent des parents (ex: Oncle, Tante, Organisme...)</span>
              </label>
            </div>

            {hasDifferentGuardian && (
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 space-y-3">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-amber-700" /> Tuteur Légal / Responsable</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Nom & Prénom du Tuteur *</label>
                    <input type="text" required={hasDifferentGuardian} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" placeholder="Ex: Mamadou Sow" value={guardianName} onChange={e => setGuardianName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Téléphone Tuteur *</label>
                    <input type="tel" required={hasDifferentGuardian} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" placeholder="Ex: +221 70 111 22 33" value={guardianPhone} onChange={e => setGuardianPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Lien de parenté</label>
                    <input type="text" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" placeholder="Ex: Oncle, Grand-père..." value={guardianRelation} onChange={e => setGuardianRelation(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500">{t('school.email')} (Optionnel)</label>
              <input
                type="email"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-[#0B1C30]"
                placeholder="contact@parent.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Section: Regime selection */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-[#0B1C30] uppercase tracking-wider">{t('school.schoolingRegimeTitle')}</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(Object.keys(regimePricing) as Array<keyof typeof regimePricing>).map((key) => {
                const item = regimePricing[key];
                const isSelected = regime === key;
                return (
                  <div
                    key={key}
                    onClick={() => {
                      setRegime(key);
                      setCustomMonthlyFee(item.monthly);
                    }}
                    className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                      isSelected 
                        ? "border-[#D0A21C] bg-amber-50/30 shadow-xs" 
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-slate-800">{item.label}</span>
                        {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#D0A21C] shrink-0"></span>}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight">{item.desc}</p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-baseline">
                      <span className="text-[10px] text-slate-500 font-bold">{t('school.monthly')}</span>
                      <span className="font-extrabold text-xs text-[#0B1C30]">{item.monthly.toLocaleString()} F</span>
                    </div>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="text-[10px] text-slate-400">{t('school.signupFee')}</span>
                      <span className="font-bold text-[11px] text-slate-500">{item.signup.toLocaleString()} F</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom / Exact Monthly Fee Input */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">Montant personnalisé de la Mensualité (FCFA)</label>
                <p className="text-[10px] text-slate-400">Ajustez le tarif exact si l'élève bénéficie d'un tarif régulier particulier (ex: 110 000 F, 120 000 F, 125 000 F, 25 000 F, 40 000 F, 75 000 F).</p>
              </div>
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <input
                  type="number"
                  value={customMonthlyFee}
                  onChange={(e) => setCustomMonthlyFee(Number(e.target.value))}
                  className="w-full sm:w-36 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-black text-[#0B1C30] focus:ring-2 focus:ring-[#0B1C30]"
                  placeholder="Ex: 110000"
                  min="0"
                  step="5000"
                />
                <span className="font-bold text-xs text-slate-600">FCFA</span>
              </div>
            </div>
          </div>

          {/* Section: Academic assignment */}
          <div className="grid grid-cols-1 gap-4" id="form-pedagogy-sec">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500">{t('school.etapeLabel')}</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-[#0B1C30]"
                value={etape}
                onChange={(e) => setEtape(e.target.value as EtapePedagogique)}
              >
                {Object.values(EtapePedagogique).map(et => <option key={et} value={et}>{et}</option>)}
              </select>
            </div>
          </div>

          {/* Section: Required Documents File Uploads */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <span className="block text-xs font-bold text-[#0B1C30] uppercase tracking-wider">{t('school.docsTitle')}</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="form-documents-sec">
              {/* Dropzone Extrait Naissance */}
              <div 
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${isDragCert ? "border-[#0B1C30] bg-[#0B1C30]/5" : "border-slate-200 hover:bg-slate-50"}`}
                onDragEnter={handleDragCert} onDragOver={handleDragCert} onDragLeave={handleDragCert} onDrop={handleDropCert}
                onClick={() => document.getElementById("birthCertInput")?.click()}
              >
                <input 
                  type="file" 
                  id="birthCertInput" 
                  className="hidden" 
                  accept="image/*,.pdf" 
                  onChange={(e) => e.target.files && setBirthCertFile(e.target.files[0])}
                />
                <div className="flex flex-col items-center space-y-2">
                  <Upload className={`w-6 h-6 ${birthCertFile ? "text-emerald-500" : "text-slate-400"}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-700">{t('school.birthCert')}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t('school.dropFiles')}</p>
                  </div>
                  {birthCertFile && (
                    <div className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1">
                      <FileText className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">{birthCertFile.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Document 2: Parent ID Copy */}
              <div 
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  parentIdFile ? "border-emerald-400 bg-emerald-50/10" : isDragId ? "border-[#D0A21C] bg-amber-50/10" : "border-slate-200 hover:border-slate-300"
                }`}
                onDragEnter={handleDragId}
                onDragOver={handleDragId}
                onDragLeave={handleDragId}
                onDrop={handleDropId}
                onClick={() => document.getElementById("parentIdInput")?.click()}
              >
                <input 
                  type="file" 
                  id="parentIdInput" 
                  className="hidden" 
                  accept="image/*,.pdf" 
                  onChange={(e) => e.target.files && setParentIdFile(e.target.files[0])}
                />
                <div className="flex flex-col items-center space-y-2">
                  <Upload className={`w-6 h-6 ${parentIdFile ? "text-emerald-500" : "text-slate-400"}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-700">{t('school.parentId')}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t('school.dropFiles')}</p>
                  </div>
                  {parentIdFile && (
                    <div className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1">
                      <FileText className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">{parentIdFile.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Reglamento aceptación (Règlement Intérieur) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3" id="reglement-interieur-panel">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
              <ShieldCheck className="w-4 h-4 text-[#D0A21C]" />
              <span className="text-xs font-extrabold text-[#0B1C30] uppercase tracking-wider">{t('school.internalRules')}</span>
            </div>
            
            <div className="text-[11px] text-slate-500 leading-relaxed max-h-32 overflow-y-auto pr-1 space-y-2 no-scrollbar">
              <p><strong>{t('school.rulesCommitmentTitle')}</strong> {t('school.rulesCommitmentDesc')}</p>
              <p><strong>{t('school.rulesFinancialTitle')}</strong> {t('school.rulesFinancialDesc1')} <strong>{t('school.rulesFinancialDesc2')}</strong>{t('school.rulesFinancialDesc3')}</p>
              <p><strong>{t('school.rulesDisciplineTitle')}</strong> {t('school.rulesDisciplineDesc')}</p>
              <p><strong>{t('school.rulesHealthTitle')}</strong> {t('school.rulesHealthDesc')}</p>
              <p><strong>{t('school.rulesHolidaysTitle')}</strong> {t('school.rulesHolidaysDesc')}</p>
            </div>

            <div className="pt-2 flex items-start space-x-2">
              <input
                type="checkbox"
                id="acceptRules"
                required
                className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-[#0B1C30] focus:ring-[#0B1C30]"
                checked={rulesAccepted}
                onChange={(e) => setRulesAccepted(e.target.checked)}
              />
              <label htmlFor="acceptRules" className="text-xs font-semibold text-slate-600 select-none cursor-pointer">
                {t('school.certify')}
              </label>
            </div>
          </div>

          <button
            type="submit"
            id="btn-submit-enrollment"
            disabled={!rulesAccepted}
            className={`w-full py-3 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 ${
              rulesAccepted 
                ? "bg-[#0B1C30] hover:bg-[#142d47] text-white cursor-pointer" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span>{t('school.submitEnroll')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 2. Bottom Panel - Information and Halaqa Occupancies placed at the bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full" id="scolarite-sidebar">
        {/* Contact & Rate info from PDF */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4" id="institution-info-panel">
          <div>
            <h3 className="font-extrabold text-sm text-[#0B1C30] flex items-center space-x-1.5 uppercase tracking-wide">
              <Info className="w-4.5 h-4.5 text-[#D0A21C]" />
              <span>{t('school.helpMemoryTitle')}</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{t('school.helpMemoryDesc')}</p>
          </div>

          <div className="text-xs space-y-3.5" id="help-info-content">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-[#D0A21C] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-700 text-[11px]">{t('school.headquartersTitle')}</p>
                <p className="text-slate-500 font-medium text-[11px]">{t('school.address')}</p>
                <p className="text-[10px] text-slate-400 italic mt-0.5">{t('school.foundedBy')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Phone className="w-4 h-4 text-[#D0A21C] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-700 text-[11px]">{t('school.adminPhones')}</p>
                <p className="text-[#0B1C30] font-bold text-[11px]">+221 77 663 32 42</p>
                <p className="text-[#0B1C30] font-bold text-[11px]">+221 75 109 66 66</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
              <p className="text-[10px] font-bold text-[#0B1C30] uppercase tracking-wide">{t('school.feeGridTitle')}</p>
              <div className="space-y-1 text-[11px] font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>Internat & Cas Régulier :</span>
                  <span className="font-bold text-slate-800">110 000 F / mois</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-1 text-[10px] text-slate-400">
                  <span>Inscription Internat :</span>
                  <span>150 000 F</span>
                </div>
                <div className="flex justify-between">
                  <span>Externat Standard :</span>
                  <span className="font-bold text-slate-800">25 000 F - 50 000 F</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-1 text-[10px] text-slate-400">
                  <span>Inscription Externat :</span>
                  <span>50 000 F</span>
                </div>
                <div className="flex justify-between">
                  <span>Cas Social (Réduit) :</span>
                  <span className="font-bold text-emerald-700">40 000 F - 80 000 F</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Inscription Cas Social :</span>
                  <span className="text-emerald-600 font-bold">Exonéré / Réduit</span>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
