'use client';

import { useMemo, useState } from 'react';
import {
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  CookingPot,
  MoreHorizontal,
  Search,
  Users,
  Wrench,
} from 'lucide-react';

type ComplaintStatus = 'Open' | 'In progress' | 'Resolved';

interface RoomAllotment {
  id: number;
  student: string;
  initials: string;
  course: string;
  room: string;
  block: string;
  floor: string;
}

interface MessDay {
  day: string;
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

interface Complaint {
  id: string;
  title: string;
  detail: string;
  student: string;
  location: string;
  category: string;
  submitted: string;
  status: ComplaintStatus;
}

const roomAllotments: RoomAllotment[] = [
  { id: 1, student: 'Aarav Mehta', initials: 'AM', course: 'B.Tech CSE · Year 3', room: 'A-204', block: 'Aravali Block', floor: 'Second floor' },
  { id: 2, student: 'Diya Nair', initials: 'DN', course: 'BBA · Year 2', room: 'B-118', block: 'Brahmaputra Block', floor: 'First floor' },
  { id: 3, student: 'Rohan Kapoor', initials: 'RK', course: 'B.Tech ECE · Year 4', room: 'C-312', block: 'Cauvery Block', floor: 'Third floor' },
  { id: 4, student: 'Ishita Sharma', initials: 'IS', course: 'B.Sc DS · Year 1', room: 'A-107', block: 'Aravali Block', floor: 'First floor' },
  { id: 5, student: 'Kabir Singh', initials: 'KS', course: 'MBA · Year 1', room: 'D-221', block: 'Dhaulagiri Block', floor: 'Second floor' },
];

const messMenu: MessDay[] = [
  { day: 'Monday', date: '14 Oct', breakfast: 'Poha, fruit & milk', lunch: 'Rajma, rice & salad', dinner: 'Paneer masala & roti' },
  { day: 'Tuesday', date: '15 Oct', breakfast: 'Idli, sambar & fruit', lunch: 'Chole, kulcha & raita', dinner: 'Vegetable pulao & dal' },
  { day: 'Wednesday', date: '16 Oct', breakfast: 'Aloo paratha & curd', lunch: 'Kadhi, rice & bhindi', dinner: 'Hakka noodles & soup' },
  { day: 'Thursday', date: '17 Oct', breakfast: 'Upma, chutney & milk', lunch: 'Dal makhani & jeera rice', dinner: 'Kofta curry & roti' },
  { day: 'Friday', date: '18 Oct', breakfast: 'Dosa, sambar & fruit', lunch: 'Sambar, rice & poriyal', dinner: 'Veg biryani & raita' },
  { day: 'Saturday', date: '19 Oct', breakfast: 'Chole bhature & lassi', lunch: 'Mixed veg, dal & roti', dinner: 'Pasta, garlic bread & salad' },
  { day: 'Sunday', date: '20 Oct', breakfast: 'Pancakes, eggs & fruit', lunch: 'Special thali & dessert', dinner: 'Light khichdi & curd' },
];

const initialComplaints: Complaint[] = [
  { id: 'MR-2048', title: 'Ceiling fan making noise', detail: 'Fan vibrates loudly at speed three and above.', student: 'Aarav Mehta', location: 'Aravali Block · A-204', category: 'Electrical', submitted: '18 min ago', status: 'Open' },
  { id: 'MR-2041', title: 'Washroom tap leaking', detail: 'Continuous leakage from the common washroom tap.', student: 'Diya Nair', location: 'Brahmaputra Block · B-118', category: 'Plumbing', submitted: '2 hrs ago', status: 'In progress' },
  { id: 'MR-2035', title: 'Study lamp replacement', detail: 'The desk lamp stopped working after a power fluctuation.', student: 'Rohan Kapoor', location: 'Cauvery Block · C-312', category: 'Electrical', submitted: 'Yesterday', status: 'Resolved' },
];

const statusStyles: Record<ComplaintStatus, string> = {
  Open: 'bg-amber-50 text-amber-700 ring-amber-200',
  'In progress': 'bg-sky-50 text-sky-700 ring-sky-200',
  Resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export default function HostelTab() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [complaintFilter, setComplaintFilter] = useState<'All' | ComplaintStatus>('All');
  const [complaints, setComplaints] = useState(initialComplaints);

  const filteredComplaints = useMemo(
    () => complaintFilter === 'All' ? complaints : complaints.filter((complaint) => complaint.status === complaintFilter),
    [complaintFilter, complaints],
  );

  const moveComplaintForward = (id: string) => {
    setComplaints((current) => current.map((complaint) => {
      if (complaint.id !== id || complaint.status === 'Resolved') return complaint;
      return { ...complaint, status: complaint.status === 'Open' ? 'In progress' : 'Resolved' };
    }));
  };

  const activeMenu = messMenu[selectedDay];
  const openRequests = complaints.filter((complaint) => complaint.status !== 'Resolved').length;

  return (
    <div className="space-y-8 text-slate-900">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-100 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-md bg-slate-900 p-3 text-white shadow-lg shadow-slate-200">
              <BedDouble size={23} strokeWidth={2.25} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Residential life</p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight">Room Allotment</h2>
              <p className="mt-1 text-sm text-slate-500">Current resident assignments across all hostel blocks.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <Users size={18} className="text-slate-500" />
            <span className="font-bold text-slate-900">482</span>
            <span className="text-slate-500">students accommodated</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              <tr>
                <th className="px-6 py-4 sm:px-8">Student</th>
                <th className="px-6 py-4">Room number</th>
                <th className="px-6 py-4">Hostel block</th>
                <th className="px-6 py-4">Floor</th>
                <th className="px-6 py-4 text-right sm:px-8">&nbsp;</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roomAllotments.map((allotment) => (
                <tr key={allotment.id} className="group transition-colors hover:bg-slate-50/80">
                  <td className="px-6 py-4 sm:px-8">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{allotment.initials}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{allotment.student}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{allotment.course}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="rounded bg-slate-100 px-3 py-1.5 font-mono text-sm font-bold text-slate-700">{allotment.room}</span></td>
                  <td className="px-6 py-4"><span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700"><Building2 size={16} className="text-slate-400" />{allotment.block}</span></td>
                  <td className="px-6 py-4 text-sm text-slate-500">{allotment.floor}</td>
                  <td className="px-6 py-4 text-right sm:px-8"><button type="button" aria-label={`View ${allotment.student}'s allotment`} className="rounded p-2 text-slate-400 transition hover:bg-white hover:text-slate-900 hover:shadow-sm"><ChevronRight size={19} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-100 px-6 py-6 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-md bg-slate-100 p-3 text-slate-700"><CookingPot size={23} strokeWidth={2.25} /></div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Dining services</p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight">Mess Menu</h2>
              <p className="mt-1 text-sm text-slate-500">Weekly menu for the central hostel mess.</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"><CalendarDays size={15} /> 14–20 October</span>
        </div>

        <div className="border-b border-slate-100 px-4 py-3 sm:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {messMenu.map((menu, index) => (
              <button key={menu.day} type="button" onClick={() => setSelectedDay(index)} className={`min-w-20 rounded-md px-4 py-2.5 text-left transition ${selectedDay === index ? 'bg-slate-900 text-white shadow-md shadow-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
                <span className="block text-xs font-bold">{menu.day.slice(0, 3)}</span>
                <span className={`mt-0.5 block text-[11px] ${selectedDay === index ? 'text-slate-300' : 'text-slate-400'}`}>{menu.date}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
          {[
            { label: 'Breakfast', time: '7:30 – 9:30 AM', meal: activeMenu.breakfast, icon: '☀' },
            { label: 'Lunch', time: '12:30 – 2:30 PM', meal: activeMenu.lunch, icon: '◐' },
            { label: 'Dinner', time: '7:30 – 9:30 PM', meal: activeMenu.dinner, icon: '☾' },
          ].map((service) => (
            <article key={service.label} className="rounded-lg border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-center justify-between"><span className="text-lg text-slate-500">{service.icon}</span><span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{service.time}</span></div>
              <h3 className="mt-7 text-sm font-bold text-slate-500">{service.label}</h3>
              <p className="mt-2 text-base font-semibold leading-6 text-slate-800">{service.meal}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-100 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-md bg-amber-50 p-3 text-amber-700"><Wrench size={23} strokeWidth={2.25} /></div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Support desk</p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight">Complaints &amp; Maintenance</h2>
              <p className="mt-1 text-sm text-slate-500">Track hostel requests and keep residents informed.</p>
            </div>
          </div>
          <div className="flex w-full gap-2 overflow-x-auto lg:w-auto">
            {(['All', 'Open', 'In progress', 'Resolved'] as const).map((filter) => (
              <button key={filter} type="button" onClick={() => setComplaintFilter(filter)} className={`whitespace-nowrap rounded px-3.5 py-2 text-xs font-bold transition ${complaintFilter === filter ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{filter}</button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-4 sm:grid-cols-3 sm:px-8">
          <div className="flex items-center gap-3 text-sm"><span className="rounded bg-amber-100 p-2 text-amber-700"><CircleAlert size={17} /></span><span className="text-slate-500">Active requests</span><span className="ml-auto font-bold text-slate-800">{openRequests}</span></div>
          <div className="flex items-center gap-3 text-sm"><span className="rounded bg-sky-100 p-2 text-sky-700"><Clock3 size={17} /></span><span className="text-slate-500">Avg. response</span><span className="ml-auto font-bold text-slate-800">2.4 hrs</span></div>
          <div className="flex items-center gap-3 text-sm"><span className="rounded bg-emerald-100 p-2 text-emerald-700"><CheckCircle2 size={17} /></span><span className="text-slate-500">Resolved this week</span><span className="ml-auto font-bold text-slate-800">18</span></div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredComplaints.map((complaint) => (
            <article key={complaint.id} className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-slate-50/70 sm:px-8 lg:flex-row lg:items-center">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div className="mt-0.5 rounded-md bg-slate-100 p-2.5 text-slate-600"><Wrench size={19} /></div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-800">{complaint.title}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${statusStyles[complaint.status]}`}>{complaint.status}</span></div>
                  <p className="mt-1 text-sm text-slate-500">{complaint.detail}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500"><span className="font-semibold text-slate-600">{complaint.id}</span><span>{complaint.student}</span><span>{complaint.location}</span><span>{complaint.submitted}</span></div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end lg:self-auto">
                <span className="hidden rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 sm:inline">{complaint.category}</span>
                {complaint.status !== 'Resolved' && <button type="button" onClick={() => moveComplaintForward(complaint.id)} className="rounded border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">{complaint.status === 'Open' ? 'Start work' : 'Mark resolved'}</button>}
                <button type="button" aria-label={`More options for ${complaint.id}`} className="rounded p-2 text-slate-400 hover:bg-white hover:text-slate-800"><MoreHorizontal size={20} /></button>
              </div>
            </article>
          ))}
          {filteredComplaints.length === 0 && <div className="px-6 py-14 text-center text-sm text-slate-500"><Search size={22} className="mx-auto mb-3 text-slate-300" />No maintenance requests match this filter.</div>}
        </div>
      </section>
    </div>
  );
}
