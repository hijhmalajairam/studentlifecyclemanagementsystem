'use client';

const feedbackSummary = [
  {
    course: 'MATH101 - Calculus I',
    semester: 'Fall 2026',
    responses: 52,
    totalStudents: 58,
    overallRating: 4.3,
    categories: {
      'Teaching Quality': 4.5,
      'Course Content': 4.2,
      'Communication': 4.6,
      'Availability': 4.1,
      'Fairness in Grading': 3.9,
      'Encourages Participation': 4.4,
    },
    comments: [
      { text: 'Professor explains complex concepts very clearly. The visual approach to limits is excellent.', sentiment: 'positive' },
      { text: 'Best math class I have taken. Encourages us to think beyond textbooks.', sentiment: 'positive' },
      { text: 'Sometimes moves too fast through integration techniques. Needs more practice problems.', sentiment: 'neutral' },
      { text: 'Very approachable during office hours and genuinely cares about student understanding.', sentiment: 'positive' },
      { text: 'Grading on the midterm felt a bit strict compared to the difficulty of questions.', sentiment: 'negative' },
    ]
  },
  {
    course: 'MATH201 - Linear Algebra',
    semester: 'Fall 2026',
    responses: 34,
    totalStudents: 38,
    overallRating: 4.6,
    categories: {
      'Teaching Quality': 4.7,
      'Course Content': 4.5,
      'Communication': 4.8,
      'Availability': 4.3,
      'Fairness in Grading': 4.5,
      'Encourages Participation': 4.6,
    },
    comments: [
      { text: 'Incredible depth of knowledge. Makes linear algebra feel intuitive and applicable.', sentiment: 'positive' },
      { text: 'The real-world applications of eigenvalues were fascinating. Best lecture series.', sentiment: 'positive' },
      { text: 'Would appreciate more coding-based assignments to complement theory.', sentiment: 'neutral' },
      { text: 'Always available and responsive. A true mentor figure beyond just a lecturer.', sentiment: 'positive' },
    ]
  },
];

const historicalRatings = [
  { semester: 'Spring 2025', rating: 4.1 },
  { semester: 'Fall 2025', rating: 4.2 },
  { semester: 'Spring 2026', rating: 4.4 },
  { semester: 'Fall 2026', rating: 4.45 },
];

export default function FacultyFeedbackTab() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Student Feedback</h2>
          <p className="text-sm text-slate-500 mt-1">Anonymous feedback collected at end of each semester</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-center">
            <p className="text-[10px] font-bold text-blue-500 uppercase">Overall Rating</p>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-2xl font-black text-blue-700">4.45</span>
              <span className="text-blue-400 text-sm">/5.0</span>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 text-center">
            <p className="text-[10px] font-bold text-emerald-500 uppercase">Trend</p>
            <p className="text-2xl font-black text-emerald-700">📈 +8.5%</p>
          </div>
        </div>
      </div>

      {/* Rating Trend */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Rating Trend Over Semesters</h3>
        <div className="flex items-end space-x-6 h-32">
          {historicalRatings.map((h, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <p className="text-xs font-bold text-slate-800 mb-1">{h.rating}</p>
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all"
                style={{ height: `${(h.rating / 5) * 100}%` }}
              />
              <p className="text-[10px] font-bold text-slate-400 mt-2 text-center">{h.semester}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Course Feedback */}
      {feedbackSummary.map((fb, fi) => (
        <div key={fi} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">{fb.course}</h3>
              <p className="text-xs text-slate-400">{fb.semester} • {fb.responses}/{fb.totalStudents} responses</p>
            </div>
            <div className="flex items-center space-x-1">
              {[1,2,3,4,5].map(star => (
                <span key={star} className={`text-lg ${star <= Math.round(fb.overallRating) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
              ))}
              <span className="ml-2 text-lg font-black text-slate-800">{fb.overallRating}</span>
            </div>
          </div>

          <div className="p-5">
            {/* Category Ratings */}
            <div className="grid gap-3 md:grid-cols-2 mb-6">
              {Object.entries(fb.categories).map(([cat, rating]) => (
                <div key={cat} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                  <span className="text-xs font-bold text-slate-600">{cat}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${rating >= 4.5 ? 'bg-emerald-500' : rating >= 4.0 ? 'bg-blue-500' : rating >= 3.5 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${(rating / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-700 w-8 text-right">{rating}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Student Comments */}
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Student Comments</h4>
            <div className="space-y-2">
              {fb.comments.map((c, ci) => (
                <div key={ci} className={`flex items-start space-x-3 p-3 rounded-xl border ${
                  c.sentiment === 'positive' ? 'bg-emerald-50/50 border-emerald-100' :
                  c.sentiment === 'negative' ? 'bg-red-50/50 border-red-100' :
                  'bg-slate-50 border-slate-100'
                }`}>
                  <span className="text-sm mt-0.5">{c.sentiment === 'positive' ? '👍' : c.sentiment === 'negative' ? '👎' : '💬'}</span>
                  <p className="text-sm text-slate-700 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
