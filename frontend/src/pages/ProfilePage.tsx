import React from 'react';
import { User, Mail, Shield, Award, BookOpen, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { TopBar } from '@/components/layout/TopBar';
import { NotebookSurface } from '@/components/notebook/NotebookSurface';
import { StickyNote } from '@/components/notebook/StickyNote';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f7f4ed]">
      <TopBar title="User Profile" />

      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h1 className="font-handwriting font-bold text-3xl md:text-4xl text-ink flex items-center gap-2">
            <span>Student Profile</span> 🎓
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-sans mt-0.5">
            Your academic identity & study account details.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-8">
            <NotebookSurface variant="ruled" hasSpiral={true} hasMarginLine={true}>
              <div className="flex items-center gap-4 border-b border-stone-200 pb-5 mb-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl uppercase shadow-md shrink-0">
                  {user?.name.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="font-bold text-xl text-slate-900 font-sans">
                    {user?.name}
                  </h2>
                  <div className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full inline-block border border-brand-200 mt-1 uppercase">
                    {user?.role} ACCOUNT
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div className="p-3.5 bg-white/90 rounded-xl border border-stone-200 flex items-center justify-between">
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <Mail size={15} className="text-slate-400" />
                    <span>Email Address</span>
                  </span>
                  <span className="font-mono text-slate-800">{user?.email}</span>
                </div>

                <div className="p-3.5 bg-white/90 rounded-xl border border-stone-200 flex items-center justify-between">
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <Shield size={15} className="text-slate-400" />
                    <span>University Affiliation</span>
                  </span>
                  <span className="font-mono text-slate-800">Sant Gadge Baba Amravati University</span>
                </div>

                <div className="p-3.5 bg-white/90 rounded-xl border border-stone-200 flex items-center justify-between">
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <Award size={15} className="text-slate-400" />
                    <span>College</span>
                  </span>
                  <span className="font-mono text-slate-800">Ram Meghe College</span>
                </div>
              </div>
            </NotebookSurface>
          </div>

          <div className="md:col-span-4 space-y-4">
            <StickyNote color="yellow" rotation={2} title="Academic Level">
              <div className="text-xs text-amber-950 font-handwriting space-y-1">
                <p>• Bachelor of Engineering</p>
                <p>• Computer Science & Engg.</p>
                <p>• 5th Semester Active</p>
              </div>
            </StickyNote>

            <StickyNote color="pink" rotation={-1} title="Study Streak">
              <div className="text-xs text-pink-950 font-handwriting">
                🔥 14 Days Active Revision Streak! Keep going strong.
              </div>
            </StickyNote>
          </div>
        </div>
      </div>
    </div>
  );
};
