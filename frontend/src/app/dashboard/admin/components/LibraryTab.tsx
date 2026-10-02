'use client';

import { useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BookCopy,
  CheckCircle2,
  Clock3,
  LibraryBig,
  Search,
  TriangleAlert,
  UserRound,
} from 'lucide-react';

type BookStatus = 'Available' | 'Issued' | 'Overdue';

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  status: BookStatus;
  copies: number;
}

const initialCatalog: LibraryBook[] = [
  { id: 'BK-1001', title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', status: 'Available', copies: 8 },
  { id: 'BK-1002', title: 'Introduction to Algorithms', author: 'T. Cormen et al.', isbn: '978-0262046305', status: 'Issued', copies: 3 },
  { id: 'BK-1003', title: 'The Design of Everyday Things', author: 'Don Norman', isbn: '978-0465050659', status: 'Available', copies: 5 },
  { id: 'BK-1004', title: 'Computer Networks', author: 'Andrew S. Tanenbaum', isbn: '978-0132126953', status: 'Overdue', copies: 2 },
  { id: 'BK-1005', title: 'Atomic Habits', author: 'James Clear', isbn: '978-0735211292', status: 'Issued', copies: 4 },
];

const statusStyles: Record<BookStatus, string> = {
  Available: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Issued: 'border-sky-200 bg-sky-50 text-sky-700',
  Overdue: 'border-rose-200 bg-rose-50 text-rose-700',
};

export default function LibraryTab() {
  const [catalog, setCatalog] = useState<LibraryBook[]>(initialCatalog);
  const [query, setQuery] = useState('');
  const [studentId, setStudentId] = useState('');
  const [bookId, setBookId] = useState('');
  const [deskMessage, setDeskMessage] = useState('');

  const stats = useMemo(() => ({
    total: catalog.reduce((sum, book) => sum + book.copies, 0),
    issued: catalog.filter((book) => book.status === 'Issued').length,
    overdue: catalog.filter((book) => book.status === 'Overdue').length,
  }), [catalog]);

  const filteredCatalog = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return catalog;
    return catalog.filter((book) =>
      [book.title, book.author, book.isbn, book.id].some((value) => value.toLowerCase().includes(term)),
    );
  }, [catalog, query]);

  const handleDeskAction = (action: 'issue' | 'return') => {
    const normalizedBookId = bookId.trim().toUpperCase();
    const normalizedStudentId = studentId.trim().toUpperCase();

    if (!normalizedStudentId || !normalizedBookId) {
      setDeskMessage('Enter both a student ID and a book ID to continue.');
      return;
    }

    const matchedBook = catalog.find((book) => book.id === normalizedBookId);
    if (!matchedBook) {
      setDeskMessage(`No catalog record was found for ${normalizedBookId}.`);
      return;
    }

    setCatalog((currentCatalog) => currentCatalog.map((book) => (
      book.id === normalizedBookId
        ? { ...book, status: action === 'issue' ? 'Issued' : 'Available' }
        : book
    )));
    setDeskMessage(`${matchedBook.title} marked as ${action === 'issue' ? 'issued to' : 'returned by'} ${normalizedStudentId}.`);
    setStudentId('');
    setBookId('');
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-5 md:grid-cols-3">
        <StatCard icon={LibraryBig} label="Total books" value={stats.total} detail="Across the university collection" iconClass="bg-slate-900 text-white" />
        <StatCard icon={BookCopy} label="Currently issued" value={stats.issued} detail="Active lending records" iconClass="bg-sky-100 text-sky-700" />
        <StatCard icon={TriangleAlert} label="Overdue" value={stats.overdue} detail="Requires follow-up today" iconClass="bg-rose-100 text-rose-700" />
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
        <div className="flex flex-col gap-5 border-b border-slate-100 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-slate-900">
              <LibraryBig className="h-5 w-5" />
              <h2 className="text-xl font-bold">Book Catalog</h2>
            </div>
            <p className="text-sm text-slate-500">Browse and manage the library&apos;s current inventory.</p>
          </div>
          <label className="relative block w-full lg:w-80">
            <span className="sr-only">Search book catalog</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, author or ISBN"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4 font-bold">Title</th>
                <th className="px-6 py-4 font-bold">Author</th>
                <th className="px-6 py-4 font-bold">ISBN</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 text-right font-bold">Copies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCatalog.map((book) => (
                <tr key={book.id} className="transition-colors hover:bg-slate-50/80">
                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-800">{book.title}</p>
                    <p className="mt-1 text-xs font-medium text-slate-400">{book.id}</p>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">{book.author}</td>
                  <td className="px-6 py-5 font-mono text-sm text-slate-500">{book.isbn}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[book.status]}`}>
                      {book.status === 'Available' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                      {book.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right text-sm font-bold text-slate-700">{book.copies}</td>
                </tr>
              ))}
              {filteredCatalog.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sm text-slate-400">No books match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl shadow-slate-300/40 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
              <BookCopy className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Issue / Return Desk</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">Process lending transactions quickly with a student ID and the catalog book ID.</p>
            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-300">
              <span className="rounded-lg bg-white/10 px-2.5 py-1.5">Try BK-1001</span>
              <span className="rounded-lg bg-white/10 px-2.5 py-1.5">Student: STU-2026-041</span>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-2xl sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"><UserRound className="h-3.5 w-3.5" /> Student ID</span>
                <input value={studentId} onChange={(event) => setStudentId(event.target.value)} placeholder="e.g. STU-2026-041" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100" />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"><BookCopy className="h-3.5 w-3.5" /> Book ID</span>
                <input value={bookId} onChange={(event) => setBookId(event.target.value)} placeholder="e.g. BK-1001" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm uppercase outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100" />
              </label>
            </div>
            {deskMessage && <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{deskMessage}</p>}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => handleDeskAction('issue')} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:from-slate-700 hover:to-slate-500 focus:outline-none focus:ring-4 focus:ring-slate-200">
                <ArrowUpFromLine className="h-4 w-4" /> Issue book
              </button>
              <button type="button" onClick={() => handleDeskAction('return')} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:from-sky-500 hover:to-cyan-400 focus:outline-none focus:ring-4 focus:ring-sky-100">
                <ArrowDownToLine className="h-4 w-4" /> Return book
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail, iconClass }: { icon: typeof LibraryBig; label: string; value: number; detail: string; iconClass: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${iconClass}`}><Icon className="h-5 w-5" /></div>
      </div>
      <p className="mt-5 text-xs text-slate-400">{detail}</p>
    </div>
  );
}
