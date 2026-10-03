'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

export default function AISettingsTab() {
  const [keyHistory, setKeyHistory] = useState<any[]>([]);
  const [newKey, setNewKey] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchKeyHistory = async () => {
    try {
      const data = await fetchAPI('/ai/config/');
      if (Array.isArray(data)) {
        setKeyHistory(data);
      } else {
        setKeyHistory([]);
      }
    } catch (error) {
      console.error('Failed to fetch AI configuration history', error);
      setKeyHistory([]);
    }
  };

  useEffect(() => {
    fetchKeyHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey) return;
    setLoading(true);
    try {
      await fetchAPI('/ai/config/', {
        method: 'POST',
        body: JSON.stringify({ groq_api_key: newKey }),
      });
      alert('Groq API Key updated successfully!');
      setNewKey('');
      fetchKeyHistory();
    } catch (error: any) {
      alert('Failed to update API Key: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-color)] shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-[var(--text-primary)]">AI Settings</h2>

      <div className="mb-8 p-6 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Update Groq API Key</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">New Groq API Key</label>
            <input
              type="password"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-[var(--text-primary)]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save API Key'}
          </button>
        </form>
      </div>

      <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] overflow-hidden">
        <h3 className="text-lg font-semibold p-6 pb-2 text-[var(--text-primary)]">API Key History</h3>
        <div className="overflow-x-auto p-6 pt-2">
          {keyHistory.length === 0 ? (
            <p className="text-[var(--text-secondary)] text-sm">No history found.</p>
          ) : (
            <table className="w-full text-left text-sm text-[var(--text-secondary)]">
              <thead className="text-xs uppercase bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Key Preview</th>
                  <th className="px-4 py-3">Updated By</th>
                  <th className="px-4 py-3">Updated At</th>
                  <th className="px-4 py-3">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {keyHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--bg-secondary)]">
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{item.id}</td>
                    <td className="px-4 py-3">
                      {item.groq_api_key.substring(0, 4)}...{item.groq_api_key.substring(item.groq_api_key.length - 4)}
                    </td>
                    <td className="px-4 py-3">{item.updated_by}</td>
                    <td className="px-4 py-3">{new Date(item.updated_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {item.is_active ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-800 dark:text-gray-400">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
