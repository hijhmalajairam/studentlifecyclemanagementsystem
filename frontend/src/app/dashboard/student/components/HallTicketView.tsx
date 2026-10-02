import React from 'react';

const hallTicketDetails = [
  { label: 'Exam session', value: 'End Semester · November 2026' },
  { label: 'Programme', value: 'B.Sc. Computer Science' },
  { label: 'Hall ticket status', value: 'Not yet released' },
  { label: 'Expected release', value: '14 days before the first paper' },
];

const hallTicketChecklist = [
  'Verify your name, registration number, and course codes once the ticket is live.',
  'Carry a university ID card and a government photo ID to the exam centre.',
  'Reach the venue at least 30 minutes before reporting time.',
  'Keep a printed copy and a mobile backup of the hall ticket.',
];

interface HallTicketViewProps {
  user: any;
}

export default function HallTicketView({ user }: HallTicketViewProps) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400"></div>
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100/60 blur-2xl"></div>
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                Hall Ticket Center
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">End Semester Hall Ticket</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Your hall ticket area is ready for the release window. Once the Controller of Examinations publishes the document, this panel will surface the download, print, and verification actions.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Secure document workflow</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">Mobile and print ready</span>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Student portal preview</span>
              </div>
            </div>

            <div className="grid min-w-0 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:w-[24rem]">
              {hallTicketDetails.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold leading-5 text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_25%,#ffffff_100%)] p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-200 pb-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-700">Exam admission preview</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">Student identity and verification block</h3>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Pending release</span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Student</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{user?.first_name} {user?.last_name}</p>
                  <p className="mt-1 text-sm text-slate-500">Registration number will appear here</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Exam hall ticket number</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">TBA</p>
                  <p className="mt-1 text-sm text-slate-500">Available after exam office publication</p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Release progress</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">Preparing for final verification and signature</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Expected</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">14 days before the first paper</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400"></div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button onClick={() => window.print()} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">
                  Download PDF
                </button>
                <button onClick={() => window.print()} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700">
                  Print Preview
                </button>
                <button className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900">
                  Exam Schedule
                </button>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-700">Important instructions</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">Before you download or print</h3>
              </div>

              <div className="space-y-3">
                {hallTicketChecklist.map((item, index) => (
                  <div key={item} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">0{index + 1}</div>
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">Need help after release?</p>
                <p className="mt-1 text-sm leading-6 text-blue-800/90">
                  Contact the examination office if your name, programme, or photo is incorrect once the ticket becomes available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
