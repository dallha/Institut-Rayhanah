import React from "react";
import { Student, EtapePedagogique, Halaqa } from "../types";
import { Award, Star, TrendingUp, Crown, GraduationCap } from "lucide-react";
import { calculateWestAfricanProgress } from "../quranData";
import { motion } from "motion/react";

interface HonneurTabProps {
  students: Student[];
  halaqas: Halaqa[];
}

export default function HonneurTab({ students, halaqas }: HonneurTabProps) {
  const getHalaqaName = (id: string) => halaqas.find((h) => h.id === id)?.name || "Inconnue";

  // Categorize students
  const huffaz = students.filter(s => s.etape === EtapePedagogique.Hafiz).sort((a, b) => b.khatmatCount - a.khatmatCount);
  const nearKhatm = students.filter(s => 
    s.etape !== EtapePedagogique.Hafiz && 
    s.etape !== EtapePedagogique.Tahajji && 
    s.currentHizbNum && s.currentHizbNum <= 10
  ).sort((a, b) => (a.currentHizbNum || 60) - (b.currentHizbNum || 60));

  const activeMemorizers = students.filter(s => 
    s.etape !== EtapePedagogique.Hafiz && 
    s.etape !== EtapePedagogique.Tahajji &&
    (s.currentHizbNum || 60) > 10
  ).sort((a, b) => (a.currentHizbNum || 60) - (b.currentHizbNum || 60)).slice(0, 5); // Top 5

  return (
    <div className="space-y-8" id="honneur-container">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#0B1C30] to-[#122b47] rounded-3xl p-8 relative overflow-hidden text-center shadow-xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Crown className="w-48 h-48 text-[#D0A21C]" />
        </div>
        <div className="relative z-10">
          <Award className="w-12 h-12 text-[#D0A21C] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-2">Tableau d'Honneur</h2>
          <p className="text-emerald-400 font-medium">Institut Rayhanah pour l'enseignement coranique</p>
        </div>
      </div>

      {/* Les Huffaz */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <GraduationCap className="w-6 h-6 text-rose-600" />
          <h3 className="text-lg font-bold text-slate-800">Nos Huffaz Certifiés 👑</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {huffaz.map(student => (
            <motion.div 
              key={student.id}
              whileHover={{ y: -5 }}
              className="bg-white border-2 border-rose-100 p-6 rounded-2xl shadow-sm text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -mr-12 -mt-12 pointer-events-none"></div>
              <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4 relative z-10 shadow-sm border-2 border-white">
                {student.firstName[0]}
              </div>
              <h4 className="font-bold text-slate-800 text-lg">{student.firstName} {student.lastName}</h4>
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full inline-block mt-2">
                {(student.gender === 'female' || student.gender === 'F') ? 'Hafizat al-Quran (حافظة القرأن)' : 'Hafiz al-Quran (حافظ القرأن)'}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium space-y-1">
                <p>Halaqa : {getHalaqaName(student.halaqaId)}</p>
                <p>Khatmats : <span className="font-bold text-amber-600">{student.khatmatCount}</span></p>
              </div>
            </motion.div>
          ))}
          {huffaz.length === 0 && (
            <div className="col-span-full text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm font-medium">Aucun Hafiz certifié pour le moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Proches du Khatm */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Star className="w-6 h-6 text-amber-500" />
          <h3 className="text-lg font-bold text-slate-800">Proches du Khatm 🔥 (Hizbs 1 à 10)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nearKhatm.map(student => (
            <div key={student.id} className="bg-white border border-amber-100 p-4 rounded-xl flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center font-bold text-amber-800 border border-amber-200">
                H.{student.currentHizbNum}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-sm">{student.firstName} {student.lastName}</h4>
                <p className="text-[10px] text-slate-400">{getHalaqaName(student.halaqaId)}</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full" 
                    style={{ width: `${calculateWestAfricanProgress(student.currentHizbNum, student.currentHizbFraction)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
          {nearKhatm.length === 0 && (
            <div className="col-span-full text-center py-6 bg-slate-50 rounded-xl text-slate-400 text-sm">
              Aucun élève dans la dernière ligne droite.
            </div>
          )}
        </div>
      </div>

      {/* Mémorisants Actifs */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-emerald-500" />
          <h3 className="text-lg font-bold text-slate-800">Meilleurs Mémorisants (Top 5)</h3>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
          {activeMemorizers.map((student, index) => (
            <div key={student.id} className="flex items-center p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <div className="w-8 font-bold text-slate-300">#{index + 1}</div>
              <div className="w-10 h-10 bg-emerald-50 rounded-full text-emerald-700 font-bold flex items-center justify-center text-sm border border-emerald-100">
                {student.firstName[0]}
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-bold text-slate-800 text-sm">{student.firstName} {student.lastName}</h4>
                <p className="text-[10px] text-slate-500 font-medium">{student.etape} • {getHalaqaName(student.halaqaId)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-700">Hizb {student.currentHizbNum}</p>
                <p className="text-[10px] font-bold text-emerald-600">{calculateWestAfricanProgress(student.currentHizbNum, student.currentHizbFraction)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
