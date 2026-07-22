import React from "react";
import { X, Palette, Phone, ExternalLink, Sparkles, CheckCircle2, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DesignerModal({ isOpen, onClose }: DesignerModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-amber-100 relative my-8"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0B1C30] via-[#122b47] to-[#0B1C30] p-6 text-white relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#D0A21C]/20 rounded-full blur-2xl pointer-events-none"></div>
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D0A21C] to-amber-600 flex items-center justify-center text-white shadow-lg border-2 border-white/20 shrink-0">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-wide">El Hadji Abdoulaye Niass</h2>
                <p className="text-xs font-black text-[#D0A21C] uppercase tracking-widest mt-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>GRAPHISTE DE LA HADARA</span>
                </p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Bio */}
            <div className="bg-amber-50/50 border border-amber-200/60 p-4 rounded-2xl">
              <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed italic">
                "En tant que designer graphique, je combine une approche esthétique moderne avec la richesse de notre héritage culturel pour créer des identités visuelles fortes et mémorables pour les entreprises, les institutions et les particuliers."
              </p>
            </div>

            {/* Services (Read-only without prices) */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                Domaines d'Expertise & Prestations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Identité Visuelle */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs">Identité Visuelle & Logo</h4>
                  <ul className="text-[11px] text-slate-600 space-y-1.5 pt-1">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Recherche & 3 concepts de logo</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Jusqu'à 3 cycles de modifications</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Livraison HD (PNG, SVG, PDF)</span>
                    </li>
                  </ul>
                </div>

                {/* 2. Communication Visuelle */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs">Communication Visuelle</h4>
                  <ul className="text-[11px] text-slate-600 space-y-1.5 pt-1">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <span>Affiches & Flyers (Événement / Business)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <span>Bâches grand format & Bannières</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <span>Supports réseaux sociaux</span>
                    </li>
                  </ul>
                </div>

                {/* 3. Packages Booster */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs">Packages "Booster"</h4>
                  <ul className="text-[11px] text-slate-600 space-y-1.5 pt-1">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Starter Pack :</strong> Logo + Charte + Carte</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Event Pack :</strong> Affiche + Badge + Kakemono</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact & Portfolio */}
            <div className="bg-[#0B1C30] text-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-[10px] font-bold text-[#D0A21C] uppercase tracking-wider">Contact & Commandes</p>
                <div className="flex items-center gap-2 text-xs font-mono font-semibold">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+221 77 623 27 41 / +221 76 375 63 63</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="https://www.behance.net/mrniasse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#D0A21C] hover:bg-amber-500 text-slate-900 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Portfolio Behance</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Close */}
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-medium">Design & Identité Visuelle — Non éditable</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
