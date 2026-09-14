import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden transition-colors duration-500">
      
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-600/10 to-transparent"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px] opacity-20 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-purple-500 rounded-full blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-cyan-500 rounded-full blur-[150px] opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-4xl space-y-10">
        <div className="inline-block px-5 py-2 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-blue-500 font-bold tracking-widest text-xs uppercase shadow-xl backdrop-blur-md">
          ✨ Veritas Grove University ERP
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
          Manage your academic journey with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            perfect clarity.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-medium">
          Experience the future of campus management. A unified, intelligent, and beautifully designed portal for students, faculty, and administrators.
        </p>

        {/* Dashboard Preview Glass Card */}
        <div className="hidden md:block w-full h-48 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl mt-12 mb-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="flex p-4 gap-4 h-full opacity-60 group-hover:opacity-100 transition-opacity duration-500">
            <div className="w-1/4 h-full bg-[var(--card-bg)] rounded-2xl border border-[var(--glass-border)] flex flex-col p-4 gap-3">
              <div className="w-1/2 h-3 bg-[var(--text-tertiary)] rounded-full"></div>
              <div className="w-3/4 h-3 bg-[var(--text-tertiary)] rounded-full"></div>
              <div className="w-full h-3 bg-[var(--text-tertiary)] rounded-full"></div>
            </div>
            <div className="w-3/4 flex flex-col gap-4">
              <div className="w-full h-1/3 bg-blue-500/10 rounded-2xl border border-blue-500/20"></div>
              <div className="flex gap-4 h-2/3">
                <div className="w-1/2 h-full bg-[var(--card-bg)] rounded-2xl border border-[var(--glass-border)]"></div>
                <div className="w-1/2 h-full bg-[var(--card-bg)] rounded-2xl border border-[var(--glass-border)]"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
          <Link href="/login" className="group relative px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] font-black rounded-2xl hover:scale-[1.03] active:scale-[0.97] transition-all overflow-hidden shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center justify-center group-hover:text-white transition-colors duration-300">
              Access Portal 
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </span>
          </Link>
          <Link href="/register" className="px-8 py-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] font-bold rounded-2xl hover:bg-[var(--glass-hover)] backdrop-blur-md transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]">
            Apply for Admission
          </Link>
        </div>
      </div>
    </div>
  );
}
