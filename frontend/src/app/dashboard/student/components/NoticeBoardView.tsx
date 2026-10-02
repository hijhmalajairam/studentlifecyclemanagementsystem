import React from 'react';

const noticeItems = [
  {
    id: 1,
    category: 'Academic',
    title: 'Mid-semester registration opens on Monday',
    description:
      'Students should complete course selection, verify credit limits, and confirm advisor approvals before the registration window closes.',
    meta: 'Today · 08:15 AM',
    audience: 'All students',
    priority: 'High',
  },
  {
    id: 2,
    category: 'Examination',
    title: 'Internal assessment schedule released',
    description:
      'The updated assessment calendar includes room assignments, invigilation notes, and submission deadlines for all ongoing modules.',
    meta: 'Yesterday · 06:40 PM',
    audience: 'Years 2-4',
    priority: 'Important',
  },
  {
    id: 3,
    category: 'Administrative',
    title: 'ID card revalidation and document check',
    description:
      'Students with pending document verification must visit the academic office with a recent photograph and university ID by Friday.',
    meta: '3 days ago',
    audience: 'Pending verification',
    priority: 'Reminder',
  },
];

export default function NoticeBoardView() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-700 via-blue-600 to-sky-500"></div>
        <div className="absolute -left-20 -top-12 h-40 w-40 rounded-full bg-blue-100/70 blur-2xl"></div>
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
                <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                Notice Board
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Latest updates for your academic timeline</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Notices are grouped by academic, examination, and administrative relevance so students can quickly scan what needs action today.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:min-w-[20rem]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-semibold text-slate-900">{noticeItems.length}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Active notices</p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center">
                <p className="text-2xl font-semibold text-blue-700">2</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700/80">High priority</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="text-2xl font-semibold text-emerald-700">24h</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700/80">Average update window</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-4">
              {noticeItems.map((notice) => (
                <article key={notice.id} className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">{notice.category}</span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">{notice.audience}</span>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${notice.priority === 'High' ? 'bg-rose-50 text-rose-700' : notice.priority === 'Important' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                          {notice.priority}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-slate-900">{notice.title}</h3>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{notice.description}</p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Updated</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{notice.meta}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      Action required within the current academic window
                    </div>
                    <button className="inline-flex items-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100">
                      View details
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">Quick glance</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">What needs attention</h3>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Today</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">Registration and assessment updates</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Review deadlines, confirm approvals, and check course submission windows before the day ends.</p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Exam notice</p>
                  <p className="mt-2 text-sm font-semibold text-blue-900">Hall ticket release is pending</p>
                  <p className="mt-1 text-sm leading-6 text-blue-800/90">Your hall ticket panel now shows the release timeline and a printable preview area.</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Support</p>
                  <p className="mt-2 text-sm font-semibold text-emerald-900">Academic office hours</p>
                  <p className="mt-1 text-sm leading-6 text-emerald-800/90">Visit the student helpdesk for verification, revalidation, and exam-related assistance.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
