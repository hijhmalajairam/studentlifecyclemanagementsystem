import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Briefcase, 
  Search,
  MoreVertical,
  MapPin,
  TrendingUp,
  GraduationCap,
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';

// Mock Data
const alumniData = [
  { id: 1, name: 'Eleanor Shellstrop', year: '2018', company: 'TechSolutions Inc.', role: 'Senior Product Manager', avatar: 'ES', status: 'active' },
  { id: 2, name: 'Chidi Anagonye', year: '2016', company: 'Sorbonne University', role: 'Professor of Ethics', avatar: 'CA', status: 'active' },
  { id: 3, name: 'Tahani Al-Jamil', year: '2017', company: 'Global Philanthropy', role: 'Director of Outreach', avatar: 'TA', status: 'active' },
  { id: 4, name: 'Jason Mendoza', year: '2019', company: 'Jacksonville Entertainment', role: 'Creative Director', avatar: 'JM', status: 'inactive' },
  { id: 5, name: 'Michael Realman', year: '2015', company: 'Architecture Inc.', role: 'Senior Architect', avatar: 'MR', status: 'active' },
  { id: 6, name: 'Janet D\'voidoffunc', year: '2014', company: 'Data Systems LLC', role: 'Database Administrator', avatar: 'JD', status: 'active' },
];

const eventsData = [
  { id: 1, title: 'Class of 2016 10-Year Reunion', date: 'Oct 15, 2026', location: 'Main Campus, Student Center', attendees: 120, type: 'Reunion' },
  { id: 2, title: 'Tech Industry Networking Mixer', date: 'Nov 02, 2026', location: 'Downtown Innovation Hub', attendees: 85, type: 'Networking' },
  { id: 3, title: 'Annual Alumni Leadership Gala', date: 'Dec 10, 2026', location: 'Grand Hotel Ballroom', attendees: 350, type: 'Gala' },
];

const fundraisingData = {
  current: 850000,
  target: 1000000,
  donors: 1245,
  recentDonation: 5000,
  campaignName: '2026 Excellence Fund'
};

const AlumniTab = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const progressPercentage = (fundraisingData.current / fundraisingData.target) * 100;

  return (
    <div className="bg-slate-50 font-sans text-slate-900 rounded-lg">
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 p-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Alumni Network</h1>
          <p className="text-sm text-slate-500 mt-1">Manage past students, events, and fundraising campaigns.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            New Event
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Invite Alumni
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Directory */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Alumni</p>
                <p className="text-2xl font-bold text-slate-900">14,205</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Employed</p>
                <p className="text-2xl font-bold text-slate-900">92%</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Event Attendees</p>
                <p className="text-2xl font-bold text-slate-900">3,420</p>
              </div>
            </div>
          </div>

          {/* Directory Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">Alumni Directory</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search alumni..." 
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="p-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="p-4 pl-6">Alumni Name</th>
                    <th className="p-4">Class Of</th>
                    <th className="p-4">Company & Role</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alumniData.map((alumnus) => (
                    <tr key={alumnus.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 border border-indigo-200 shadow-sm">
                            {alumnus.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{alumnus.name}</p>
                            <p className="text-xs text-slate-500">ALUM-{alumnus.year}-{alumnus.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                          <GraduationCap className="w-4 h-4 text-slate-400" />
                          {alumnus.year}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-slate-900">{alumnus.company}</p>
                        <p className="text-xs text-slate-500">{alumnus.role}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-widest ${
                          alumnus.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {alumnus.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          
          {/* Fundraising Widget */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Fundraising</h3>
                    <p className="text-indigo-200 text-sm">{fundraisingData.campaignName}</p>
                  </div>
                  <div className="p-2 bg-white/10 rounded backdrop-blur-sm">
                    <DollarSign className="w-5 h-5 text-indigo-300" />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-4xl font-bold tracking-tight">${(fundraisingData.current / 1000).toFixed(0)}k</span>
                    <span className="text-sm font-medium text-indigo-200">/ ${(fundraisingData.target / 1000000).toFixed(1)}M goal</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-slate-900/50 rounded-full h-2.5 mb-3 border border-white/10">
                    <div className="bg-indigo-400 h-2.5 rounded-full relative" style={{ width: `${progressPercentage}%` }}>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-sm translate-x-1/2"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs font-medium text-indigo-100">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {fundraisingData.donors.toLocaleString()} Donors</span>
                    <span>{progressPercentage.toFixed(0)}% Funded</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events Widget */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Upcoming Events</h3>
              <button className="text-sm text-indigo-600 font-bold hover:text-indigo-700">See All</button>
            </div>
            <div className="divide-y divide-slate-100">
              {eventsData.map((event) => (
                <div key={event.id} className="p-5 hover:bg-slate-50 transition-colors group cursor-pointer">
                  <div className="flex gap-4">
                    <div className="w-12 h-14 bg-indigo-50 border border-indigo-100 rounded flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-semibold uppercase text-indigo-600 tracking-wider">
                        {event.date.split(' ')[0]}
                      </span>
                      <span className="text-lg font-semibold text-slate-900 leading-none mt-1">
                        {event.date.split(' ')[1].replace(',', '')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                          {event.title}
                        </h4>
                      </div>
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AlumniTab;
