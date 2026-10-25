'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  is_read: boolean;
  created_at: string;
}

export default function NoticeBoardView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'WARNING' | 'SUCCESS' | 'INFO'>('ALL');

  const loadNotifications = async () => {
    try {
      const data = await fetchAPI('/academics/notifications/');
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await fetchAPI(`/academics/notifications/${id}/mark_read/`, { method: 'POST' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetchAPI('/academics/notifications/mark_all_read/', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const warningsCount = notifications.filter((n) => n.notification_type === 'WARNING' || n.notification_type === 'ALERT').length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.is_read;
    if (filterType === 'WARNING') return n.notification_type === 'WARNING' || n.notification_type === 'ALERT';
    if (filterType === 'SUCCESS') return n.notification_type === 'SUCCESS';
    if (filterType === 'INFO') return n.notification_type === 'INFO';
    return true;
  });

  // Default institutional circulars if notification list is small
  const defaultCirculars: NotificationItem[] = [
    {
      id: 991,
      title: 'Autumn 2026 Academic Term Policy Reminder',
      message: 'Mandatory 75% attendance threshold applies across all registered courses. Shortage will result in examination debarment pursuant to Academic Regulation Sec 4.2.',
      notification_type: 'INFO',
      is_read: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 992,
      title: 'Digital Fee Payment & No-Dues Clearance Window',
      message: 'Tuition fees must be cleared through the Student Billing portal before term completion to enable automated digital No-Dues and Bonafide Certificate issuance.',
      notification_type: 'INFO',
      is_read: true,
      created_at: new Date().toISOString(),
    },
  ];

  const displayedList = filteredNotifications.length > 0 ? filteredNotifications : defaultCirculars;

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'WARNING':
      case 'ALERT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'SUCCESS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'INFO':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getPriorityLabel = (type: string) => {
    switch (type) {
      case 'WARNING':
      case 'ALERT':
        return 'Critical Action';
      case 'SUCCESS':
        return 'Confirmed';
      case 'INFO':
      default:
        return 'Institutional';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Academic Context Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-700 via-blue-600 to-sky-500"></div>
        <div className="absolute -left-20 -top-12 h-40 w-40 rounded-full bg-blue-100/70 blur-2xl pointer-events-none"></div>
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                Official University Notice Board & Alert Dispatch
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Institutional Notices & Personal Academic Alerts
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Live repository of attendance shortage warnings, fee transaction confirmations, approved leave notices, and university circulars.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:min-w-[20rem]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-black text-slate-900">{notifications.length}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Alerts</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
                <p className="text-2xl font-black text-rose-700">{warningsCount}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-rose-700/80">Warnings</p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center">
                <p className="text-2xl font-black text-blue-700">{unreadCount}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-blue-700/80">Unread</p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterType === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Notices ({notifications.length})
              </button>
              <button
                onClick={() => setFilterType('UNREAD')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterType === 'UNREAD'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilterType('WARNING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterType === 'WARNING'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ⚠️ Attendance Alerts ({warningsCount})
              </button>
              <button
                onClick={() => setFilterType('SUCCESS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterType === 'SUCCESS'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                💳 Finance & Approvals
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition"
              >
                ✓ Mark all as read
              </button>
            )}
          </div>

          {/* Notices Grid */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-4">
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Loading official notices…</div>
              ) : displayedList.length === 0 ? (
                <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 text-xl">
                    📭
                  </div>
                  <p className="font-bold text-slate-700 text-base">No notices under this filter</p>
                  <p className="text-xs text-slate-400 mt-1">Select another filter to view your notices</p>
                </div>
              ) : (
                displayedList.map((notice) => (
                  <article
                    key={notice.id}
                    className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
                      !notice.is_read
                        ? 'border-blue-300 bg-blue-50/20'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${getBadgeStyle(
                              notice.notification_type
                            )}`}
                          >
                            {notice.notification_type}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                            {getPriorityLabel(notice.notification_type)}
                          </span>
                          {!notice.is_read && (
                            <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-bold tracking-tight text-slate-900">
                            {notice.title}
                          </h3>
                          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                            {notice.message}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-right">
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timestamp</p>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">
                            {new Date(notice.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Institutional Record ID #{notice.id}
                      </span>
                      {!notice.is_read && (
                        <button
                          onClick={() => handleMarkRead(notice.id)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 transition"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Quick Glance Side Panel */}
            <aside className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 h-fit">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Compliance Digest</p>
                <h3 className="mt-1 text-base font-black text-slate-900">Statutory Notices</h3>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">75% Attendance Rule</p>
                  <p className="mt-1 text-xs font-bold text-slate-900">Statutory Exam Eligibility</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                    Faculty warning dispatches are recorded directly in this alert register. If you receive a warning, attend mandatory remediation lectures.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Excused Absence Policy</p>
                  <p className="mt-1 text-xs font-bold text-emerald-900">Medical & Duty Leaves</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-emerald-800">
                    Approved leaves via the Leave Portal automatically protect attendance calculations and log confirmation notices here.
                  </p>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Digital Clearance</p>
                  <p className="mt-1 text-xs font-bold text-blue-900">Automated No-Dues</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-blue-800">
                    Paid semester fees trigger digital finance clearance, releasing your printable Institutional Bonafide Certificate.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
