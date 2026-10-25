'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Calendar, 
  Plus, 
  Send, 
  Phone, 
  Mail, 
  Sparkles,
  Search,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { fetchAPI } from '@/lib/api';

interface Mentee {
  id: number;
  name: string;
  enrollment_number: string;
  program: string;
  semester: number;
  current_year: number;
  cgpa: number;
  attendance_percentage: number;
  attendance_status: string;
  fee_status: string;
  email: string;
  last_meeting: string;
  notes: string;
}

export default function FacultyMentoringTab() {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ON_TRACK' | 'AT_RISK'>('ALL');
  const [search, setSearch] = useState('');
  
  // Meeting log modal
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [meetingTopic, setMeetingTopic] = useState('Academic Progress & Attendance Review');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load mentees
  const loadMentees = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI('/academics/faculty/my_mentees/');
      setMentees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load mentees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentees();
  }, []);

  const handleLogMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentee || !meetingNotes.trim()) return;

    try {
      setSubmitting(true);
      await fetchAPI('/academics/faculty/log_mentee_meeting/', {
        method: 'POST',
        body: JSON.stringify({
          enrollment_id: selectedMentee.id,
          topic: meetingTopic,
          notes: meetingNotes
        })
      });

      setToastMsg(`Mentoring advising note logged for ${selectedMentee.name}.`);
      // Update mentee note locally
      setMentees(prev => prev.map(m => m.id === selectedMentee.id ? { ...m, notes: meetingNotes, last_meeting: new Date().toISOString().split('T')[0] } : m));
      setSelectedMentee(null);
      setMeetingNotes('');
    } catch (err) {
      alert('Failed to log meeting');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMentees = mentees.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.enrollment_number.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'ON_TRACK') return m.attendance_status === 'On Track';
    if (filter === 'AT_RISK') return m.attendance_status === 'At Risk';
    return true;
  });

  const atRiskCount = mentees.filter(m => m.attendance_status === 'At Risk').length;
  const onTrackCount = mentees.filter(m => m.attendance_status === 'On Track').length;

  return (
    <div className="space-y-6">
      {/* Top Academic Context Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200/60 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Faculty Mentorship & Proctoring System
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Student Proctoring & Mentee Hub
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Monitor attendance compliance, academic progress, and counseling records for your assigned student mentees.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center min-w-[90px]">
              <span className="block text-2xl font-black text-slate-900">{mentees.length}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mentees</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-center min-w-[90px]">
              <span className="block text-2xl font-black text-emerald-700">{onTrackCount}</span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">On Track</span>
            </div>
            <div className={`border rounded-xl px-4 py-3 text-center min-w-[90px] ${
              atRiskCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <span className="block text-2xl font-black">{atRiskCount}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">At Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span>✓ {toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-emerald-500">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search mentees by name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Mentees ({mentees.length})
          </button>
          <button
            onClick={() => setFilter('ON_TRACK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'ON_TRACK' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Compliant ({onTrackCount})
          </button>
          <button
            onClick={() => setFilter('AT_RISK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'AT_RISK' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Shortage Risk ({atRiskCount})
          </button>
        </div>
      </div>

      {/* Mentees Grid */}
      {loading ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-600">Loading Assigned Department Mentees...</p>
        </div>
      ) : filteredMentees.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No Mentees Match Filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMentees.map(mentee => (
            <div 
              key={mentee.id}
              className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between ${
                mentee.attendance_status === 'At Risk' ? 'border-rose-300' : 'border-slate-200'
              }`}
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-900 text-base">{mentee.name}</h3>
                    <p className="font-mono text-xs text-indigo-700 font-bold">{mentee.enrollment_number}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{mentee.program} • Sem {mentee.semester}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    mentee.attendance_status === 'On Track' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                  }`}>
                    {mentee.attendance_status}
                  </span>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">CGPA</span>
                    <span className="font-black text-slate-800 text-sm">{mentee.cgpa.toFixed(2)}</span>
                  </div>
                  <div className={`rounded-xl p-2.5 border ${
                    mentee.attendance_percentage >= 75 ? 'bg-slate-50 border-slate-100' : 'bg-rose-50 border-rose-200'
                  }`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Attend.</span>
                    <span className={`font-black text-sm ${
                      mentee.attendance_percentage >= 75 ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {mentee.attendance_percentage}%
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Fees</span>
                    <span className="font-black text-slate-800 text-xs">{mentee.fee_status}</span>
                  </div>
                </div>

                {/* Mentor Advising Notes */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Advising Note</span>
                    <span>Last Met: {mentee.last_meeting}</span>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {mentee.notes}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-mono truncate">{mentee.email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMentee(mentee);
                    setMeetingNotes(mentee.notes || '');
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Log Advising</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOG MEETING MODAL */}
      {selectedMentee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Log Mentoring Consultation</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedMentee.name} ({selectedMentee.enrollment_number})</p>
              </div>
              <button onClick={() => setSelectedMentee(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleLogMeeting} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Advising Discussion Topic</label>
                <input
                  type="text"
                  required
                  value={meetingTopic}
                  onChange={(e) => setMeetingTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Counseling Notes & Action Items</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record guidance, recommended tutorial classes, attendance targets, or career direction..."
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMentee(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5"
                >
                  {submitting ? 'Saving...' : 'Save & Dispatch Alert to Mentee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
