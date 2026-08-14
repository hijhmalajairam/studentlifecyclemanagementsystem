import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      <div className="relative z-10 max-w-3xl space-y-8">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-semibold tracking-wide uppercase border border-blue-500/20">
          University ERP System
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Welcome to the{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Unified Student Portal
          </span>
        </h1>
        <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
          From admission enquiry to your final alumni transition, manage your entire academic journey in one seamless, connected system.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/register" className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
            Apply Now
          </Link>
          <Link href="/login" className="px-8 py-3.5 bg-slate-800 text-slate-200 font-semibold rounded-xl border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700 transition shadow-sm">
            Portal Login
          </Link>
        </div>
      </div>
      
      {/* Animated background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
    </div>
  );
}
