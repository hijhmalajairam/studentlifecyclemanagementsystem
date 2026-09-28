'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ClipboardPlus,
  Clock3,
  Computer,
  Landmark,
  Send,
  Wrench,
} from 'lucide-react';

type Category = 'IT' | 'Maintenance' | 'Academics' | 'Finance';
type TicketStatus = 'Open' | 'In Progress' | 'Resolved';

interface Ticket {
  id: string;
  category: Category;
  subject: string;
  details: string;
  status: TicketStatus;
  submittedAt: string;
  updatedAt: string;
}

const initialTickets: Ticket[] = [
  {
    id: 'GR-1042',
    category: 'IT',
    subject: 'Unable to access the student Wi-Fi',
    details: 'My registered device is not connecting to the campus network in the library.',
    status: 'Open',
    submittedAt: 'Today, 9:42 AM',
    updatedAt: 'Awaiting assignment',
  },
  {
    id: 'GR-1038',
    category: 'Academics',
    subject: 'Elective not visible in course registration',
    details: 'The Data Visualisation elective does not appear in my registration portal.',
    status: 'In Progress',
    submittedAt: 'Yesterday',
    updatedAt: 'Updated 35 min ago',
  },
  {
    id: 'GR-1027',
    category: 'Maintenance',
    subject: 'Study area light needs replacement',
    details: 'The light above desk 14 in the residence study room is not working.',
    status: 'In Progress',
    submittedAt: '18 Oct',
    updatedAt: 'Technician assigned',
  },
  {
    id: 'GR-1019',
    category: 'Finance',
    subject: 'Receipt needed for tuition payment',
    details: 'Please share the official receipt for my latest semester tuition payment.',
    status: 'Resolved',
    submittedAt: '14 Oct',
    updatedAt: 'Resolved 16 Oct',
  },
  {
    id: 'GR-1006',
    category: 'Maintenance',
    subject: 'Water cooler service request',
    details: 'The water cooler outside Block C has not been cooling water properly.',
    status: 'Resolved',
    submittedAt: '08 Oct',
    updatedAt: 'Resolved 10 Oct',
  },
];

const categoryConfig: Record<Category, { icon: typeof Computer; className: string }> = {
  IT: { icon: Computer, className: 'bg-indigo-50 text-indigo-700 ring-indigo-100' },
  Maintenance: { icon: Wrench, className: 'bg-amber-50 text-amber-700 ring-amber-100' },
  Academics: { icon: BookOpen, className: 'bg-violet-50 text-violet-700 ring-violet-100' },
  Finance: { icon: Landmark, className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
};

const columns: Array<{ status: TicketStatus; icon: typeof CircleDot; accent: string; helper: string }> = [
  { status: 'Open', icon: CircleDot, accent: 'text-amber-500 bg-amber-50 border-amber-100', helper: 'Newly raised requests' },
  { status: 'In Progress', icon: Clock3, accent: 'text-indigo-600 bg-indigo-50 border-indigo-100', helper: 'Being handled by the team' },
  { status: 'Resolved', icon: CheckCircle2, accent: 'text-emerald-600 bg-emerald-50 border-emerald-100', helper: 'Completed requests' },
];

export default function GrievanceTab() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [form, setForm] = useState<{ category: Category; subject: string; details: string }>({
    category: 'IT',
    subject: '',
    details: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const ticketGroups = useMemo(() => columns.map((column) => ({
    ...column,
    tickets: tickets.filter((ticket) => ticket.status === column.status),
  })), [tickets]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.subject.trim() || !form.details.trim()) return;

    const nextId = `GR-${1043 + tickets.length}`;
    setTickets((current) => [{
      id: nextId,
      category: form.category,
      subject: form.subject.trim(),
      details: form.details.trim(),
      status: 'Open',
      submittedAt: 'Just now',
      updatedAt: 'Awaiting assignment',
    }, ...current]);
    setForm({ category: 'IT', subject: '', details: '' });
    setShowSuccess(true);
  };

  return (
    <div className="space-y-8 text-slate-900">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative overflow-hidden bg-slate-950 px-6 py-8 text-white sm:px-8">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-indigo-500/25 blur-3xl" />
            <div className="absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-indigo-400/15 blur-3xl" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15"><ClipboardPlus size={23} /></div>
              <p className="mt-8 text-sm font-semibold text-indigo-200">Student helpdesk</p>
              <h1 className="mt-2 max-w-sm text-3xl font-bold tracking-tight">How can we help today?</h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">Raise a ticket for the right team and follow every update from one place.</p>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { label: 'Total', value: tickets.length },
                  { label: 'Active', value: tickets.filter((ticket) => ticket.status !== 'Resolved').length },
                  { label: 'Resolved', value: tickets.filter((ticket) => ticket.status === 'Resolved').length },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="mt-1 text-[11px] font-medium text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Raise a new ticket</h2>
                <p className="mt-1 text-sm text-slate-500">Describe the issue and we’ll route it to the right team.</p>
              </div>
              <span className="hidden rounded-xl bg-indigo-50 p-2.5 text-indigo-600 sm:block"><Send size={19} /></span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold text-slate-700">
                Category
                <span className="relative mt-2 block">
                  <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as Category }))} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50">
                    <option value="IT">IT support</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Academics">Academics</option>
                    <option value="Finance">Finance</option>
                  </select>
                  <ChevronDown size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </span>
              </label>
              <label className="block text-sm font-bold text-slate-700">
                Subject
                <input required value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} placeholder="Briefly describe your issue" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50" />
              </label>
            </div>
            <label className="mt-4 block text-sm font-bold text-slate-700">
              Details
              <textarea required value={form.details} onChange={(event) => setForm((current) => ({ ...current, details: event.target.value }))} rows={4} placeholder="Include any useful details, such as a location, error message, or relevant date." className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50" />
            </label>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {showSuccess ? <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600"><BadgeCheck size={17} /> Ticket created successfully</p> : <p className="text-xs leading-5 text-slate-500">You’ll see updates here as your ticket progresses.</p>}
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100">Submit ticket <ArrowRight size={17} /></button>
            </div>
          </form>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">My requests</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Ticket status</h2>
          </div>
          <p className="text-sm text-slate-500">Your most recent support requests.</p>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          {ticketGroups.map((column) => {
            const StatusIcon = column.icon;
            return (
              <div key={column.status} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${column.accent}`}><StatusIcon size={18} /></span>
                    <div><h3 className="text-sm font-bold text-slate-800">{column.status}</h3><p className="text-xs text-slate-500">{column.helper}</p></div>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500 shadow-sm">{column.tickets.length}</span>
                </div>

                <div className="mt-4 space-y-3">
                  {column.tickets.map((ticket) => {
                    const category = categoryConfig[ticket.category];
                    const CategoryIcon = category.icon;
                    return (
                      <article key={ticket.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-start justify-between gap-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${category.className}`}><CategoryIcon size={13} />{ticket.category}</span>
                          <span className="font-mono text-[11px] font-semibold text-slate-400">{ticket.id}</span>
                        </div>
                        <h4 className="mt-3 text-sm font-bold leading-5 text-slate-800">{ticket.subject}</h4>
                        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">{ticket.details}</p>
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-400"><span>{ticket.submittedAt}</span><span className={column.status === 'Resolved' ? 'text-emerald-600' : 'text-slate-500'}>{ticket.updatedAt}</span></div>
                      </article>
                    );
                  })}
                  {column.tickets.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-8 text-center text-xs text-slate-400">No {column.status.toLowerCase()} tickets.</div>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
