'use client';

import React, { useState } from 'react';
import { Printer, Shield, QrCode, CheckCircle2, Download, CreditCard, Sparkles, Building, Phone, Calendar } from 'lucide-react';

export default function ProfileSection({ profile }: { profile: any }) {
  const [showIdCard, setShowIdCard] = useState(false);

  if (!profile) return null;

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Brianna Carter';
  const enrollmentNo = profile.enrollment_number || 'ENR-BTECH-CSE-9757';
  const program = 'B.Tech Computer Science & Engineering';
  const validThru = '2026 - 2030 (Class of 2030)';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {profile.gender === 'FEMALE' ? 'Ms.' : 'Mr.'} {fullName}
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs md:text-sm font-medium">
            <p className="text-slate-500"><span className="text-slate-400">Enrolment No:</span> <span className="font-mono font-bold text-indigo-700">{enrollmentNo}</span></p>
            <p className="text-slate-500"><span className="text-slate-400">Program:</span> <span className="font-bold text-slate-800">B.Tech</span></p>
            <p className="text-slate-500"><span className="text-slate-400">Branch:</span> <span className="font-bold text-slate-800">Computer Science & Engineering</span></p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            type="button"
            onClick={() => setShowIdCard(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 active:scale-95"
          >
            <span className="text-sm">🪪</span>
            <span>Digital Student ID Card</span>
          </button>
          
          <button 
            type="button"
            onClick={() => window.print()}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Data (PDF)</span>
          </button>
        </div>
      </div>

      {/* Verification Status */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-center shadow-sm">
        <div className="bg-emerald-100 text-emerald-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="text-emerald-900 font-bold text-xs md:text-sm">
            Institutional Identity Verified • Active University Scholar Profile
          </p>
          <p className="text-emerald-700 text-xs mt-0.5">
            Your demographic records and academic identity vault are synchronized with the Registrar Office.
          </p>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Academic Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5">
            <h3 className="font-black text-slate-800 text-xs tracking-wider uppercase">Academic Record</h3>
          </div>
          <div className="p-5">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-100">
                <tr className="flex py-2.5"><td className="w-1/3 text-slate-400 font-medium">Enrolment Number</td><td className="w-2/3 font-mono font-bold text-indigo-700">{enrollmentNo}</td></tr>
                <tr className="flex py-2.5"><td className="w-1/3 text-slate-400 font-medium">Application ID</td><td className="w-2/3 font-mono font-semibold text-slate-800">APP-2026-{profile.id}</td></tr>
                <tr className="flex py-2.5"><td className="w-1/3 text-slate-400 font-medium">Degree Program</td><td className="w-2/3 font-semibold text-slate-800">{program}</td></tr>
                <tr className="flex py-2.5"><td className="w-1/3 text-slate-400 font-medium">Class / Term</td><td className="w-2/3 font-semibold text-slate-800">1st Year • Semester 1 • Section A</td></tr>
                <tr className="flex py-2.5"><td className="w-1/3 text-slate-400 font-medium">Academic Year</td><td className="w-2/3 font-semibold text-slate-800">2026 - 2027</td></tr>
                <tr className="flex py-2.5"><td className="w-1/3 text-slate-400 font-medium">Current Status</td><td className="w-2/3"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded uppercase">Regular • Good Standing</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5">
            <h3 className="font-black text-slate-800 text-xs tracking-wider uppercase">Personal Demographics</h3>
          </div>
          <div className="p-5">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-100">
                <tr className="flex py-2.5"><td className="w-1/3 text-slate-400 font-medium">Full Name</td><td className="w-2/3 font-bold text-slate-900">{fullName}</td></tr>
                <tr className="flex py-2.5"><td className="w-1/3 text-slate-400 font-medium">Date of Birth</td><td className="w-2/3 font-semibold text-slate-800">{profile.dob || '2006-04-15'}</td></tr>
                <tr className="flex py-2.5"><td className="w-1/3 text-slate-400 font-medium">Gender</td><td className="w-2/3 font-semibold text-slate-800">{profile.gender || 'Female'}</td></tr>
                <tr className="flex py-2.5"><td className="w-1/3 text-slate-400 font-medium">Blood Group</td><td className="w-2/3 font-bold text-rose-600">{profile.blood_group || 'O+'}</td></tr>
                <tr className="flex py-2.5"><td className="w-1/3 text-slate-400 font-medium">Nationality</td><td className="w-2/3 font-semibold text-slate-800">{profile.nationality || 'Indian'}</td></tr>
                <tr className="flex py-2.5"><td className="w-1/3 text-slate-400 font-medium">Category / Quota</td><td className="w-2/3 font-semibold text-slate-800">{profile.category || 'General (Merit)'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact & Digital Identity */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5">
            <h3 className="font-black text-slate-800 text-xs tracking-wider uppercase">Contact Channels</h3>
          </div>
          <div className="p-5">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-100">
                <tr className="flex py-2.5"><td className="w-1/3 text-slate-400 font-medium">Primary Mobile</td><td className="w-2/3 font-mono font-semibold text-slate-800">{profile.mobile_no || '+91 98765 43210'}</td></tr>
                <tr className="flex py-2.5"><td className="w-1/3 text-slate-400 font-medium">Campus Email</td><td className="w-2/3 font-mono font-semibold text-blue-600">{profile.institutional_email || 'btech-cse_stu0@univ.edu'}</td></tr>
                <tr className="flex py-2.5"><td className="w-1/3 text-slate-400 font-medium">Personal Email</td><td className="w-2/3 font-mono font-semibold text-slate-700">{profile.personal_email || 'brianna.carter@example.com'}</td></tr>
                <tr className="flex py-2.5"><td className="w-1/3 text-slate-400 font-medium">Emergency Contact</td><td className="w-2/3 font-mono font-semibold text-slate-800">{profile.father_mobile || '+91 98765 00000'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Residential Address */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5">
            <h3 className="font-black text-slate-800 text-xs tracking-wider uppercase">Permanent Residence</h3>
          </div>
          <div className="p-5">
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {profile.permanent_address || '42 University Enclave, Tech Park Boulevard'}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs">
              <div><span className="text-slate-400 text-[10px] uppercase font-bold block">City</span><span className="font-bold text-slate-800">{profile.permanent_city || 'Bengaluru'}</span></div>
              <div><span className="text-slate-400 text-[10px] uppercase font-bold block">State</span><span className="font-bold text-slate-800">{profile.permanent_state || 'Karnataka'}</span></div>
              <div><span className="text-slate-400 text-[10px] uppercase font-bold block">PIN Code</span><span className="font-mono font-bold text-slate-800">{profile.permanent_pin || '560001'}</span></div>
            </div>
          </div>
        </div>

      </div>

      {/* DIGITAL STUDENT SMART ID CARD MODAL */}
      {showIdCard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Bar */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center print:hidden">
              <span className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Institutional Smart Identity Card</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print PVC ID
                </button>
                <button
                  type="button"
                  onClick={() => setShowIdCard(false)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* PVC SMART CARD BODY */}
            <div className="p-8 flex justify-center bg-slate-100/70">
              <div className="w-[380px] h-[240px] bg-gradient-to-br from-[#1a1c3d] via-[#24275a] to-[#0f112e] text-white rounded-2xl p-4 shadow-2xl border border-indigo-500/30 relative overflow-hidden flex flex-col justify-between">
                
                {/* Background Holographic Watermark Circle */}
                <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-blue-500/10 blur-xl pointer-events-none"></div>
                <div className="absolute right-3 top-3 opacity-20 pointer-events-none text-4xl">🏛️</div>

                {/* Card Top Brand */}
                <div className="flex items-center justify-between border-b border-white/15 pb-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-xs shadow-md border border-red-400">
                      V
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider leading-tight text-white">
                        Veritas Grove University
                      </h4>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-indigo-300">
                        Student Identity Card
                      </p>
                    </div>
                  </div>

                  {/* Smart Card Chip icon */}
                  <div className="w-7 h-5 rounded bg-amber-400/90 border border-amber-300 flex items-center justify-center text-[8px] font-mono font-bold text-amber-950 shadow-inner">
                    CHIP
                  </div>
                </div>

                {/* Card Main Info Body */}
                <div className="flex items-center gap-3.5 my-auto relative z-10">
                  {/* Student Avatar */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 border-2 border-white/60 p-0.5 shadow-md flex items-center justify-center text-white font-black text-xl shrink-0">
                    {profile.first_name ? profile.first_name[0] : 'B'}{profile.last_name ? profile.last_name[0] : 'C'}
                  </div>

                  {/* Info details */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="text-xs font-black text-white truncate tracking-wide">
                      {fullName}
                    </div>
                    <div className="font-mono text-[10px] font-bold text-amber-300">
                      {enrollmentNo}
                    </div>
                    <div className="text-[9px] font-medium text-slate-300 truncate">
                      {program}
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-bold text-indigo-200 pt-0.5">
                      <span>Blood: <b className="text-white">{profile.blood_group || 'O+'}</b></span>
                      <span>•</span>
                      <span>Valid: <b className="text-white">2026-2030</b></span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Bar & Barcode */}
                <div className="flex items-end justify-between border-t border-white/15 pt-2 relative z-10 text-[8px]">
                  <div>
                    {/* Simulated Barcode */}
                    <div className="font-mono text-[9px] tracking-[3px] text-slate-300 opacity-80 leading-none">
                      ||| | |||| | ||| |||| |
                    </div>
                    <span className="text-[7px] text-slate-400 font-mono mt-0.5 block">
                      SEC-ID: {enrollmentNo.replace(/[^0-9]/g, '') || '9757'}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-[7px] font-serif italic text-amber-200">
                      A. Registrar
                    </div>
                    <div className="text-[7px] font-bold uppercase tracking-widest text-slate-400">
                      Authorized Seal
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer Note */}
            <div className="p-4 bg-white text-center border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium">
                This digital credential serves as valid identification across library checkouts, examination halls, and campus transit.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
