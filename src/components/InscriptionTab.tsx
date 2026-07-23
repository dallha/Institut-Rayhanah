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
  const [halaqaId, setHalaqaId] = useState(halaqas[0]?.id || "h1");
  const [nationality, setNationality] = useState("Sénégalaise");
  const [etape, setEtape] = useState<EtapePedagogique>(EtapePedagogique.Tahajji);
  const [regime, setRegime] = useState<"internat" | "externat" | "demi-pension">("internat");
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Files state
  const [birthCertFile, setBirthCertFile] = useState<File | null>(null);
  const [parentIdFile, setParentIdFile] = useState<File | null>(null);
  const [isDragCert, setIsDragCert] = useState(false);
  const [isDragId, setIsDragId] = useState(false);

  // Pricing scheme as specified in PDF
  const regimePricing = {
    internat: { monthly: 110000, signup: 150000, label: t('school.regimeInternat'), desc: "Logé, nourri, encadrement 24h/7" },
    externat: { monthly: 35000, signup: 50000, label: t('school.regimeExternat'), desc: "Cours uniquement en journée" },
    "demi-pension": { monthly: 50000, signup: 50000, label: t('school.regimeDemi'), desc: "Repas du midi inclus" }
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
      alert("Veuillez remplir tous les champs obligatoires (marqués d'un astérisque).");
      return;
    }

    if (!rulesAccepted) {
      alert("Vous devez lire et signer le Règlement Intérieur de l'établissement pour valider l'inscription.");
      return;
    }

    const count = students.length + 1;
    const matricule = `IRY-${String(count).padStart(4, "0")}`;

    const newStudent: Student = {
      id: `s_${Date.now()}`,
      matricule,
      firstName,
      lastName,
      parentName,
      parentPhone,
      parentEmail: parentEmail || undefined,
      halaqaId,
      etape,
      khatmatCount: 0,
      dailyWardHizbs: etape === EtapePedagogique.Tahajji ? 0 : 0.5,
      medals: [],
      score: 50, // Welcome points
      balanceDue: regimePricing[regime].signup, // Initial signup fee due on balance
      monthlyFee: regimePricing[regime].monthly,
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

          {/* Section: Filiation details */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <span className="block text-xs font-bold text-[#0B1C30] uppercase tracking-wider">{t('school.parentTitle')}</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="form-parent-sec">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500">{t('school.parentName')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400"><Users className="w-4 h-4" /></span>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 focus:outline-hidden focus:ring-1 focus:ring-[#0B1C30]"
                    placeholder="Ex: M. Ousmane Sall"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500">{t('school.phone')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400"><Phone className="w-4 h-4" /></span>
                  <input
                    type="tel"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 focus:outline-hidden focus:ring-1 focus:ring-[#0B1C30]"
                    placeholder="Ex: +221 77 123 45 67"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500">{t('school.email')}</label>
                <input
                  type="email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-[#0B1C30]"
                  placeholder="contact@parent.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section: Regime selection */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-[#0B1C30] uppercase tracking-wider">3. Régime de Scolarisation & Tarification</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(regimePricing) as Array<keyof typeof regimePricing>).map((key) => {
                const item = regimePricing[key];
                const isSelected = regime === key;
                return (
                  <div
                    key={key}
                    onClick={() => setRegime(key)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                      isSelected 
                        ? "border-[#D0A21C] bg-amber-50/20" 
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-slate-800">{item.label}</span>
                        {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#D0A21C]"></span>}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight">{item.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-baseline">
                      <span className="text-[10px] text-slate-500 font-bold">Mensuel:</span>
                      <span className="font-extrabold text-xs text-[#0B1C30]">{item.monthly.toLocaleString()} F</span>
                    </div>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="text-[10px] text-slate-400">Inscription:</span>
                      <span className="font-bold text-[11px] text-slate-500">{item.signup.toLocaleString()} F</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Academic assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="form-pedagogy-sec">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase">Halaqa d'affectation</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden"
                value={halaqaId}
                onChange={(e) => setHalaqaId(e.target.value)}
              >
                {halaqas.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>

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
              <p><strong>Engagements de scolarité :</strong> L'inscription à l'internat est annuelle et se renouvelle chaque année au retour des vacances de Mawlid Naby. L'élève s'inscrit pour une année scolaire entière.</p>
              <p><strong>Conditions financières :</strong> La scolarité est payable par anticipation <strong>AVANT le 05 de chaque mois</strong>. Une absence justifiée ou non ne donne droit à aucun remboursement.</p>
              <p><strong>Discipline & Équipements :</strong> Les appareils électroniques (téléphones portables, tablettes) sont STRICTEMENT INTERDITS. Les élèves doivent apporter des tenues décentes conformes à l'accoutrement islamique.</p>
              <p><strong>Santé & Médicaments :</strong> Il est formellement interdit de conserver des médicaments au dortoir. Tous les traitements doivent être obligatoirement déposés à l'administration.</p>
              <p><strong>Vacances & Sorties :</strong> Trois vacances sont programmées dans l'année : Korité (15 jours), Tabaski (15 jours) et Gamou (20 jours). Aucune sortie exceptionnelle ne sera accordée sans autorisation écrite préalable (24h à l'avance) et présence physique du tuteur légal.</p>
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
              <span>Aide-Mémoire Rayhana</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Informations de contact et barème des frais officiels</p>
          </div>

          <div className="text-xs space-y-3.5" id="help-info-content">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-[#D0A21C] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-700 text-[11px]">Siège & Adresse :</p>
                <p className="text-slate-500 font-medium text-[11px]">Somisci Mermoz, Villa N 30, Dakar, Sénégal</p>
                <p className="text-[10px] text-slate-400 italic mt-0.5">Fondé en 1952 par Cheikha Marieme Niass</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Phone className="w-4 h-4 text-[#D0A21C] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-700 text-[11px]">Téléphones de l'Administration :</p>
                <p className="text-[#0B1C30] font-bold text-[11px]">+221 77 663 32 42</p>
                <p className="text-[#0B1C30] font-bold text-[11px]">+221 75 109 66 66</p>
              </div>
            </div>

            {/* Rates recap block */}
            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
              <p className="text-[10px] font-bold text-[#0B1C30] uppercase tracking-wide">Grille des frais d'inscription & Scolarité</p>
              <div className="space-y-1 text-[11px] font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>Internat Complet :</span>
                  <span className="font-bold text-slate-800">110 000 F / mois</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-1 text-[10px] text-slate-400">
                  <span>Inscription :</span>
                  <span>150 000 F</span>
                </div>
                <div className="flex justify-between">
                  <span>Demi-Pension :</span>
                  <span className="font-bold text-slate-800">50 000 F / mois</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-1 text-[10px] text-slate-400">
                  <span>Inscription :</span>
                  <span>50 000 F</span>
                </div>
                <div className="flex justify-between">
                  <span>Externat Simple :</span>
                  <span className="font-bold text-slate-800">35 000 F / mois</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Inscription :</span>
                  <span>50 000 F</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Halaqa Capacities Chart */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4" id="halaqa-occupancy-panel">
          <div>
            <h3 className="font-bold text-base text-slate-800 flex items-center space-x-1.5">
              <Users className="w-5 h-5 text-[#0B1C30]" />
              <span>Gestion des Effectifs Halaqas</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Capacités et taux de remplissage par classe</p>
          </div>

          <div className="space-y-4" id="halaqa-capacities-list">
            {halaqas.map((h) => {
              const occupied = getHalaqaOccupancy(h.id);
              const percentage = Math.round((occupied / h.maxCapacity) * 100);
              const isFull = occupied >= h.maxCapacity;

              return (
                <div key={h.id} className="border border-slate-100 p-4 rounded-xl space-y-2 relative" id={`halaqa-stat-${h.id}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-700">{h.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Oustaz : {h.teacherName}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isFull ? "bg-rose-100 text-rose-800" : "bg-[#0B1C30]/5 text-[#0B1C30]"}`}>
                      {occupied} / {h.maxCapacity} élèves
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${isFull ? "bg-rose-500" : percentage > 80 ? "bg-amber-500" : "bg-[#D0A21C]"}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-1">
                    <span>Occupation</span>
                    <span>{percentage}% de remplissage</span>
                  </div>

                  {isFull && (
                    <div className="flex items-center space-x-1 text-[10px] text-rose-600 font-semibold pt-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Capacité maximale atteinte.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
