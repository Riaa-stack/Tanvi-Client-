import React, { useState, useEffect } from 'react';
import { Settings, Shield, Server, CheckCircle2, AlertCircle } from 'lucide-react';
import { healthApi } from '@/services/api/health';
import { TopBar } from '@/components/layout/TopBar';
import { NotebookSurface } from '@/components/notebook/NotebookSurface';
import { toast } from '@/store/useToastStore';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<any | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const data = await healthApi.getDetailedHealth();
      setHealth(data);
    } catch {
      setHealth({ status: 'offline' });
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f7f4ed]">
      <TopBar title="System & Workspace Settings" />

      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h1 className="font-handwriting font-bold text-3xl md:text-4xl text-ink flex items-center gap-2">
            <span>Workspace Settings</span> ⚙️
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-sans mt-0.5">
            Configure notebook appearance and monitor EduArchive AI backend connectivity.
          </p>
        </div>

        <NotebookSurface variant="ruled" hasSpiral={true} hasMarginLine={true}>
          <div className="space-y-6">
            <div>
              <h2 className="font-handwriting font-bold text-xl text-ink mb-3">
                Backend System Health 🩺
              </h2>

              <div className="p-4 rounded-2xl bg-white/90 border border-stone-200 text-xs space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <Server size={16} className="text-brand-600" />
                    <span>Backend Status</span>
                  </span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded-full ${
                      health?.status === 'healthy'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {health?.status || 'CHECKING'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="font-bold text-slate-700">Database</div>
                    <div className="font-mono text-emerald-700 text-[11px] mt-0.5">
                      {health?.components?.database?.status || 'Online (PostgreSQL / SQLite)'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="font-bold text-slate-700">Vector Store</div>
                    <div className="font-mono text-emerald-700 text-[11px] mt-0.5">
                      {health?.components?.vector_store?.status || 'Online (ChromaDB)'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="font-bold text-slate-700">AI Intelligence</div>
                    <div className="font-mono text-emerald-700 text-[11px] mt-0.5">
                      {health?.components?.gemini?.status || 'Online (Gemini Flash 2.5)'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="font-bold text-slate-700">Embeddings</div>
                    <div className="font-mono text-emerald-700 text-[11px] mt-0.5">
                      {health?.components?.embedding?.model || 'text-embedding-004 (768-dim)'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={fetchHealth}
                    disabled={isLoadingHealth}
                    className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-xs shadow-2xs"
                  >
                    Refresh Health Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </NotebookSurface>
      </div>
    </div>
  );
};
