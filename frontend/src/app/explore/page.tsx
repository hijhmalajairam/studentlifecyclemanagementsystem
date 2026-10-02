import Link from 'next/link';

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans">
      <nav className="w-full px-6 md:px-12 py-6 flex justify-between items-center border-b border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-black text-xl">V</span>
          </div>
          <span className="text-[var(--text-primary)] font-black text-xl tracking-tight">Veritas Grove</span>
        </Link>
        <Link href="/login" className="px-5 py-2 text-sm font-bold bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl hover:scale-105 transition-transform shadow-lg">
          Sign In
        </Link>
      </nav>
      
      <div className="max-w-4xl mx-auto py-20 px-6 text-center">
        <h1 className="text-5xl font-black text-[var(--text-primary)] mb-6">Explore the Campus</h1>
        <p className="text-xl text-[var(--text-secondary)] mb-12">
          (Content for the explore page will be placed here soon, as requested by the Admin.)
        </p>
        
        <Link href="/" className="px-8 py-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] font-bold rounded-2xl hover:bg-[var(--glass-hover)] backdrop-blur-md transition-colors shadow-lg">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
