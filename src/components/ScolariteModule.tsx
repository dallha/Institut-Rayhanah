import React, { useState } from "react";
import { Student, Halaqa, PaymentRecord, AttendanceRecord, QuranLesson } from "../types";
import InscriptionTab from "./InscriptionTab";
import ComptabiliteTab from "./ComptabiliteTab";
import { UserPlus, CreditCard } from "lucide-react";

interface ScolariteModuleProps {
  students: Student[];
  halaqas: Halaqa[];
  payments: PaymentRecord[];
  attendance: AttendanceRecord[];
  lessons: QuranLesson[];
  onEnrollStudent: (student: Student) => void;
  onAddPayment: (payment: PaymentRecord) => void;
  unpaidThreshold: number;
  onUpdateThreshold: (val: number) => void;
  initialSubTab?: string;
}

export default function ScolariteModule({
  students,
  halaqas,
  payments,
  attendance,
  lessons,
  onEnrollStudent,
  onAddPayment,
  unpaidThreshold,
  onUpdateThreshold,
  initialSubTab = "inscriptions"
}: ScolariteModuleProps) {
  const [subTab, setSubTab] = useState<string>(initialSubTab);

  return (
    <div className="space-y-6" id="scolarite-module-container">
      {/* Sub-navigation for Scolarité */}
      <div className="flex bg-white/85 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-slate-200/60 shadow-xs justify-center gap-3 max-w-4xl mx-auto w-full overflow-x-auto" id="scolarite-sub-tabs">
        {[
          { id: "inscriptions", label: "Inscriptions & Liste Élèves", icon: <UserPlus className="w-4 h-4" /> },
          { id: "tresorerie", label: "Trésorerie & Frais de Scolarité", icon: <CreditCard className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              subTab === tab.id
                ? "bg-[#0B1C30] text-white shadow-xs"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200/40"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Sub-tab Content */}
      {subTab === "inscriptions" && (
        <InscriptionTab
          students={students}
          halaqas={halaqas}
          onEnrollStudent={onEnrollStudent}
        />
      )}

      {subTab === "tresorerie" && (
        <ComptabiliteTab
          students={students}
          payments={payments}
          onAddPayment={onAddPayment}
          unpaidThreshold={unpaidThreshold}
          onUpdateThreshold={onUpdateThreshold}
        />
      )}
    </div>
  );
}
