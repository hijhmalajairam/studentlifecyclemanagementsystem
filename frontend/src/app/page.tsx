'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const quotes = [
    { text: "Education is not the learning of facts, but the training of the mind to think.", author: "Albert Einstein" },
    { text: "The function of education is to teach one to think intensively and to think critically.", author: "Martin Luther King Jr." },
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.", author: "Malcolm X" },
    { text: "Change is the end result of all true learning.", author: "Leo Buscaglia" },
    { text: "Learning is not attained by chance, it must be sought for with ardor and attended to with diligence.", author: "Abigail Adams" },
    { text: "Develop a passion for learning. If you do, you will never cease to grow.", author: "Anthony J. D'Angelo" }
  ];

  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans selection:bg-indigo-500/30">
      
      {/* Navbar */}
      <nav className="absolute top-0 w-full z-50 px-6 md:px-12 py-6 flex justify-between items-center bg-transparent">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-black text-xl">V</span>
          </div>
          <span className="text-[var(--text-primary)] font-black text-xl tracking-tight">Veritas Grove</span>
        </div>
        
        <div className="flex space-x-4">
          <Link href="/login" className="px-5 py-2 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--glass-hover)] rounded-xl transition-all">Sign In</Link>
          <Link href="/register" className="px-5 py-2 text-sm font-bold bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl hover:scale-105 transition-transform shadow-lg">Apply Now</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center text-center px-4">
        <div 
          className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/graduation-bg.jpg')" }}
        ></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-[var(--bg-primary)] opacity-90"></div>
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 font-bold tracking-widest text-xs uppercase backdrop-blur-md">
            Next Generation Campus ERP
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-[var(--text-primary)] tracking-tighter leading-[1.1]">
            Academic excellence,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
              seamlessly managed.
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto font-medium">
            Veritas Grove brings students, faculty, and administration together in one powerful, unified ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/explore" className="px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] font-black rounded-2xl hover:scale-[1.02] transition-transform shadow-2xl flex items-center justify-center">
              Explore
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
            <Link href="/catalog" className="px-8 py-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] font-bold rounded-2xl hover:bg-[var(--glass-hover)] backdrop-blur-md transition-colors shadow-lg">
              What Programs We Offer
            </Link>
          </div>
        </div>

        {/* Quote Block / Blank Space replacement */}
        <div className="relative z-10 w-full max-w-4xl mt-32 mb-16 px-6">
          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-10 md:p-16 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-600"></div>
            <svg className="w-16 h-16 text-indigo-500/20 absolute top-8 left-8" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
            <blockquote className="relative z-10 text-2xl md:text-3xl font-medium text-[var(--text-primary)] leading-snug italic text-left pl-12 transition-opacity duration-500 ease-in-out min-h-[120px]">
              "{quotes[quoteIndex].text}"
            </blockquote>
            <p className="relative z-10 mt-6 text-left pl-12 font-bold text-indigo-500 uppercase tracking-widest text-sm transition-opacity duration-500">— {quotes[quoteIndex].author}</p>
            
            {/* Sliding Progress Indicator */}
            <div className="absolute bottom-0 left-0 h-1 bg-indigo-500/20 w-full">
              <div className="h-full bg-indigo-500 animate-slide-progress" key={quoteIndex}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-2">15k+</div>
            <div className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Active Students</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-2">120+</div>
            <div className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Programs</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-2">98%</div>
            <div className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Placement Rate</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-2">24/7</div>
            <div className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Digital Access</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-6">Everything you need. <br/>In one place.</h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">From admissions to alumni relations, our unified platform streamlines every aspect of the university lifecycle.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Smart Admissions", desc: "Fully digital application process with real-time tracking, document verification, and automated seat allocation.", icon: "🎓" },
            { title: "Academic Core", desc: "Comprehensive timetable management, real-time attendance tracking, and secure grade entry systems.", icon: "📚" },
            { title: "Role-Based Security", desc: "Granular access control ensuring students, faculty, and admins only see what they need to see.", icon: "🔒" },
            { title: "Financial Hub", desc: "Integrated fee management, automated reminders, and instant digital receipts for all transactions.", icon: "💳" },
            { title: "Hostel & Transport", desc: "Seamless allocation of accommodation and campus transport with interactive route planning.", icon: "🚌" },
            { title: "Career Services", desc: "Built-in placement portal connecting students with top recruiters and managing interview schedules.", icon: "💼" }
          ].map((feature, i) => (
            <div key={i} className="bg-[var(--card-bg)] border border-[var(--glass-border)] p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <div className="text-4xl mb-6">{feature.icon}</div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-5xl font-black text-[var(--text-primary)] mb-8">Ready to begin?</h2>
          <p className="text-xl text-[var(--text-secondary)] mb-12">Join thousands of students and faculty already experiencing the future of education management.</p>
          <Link href="/register" className="px-10 py-5 bg-[var(--text-primary)] text-[var(--bg-primary)] font-black rounded-2xl hover:scale-105 transition-transform shadow-2xl text-lg">
            Start Your Journey Today
          </Link>
        </div>
      </section>
    </div>
  );
}
