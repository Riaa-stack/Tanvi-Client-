import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  RefreshCw,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { papersApi } from '@/services/api/papers';
import { Paper } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { PencilLoader } from '@/components/notebook/PencilLoader';
import { toast } from '@/store/useToastStore';

export const TeacherDashboard: React.FC = () => {
  const [stats, setStats] = useState({ total: 0, ready: 0, processing: 0, failed: 0 });
  const [recentPapers, setRecentPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await papersApi.getTeacherDashboard();
      if (res.success && res.data) {
        setStats(res.data.statistics);
        setRecentPapers(res.data.recent_papers || []);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDelete = async (paperId: string) => {
    if (!confirm('Are you sure you want to delete this question paper?')) return;
    try {
      await papersApi.deletePaper(paperId);
      toast.success('Paper deleted successfully.');
      fetchDashboardData();
    } catch {
      toast.error('Failed to delete paper.');
    }
  };

  const handleRetry = async (paperId: string) => {
    try {
      await papersApi.retryPaperProcessing(paperId);
      toast.success('Retrying paper processing...');
      fetchDashboardData();
    } catch {
      toast.error('Failed to retry processing.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f7f4ed]">
      <TopBar title="Teacher Academic Portal" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-handwriting font-bold text-3xl md:text-4xl text-ink flex items-center gap-2">
              <span>Teacher Dashboard</span> 👨‍🏫
            </h1>
            <p className="text-xs md:text-sm text-slate-600 font-sans mt-0.5">
              Upload and manage university examination question papers for student AI analysis.
            </p>
          </div>

          <NavLink
            to="/teacher/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md font-sans shrink-0"
          >
            <Plus size={16} />
            <span>Upload Question Paper</span>
          </NavLink>
        </div>

        {/* 4 Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <FileText size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-slate-900">{stats.total}</div>
              <div className="text-xs text-slate-500 font-sans">Total Papers</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-slate-900">{stats.ready}</div>
              <div className="text-xs text-slate-500 font-sans">Ready for Students</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-slate-900">{stats.processing}</div>
              <div className="text-xs text-slate-500 font-sans">In Processing</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <AlertCircle size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-slate-900">{stats.failed}</div>
              <div className="text-xs text-slate-500 font-sans">Processing Issues</div>
            </div>
          </div>
        </div>

        {/* Recent Uploads Table */}
        <div className="bg-[#fdfbf7] notebook-ruled-bg rounded-3xl border border-stone-200/90 shadow-paper p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-handwriting font-bold text-2xl text-ink">
              Recent Question Papers 📄
            </h2>
            <NavLink
              to="/teacher/papers"
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1 font-sans"
            >
              <span>View All Papers</span>
              <ArrowRight size={12} />
            </NavLink>
          </div>

          {isLoading ? (
            <div className="py-12 flex justify-center">
              <PencilLoader size="sm" message="Loading paper dashboard..." />
            </div>
          ) : recentPapers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-stone-200 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/60">
                  {recentPapers.map((p) => (
                    <tr key={p.id} className="hover:bg-white/60 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {p.title}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {p.subject?.name} ({p.subject?.code})
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">{p.year}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                            p.status === 'READY'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : p.status === 'FAILED'
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        {p.status === 'FAILED' && (
                          <button
                            onClick={() => handleRetry(p.id)}
                            className="p-1 text-amber-600 hover:text-amber-800"
                            title="Retry"
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500 font-sans">
              No papers uploaded yet. Click "Upload Question Paper" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
