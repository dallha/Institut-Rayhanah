/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Student, PaymentRecord } from "../types";
import { Receipt, CreditCard, ShieldAlert, CheckCircle, Printer, FileText, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

interface ComptabiliteTabProps {
  students: Student[];
  payments: PaymentRecord[];
  onAddPayment: (payment: PaymentRecord) => void;
  unpaidThreshold: number;
  onUpdateThreshold: (threshold: number) => void;
}

export default function ComptabiliteTab({
  students,
  payments,
  onAddPayment,
  unpaidThreshold,
  onUpdateThreshold
}: ComptabiliteTabProps) {
  const { t } = useTranslation();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [paymentAmount, setPaymentAmount] = useState<number>(15000);
  const [paymentPurpose, setPaymentPurpose] = useState<string>(t('treasury.defaultPurpose'));
  const [recordedBy, setRecordedBy] = useState<string>(t('treasury.defaultRecordedBy'));
  const [receiptSuccess, setReceiptSuccess] = useState<boolean>(false);
  const [activeReceipt, setActiveReceipt] = useState<PaymentRecord | null>(null);

  // Filter students with unpaid balances
  const unpaidStudents = students.filter(s => s.balanceDue > 0);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || paymentAmount <= 0) return;

    const selectedStudent = students.find(s => s.id === selectedStudentId);
    if (!selectedStudent) return;

    const serial = payments.length + 1070;
    const receiptNumber = `REC-2026-${serial}`;

    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      studentId: selectedStudentId,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      amount: paymentAmount,
      purpose: paymentPurpose,
      receiptNumber,
      recordedBy
    };

    onAddPayment(newPayment);
    setActiveReceipt(newPayment);
    setReceiptSuccess(true);
    setTimeout(() => setReceiptSuccess(false), 5000);
  };

  const getStudentFullName = (id: string) => {
    const s = students.find(st => st.id === id);
    return s ? `${s.firstName} ${s.lastName} (${s.matricule})` : t('treasury.unknownStudent');
  };

  return (
    <div className="space-y-6" id="comptabilite-container">
      {/* Top Grid: Payment form and receipt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="comptabilite-top-grid">
        {/* 1. Log Payment Form */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4" id="comptabilite-payment-logger">
          <div>
            <h3 className="font-bold text-base text-slate-800 flex items-center space-x-1.5">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>{t('treasury.recordPayment')}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">{t('treasury.subtitle')}</p>
          </div>

          {receiptSuccess && activeReceipt && (
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-emerald-800 text-xs font-semibold flex items-center space-x-2" id="payment-success-msg">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{t('treasury.receiptSuccess')}</span>
            </div>
          )}

          <form onSubmit={handleRecordPayment} className="space-y-4 text-slate-700 text-sm" id="payment-form">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('treasury.selectStudent')}</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-xs focus:outline-hidden font-semibold"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.matricule})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('treasury.amount')}</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2 text-xs focus:outline-hidden font-bold text-emerald-700"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('treasury.recordedBy')}</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2 text-xs focus:outline-hidden"
                  value={recordedBy}
                  onChange={(e) => setRecordedBy(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('treasury.purpose')}</label>
              <div className="space-y-2">
                <select
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2 text-xs font-semibold focus:outline-hidden"
                  onChange={(e) => {
                    if (e.target.value !== "custom") {
                      setPaymentPurpose(e.target.value);
                    }
                  }}
                  defaultValue={t('treasury.defaultPurpose')}
                >
                  <option value="Mensualité (Scolarité Mermoz)">Mensualité (Scolarité Mermoz)</option>
                  <option value="Mensualité (Juillet 2026)">Mensualité (Juillet 2026)</option>
                  <option value="Frais d'inscription & Dossier">Frais d'inscription & Dossier</option>
                  <option value="Cotisation Cantine / Restauration">Cotisation Cantine / Restauration</option>
                  <option value="Droit d'examen & Certification">Droit d'examen & Certification</option>
                  <option value="custom">✏️ Autre motif (Saisie libre ci-dessous)</option>
                </select>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[#0B1C30]"
                  placeholder="Ou saisissez un motif personnalisé..."
                  value={paymentPurpose}
                  onChange={(e) => setPaymentPurpose(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-payment"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t('treasury.validateReceipt')}</span>
            </button>
          </form>
        </div>

        {/* 2. Live Electronic Receipt Display */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4" id="comptabilite-receipt-viewer">
          <div>
            <h3 className="font-bold text-base text-slate-800 flex items-center space-x-1.5">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <span>{t('treasury.receiptPreviewTitle')}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">{t('treasury.receiptPreviewDesc')}</p>
          </div>

          {activeReceipt ? (
            <div className="bg-[#FAF9F6] border-2 border-emerald-800 p-5 rounded-xl space-y-4 shadow-inner relative text-slate-800 text-xs" id="receipt-print-layout">
              <div className="flex justify-between items-start border-b border-dashed border-emerald-800/40 pb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="w-24 h-8 object-contain" />
                  <div>
                    <p className="text-[8px] text-slate-500 font-bold ml-2 border-l border-emerald-800/20 pl-2">{t('treasury.daaraSection')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[10px] text-slate-700">{activeReceipt.receiptNumber}</span>
                  <p className="text-[8px] text-slate-400 mt-0.5">{activeReceipt.date}</p>
                </div>
              </div>

              {/* Cachet filigrane */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden z-0">
                <div className="border-4 border-emerald-900 rounded-full w-48 h-48 flex items-center justify-center -rotate-12">
                  <span className="text-emerald-900 font-black text-2xl text-center uppercase tracking-widest">{t('treasury.paidStamp')}</span>
                </div>
              </div>

              <div className="space-y-2 py-1 relative z-10">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">{t('treasury.studentLabel')}</span>
                  <span className="font-bold text-slate-800">{getStudentFullName(activeReceipt.studentId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">{t('treasury.purposeLabel')}</span>
                  <span className="font-semibold text-slate-800">{activeReceipt.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">{t('treasury.cashedByLabel')}</span>
                  <span className="font-semibold text-slate-800">{activeReceipt.recordedBy}</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-center flex justify-between items-center">
                <span className="text-emerald-800 font-bold uppercase tracking-wider text-[10px]">{t('treasury.totalAmountLabel')}</span>
                <span className="text-base font-extrabold text-emerald-900">{activeReceipt.amount.toLocaleString()} FCFA</span>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-2 bg-white border border-emerald-800 text-emerald-800 hover:bg-emerald-50 font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 text-[10px] cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('treasury.printReceipt')}</span>
              </button>
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 p-12 text-center rounded-xl text-slate-400 text-xs italic flex flex-col items-center justify-center space-y-2 min-h-[220px]">
              <FileText className="w-10 h-10 text-slate-300" />
              <span>{t('treasury.noReceiptSelected')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Unpaid Balances List (Relances Parentales) */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4" id="comptabilite-relances">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-800 flex items-center space-x-1.5">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>{t('treasury.debtorsList')}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">{t('treasury.noDebtors')}</p>
          </div>

          {/* Global Threshold Settings Widget */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3 text-xs w-full sm:w-auto" id="comptabilite-threshold-settings">
            <div className="flex flex-col">
              <label htmlFor="threshold-input" className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                {t('treasury.alertThreshold')}
              </label>
              <span className="text-[10px] font-mono font-bold text-rose-600">
                &gt; {unpaidThreshold.toLocaleString()} FCFA
              </span>
            </div>
            <input
              id="threshold-input"
              type="number"
              step="5000"
              min="0"
              className="bg-white border border-slate-200 rounded p-1 w-28 font-bold focus:outline-hidden text-slate-700"
              value={unpaidThreshold}
              onChange={(e) => onUpdateThreshold(Math.max(0, Number(e.target.value)))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="unpaid-students-list">
          {unpaidStudents.map((student) => {
            const isOverThreshold = student.balanceDue > unpaidThreshold;
            return (
              <div 
                key={student.id} 
                className={`border p-4 rounded-xl flex justify-between items-center transition-all ${
                  isOverThreshold 
                    ? "border-rose-200 bg-rose-50/30 shadow-xs" 
                    : "border-slate-100 bg-slate-50/50"
                }`} 
                id={`unpaid-${student.id}`}
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                    {student.firstName} {student.lastName}
                    {isOverThreshold && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Parent : {student.parentName} ({student.parentPhone})</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block border ${
                    isOverThreshold 
                      ? "bg-rose-100 border-rose-200 text-rose-800" 
                      : "bg-slate-100 border-slate-200 text-slate-600"
                  }`}>
                    {isOverThreshold ? t('treasury.alertReminder') : t('treasury.standardUnpaid')}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`block text-sm font-extrabold ${isOverThreshold ? "text-rose-600" : "text-slate-600"}`}>
                    {student.balanceDue.toLocaleString()} FCFA
                  </span>
                  <button
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setPaymentAmount(student.balanceDue);
                    }}
                    className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold underline mt-1 block cursor-pointer"
                  >
                    {t('treasury.settleBalance')}
                  </button>
                </div>
              </div>
            );
          })}

          {unpaidStudents.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs italic col-span-full">
              {t('treasury.noUnpaidMsg')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
