import React, { useState } from "react";
import { Student, Halaqa, AttendanceRecord, QuranLesson, PaymentRecord } from "../types";
import AttendanceTab from "./AttendanceTab";
import PedagogyTab from "./PedagogyTab";
import KashfShahriTab from "./KashfShahriTab";
import WeeklySummaryChart from "./WeeklySummaryChart";
import HalaqatModule from "./HalaqatModule";
import { UserCheck, BookOpen, BarChart2, FileCheck, Users } from "lucide-react";

interface PedagogieModuleProps {
  students: Student[];
  halaqas: Halaqa[];
  attendance: AttendanceRecord[];
  lessons: QuranLesson[];
  onUpdateStudent: (student: Student) => void;
  payments?: PaymentRecord[];
  onClotureDay: (attendance: AttendanceRecord[], lessons: QuranLesson[]) => void;
  onAddHalaqa: (h: Halaqa) => void;
  onUpdateHalaqa: (h: Halaqa) => void;
  onDeleteHalaqa: (id: string) => void;
  initialSubTab?: string;
}

export default function PedagogieModule({
  students,
  halaqas,
  attendance,
  lessons,
  onUpdateStudent,
  onClotureDay,
  payments = [],
  onAddHalaqa,
  onUpdateHalaqa,
  onDeleteHalaqa,
  initialSubTab = "pedagogy"
}: PedagogieModuleProps) {
  const [subTab, setSubTab] = useState<string>(initialSubTab);

  return (
    <div className="space-y-6" id="pedagogie-module-container">
      {/* Sub-navigation for Pédagogie */}
      <div className="flex bg-white/85 backdrop-blur-xs px-2 sm:px-4 py-2.5 rounded-2xl border border-slate-200/60 shadow-xs justify-start sm:justify-center gap-2 sm:gap-3 max-w-4xl mx-auto w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" id="pedagogie-sub-tabs">
        {[
          { id: "pedagogy", label: "Suivi Coranique (Hifz)", icon: <BookOpen className="w-4 h-4" /> },
          { id: "attendance", label: "Cahier d'Appel & Leçons", icon: <UserCheck className="w-4 h-4" /> },
          { id: "halaqat", label: "Halaqāt (Cercles)", icon: <Users className="w-4 h-4" /> },
          { id: "bulletins", label: "Bulletins Mensuels (كشف شهري)", icon: <FileCheck className="w-4 h-4" /> },
          { id: "stats", label: "Statistiques Hebdo", icon: <BarChart2 className="w-4 h-4" /> }
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
      {subTab === "pedagogy" && (
        <PedagogyTab
          students={students}
          halaqas={halaqas}
          onUpdateStudent={onUpdateStudent}
          onClotureDay={onClotureDay}
          attendance={attendance}
          lessons={lessons}
          payments={payments}
        />
      )}

      {subTab === "attendance" && (
        <AttendanceTab
          students={students}
          halaqas={halaqas}
          onClotureDay={onClotureDay}
        />
      )}

      {subTab === "halaqat" && (
        <HalaqatModule
          halaqas={halaqas}
          students={students}
          onAddHalaqa={onAddHalaqa}
          onUpdateHalaqa={onUpdateHalaqa}
          onDeleteHalaqa={onDeleteHalaqa}
          onUpdateStudent={onUpdateStudent}
          onClotureDay={onClotureDay}
        />
      )}

      {subTab === "bulletins" && (
        <KashfShahriTab
          students={students}
          halaqas={halaqas}
          lessons={lessons}
          attendance={attendance}
        />
      )}

      {subTab === "stats" && (
        <WeeklySummaryChart
          attendance={attendance}
          lessons={lessons}
          students={students}
        />
      )}
    </div>
  );
}
