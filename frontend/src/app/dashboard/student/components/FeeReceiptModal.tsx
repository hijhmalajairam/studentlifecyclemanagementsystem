'use client';

import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';

interface FeeReceiptModalProps {
  fee: any;
  user: any;
  enrollment: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function FeeReceiptModal({ fee, user, enrollment, isOpen, onClose }: FeeReceiptModalProps) {
  if (!isOpen || !fee) return null;

  const handlePrint = () => {
    window.print();
  };

  const netPayable = fee.net_amount !== undefined 
    ? (typeof fee.net_amount === 'function' ? fee.net_amount() : fee.net_amount)
    : (parseFloat(fee.amount) * (1 - (parseFloat(fee.scholarship_discount || 0) / 100)));

  const discountAmount = parseFloat(fee.amount) - netPayable;
  const receiptNo = `VG-REC-2026-${String(fee.id).padStart(5, '0')}`;
  const paidDateFormatted = fee.paid_date || new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden print:shadow-none print:border-none print:max-w-none print:m-0">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex justify-between items-center print:hidden">
          <span className="text-xs font-mono font-bold tracking-wider text-slate-500">DIGITAL RECEIPT PREVIEW</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable Receipt Body */}
        <div className="p-8 md:p-10 space-y-6 text-slate-800 font-sans print:p-6" id="printable-receipt">
          {/* Institution Header */}
          <div className="flex items-start justify-between border-b-2 border-indigo-900 pb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-900 text-white rounded-xl flex items-center justify-center font-black text-xl shadow">
                VG
              </div>
              <div>
                <h1 className="text-xl font-black text-indigo-950 tracking-tight">VERITAS GROVE UNIVERSITY</h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Office of the Bursar & Academic Accounts</p>
                <p className="text-[11px] text-slate-400">Hyderabad Campus, Telangana, India • support@veritasgrove.edu.in</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs rounded-full uppercase tracking-wider">
                Official Receipt
              </span>
              <p className="font-mono text-xs text-slate-600 font-bold mt-2">{receiptNo}</p>
            </div>
          </div>

          {/* Student & Payment Metadata */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Student Name:</span>
                <span className="font-bold text-slate-900 uppercase">{user?.first_name} {user?.last_name}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Enrollment No:</span>
                <span className="font-bold font-mono text-indigo-700">{enrollment?.enrollment_number || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Program:</span>
                <span className="font-bold text-slate-900">{enrollment?.program_name || 'Undergraduate Degree'}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Semester:</span>
                <span className="font-bold text-slate-900">Semester {fee.semester}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Date of Payment:</span>
                <span className="font-bold text-slate-900">{paidDateFormatted}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Payment Mode:</span>
                <span className="font-bold text-emerald-700">Online Gateway (Authorized)</span>
              </div>
            </div>
          </div>

          {/* Fee Itemization Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Particulars / Description</th>
                  <th className="p-3 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-semibold text-slate-400">1</td>
                  <td className="p-3 font-bold text-slate-800">
                    Tuition & Academic Term Fee (Semester {fee.semester})
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    ₹{Number(fee.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                {Number(fee.scholarship_discount) > 0 && (
                  <tr className="bg-emerald-50/50">
                    <td className="p-3 font-semibold text-emerald-600">2</td>
                    <td className="p-3 font-bold text-emerald-800">
                      Merit Scholarship Fee Concession ({fee.scholarship_discount}%)
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">
                      - ₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-black">
                <tr>
                  <td colSpan={2} className="p-3 text-right text-slate-900 uppercase text-xs tracking-wider">
                    Total Amount Paid:
                  </td>
                  <td className="p-3 text-right font-mono text-base text-indigo-900">
                    ₹{Number(netPayable).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Stamp & Verification */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider">Payment Verified</p>
                <p className="text-[10px] text-emerald-600">Zero Outstanding Dues for Semester {fee.semester}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block border-2 border-indigo-900/30 rounded-lg p-2 text-center">
                <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">Accounts Controller</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Digitally Certified via Veritas ERP</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-center text-slate-400 italic pt-2">
            This is a computer-generated official receipt and requires no physical signature.
          </p>
        </div>
      </div>
    </div>
  );
}
