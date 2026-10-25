import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Upload,
  BookOpen,
  FileText,
  FileCheck,
  Trash2,
  Download,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import { teacherNotesApi } from '@/services/api/teacherNotes';
import { TeacherNote } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { PencilLoader } from '@/components/notebook/PencilLoader';
import { toast } from '@/store/useToastStore';

const DEFAULT_SUBJECT_SUGGESTIONS = [
  'Database Management Systems',
  'Operating Systems',
  'Computer Networks',
  'Design & Analysis of Algorithms',
  'Data Structures & Algorithms',
  'Software Engineering',
  'Theory of Computation',
  'Artificial Intelligence',
  'Machine Learning',
  'Compiler Design',
  'Discrete Mathematics',
  'Cloud Computing',
];

const SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

export const TeacherUploadNotes: React.FC = () => {
  const [notes, setNotes] = useState<TeacherNote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [semester, setSemester] = useState<string>('Semester 5');
  const [branch, setBranch] = useState<string>('CSE');
  const [description, setDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const res = await teacherNotesApi.getTeacherUploadedNotes(1, 50);
      if (res.success && res.notes) {
        setNotes(res.notes);
      }
    } catch {
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[_-]/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a PDF or Word document (.doc, .docx).');
      return;
    }
    if (!title.trim() || !subject.trim() || !semester.trim()) {
      toast.error('Please fill in note title, subject, and semester.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title.trim());
    formData.append('subject', subject.trim());
    formData.append('semester', semester.trim());
    formData.append('branch', branch.trim());
    if (description.trim()) {
      formData.append('description', description.trim());
    }

    try {
      const res = await teacherNotesApi.uploadTeacherNote(formData);
      if (res.success && res.data) {
        toast.success('Notes uploaded successfully! Published to student portal.');
        setIsModalOpen(false);
        setTitle('');
        setSubject('');
        setDescription('');
        setSelectedFile(null);
        fetchNotes();
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error?.message || 'Failed to upload class notes.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note? Students will no longer be able to download it.')) {
      return;
    }
    try {
      await teacherNotesApi.deleteTeacherNote(noteId);
      toast.success('Note removed successfully.');
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch {
      toast.error('Failed to delete note.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.subject_name.toLowerCase().includes(q) ||
      n.semester_name.toLowerCase().includes(q) ||
      (n.branch_name && n.branch_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f7f4ed]">
      <TopBar title="Teacher Notes Upload & Management" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-handwriting font-bold text-3xl md:text-4xl text-ink flex items-center gap-2">
              <span>Teacher Course Notes</span> 📚
            </h1>
            <p className="text-xs md:text-sm text-slate-600 font-sans mt-0.5">
              Upload PDF or Word notes for your students. Notes are instantly available on the student side by subject & semester.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all font-sans shrink-0"
          >
            <Plus size={16} />
            <span>Upload New Notes</span>
          </button>
        </div>

        {/* Feature Highlight Banner */}
        <div className="p-4 rounded-2xl bg-brand-50/80 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileCheck size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-brand-950 dark:text-brand-200 font-sans">
                Instant Student Access (PDF & Word Supported)
              </div>
              <div className="text-[11px] text-brand-700 dark:text-brand-400 font-sans">
                No OCR or background processing delay. Once uploaded, students can find your notes tagged with subject and semester and download them immediately.
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300">
            <CheckCircle2 size={14} />
            <span>Direct Distribution</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800/80 p-2.5 rounded-2xl border border-stone-200 dark:border-slate-700 shadow-xs">
          <Search size={16} className="text-slate-400 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search uploaded notes by title, subject, or semester..."
            className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden font-sans"
          />
        </div>

        {/* Notes Table / Grid */}
        <div className="bg-[#fdfbf7] dark:bg-slate-800 notebook-ruled-bg rounded-3xl border border-stone-200/90 dark:border-slate-700 shadow-paper p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-handwriting font-bold text-2xl text-ink">
              Uploaded Class Notes ({filteredNotes.length}) 📑
            </h2>
          </div>

          {isLoading ? (
            <div className="py-16 flex justify-center">
              <PencilLoader size="sm" message="Loading your uploaded notes..." />
            </div>
          ) : filteredNotes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Semester</th>
                    <th className="py-2.5 px-3">Format</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Uploaded</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/60 dark:divide-slate-700/60">
                  {filteredNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-white/60 dark:hover:bg-slate-750 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className="text-brand-600 shrink-0" />
                          <span className="line-clamp-1">{note.title}</span>
                        </div>
                        {note.description && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal pl-6 line-clamp-1">
                            {note.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {note.subject_name}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200">
                          {note.semester_name}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[10px] uppercase">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold ${
                            note.original_filename.toLowerCase().endsWith('.docx') ||
                            note.original_filename.toLowerCase().endsWith('.doc')
                              ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200'
                              : 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                          }`}
                        >
                          {note.original_filename.toLowerCase().endsWith('.docx')
                            ? 'DOCX'
                            : note.original_filename.toLowerCase().endsWith('.doc')
                            ? 'DOC'
                            : 'PDF'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-500 dark:text-slate-400">
                        {formatFileSize(note.file_size)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                        {new Date(note.uploaded_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-right space-x-2">
                        <a
                          href={note.download_url}
                          download
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 hover:bg-emerald-100 transition-colors font-semibold text-[11px]"
                          title="Download File"
                        >
                          <Download size={12} />
                          <span>Download</span>
                        </a>

                        <button
                          onClick={() => handleDelete(note.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Note"
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
            <div className="py-12 text-center space-y-2">
              <div className="text-3xl">📝</div>
              <h3 className="font-handwriting font-bold text-xl text-ink">
                No class notes uploaded yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-sm mx-auto">
                Share your lecture slides, handwritten scans, or Word summaries with your students by clicking "Upload New Notes".
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-3 px-5 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Upload First Note</span>
              </button>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#fdfbf7] dark:bg-slate-800 notebook-ruled-bg rounded-3xl shadow-2xl border border-stone-300 dark:border-slate-700 p-6 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-700 mb-4">
                <div>
                  <h2 className="font-handwriting font-bold text-2xl text-ink">
                    Upload Class Notes 📑
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                    Supports PDF and Word documents (.pdf, .doc, .docx). Direct student download.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Note Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Relational Calculus & SQL Comprehensive Notes"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Operating Systems"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Semester *
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                    >
                      {SEMESTERS.map((sem) => (
                        <option key={sem} value={sem}>
                          {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Subject Suggestions */}
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium">
                    Quick Pick Curriculum Subjects:
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                    {DEFAULT_SUBJECT_SUGGESTIONS.map((subj) => (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => setSubject(subj)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                          subject === subj
                            ? 'bg-brand-600 text-white border-brand-700'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-stone-200 dark:border-slate-600 hover:bg-stone-50'
                        }`}
                      >
                        {subj}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Branch / Department
                    </label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. CSE / IT"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Short Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Unit 2 & 3 revision notes"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* File Upload Drop Area */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Select File (.pdf, .doc, .docx) *
                  </label>
                  <div className="border-2 border-dashed border-stone-300 dark:border-slate-600 rounded-2xl p-4 text-center bg-white/70 dark:bg-slate-750 hover:bg-stone-50 transition-colors">
                    <input
                      type="file"
                      required
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 dark:file:bg-brand-950/60 file:text-brand-700 dark:file:text-brand-300 hover:file:bg-brand-100"
                    />
                    {selectedFile && (
                      <div className="mt-2 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {isUploading ? (
                      <span>Uploading...</span>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Publish Notes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
