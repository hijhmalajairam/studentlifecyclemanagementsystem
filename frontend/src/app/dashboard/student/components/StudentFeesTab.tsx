'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Receipt, AlertCircle, CheckCircle2, Clock, Calendar, ArrowUpRight, DollarSign } from 'lucide-react';
import { fetchAPI } from '@/lib/api';
import PaymentModal from './PaymentModal';
import FeeReceiptModal from './FeeReceiptModal';

interface StudentFeesTabProps {
  user: any;
  enrollment: any;
}

export default function StudentFeesTab({ user, enrollment }: StudentFeesTabProps) {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<any | null>(null);
  const [selectedFeeForReceipt, setSelectedFeeForReceipt] = useState<any | null>(null);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI('/academics/fees/my_fees/');
      const list = Array.isArray(data) ? data : (data?.results || []);
      setFees(list);
    } catch (err) {
      console.error('Failed to load fees', err);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const totalInvoiced = fees.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
  const totalPaid = fees
    .filter(f => f.status === 'PAID')
    .reduce((sum, f) => {
      const net = f.net_amount !== undefined 
        ? (typeof f.net_amount === 'function' ? f.net_amount() : f.net_amount)
        : (parseFloat(f.amount) * (1 - (parseFloat(f.scholarship_discount || 0) / 100)));
      return sum + Number(net);
    }, 0);

  const totalPending = fees
    .filter(f => f.status !== 'PAID')
    .reduce((sum, f) => {
      const net = f.net_amount !== undefined 
        ? (typeof f.net_amount === 'function' ? f.net_amount() : f.net_amount)
        : (parseFloat(f.amount) * (1 - (parseFloat(f.scholarship_discount || 0) / 100)));
      return sum + Number(net);
    }, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            <span>Fees & Academic Invoices</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review your semester tuition billing schedule, claim scholarship concessions, and download official receipts.
          </p>
        </div>
        {enrollment && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Enrollment ID</span>
            <span className="font-mono text-sm font-bold text-indigo-700">{enrollment.enrollment_number}</span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Invoiced</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              ₹{totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">{fees.length} Total Semesters</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Paid</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-emerald-700 mt-1 font-medium">Clear & Settled</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding Balance</p>
            <h3 className={`text-2xl font-black mt-1 ${totalPending > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              ₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {totalPending > 0 ? 'Payment Required' : 'All Accounts Clear'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
            totalPending > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'
          }`}>
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Fee Ledger Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Semester Tuition Schedule</h3>
          <span className="text-xs text-slate-400">{fees.length} Records</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Loading fee schedule...</p>
          </div>
        ) : fees.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700">No Fee Bills Assigned Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Your academic program fees have not been issued yet. The admissions or accounts desk will assign them once your registration is active.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8f9fa] text-xs uppercase text-slate-500 border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-6 py-4">Semester</th>
                  <th className="px-6 py-4">Tuition Fee</th>
                  <th className="px-6 py-4">Scholarship</th>
                  <th className="px-6 py-4">Net Payable</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {fees.map((fee) => {
                  const net = fee.net_amount !== undefined 
                    ? (typeof fee.net_amount === 'function' ? fee.net_amount() : fee.net_amount)
                    : (parseFloat(fee.amount) * (1 - (parseFloat(fee.scholarship_discount || 0) / 100)));

                  return (
                    <tr key={fee.id} className="hover:bg-slate-50/80 transition group">
                      <td className="px-6 py-4 font-black text-slate-800">
                        Semester {fee.semester}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">
                        ₹{Number(fee.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        {Number(fee.scholarship_discount) > 0 ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded border border-emerald-200">
                            {fee.scholarship_discount}% Off
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        ₹{Number(net).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{fee.due_date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {fee.status === 'PAID' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
                            PAID
                          </span>
                        )}
                        {fee.status === 'PENDING' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5"></span>
                            PENDING
                          </span>
                        )}
                        {fee.status === 'OVERDUE' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"></span>
                            OVERDUE
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {fee.status === 'PAID' ? (
                          <button
                            onClick={() => setSelectedFeeForReceipt(fee)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center space-x-1 ml-auto"
                          >
                            <Receipt className="w-3.5 h-3.5 text-slate-500" />
                            <span>Receipt</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedFeeForPayment(fee)}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow shadow-indigo-100 flex items-center space-x-1 ml-auto"
                          >
                            <span>Pay Now</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Gateway Modal */}
      {selectedFeeForPayment && (
        <PaymentModal
          fee={selectedFeeForPayment}
          isOpen={!!selectedFeeForPayment}
          onClose={() => setSelectedFeeForPayment(null)}
          onSuccess={() => {
            fetchFees();
          }}
        />
      )}

      {/* Printable Digital Receipt Modal */}
      {selectedFeeForReceipt && (
        <FeeReceiptModal
          fee={selectedFeeForReceipt}
          user={user}
          enrollment={enrollment}
          isOpen={!!selectedFeeForReceipt}
          onClose={() => setSelectedFeeForReceipt(null)}
        />
      )}
    </div>
  );
}
