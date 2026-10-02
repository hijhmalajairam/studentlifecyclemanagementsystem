import React, { useState } from "react";
import { Bus, MapPin, User, CheckCircle, XCircle, Clock } from "lucide-react";

type Route = {
  id: string;
  busNumber: string;
  driverName: string;
  routeName: string;
  status: "On Route" | "Idle" | "Delayed";
};

type PassRequest = {
  id: string;
  studentName: string;
  grade: string;
  requestedRoute: string;
  submittedAt: string;
  status: "Pending" | "Approved" | "Denied";
};

export default function TransportTab() {
  const [routes] = useState<Route[]>([
    { id: "r1", busNumber: "BUS-101", driverName: "Ravi Kumar", routeName: "North Campus", status: "On Route" },
    { id: "r2", busNumber: "BUS-203", driverName: "Sita Devi", routeName: "South Circle", status: "Idle" },
    { id: "r3", busNumber: "BUS-309", driverName: "Ashok Mehta", routeName: "East Line", status: "Delayed" },
  ]);

  const [passRequests, setPassRequests] = useState<PassRequest[]>([
    { id: "p1", studentName: "Anita Sharma", grade: "10-A", requestedRoute: "North Campus", submittedAt: "2026-09-28 09:12", status: "Pending" },
    { id: "p2", studentName: "Rahul Gupta", grade: "8-B", requestedRoute: "East Line", submittedAt: "2026-09-27 14:30", status: "Pending" },
  ]);

  const stats = {
    totalBuses: routes.length,
    activeRoutes: routes.filter((r) => r.status === "On Route").length,
    studentsRegistered: 1248, // placeholder; in real app fetch this from API
  };

  function handleApprove(id: string) {
    setPassRequests((prev) => prev.map((p) => (p.id === id ? { ...p, status: "Approved" } : p)));
  }

  function handleDeny(id: string) {
    setPassRequests((prev) => prev.map((p) => (p.id === id ? { ...p, status: "Denied" } : p)));
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-6 rounded-lg shadow-sm">
          <div className="p-3 rounded bg-slate-200 text-slate-800">
            <Bus className="w-6 h-6 text-slate-800" />
          </div>
          <div>
            <div className="text-sm text-slate-500">Total Buses</div>
            <div className="text-2xl font-semibold text-slate-900">{stats.totalBuses}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-blue-50 p-6 rounded-lg shadow-sm">
          <div className="p-3 rounded bg-blue-100 text-blue-700">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-blue-600">Active Routes</div>
            <div className="text-2xl font-semibold text-blue-900">{stats.activeRoutes}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-emerald-50 p-6 rounded-lg shadow-sm">
          <div className="p-3 rounded bg-emerald-100 text-emerald-700">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-emerald-600">Students Registered</div>
            <div className="text-2xl font-semibold text-emerald-900">{stats.studentsRegistered}</div>
          </div>
        </div>
      </div>

      {/* Main content: Live Routes + Pass Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Routes Table */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Live Routes</h3>
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Live updates
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="py-2 pr-4">Bus Number</th>
                  <th className="py-2 pr-4">Driver Name</th>
                  <th className="py-2 pr-4">Route Name</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {routes.map((r) => (
                  <tr key={r.id} className="text-slate-700 dark:text-slate-200">
                    <td className="py-3 pr-4 font-medium">{r.busNumber}</td>
                    <td className="py-3 pr-4">{r.driverName}</td>
                    <td className="py-3 pr-4">{r.routeName}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          r.status === "On Route"
                            ? "bg-blue-50 text-blue-700"
                            : r.status === "Idle"
                            ? "bg-slate-100 text-slate-800"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {r.status === "On Route" && <CheckCircle className="w-4 h-4 text-blue-600" />}
                        {r.status === "Idle" && <Bus className="w-4 h-4 text-slate-500" />}
                        {r.status === "Delayed" && <Clock className="w-4 h-4 text-amber-600" />}
                        <span>{r.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pass Requests */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Pass Requests</h3>
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Pending approvals
            </div>
          </div>

          <div className="space-y-4">
            {passRequests.length === 0 && <div className="text-sm text-slate-500">No requests at the moment.</div>}

            {passRequests.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-md">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-slate-200">
                    <User className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{p.studentName}</div>
                    <div className="text-sm text-slate-500">{p.grade} • {p.requestedRoute}</div>
                    <div className="text-xs text-slate-400">Submitted: {p.submittedAt}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    {p.status === "Pending" && <span className="text-slate-600">Pending</span>}
                    {p.status === "Approved" && <span className="text-emerald-700">Approved</span>}
                    {p.status === "Denied" && <span className="text-rose-600">Denied</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(p.id)}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600 text-white rounded-full text-sm hover:bg-emerald-700"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>

                    <button
                      onClick={() => handleDeny(p.id)}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm hover:bg-rose-200"
                      title="Deny"
                    >
                      <XCircle className="w-4 h-4" /> Deny
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-slate-500">Tip: Click Approve to mark a student's pass as approved. Integrate with backend to persist changes.</div>
        </div>
      </div>
    </div>
  );
}
