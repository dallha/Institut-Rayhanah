/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Student, Halaqa } from "../types";
import { SURAHS, calculateWestAfricanProgress } from "../quranData";
import { Award, Trophy, Crown, Heart, Music, Zap, Shield, Plus, Printer, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

interface MotivationTabProps {
  students: Student[];
  halaqas: Halaqa[];
  onAwardMedal: (studentId: string, medal: { id: string; name: string; icon: string; date: string }) => void;
}

export default function MotivationTab({ students, halaqas, onAwardMedal }: MotivationTabProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [medalType, setMedalType] = useState<string>("Discipline");
  const [customMedalName, setCustomMedalName] = useState<string>("");
  const [isAwarded, setIsAwarded] = useState<boolean>(false);

  // Certificate generator state
  const [selectedCertStudentId, setSelectedCertStudentId] = useState<string>(students[0]?.id || "");
  const [certType, setCertType] = useState<"tahajji" | "half" | "hafiz">("hafiz");
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  // Auto-calculated Honors: Top 3 by progression points / score
  const topStudents = [...students]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const medalPresets = [
    { name: "Discipline Exemplaire", icon: "Shield", desc: "Comportement irréprochable et respectueux" },
    { name: "Voix Exceptionnelle", icon: "Music", desc: "Excellence dans la mélodie et règles de Tajwid" },
    { name: "Camarade Solidaire", icon: "Heart", desc: "Aide active et soutien de ses pairs" },
    { name: "Persévérance Majeure", icon: "Zap", desc: "Efforts constants face aux difficultés" }
  ];

  const handleAwardMedalSubmit = () => {
    if (!selectedStudentId) return;

    const selectedPreset = medalPresets.find(p => p.name.includes(medalType));
    const medalName = customMedalName || selectedPreset?.name || medalType;
    const medalIcon = selectedPreset?.icon || "Award";

    onAwardMedal(selectedStudentId, {
      id: `med_${Date.now()}`,
      name: medalName,
      icon: medalIcon,
      date: new Date().toISOString().split("T")[0]
    });

    setCustomMedalName("");
    setIsAwarded(true);
    setTimeout(() => setIsAwarded(false), 3000);
  };

  const getMedalIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Shield": return <Shield className="w-5 h-5 text-indigo-600" />;
      case "Music": return <Music className="w-5 h-5 text-purple-600" />;
      case "Heart": return <Heart className="w-5 h-5 text-rose-600" />;
      case "Zap": return <Zap className="w-5 h-5 text-amber-600" />;
      default: return <Award className="w-5 h-5 text-emerald-600" />;
    }
  };

  const selectedCertStudent = students.find(s => s.id === selectedCertStudentId);

  return (
    <div className="space-y-6" id="motivation-container">
      {/* 1. Hall of Fame (Podium of Top Students) */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs" id="hall-of-fame">
        <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2 mb-6">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>Tableau d'Honneur & Tanafus (Saine Émulation)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4" id="podium-grid">
          {/* Second Place */}
          {topStudents[1] && (
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 text-center flex flex-col items-center justify-center order-2 md:order-1" id="podium-second">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold relative mb-3">
                🥈
                <span className="absolute -top-1 -right-1 bg-slate-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">2nd</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{topStudents[1].firstName} {topStudents[1].lastName}</h4>
              <p className="text-slate-400 text-[10px] mt-0.5 font-mono">{topStudents[1].matricule}</p>
              <div className="mt-2 bg-slate-100 px-3 py-1 rounded-full text-slate-700 text-xs font-bold">
                {topStudents[1].score} Pts d'Émulation
              </div>
            </div>
          )}

          {/* First Place (Center, slightly larger) */}
          {topStudents[0] && (
            <div className="bg-amber-50/50 border-2 border-amber-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center order-1 md:order-2 scale-105 shadow-sm relative" id="podium-first">
              <div className="absolute -top-6 text-3xl animate-bounce">👑</div>
              <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center font-bold relative mb-3">
                🥇
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">1er</span>
              </div>
              <h4 className="font-bold text-amber-900 text-base">{topStudents[0].firstName} {topStudents[0].lastName}</h4>
              <p className="text-amber-700/60 text-xs font-mono mt-0.5">{topStudents[0].matricule}</p>
              <div className="mt-2 bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full text-xs font-bold">
                {topStudents[0].score} Pts d'Émulation
              </div>
            </div>
          )}

          {/* Third Place */}
          {topStudents[2] && (
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 text-center flex flex-col items-center justify-center order-3" id="podium-third">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold relative mb-3">
                🥉
                <span className="absolute -top-1 -right-1 bg-amber-700 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">3e</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{topStudents[2].firstName} {topStudents[2].lastName}</h4>
              <p className="text-slate-400 text-[10px] mt-0.5 font-mono">{topStudents[2].matricule}</p>
              <div className="mt-2 bg-slate-100 px-3 py-1 rounded-full text-slate-700 text-xs font-bold">
                {topStudents[2].score} Pts d'Émulation
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="motivation-actions-grid">
        {/* 2. Award Virtuelle Medals Panel */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4" id="award-medal-panel">
          <div>
            <h4 className="font-bold text-base text-slate-800 flex items-center space-x-1.5">
              <Crown className="w-5 h-5 text-emerald-600" />
              <span>Octroyer un Bon Point / Médaille</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">Attribuez des distinctions de comportement ou de Tajwid</p>
          </div>

          {isAwarded && (
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-emerald-800 text-xs font-medium flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>La médaille a été décernée avec succès à l'élève !</span>
            </div>
          )}

          <div className="space-y-3 pt-2" id="award-medal-form">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Élève récipiendaire</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-xs focus:outline-hidden"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.matricule})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type de distinction</label>
              <div className="grid grid-cols-2 gap-2" id="medal-presets-selector">
                {medalPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setMedalType(preset.name);
                      setCustomMedalName("");
                    }}
                    className={`p-3 border rounded-xl text-left transition-all ${medalType === preset.name ? "border-emerald-500 bg-emerald-50/40 text-emerald-900" : "border-slate-100 hover:border-slate-200 text-slate-600"}`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1">
                      {getMedalIconComponent(preset.icon)}
                      <span className="text-xs font-bold">{preset.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block">{preset.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAwardMedalSubmit}
              id="btn-submit-medal"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Décerner la Distinction</span>
            </button>
          </div>
        </div>

        {/* 3. Official Certificate & Diploma Generator */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4" id="certificate-generator-panel">
          <div>
            <h4 className="font-bold text-base text-slate-800 flex items-center space-x-1.5">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Générateur de Certificats & Sceaux</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">Concevez et imprimez des attestations solennelles</p>
          </div>

          <div className="space-y-3 pt-2" id="cert-form">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Élève méritant</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-xs focus:outline-hidden"
                value={selectedCertStudentId}
                onChange={(e) => setSelectedCertStudentId(e.target.value)}
              >
                {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.matricule})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Modèle de Diplôme</label>
              <div className="grid grid-cols-3 gap-2" id="cert-type-grid">
                <button
                  onClick={() => setCertType("tahajji")}
                  className={`p-3 border rounded-xl text-center transition-all ${certType === "tahajji" ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-slate-100 text-slate-600"}`}
                >
                  <span className="block font-bold text-xs">Tahajji</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Fin Initiation</span>
                </button>
                <button
                  onClick={() => setCertType("half")}
                  className={`p-3 border rounded-xl text-center transition-all ${certType === "half" ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-slate-100 text-slate-600"}`}
                >
                  <span className="block font-bold text-xs">Nisf</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Moitié Coran</span>
                </button>
                <button
                  onClick={() => setCertType("hafiz")}
                  className={`p-3 border rounded-xl text-center transition-all ${certType === "hafiz" ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-slate-100 text-slate-600"}`}
                >
                  <span className="block font-bold text-xs">Hafiz(at)</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Clôture (100%)</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowCertificate(true)}
              id="btn-generate-cert"
              className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Générer et Prévisualiser le Diplôme</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Beautiful Certificate Modal Render */}
      {showCertificate && selectedCertStudent && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto" id="certificate-preview-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-3xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            {/* Modal action bar */}
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center" id="cert-modal-bar">
              <span className="text-xs font-bold text-slate-600">Aperçu officiel avant impression</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer le Diplôme</span>
                </button>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-bold rounded-lg transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>

            {/* Certificate Print Area */}
            <div className="p-10 bg-[#FAF9F6] border-8 border-double border-amber-800 m-6 rounded shadow-inner text-center space-y-6 relative font-serif" id="certificate-print-sheet">
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 text-amber-800 font-bold text-lg">✤</div>
              <div className="absolute top-2 right-2 text-amber-800 font-bold text-lg">✤</div>
              <div className="absolute bottom-2 left-2 text-amber-800 font-bold text-lg">✤</div>
              <div className="absolute bottom-2 right-2 text-amber-800 font-bold text-lg">✤</div>

              {/* Bismillah */}
              <div className="text-slate-800 text-lg font-bold tracking-widest text-center" id="cert-bismillah">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>

              {/* Header */}
              <div className="space-y-1">
                <h2 className="text-[11px] text-amber-800 font-bold uppercase tracking-widest">Institut Islamique & Daara Supérieure</h2>
                <h1 className="text-2xl font-bold text-slate-800 tracking-wider font-mono">DIPLÔME DE MÉRITE CORANIQUE</h1>
              </div>

              <div className="w-24 h-0.5 bg-amber-800 mx-auto"></div>

              {/* Body message based on cert type */}
              <div className="space-y-4 max-w-lg mx-auto py-4 text-slate-700 text-sm leading-relaxed" id="cert-body-msg">
                <p>Le Conseil Pédagogique de l'Institut certifie par le présent diplôme que l'élève :</p>
                <p className="text-xl font-bold text-slate-900 border-b border-dashed border-amber-800/60 pb-1.5 w-max mx-auto font-sans">
                  {selectedCertStudent.firstName} {selectedCertStudent.lastName}
                </p>
                <p className="text-xs text-slate-400 font-mono">Matricule : {selectedCertStudent.matricule}</p>
                
                {certType === "tahajji" && (
                  <p className="italic">
                    A complété avec brio la phase d'apprentissage des règles de lecture de l'alphabet arabe **Tahajji (التهجي)** et est jugé apte à entamer la mémorisation du Saint Coran.
                  </p>
                )}

                {certType === "half" && (
                  <p className="italic">
                    A mémorisé et récité avec excellence la moitié du Saint Coran, représentant **30 Hizbs accomplis**, avec une maîtrise solide des règles fondamentales du Tajwid.
                  </p>
                )}

                {certType === "hafiz" && (
                  <p className="italic">
                    A accompli la mémorisation intégrale des **60 Hizbs** du Livre Saint d'Allah (Al-Khatm), accédant au titre honorable de **{selectedCertStudent.gender === 'F' ? "Hafizat (حافظة)" : "Hafiz (حافظ)"}**, avec une récitation conforme aux standards traditionnels.
                  </p>
                )}
              </div>

              {/* Arabic Calligraphy Decorative Text */}
              <div className="text-amber-800 text-base font-bold italic py-2">
                "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ"
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-12 pt-8 text-xs max-w-md mx-auto text-slate-600" id="cert-signatures">
                <div className="border-t border-slate-300 pt-3">
                  <p className="font-bold">Le Cheikh / Oustaz</p>
                  <p className="text-[10px] text-slate-400 mt-1">Diallo Oumar</p>
                </div>
                <div className="border-t border-slate-300 pt-3">
                  <p className="font-bold">Le Directeur de l'Institut</p>
                  <p className="text-[10px] text-slate-400 mt-1">Dr. Abdoulaye Lo</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
