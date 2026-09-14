import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Check, ArrowLeft, AlertCircle } from 'lucide-react';
import { papersApi } from '@/services/api/papers';
import { AcademicSubject } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { ProcessingModal } from '@/components/processing/ProcessingModal';
import { toast } from '@/store/useToastStore';

export const TeacherUploadPaper: React.FC = () => {
  const navigate = useNavigate();

  // Form Fields
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('2025');
  const [semester, setSemester] = useState('5');
  const [subjectName, setSubjectName] = useState('');
  const [branchName, setBranchName] = useState('Computer Science & Engineering');
  const [college, setCollege] = useState('Ram Meghe College');
  const [university, setUniversity] = useState('SGBAU');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingPaperId, setProcessingPaperId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title.trim() || !subjectName.trim()) {
      toast.error('Please fill all required fields and choose a PDF file.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title.trim());
    formData.append('year', year);
    formData.append('semester', semester);
    formData.append('subject', subjectName.trim());
    formData.append('branch', branchName.trim());
    formData.append('college', college.trim());
    formData.append('university', university.trim());

    try {
      const res = await papersApi.uploadPaper(formData);
      if (res.success && res.data) {
        toast.success('Paper uploaded! Starting AI processing pipeline...');
        setProcessingPaperId(res.data.paper_id);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to upload paper.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f7f4ed]">
      <TopBar title="Upload University Question Paper" />

      <div className="p-6 md:p-8 max-w-3xl mx-auto w-full space-y-6">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 font-sans"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-[#fdfbf7] notebook-ruled-bg rounded-3xl border border-stone-200/90 shadow-paper p-8">
          <div className="mb-6">
            <h1 className="font-handwriting font-bold text-3xl text-ink">
              Upload Question Paper 📄
            </h1>
            <p className="text-xs text-slate-600 font-sans mt-1">
              Add university examination question papers for AI question indexing, topic extraction, and study intelligence.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Paper Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms - Winter 2025"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Examination Year *
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-slate-900"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Semester *
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-slate-900"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num.toString()}>
                      Semester {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  University
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  College
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Select Exam Paper PDF *
              </label>
              <input
                type="file"
                required
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Uploading...' : 'Upload & Start AI Processing'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Processing Modal for newly uploaded papers */}
        {processingPaperId && (
          <ProcessingModal
            isOpen={!!processingPaperId}
            type="paper"
            itemId={processingPaperId}
            onComplete={() => {
              setProcessingPaperId(null);
              navigate(`/student/papers/${processingPaperId}`);
            }}
            onClose={() => {
              setProcessingPaperId(null);
              navigate('/teacher/dashboard');
            }}
          />
        )}
      </div>
    </div>
  );
};
