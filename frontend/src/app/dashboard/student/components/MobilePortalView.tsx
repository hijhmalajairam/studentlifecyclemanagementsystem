import React from 'react';

export default function MobilePortalView() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-3xl mx-auto">
      <div className="bg-[#a41034] text-white px-6 py-4 flex items-center justify-center relative">
        <h2 className="font-bold text-lg text-center tracking-wide">University Mobile App Portal</h2>
      </div>
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-100 rounded-3xl mb-6 shadow-inner border border-slate-200">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">Connect Your Mobile Device</h3>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">Download the official university application to access your hall tickets, receive instant notifications for marks, and track your attendance on the go.</p>
        
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          <button className="flex flex-col items-center justify-center bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition">
            <span className="text-[10px] uppercase tracking-widest opacity-70">Download on the</span>
            <span className="font-bold text-sm">App Store</span>
          </button>
          <button className="flex flex-col items-center justify-center bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition">
            <span className="text-[10px] uppercase tracking-widest opacity-70">GET IT ON</span>
            <span className="font-bold text-sm">Google Play</span>
          </button>
        </div>
      </div>
      
      <div className="bg-slate-50 border-t border-slate-200 p-4 grid grid-cols-4 gap-2 text-center">
        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm"><div className="font-black text-blue-600 mb-1">✓</div><div className="text-xs font-bold text-slate-600">Hall Ticket</div></div>
        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm"><div className="font-black text-emerald-600 mb-1">✓</div><div className="text-xs font-bold text-slate-600">Marks</div></div>
        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm"><div className="font-black text-amber-600 mb-1">✓</div><div className="text-xs font-bold text-slate-600">Attendance</div></div>
        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm"><div className="font-black text-purple-600 mb-1">✓</div><div className="text-xs font-bold text-slate-600">Settings</div></div>
      </div>
    </div>
  );
}
