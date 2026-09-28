'use client';

import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BadgeCheck,
  BrainCircuit,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Code2,
  Lightbulb,
  MessageSquareText,
  MicVocal,
  ScanSearch,
  Sparkles,
  Target,
  TrendingUp,
  WandSparkles,
} from 'lucide-react';

interface JobDescription {
  id: string;
  company: string;
  role: string;
  location: string;
  score: number;
  matchedSkills: string[];
  weakSkills: string[];
  summary: string;
}

interface InterviewSession {
  id: number;
  role: string;
  date: string;
  duration: string;
  score: number;
  technical: number;
  structure: number;
  confidence: number;
  feedback: string;
  focus: string;
}

const jobDescriptions: JobDescription[] = [
  {
    id: 'frontend-engineer',
    company: 'Orbit Labs',
    role: 'Frontend Engineer Intern',
    location: 'Bengaluru · Hybrid',
    score: 82,
    matchedSkills: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs', 'Git'],
    weakSkills: ['Next.js', 'Unit Testing', 'Performance Optimisation'],
    summary: 'Your experience is strongly aligned with this role. Add one project outcome and deepen your testing story to improve recruiter confidence.',
  },
  {
    id: 'data-analyst',
    company: 'Northstar Analytics',
    role: 'Data Analyst Intern',
    location: 'Mumbai · On-site',
    score: 68,
    matchedSkills: ['Python', 'SQL', 'Data Visualisation'],
    weakSkills: ['Power BI', 'Statistical Modelling', 'A/B Testing'],
    summary: 'You have a good technical foundation. A portfolio dashboard and a quantified analysis project would make this application more competitive.',
  },
  {
    id: 'product-intern',
    company: 'Vertex Cloud',
    role: 'Associate Product Intern',
    location: 'Remote · India',
    score: 74,
    matchedSkills: ['User Research', 'Figma', 'Agile', 'Communication'],
    weakSkills: ['Product Metrics', 'SQL', 'Roadmapping'],
    summary: 'Your collaboration profile is a clear strength. Highlight evidence of user impact and build confidence with product analytics fundamentals.',
  },
];

const interviewSessions: InterviewSession[] = [
  {
    id: 1,
    role: 'Frontend Engineer',
    date: '24 October',
    duration: '22 min',
    score: 86,
    technical: 88,
    structure: 84,
    confidence: 86,
    feedback: 'You explained state management with a clear real-world example. For system questions, lead with assumptions before proposing the solution.',
    focus: 'Practice explaining rendering performance trade-offs.',
  },
  {
    id: 2,
    role: 'Software Engineer',
    date: '20 October',
    duration: '26 min',
    score: 78,
    technical: 81,
    structure: 73,
    confidence: 79,
    feedback: 'Your problem-solving approach was sound. Make the final answer easier to follow by stating complexity and edge cases explicitly.',
    focus: 'Use a concise problem → approach → complexity answer flow.',
  },
  {
    id: 3,
    role: 'Product Analyst',
    date: '14 October',
    duration: '18 min',
    score: 72,
    technical: 68,
    structure: 77,
    confidence: 74,
    feedback: 'You framed user pain points well. Build stronger hypotheses by connecting the proposed metric directly to the business decision.',
    focus: 'Review core product metrics and experiment design.',
  },
];

const scoreColor = (score: number) => score >= 80 ? 'text-emerald-300' : score >= 70 ? 'text-amber-300' : 'text-rose-300';

export default function PlacementPrepTab() {
  const [selectedJobId, setSelectedJobId] = useState(jobDescriptions[0].id);
  const [selectedSessionId, setSelectedSessionId] = useState(interviewSessions[0].id);

  const selectedJob = useMemo(
    () => jobDescriptions.find((job) => job.id === selectedJobId) ?? jobDescriptions[0],
    [selectedJobId],
  );
  const selectedSession = useMemo(
    () => interviewSessions.find((session) => session.id === selectedSessionId) ?? interviewSessions[0],
    [selectedSessionId],
  );

  return (
    <div className="space-y-8 text-slate-900">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-indigo-950/20 sm:px-8 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(99,102,241,0.38),transparent_28%),radial-gradient(circle_at_10%_100%,rgba(14,165,233,0.16),transparent_30%)]" />
        <div className="absolute right-5 top-4 hidden h-64 w-64 rounded-full border border-indigo-300/10 lg:block" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-bold tracking-wide text-indigo-100"><Sparkles size={14} /> AI-powered career lab</span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Placement prep, made personal.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">See how your profile fits the opportunities you want, then build confidence through focused AI interview practice.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3"><p className="text-lg font-bold text-white">82%</p><p className="mt-1 text-[11px] font-medium text-slate-400">Best job match</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3"><p className="text-lg font-bold text-white">3</p><p className="mt-1 text-[11px] font-medium text-slate-400">Mock interviews</p></div>
            <div className="col-span-2 rounded-2xl border border-indigo-300/15 bg-indigo-400/10 px-4 py-3 sm:col-span-1"><p className="text-lg font-bold text-indigo-200">+14</p><p className="mt-1 text-[11px] font-medium text-indigo-200/70">Score growth</p></div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-200"><ScanSearch size={22} /></div>
            <div><p className="text-sm font-semibold text-indigo-600">AI Resume Matcher</p><h2 className="mt-0.5 text-xl font-bold tracking-tight">Find your strongest fit</h2><p className="mt-1 text-sm text-slate-500">Compare your current profile with a job description.</p></div>
          </div>
          <label className="relative block w-full md:w-80">
            <span className="sr-only">Choose a job description</span>
            <select value={selectedJobId} onChange={(event) => setSelectedJobId(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 pr-10 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50">
              {jobDescriptions.map((job) => <option key={job.id} value={job.id}>{job.role} · {job.company}</option>)}
            </select>
            <ChevronDown size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </label>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[250px_1fr]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-700 to-slate-950 p-6 text-white">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-400/40 blur-2xl" />
            <div className="relative">
              <p className="text-sm font-medium text-indigo-100">Match score</p>
              <div className="mt-5 flex items-end gap-2"><span className="text-6xl font-bold tracking-tighter">{selectedJob.score}</span><span className="mb-2 text-xl font-semibold text-indigo-200">%</span></div>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-indigo-200" style={{ width: `${selectedJob.score}%` }} /></div>
              <div className="mt-7 flex items-center gap-2 text-sm text-indigo-100"><TrendingUp size={17} /> Stronger than 76% of matches</div>
              <div className="mt-5 border-t border-white/10 pt-4"><p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Target role</p><p className="mt-1.5 font-bold">{selectedJob.role}</p><p className="mt-1 text-xs text-slate-300">{selectedJob.company} · {selectedJob.location}</p></div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm leading-6 text-slate-600"><span className="mr-2 inline-flex rounded-lg bg-white p-1.5 align-middle text-indigo-600"><WandSparkles size={15} /></span>{selectedJob.summary}</div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-5"><div className="flex items-center gap-2 text-sm font-bold text-slate-800"><span className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600"><Check size={16} /></span> Matched skills</div><div className="mt-4 flex flex-wrap gap-2">{selectedJob.matchedSkills.map((skill) => <span key={skill} className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">{skill}</span>)}</div></div>
              <div className="rounded-2xl border border-slate-200 p-5"><div className="flex items-center gap-2 text-sm font-bold text-slate-800"><span className="rounded-lg bg-amber-50 p-1.5 text-amber-600"><CircleAlert size={16} /></span> Missing / weak skills</div><div className="mt-4 flex flex-wrap gap-2">{selectedJob.weakSkills.map((skill) => <span key={skill} className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-100">{skill}</span>)}</div></div>
            </div>
            <button type="button" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 transition hover:text-indigo-800">View tailored improvement plan <ArrowUpRight size={16} /></button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-xl shadow-slate-950/15">
        <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-6 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4"><div className="rounded-2xl bg-white/10 p-3 text-indigo-200 ring-1 ring-white/10"><MicVocal size={22} /></div><div><p className="text-sm font-semibold text-indigo-300">AI Interview Coach</p><h2 className="mt-0.5 text-xl font-bold tracking-tight">Practice feedback that sticks</h2><p className="mt-1 text-sm text-slate-400">Your mock interview performance, decoded.</p></div></div>
          <button type="button" className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-400"><BrainCircuit size={17} /> Start a practice round</button>
        </div>

        <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Past sessions</p>
            <div className="mt-4 space-y-2">
              {interviewSessions.map((session) => (
                <button key={session.id} type="button" onClick={() => setSelectedSessionId(session.id)} className={`w-full rounded-2xl border p-4 text-left transition ${session.id === selectedSessionId ? 'border-indigo-400/40 bg-indigo-400/15 shadow-lg shadow-indigo-950/20' : 'border-white/5 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'}`}>
                  <div className="flex items-center justify-between gap-3"><span className="font-bold text-slate-100">{session.role}</span><span className={`text-sm font-bold ${scoreColor(session.score)}`}>{session.score}%</span></div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400"><span>{session.date}</span><span className="flex items-center gap-1"><Clock3 size={12} /> {session.duration}</span></div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-indigo-300">{selectedSession.role} simulation</p><h3 className="mt-1 text-2xl font-bold tracking-tight">{selectedSession.score}% interview readiness</h3></div><span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300 ring-1 ring-inset ring-emerald-400/20"><BadgeCheck size={14} /> Feedback ready</span></div>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Technical Accuracy', value: selectedSession.technical, icon: Code2, color: 'bg-cyan-400' },
                { label: 'Answer Structure', value: selectedSession.structure, icon: MessageSquareText, color: 'bg-indigo-400' },
                { label: 'Confidence', value: selectedSession.confidence, icon: Target, color: 'bg-violet-400' },
              ].map((metric) => {
                const MetricIcon = metric.icon;
                return <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><MetricIcon size={18} className="text-slate-400" /><p className="mt-5 text-2xl font-bold">{metric.value}<span className="text-sm text-slate-500">/100</span></p><p className="mt-1 text-xs font-medium text-slate-400">{metric.label}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${metric.color}`} style={{ width: `${metric.value}%` }} /></div></div>;
              })}
            </div>
            <div className="mt-5 rounded-2xl border border-indigo-400/15 bg-indigo-400/10 p-5"><div className="flex items-center gap-2 text-sm font-bold text-indigo-200"><ChartNoAxesCombined size={18} /> Coach&apos;s analysis</div><p className="mt-3 text-sm leading-6 text-slate-300">“{selectedSession.feedback}”</p><div className="mt-4 flex items-start gap-2 border-t border-white/10 pt-4 text-sm text-indigo-200"><Lightbulb size={17} className="mt-0.5 shrink-0 text-amber-300" /><span><strong className="font-bold text-white">Next focus:</strong> {selectedSession.focus}</span></div></div>
          </div>
        </div>
      </section>
    </div>
  );
}
