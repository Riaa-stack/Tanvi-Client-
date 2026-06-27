import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import CompactToggle from '../components/CompactToggle.jsx';
import { Sun, Moon, Laptop, Shield, Key, EyeOff, Info, BadgeAlert } from 'lucide-react';

export default function Settings() {
  const { theme, setTheme, isCompact } = useTheme();

  return (
    <div className={`${isCompact ? 'space-y-4' : 'space-y-6'} font-sans max-w-4xl`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">System Settings & Configurations</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-normal mt-0.5">Customize theme options, manage system tokens, and review credential configurations.</p>
        </div>

        <div className="shrink-0">
          <CompactToggle />
        </div>
      </div>

      {/* Feature: Theme presets selector cards */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-extrabold text-gray-950 dark:text-white">Theme Customization</h3>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">Choose between visual presets. Custom styles are persisted in local storage.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'light', name: 'Light Mode', desc: 'High contrast clean view', icon: Sun, color: 'text-amber-500 bg-amber-50' },
            { id: 'dark', name: 'Dark Mode (Default)', desc: 'Eye safe slate dark mode', icon: Moon, color: 'text-indigo-400 bg-indigo-950/40' },
            { id: 'system', name: 'System Sync', desc: 'Syncs with OS preferences', icon: Laptop, color: 'text-gray-500 bg-gray-100' }
          ].map((preset) => {
            const Icon = preset.icon;
            const isSelected = theme === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => setTheme(preset.id)}
                className={`p-5 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/10 ring-2 ring-indigo-500/10'
                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-gray-950/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${preset.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {isSelected && (
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">{preset.name}</h4>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium leading-none mt-1">{preset.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secrets & Credentials description block */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-50 dark:border-gray-850">
          <Key className="h-5 w-5 text-indigo-500" />
          <h3 className="font-extrabold text-gray-950 dark:text-white">API Secrets & Key Security</h3>
        </div>

        <div className="space-y-4 text-xs font-medium leading-relaxed text-gray-600 dark:text-gray-400">
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl flex items-start gap-3">
            <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-indigo-850 dark:text-indigo-300">Server-Side Credentials Management</h4>
              <p className="text-[11px] leading-normal font-medium">
                To guarantee absolute client privacy and conform to security standards, all API keys (such as `GEMINI_API_KEY`) are stored purely server-side. They are never transmitted or exposed to the browser.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p>
              Your full-stack container is equipped with an automated secrets injector. If you want to use customized models or private project resources, register them inside the <strong>Secrets Panel</strong> in the top-right toolbar of the Google AI Studio workspace:
            </p>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-850 rounded-2xl space-y-2 font-mono text-[10px]">
              <div className="flex items-center justify-between text-gray-400 border-b border-gray-100 dark:border-gray-850 pb-1.5 mb-1.5">
                <span>Secret Identifier</span>
                <span>Active Status</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-gray-850 dark:text-gray-250">GEMINI_API_KEY</span>
                <span className="text-emerald-500 flex items-center gap-1">● INJECTED</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-gray-850 dark:text-gray-250">JWT_SECRET</span>
                <span className="text-indigo-500 flex items-center gap-1">● CONTAINER_DEFAULT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
