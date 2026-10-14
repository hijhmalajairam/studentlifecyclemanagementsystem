'use client';

import React, { useState } from 'react';
import { ShieldCheck, QrCode, CreditCard, Landmark, CheckCircle2, Loader2, X, AlertCircle } from 'lucide-react';
import { fetchAPI } from '@/lib/api';

interface PaymentModalProps {
  fee: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ fee, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // UPI state
  const [upiId, setUpiId] = useState('');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('HDFC');

  if (!isOpen || !fee) return null;

  const netPayable = fee.net_amount !== undefined 
    ? (typeof fee.net_amount === 'function' ? fee.net_amount() : fee.net_amount)
    : (parseFloat(fee.amount) * (1 - (parseFloat(fee.scholarship_discount || 0) / 100)));

  const handlePayment = async () => {
    setErrorMsg('');
    setIsProcessing(true);

    try {
      // Realistic 1.5s simulated gateway communication
      await new Promise(r => setTimeout(r, 1500));

      await fetchAPI(`/academics/fees/${fee.id}/pay_semester_fee/`, {
        method: 'POST'
      });

      setIsProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Payment processing failed. Please try again.');
    }
  };

  const formatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    return raw.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      return `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    return raw;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 px-6 py-5 text-white flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-200">Veritas Grove Secure Payment</span>
            </div>
            <h3 className="text-lg font-black mt-0.5">Semester {fee.semester} Tuition Fee</h3>
          </div>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="p-1 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentSuccess ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-slate-900">Payment Successful!</h4>
            <p className="text-sm text-slate-500 max-w-xs">
              ₹{Number(netPayable).toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been received. Your fee receipt is now ready.
            </p>
          </div>
        ) : (
          <div className="p-6">
            {/* Amount Summary Card */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200 flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Payable Amount</p>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-2xl font-black text-slate-900">
                    ₹{Number(netPayable).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  {Number(fee.scholarship_discount) > 0 && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {fee.scholarship_discount}% Scholarship Applied
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 font-medium">
                Due: {fee.due_date}
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  method === 'upi' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  method === 'card' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('netbanking')}
                className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  method === 'netbanking' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>Net Banking</span>
              </button>
            </div>

            {/* Method Body */}
            {method === 'upi' && (
              <div className="space-y-4 text-center">
                <div className="inline-block p-3 bg-white border-2 border-dashed border-indigo-200 rounded-xl">
                  {/* Dynamic SVG QR Code Simulation */}
                  <div className="w-36 h-36 bg-slate-900 rounded-lg p-2 flex flex-col justify-between items-center text-white">
                    <div className="w-full flex justify-between">
                      <div className="w-6 h-6 border-2 border-white rounded-sm"></div>
                      <div className="w-6 h-6 border-2 border-white rounded-sm"></div>
                    </div>
                    <div className="text-[10px] font-mono tracking-widest text-indigo-300">UPI VERIFIED</div>
                    <div className="w-full flex justify-between">
                      <div className="w-6 h-6 border-2 border-white rounded-sm"></div>
                      <div className="w-4 h-4 bg-emerald-400 rounded-sm"></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Scan this QR code with Google Pay, PhonePe, or Paytm</p>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400 font-bold">Or enter UPI ID</span>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="e.g. yourname@okhdfcbank"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  className="w-full text-center px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Card Number</label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="JAIRAM HIJHMALA"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Expiry</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg font-mono text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg font-mono text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'netbanking' && (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Select Bank</label>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Kotak Mahindra'].map(bank => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-3 text-xs font-bold rounded-lg border text-left transition ${
                        selectedBank === bank
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pay Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>256-Bit SSL Encryption</span>
              </div>
              <button
                type="button"
                onClick={handlePayment}
                disabled={isProcessing}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-md shadow-indigo-200 flex items-center space-x-2 text-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Pay ₹{Number(netPayable).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
