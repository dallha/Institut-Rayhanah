/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Student, Halaqa, PaymentRecord, AttendanceRecord, QuranLesson } from "../types";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Award, 
  ArrowRight, 
  Bell, 
  BookOpen, 
  Sparkles,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  GraduationCap,
  Coffee,
  Bed
} from "lucide-react";
import WeeklySummaryChart from "./WeeklySummaryChart";

interface PilotageTabProps {
  students: Student[];
  halaqas: Halaqa[];
  payments: PaymentRecord[];
  attendance: AttendanceRecord[];
  lessons: QuranLesson[];
  onNavigateToTab: (tabId: string, subTabId?: string) => void;
}

export default function PilotageTab({ 
  students, 
  halaqas, 
  payments, 
  attendance,
  lessons = [],
  onNavigateToTab 
}: PilotageTabProps) {
  const { t } = useTranslation();

  // Stats calculations
  const stats = useMemo(() => {
    // Total receivables
    const totalDue = students.reduce((sum, s) => sum + s.balanceDue, 0);
    // Recent payments sum (last 30 days or general total)
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    // Average attendance rate
    const totalLogs = attendance.length;
    const presentLogs = attendance.filter(a => a.status === "Present" || a.status === "Late").length;
    const attendanceRate = totalLogs > 0 ? Math.round((presentLogs / totalLogs) * 100) : 92;

    // Top scholar based on score
    const topStudent = [...students].sort((a, b) => b.score - a.score)[0];

    return {
      totalDue,
      totalPaid,
      attendanceRate,
      topStudentName: topStudent ? `${topStudent.firstName} ${topStudent.lastName}` : "Aucun élève",
      topStudentScore: topStudent ? topStudent.score : 0
    };
  }, [students, payments, attendance]);

  // Notifications
  const alerts = useMemo(() => {
    const criticalUnpaid = students.filter(s => s.balanceDue >= s.monthlyFee);
    const list = [
      {
        id: "1",
        title: t('dashboard.alerts.remindersTitle'),
        desc: t('dashboard.alerts.remindersDesc', { count: criticalUnpaid.length }),
        type: "warning",
        time: t('dashboard.alerts.time1')
      },
      {
        id: "2",
        title: t('dashboard.alerts.kashfTitle'),
        desc: t('dashboard.alerts.kashfDesc'),
        type: "info",
        time: t('dashboard.alerts.time2')
      },
      {
        id: "3",
        title: t('dashboard.alerts.attendanceTitle'),
        desc: t('dashboard.alerts.attendanceDesc', { rate: stats.attendanceRate }),
        type: "success",
        time: t('dashboard.alerts.time3')
      }
    ];
    return list;
  }, [students, stats.attendanceRate, t]);

  // 3 Recent payments
  const recentPayments = useMemo(() => {
    return [...payments].slice(-3).reverse();
  }, [payments]);

  return (
    <div className="space-y-6" id="pilotage-tab-container">
      {/* Welcome Banner Card */}
      <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-5 sm:p-8 relative overflow-hidden flex flex-col justify-center min-h-[200px]" id="pilotage-welcome-card">
        <div className="relative z-10 max-w-xl">
          <h2 
            className="text-xl sm:text-3xl font-extrabold text-slate-800 leading-tight" 
            dangerouslySetInnerHTML={{ __html: t('dashboard.welcomeTitle') }} 
          />
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
            {t('dashboard.welcomeDesc', { count: alerts.length })}
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <button 
              onClick={() => onNavigateToTab("scolarite")}
              className="bg-[#0B1C30] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:bg-[#142d47] transition-all flex items-center gap-1.5"
            >
              {t('dashboard.btnManageSchool')}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => onNavigateToTab("daara")}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 transition-all"
            >
              {t('dashboard.btnAccessDaara')}
            </button>
          </div>
        </div>
        {/* Abstract design geometry */}
        <div className="absolute right-0 bottom-0 w-48 h-48 sm:w-64 sm:h-64 bg-[#0B1C30]/5 rounded-full -mr-12 -mb-12"></div>
        <div className="absolute right-12 top-0 w-24 h-24 bg-[#D0A21C]/5 rounded-full -mt-6"></div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="pilotage-kpi-grid">
        {/* Stat 1: Total Enrolled */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-[#0B1C30]/10 text-[#0B1C30] rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">{t('dashboard.active')}</span>
          </div>
          <div className="mt-4">
            <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{t('dashboard.activeStudents')}</h3>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">{students.length}</div>
            <p className="text-[10px] text-slate-400 mt-1">{t('dashboard.distributedIn', { count: halaqas.length })}</p>
          </div>
        </div>

        {/* Stat 2: Attendance Rate */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-amber-50 text-[#D0A21C] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] bg-amber-50 border border-amber-100 text-[#D0A21C] px-2 py-0.5 rounded-full font-bold">+1.2%</span>
          </div>
          <div className="mt-4">
            <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{t('dashboard.attendanceRate')}</h3>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">{stats.attendanceRate}%</div>
            <p className="text-[10px] text-slate-400 mt-1">{t('dashboard.avgCalculated')}</p>
          </div>
        </div>

        {/* Stat 3: Total school fees received */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">{t('dashboard.received')}</span>
          </div>
          <div className="mt-4">
            <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{t('dashboard.totalFees')}</h3>
            <div className="text-2xl font-extrabold text-emerald-800 mt-1">{stats.totalPaid.toLocaleString()} FCFA</div>
            <p className="text-[10px] text-slate-400 mt-1">{t('dashboard.amountStored')}</p>
          </div>
        </div>

        {/* Stat 4: Unpaid dues */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">{t('dashboard.due')}</span>
          </div>
          <div className="mt-4">
            <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{t('dashboard.unpaidRemaining')}</h3>
            <div className="text-2xl font-extrabold text-rose-600 mt-1">{stats.totalDue.toLocaleString()} FCFA</div>
            <p className="text-[10px] text-slate-400 mt-1">{t('dashboard.toRecover')}</p>
          </div>
        </div>
      </div>

      {/* Quick Shortcuts Grid */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs" id="pilotage-quick-actions">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('dashboard.quickActions')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          <button 
            onClick={() => onNavigateToTab("daara", "pedagogy")}
            className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-[#0B1C30]/5 border border-slate-100 rounded-xl transition-all text-center group cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-[#0B1C30] group-hover:scale-110 transition-transform mb-2" />
            <span className="text-[10px] font-extrabold text-slate-700">{t('dashboard.actionLesson')}</span>
          </button>
          
          <button 
            onClick={() => onNavigateToTab("daara", "attendance")}
            className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-[#0B1C30]/5 border border-slate-100 rounded-xl transition-all text-center group cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-[#0B1C30] group-hover:scale-110 transition-transform mb-2" />
            <span className="text-[10px] font-extrabold text-slate-700">{t('dashboard.actionRollCall')}</span>
          </button>

          <button 
            onClick={() => onNavigateToTab("scolarite", "comptabilite")}
            className="flex flex-col items-center justify-center p-3.5 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/50 rounded-xl transition-all text-center group cursor-pointer"
          >
            <DollarSign className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform mb-2" />
            <span className="text-[10px] font-extrabold text-slate-700">{t('dashboard.actionFees')}</span>
          </button>

          <button 
            onClick={() => onNavigateToTab("scolarite", "inscriptions")}
            className="flex flex-col items-center justify-center p-3.5 bg-amber-50/30 hover:bg-amber-50 border border-amber-100/30 rounded-xl transition-all text-center group cursor-pointer"
          >
            <Users className="w-5 h-5 text-amber-700 group-hover:scale-110 transition-transform mb-2" />
            <span className="text-[10px] font-extrabold text-slate-700">{t('dashboard.actionNewStudent')}</span>
          </button>

          <button 
            onClick={() => onNavigateToTab("francais")}
            className="flex flex-col items-center justify-center p-3.5 bg-sky-50/50 hover:bg-sky-50 border border-sky-100/50 rounded-xl transition-all text-center group cursor-pointer"
          >
            <GraduationCap className="w-5 h-5 text-sky-700 group-hover:scale-110 transition-transform mb-2" />
            <span className="text-[10px] font-extrabold text-slate-700">{t('dashboard.actionFrench')}</span>
          </button>

          <button 
            onClick={() => onNavigateToTab("vie", "discipline")}
            className="flex flex-col items-center justify-center p-3.5 bg-rose-50/50 hover:bg-rose-50 border border-rose-100/50 rounded-xl transition-all text-center group cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-rose-700 group-hover:scale-110 transition-transform mb-2" />
            <span className="text-[10px] font-extrabold text-slate-700">{t('dashboard.actionDiscipline')}</span>
          </button>
        </div>
      </div>

      {/* Main Analytical Section - Chart full width, logs at the bottom */}
      <div className="space-y-6" id="pilotage-bento-section">
        {/* Weekly Summary Chart component (Full width on large) */}
        <div className="w-full" id="pilotage-chart-area">
          <WeeklySummaryChart students={students} attendance={attendance} lessons={lessons} />
        </div>

        {/* Bottom logs grid: 2-column layout on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="pilotage-logs-area">
          {/* Notifications panel */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('dashboard.sysNotifs')}</h3>
              <span className="text-[10px] bg-[#0B1C30]/10 text-[#0B1C30] font-extrabold px-1.5 py-0.5 rounded">
                {t('dashboard.newNotifs', { count: alerts.length })}
              </span>
            </div>
            <div className="space-y-3">
              {alerts.map((al) => (
                <div key={al.id} className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex items-start space-x-3 text-xs">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    al.type === "warning" ? "bg-amber-500" : al.type === "success" ? "bg-emerald-500" : "bg-sky-500"
                  }`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-700">{al.title}</span>
                      <span className="text-[9px] text-slate-400">{al.time}</span>
                    </div>
                    <p className="text-slate-400 text-[10px] mt-1 font-medium leading-relaxed">{al.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Operations */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('dashboard.recentCashflow')}</h3>
              <button 
                onClick={() => onNavigateToTab("scolarite")}
                className="text-[10px] text-[#0B1C30] hover:underline font-bold cursor-pointer"
              >
                {t('dashboard.seeAll')}
              </button>
            </div>
            {recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">{t('dashboard.noTransaction')}</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((pay) => {
                  const student = students.find(s => s.id === pay.studentId);
                  return (
                    <div key={pay.id} className="flex justify-between items-center text-xs p-2.5 border border-slate-50 rounded-xl hover:bg-slate-50/50">
                      <div>
                        <p className="font-bold text-slate-700">
                          {student ? `${student.firstName} ${student.lastName}` : t('dashboard.unknownStudent')}
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium">{pay.purpose} • {pay.date}</p>
                      </div>
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        +{pay.amount.toLocaleString()} F
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Gamification Spotlight Banner */}
      <div className="bg-gradient-to-r from-[#0B1C30] to-[#122b47] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4" id="gamification-spotlight">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-amber-300">
            <Award className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase text-amber-300 tracking-wider">{t('dashboard.starOfWeek')}</h4>
            <p className="text-sm font-extrabold mt-0.5">{stats.topStudentName}</p>
            <p className="text-[10px] text-slate-300">
              {t('dashboard.bestScore', { score: stats.topStudentScore })}
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigateToTab("daara")}
          className="bg-[#D0A21C] hover:bg-[#b88c14] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs"
        >
          {t('dashboard.seeRewards')}
        </button>
      </div>
    </div>
  );
}
