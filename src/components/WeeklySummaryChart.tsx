/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { AttendanceRecord, QuranLesson, Student, AttendanceStatus, Evaluation } from "../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell
} from "recharts";
import { Calendar, CheckCircle, AlertTriangle, Sparkles, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";

interface WeeklySummaryChartProps {
  students: Student[];
  attendance: AttendanceRecord[];
  lessons: QuranLesson[];
}

// French weekday helper
const WEEKDAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

// Helper to get ISO week number and year from a date string (YYYY-MM-DD)
function getWeekAndYear(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { week: 0, year: 0 };
  
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
}

// Helper to get start and end dates of a week
function getWeekRangeLabel(week: number, year: number) {
  // Find the first Monday of the year
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  
  const end = new Date(ISOweekStart);
  end.setDate(end.getDate() + 6);
  
  const format = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };
  
  return `Semaine ${week} (${format(ISOweekStart)} - ${format(end)})`;
}

// Get the weekday index (0 = Monday, 6 = Sunday)
function getWeekdayIndex(dateStr: string): number {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return -1;
  const day = d.getDay(); // 0 = Sunday, 1 = Monday
  return day === 0 ? 6 : day - 1;
}

export default function WeeklySummaryChart({ students, attendance, lessons }: WeeklySummaryChartProps) {
  // Find all weeks available in the logs to populate the selector
  const availableWeeks = useMemo(() => {
    const weeksMap = new Map<string, { week: number; year: number }>();
    
    const dates = [
      ...attendance.map(a => a.date),
      ...lessons.map(l => l.date)
    ];

    dates.forEach(dStr => {
      if (!dStr) return;
      // Extract YYYY-MM-DD
      const cleanDate = dStr.split(" ")[0]; 
      const { week, year } = getWeekAndYear(cleanDate);
      if (week > 0 && year > 0) {
        weeksMap.set(`${year}-W${week}`, { week, year });
      }
    });

    // If no weeks are found, default to current week
    if (weeksMap.size === 0) {
      const { week, year } = getWeekAndYear(new Date().toISOString().split("T")[0]);
      weeksMap.set(`${year}-W${week}`, { week, year });
    }

    const sorted = Array.from(weeksMap.entries()).sort((a, b) => {
      return b[0].localeCompare(a[0]); // Newest first
    });

    return sorted.map(([key, value]) => ({
      key,
      label: getWeekRangeLabel(value.week, value.year),
      ...value
    }));
  }, [attendance, lessons]);

  // Selected week index
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>(
    availableWeeks[0]?.key || ""
  );

  // If selectedWeekKey is empty but weeks exist, set it
  React.useEffect(() => {
    if (!selectedWeekKey && availableWeeks.length > 0) {
      setSelectedWeekKey(availableWeeks[0].key);
    }
  }, [availableWeeks, selectedWeekKey]);

  // Selected tab for visualization: 'attendance' or 'pedagogy'
  const [activeSubTab, setActiveSubTab] = useState<"attendance" | "pedagogy">("attendance");

  // Get current week details
  const currentWeekInfo = useMemo(() => {
    return availableWeeks.find(w => w.key === selectedWeekKey) || availableWeeks[0];
  }, [selectedWeekKey, availableWeeks]);

  // Aggregate data for the selected week
  const weeklyData = useMemo(() => {
    if (!currentWeekInfo) return [];

    const { week, year } = currentWeekInfo;

    // Initialize 7 days
    const days = WEEKDAYS.map((name) => ({
      name,
      // Attendance stats
      presents: 0,
      absents: 0,
      lates: 0,
      attendanceRate: 0,
      totalAttendanceLogs: 0,
      // Pedagogy stats
      totalLessons: 0,
      excellentLessons: 0, // ممتاز
      bienLessons: 0,      // جيد
      otherLessons: 0
    }));

    // Filter and aggregate attendance records
    attendance.forEach((rec) => {
      const cleanDate = rec.date.split(" ")[0];
      const recWeek = getWeekAndYear(cleanDate);
      if (recWeek.week === week && recWeek.year === year) {
        const dayIdx = getWeekdayIndex(cleanDate);
        if (dayIdx >= 0 && dayIdx < 7) {
          days[dayIdx].totalAttendanceLogs += 1;
          if (rec.status === AttendanceStatus.Present) {
            days[dayIdx].presents += 1;
          } else if (rec.status === AttendanceStatus.Late) {
            days[dayIdx].lates += 1;
            days[dayIdx].presents += 1; // Late is physically present
          } else if (rec.status === AttendanceStatus.Absent) {
            days[dayIdx].absents += 1;
          }
        }
      }
    });

    // Filter and aggregate lesson records
    lessons.forEach((lesson) => {
      const cleanDate = lesson.date.split(" ")[0];
      const lesWeek = getWeekAndYear(cleanDate);
      if (lesWeek.week === week && lesWeek.year === year) {
        const dayIdx = getWeekdayIndex(cleanDate);
        if (dayIdx >= 0 && dayIdx < 7) {
          days[dayIdx].totalLessons += 1;
          if (lesson.evaluation === Evaluation.Excellent) {
            days[dayIdx].excellentLessons += 1;
          } else if (lesson.evaluation === Evaluation.Bien) {
            days[dayIdx].bienLessons += 1;
          } else {
            days[dayIdx].otherLessons += 1;
          }
        }
      }
    });

    // Calculate rates
    days.forEach((day) => {
      if (day.totalAttendanceLogs > 0) {
        day.attendanceRate = Math.round((day.presents / day.totalAttendanceLogs) * 100);
      } else {
        day.attendanceRate = 0;
      }
    });

    return days;
  }, [currentWeekInfo, attendance, lessons]);

  // Week selection helpers
  const handlePrevWeek = () => {
    const idx = availableWeeks.findIndex(w => w.key === selectedWeekKey);
    if (idx < availableWeeks.length - 1) {
      setSelectedWeekKey(availableWeeks[idx + 1].key);
    }
  };

  const handleNextWeek = () => {
    const idx = availableWeeks.findIndex(w => w.key === selectedWeekKey);
    if (idx > 0) {
      setSelectedWeekKey(availableWeeks[idx - 1].key);
    }
  };

  // Aggregated weekly summary stats
  const summaryStats = useMemo(() => {
    let totalPresents = 0;
    let totalLogs = 0;
    let totalLessonsRecorded = 0;
    let totalExcellent = 0;

    weeklyData.forEach(day => {
      totalPresents += day.presents;
      totalLogs += day.totalAttendanceLogs;
      totalLessonsRecorded += day.totalLessons;
      totalExcellent += day.excellentLessons;
    });

    const averageAttendanceRate = totalLogs > 0 ? Math.round((totalPresents / totalLogs) * 100) : 0;

    return {
      averageAttendanceRate,
      totalLessonsRecorded,
      totalExcellent,
      daysWithPerfectAttendance: weeklyData.filter(d => d.totalAttendanceLogs > 0 && d.attendanceRate >= 95).length
    };
  }, [weeklyData]);

  const hasData = weeklyData.some(d => d.totalAttendanceLogs > 0 || d.totalLessons > 0);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-xs" id="weekly-summary-widget">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-5 mb-5">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            Résumé de Performance Hebdomadaire
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Visualisation analytique de la régularité et des leçons par semaine
          </p>
        </div>

        {/* Week navigation & Selector */}
        <div className="flex items-center space-x-2 w-full md:w-auto self-start md:self-center" id="week-selector-controls">
          <button
            onClick={handlePrevWeek}
            disabled={availableWeeks.findIndex(w => w.key === selectedWeekKey) === availableWeeks.length - 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-all"
            title="Semaine précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <select
            value={selectedWeekKey}
            onChange={(e) => setSelectedWeekKey(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold text-slate-700 focus:outline-hidden flex-1 md:flex-none text-center min-w-[210px]"
          >
            {availableWeeks.map((w) => (
              <option key={w.key} value={w.key}>
                {w.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleNextWeek}
            disabled={availableWeeks.findIndex(w => w.key === selectedWeekKey) === 0}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-all"
            title="Semaine suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6" id="weekly-overview-metrics">
        <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wide">Assiduité Moyenne</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-900">{summaryStats.averageAttendanceRate}%</span>
          </div>
          <span className="text-[10px] text-emerald-700 mt-1 font-medium">Présents & retards</span>
        </div>

        <div className="bg-sky-50/50 border border-sky-100/50 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-sky-800 uppercase tracking-wide">Leçons Récitées</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-extrabold text-sky-900">{summaryStats.totalLessonsRecorded}</span>
          </div>
          <span className="text-[10px] text-sky-700 mt-1 font-medium">Dars quotidien validé</span>
        </div>

        <div className="bg-amber-50/50 border border-amber-100/50 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wide">Mentions Excellent (ممتاز)</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-extrabold text-amber-900">{summaryStats.totalExcellent}</span>
          </div>
          <span className="text-[10px] text-amber-700 mt-1 font-medium">Qualité de mémorisation</span>
        </div>

        <div className="bg-rose-50/50 border border-rose-100/50 rounded-xl p-3 flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-[9px] font-bold text-rose-800 uppercase tracking-wide font-sans">Jours de Haute Présence</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-extrabold text-rose-900">{summaryStats.daysWithPerfectAttendance} / 7</span>
          </div>
          <span className="text-[10px] text-rose-700 mt-1 font-medium">Taux &ge; 95%</span>
        </div>
      </div>

      {/* Selector Tabs for Chart */}
      <div className="flex border-b border-slate-100 mb-4" id="chart-type-tabs">
        <button
          onClick={() => setActiveSubTab("attendance")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === "attendance"
              ? "border-emerald-700 text-emerald-800"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Assiduité (Présences vs Absences)
        </button>
        <button
          onClick={() => setActiveSubTab("pedagogy")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === "pedagogy"
              ? "border-emerald-700 text-emerald-800"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Progrès (Leçons récités par mention)
        </button>
      </div>

      {/* Chart Canvas with empty state handling */}
      {!hasData ? (
        <div className="border-2 border-dashed border-slate-100 rounded-xl py-12 flex flex-col items-center justify-center text-center px-4">
          <Calendar className="w-8 h-8 text-slate-300 stroke-[1.5]" />
          <p className="text-xs font-semibold text-slate-500 mt-3">Aucune donnée disponible pour cette semaine</p>
          <p className="text-[10px] text-slate-400 mt-1 max-w-xs">
            Veuillez choisir une autre semaine dans le sélecteur ci-dessus ou valider l'appel d'aujourd'hui.
          </p>
        </div>
      ) : (
        <div className="w-full h-64 sm:h-80" id="weekly-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            {activeSubTab === "attendance" ? (
              <BarChart
                data={weeklyData}
                margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFF', 
                    border: '1px solid #F1F5F9', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    fontSize: '11px',
                    fontFamily: 'sans-serif'
                  }}
                  formatter={(value, name) => {
                    if (name === "presents") return [value, "Présents/Retards"];
                    if (name === "absents") return [value, "Absents"];
                    if (name === "attendanceRate") return [`${value}%`, "Taux d'assiduité"];
                    return [value, name];
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}
                />
                
                <Bar 
                  dataKey="presents" 
                  name="Présents" 
                  fill="#047857" // Emerald-700
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={30}
                />
                <Bar 
                  dataKey="absents" 
                  name="Absents" 
                  fill="#FDA4AF" // Rose-300
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={30}
                />
              </BarChart>
            ) : (
              <BarChart
                data={weeklyData}
                margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFF', 
                    border: '1px solid #F1F5F9', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    fontSize: '11px',
                    fontFamily: 'sans-serif'
                  }}
                  formatter={(value, name) => {
                    if (name === "excellentLessons") return [value, "Excellent (ممتاز)"];
                    if (name === "bienLessons") return [value, "Bien (جيد)"];
                    if (name === "otherLessons") return [value, "Passable/Faible"];
                    return [value, name];
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}
                />

                <Bar 
                  dataKey="excellentLessons" 
                  name="Excellent (ممتاز)" 
                  fill="#D97706" // Amber-600
                  stackId="lessonsStack"
                  radius={[0, 0, 0, 0]} 
                  maxBarSize={30}
                />
                <Bar 
                  dataKey="bienLessons" 
                  name="Bien (جيد)" 
                  fill="#10B981" // Emerald-500
                  stackId="lessonsStack"
                  radius={[0, 0, 0, 0]} 
                  maxBarSize={30}
                />
                <Bar 
                  dataKey="otherLessons" 
                  name="Passable/Faible" 
                  fill="#94A3B8" // Slate-400
                  stackId="lessonsStack"
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={30}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Pedagogical Guidance Footer */}
      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Les données reflètent les journées clôturées par les enseignants.
        </span>
        <span className="hidden sm:inline italic">
          Mise à jour en temps réel
        </span>
      </div>
    </div>
  );
}
