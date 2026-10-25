import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  Upload,
  Plus,
  ArrowRight,
  Trash2,
  AlertCircle,
  FileText,
  Clock,
  Download,
  Search,
  Filter,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { notesApi } from '@/services/api/notes';
import { teacherNotesApi } from '@/services/api/teacherNotes';
import { Note, TeacherNote } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { PencilLoader } from '@/components/notebook/PencilLoader';
import { ProcessingModal } from '@/components/processing/ProcessingModal';
import { toast } from '@/store/useToastStore';

export const NotesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'teacher' | 'personal'>('teacher');

  // Teacher notes state
  const [teacherNotes, setTeacherNotes] = useState<TeacherNote[]>([]);
  const [isLoadingTeacherNotes, setIsLoadingTeacherNotes] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  // Personal notes state
  const [personalNotes, setPersonalNotes] = useState<Note[]>([]);
  const [isLoadingPersonalNotes, setIsLoadingPersonalNotes] = useState<boolean>(true);

  // Upload dialog state (personal student notes)
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Processing state
  const [processingNoteId, setProcessingNoteId] = useState<string | null>(null);

  const fetchTeacherNotes = async () => {
    setIsLoadingTeacherNotes(true);
    try {
      const res = await teacherNotesApi.getStudentAvailableNotes({
        semester: selectedSemester !== 'ALL' ? selectedSemester : undefined,
        subject: selectedSubject !== 'ALL' ? selectedSubject : undefined,
        search: searchQuery.trim() || undefined,
        pageSize: 50,
      });
      if (res.success && res.notes) {
        setTeacherNotes(res.notes);
      }
    } catch {
      setTeacherNotes([]);
    } finally {
      setIsLoadingTeacherNotes(false);
    }
  };

  const fetchPersonalNotes = async () => {
    setIsLoadingPersonalNotes(true);
    try {
      const res = await notesApi.getNotes(1, 50);
      if (res.success && res.notes) {
        setPersonalNotes(res.notes);
      }
    } catch {
      setPersonalNotes([]);
    } finally {
      setIsLoadingPersonalNotes(false);
    }
  };

  useEffect(() => {
    fetchTeacherNotes();
  }, [selectedSemester, selectedSubject]);

  useEffect(() => {
    fetchPersonalNotes();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTeacherNotes();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!noteTitle) {
        setNoteTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !noteTitle.trim()) {
      toast.error('Please provide a title and select a PDF file.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', noteTitle.trim());

    try {
      const res = await notesApi.uploadNote(formData);
      if (res.success && res.data) {
        toast.success('Note uploaded! Starting AI processing...');
        setIsUploadOpen(false);
        setNoteTitle('');
        setSelectedFile(null);
        setProcessingNoteId(res.data.note_id);
        fetchPersonalNotes();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to upload note.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePersonalNote = async (noteId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this personal note?')) return;

    try {
      await notesApi.deleteNote(noteId);
      toast.success('Note deleted successfully.');
      setPersonalNotes((prev) => prev.filter((n) => n.id !== noteId));
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

  // Derive unique subject list from notes
  const availableSubjects = Array.from(
    new Set(teacherNotes.map((n) => n.subject_name).filter(Boolean))
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f7f4ed]">
      <TopBar title="Course Materials & Study Notes" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-handwriting font-bold text-3xl md:text-4xl text-ink flex items-center gap-2">
              <span>Study Notes & Handouts</span> 📚
            </h1>
            <p className="text-xs md:text-sm text-slate-600 font-sans mt-0.5">
              Access lecture notes uploaded by teachers by subject and semester, download materials, and manage personal notes.
            </p>
          </div>

          {activeTab === 'personal' && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all font-sans shrink-0"
            >
              <Plus size={16} />
              <span>Upload Personal Note</span>
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-stone-200 dark:border-slate-700 pb-2">
          <button
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all ${
              activeTab === 'teacher'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-stone-100 border border-stone-200 dark:border-slate-700'
            }`}
          >
            <GraduationCap size={16} />
            <span>Teacher Notes & Course Materials</span>
            {teacherNotes.length > 0 && (
              <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {teacherNotes.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all ${
              activeTab === 'personal'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-stone-100 border border-stone-200 dark:border-slate-700'
            }`}
          >
            <Sparkles size={16} />
            <span>My Personal Notes (AI Grounded)</span>
            {personalNotes.length > 0 && (
              <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {personalNotes.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Teacher Notes */}
        {activeTab === 'teacher' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-stone-200 dark:border-slate-700 shadow-xs"
            >
              <div className="md:col-span-5 relative">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes by title, topic, or keyword..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-slate-600 bg-stone-50 dark:bg-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 font-sans"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-600 bg-stone-50 dark:bg-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500 font-sans"
                >
                  <option value="ALL">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={`Semester ${s}`}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-600 bg-stone-50 dark:bg-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500 font-sans"
                >
                  <option value="ALL">All Subjects</option>
                  {availableSubjects.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-1">
                <button
                  type="submit"
                  className="w-full h-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center transition-colors"
                >
                  Filter
                </button>
              </div>
            </form>

            {/* Teacher Notes Grid */}
            {isLoadingTeacherNotes ? (
              <div className="py-20 flex justify-center">
                <PencilLoader size="md" message="Loading notes uploaded by teachers..." />
              </div>
            ) : teacherNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {teacherNotes.map((note) => {
                  const isWord =
                    note.original_filename.toLowerCase().endsWith('.docx') ||
                    note.original_filename.toLowerCase().endsWith('.doc');

                  return (
                    <div
                      key={note.id}
                      className="p-6 rounded-2xl bg-[#fdfbf7] dark:bg-slate-800 notebook-ruled-bg border border-stone-200/90 dark:border-slate-700 shadow-paper hover:shadow-card-lift transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Badges: Subject & Semester & Format */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200">
                            {note.semester_name}
                          </span>

                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 truncate max-w-[140px]">
                            {note.subject_name}
                          </span>

                          <span
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ml-auto border ${
                              isWord
                                ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200'
                                : 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200'
                            }`}
                          >
                            {isWord ? 'WORD' : 'PDF'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors line-clamp-2 font-sans mb-1">
                          {note.title}
                        </h3>

                        {/* Description */}
                        {note.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-sans line-clamp-2 mb-2">
                            {note.description}
                          </p>
                        )}

                        {/* Metadata Details */}
                        <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 font-sans pt-2 border-t border-stone-200/60 dark:border-slate-700/60">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px]">Subject:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                              {note.subject_name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px]">Instructor:</span>
                            <span className="font-medium text-[11px]">
                              {note.teacher_name || 'Faculty Professor'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px]">File:</span>
                            <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
                              {note.original_filename} ({formatFileSize(note.file_size)})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Download Action Footer */}
                      <div className="mt-5 pt-3.5 border-t border-stone-200 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                          <Clock size={11} />
                          <span>{new Date(note.uploaded_at).toLocaleDateString()}</span>
                        </span>

                        <a
                          href={note.download_url}
                          download
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-transform group-hover:scale-105 font-sans"
                        >
                          <Download size={14} />
                          <span>Download Notes</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center bg-[#fdfbf7] dark:bg-slate-800 notebook-ruled-bg rounded-3xl border border-stone-200 dark:border-slate-700 p-8 space-y-3">
                <div className="text-3xl">📂</div>
                <h3 className="font-handwriting font-bold text-2xl text-ink">
                  No notes found for this filter
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-sm mx-auto">
                  Try clearing your search query or semester filter to view all course materials uploaded by your professors.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSemester('ALL');
                    setSelectedSubject('ALL');
                    fetchTeacherNotes();
                  }}
                  className="px-4 py-2 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 rounded-xl text-xs font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Personal Student Notes */}
        {activeTab === 'personal' && (
          <div>
            {isLoadingPersonalNotes ? (
              <div className="py-20 flex justify-center">
                <PencilLoader size="md" message="Loading your personal notes..." />
              </div>
            ) : personalNotes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {personalNotes.map((note) => (
                  <NavLink
                    key={note.id}
                    to={`/student/notes/${note.id}`}
                    className="p-6 rounded-2xl bg-[#fdfbf7] dark:bg-slate-800 notebook-ruled-bg border border-stone-200/90 dark:border-slate-700 shadow-paper hover:shadow-card-lift transition-all flex flex-col justify-between group relative"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                            note.status === 'READY'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : note.status === 'FAILED'
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                          }`}
                        >
                          {note.status}
                        </span>

                        <button
                          onClick={(e) => handleDeletePersonalNote(note.id, e)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Delete Note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors line-clamp-2 font-sans">
                        {note.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-sans">
                        <Clock size={12} />
                        <span>Uploaded {new Date(note.uploaded_at).toLocaleDateString()}</span>
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-stone-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                        AI Grounded Study Tools
                      </span>
                      <span className="text-brand-600 font-bold font-handwriting flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Study Note</span>
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </NavLink>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-[#fdfbf7] dark:bg-slate-800 notebook-ruled-bg rounded-3xl border border-stone-200 dark:border-slate-700 p-8 space-y-3">
                <h3 className="font-handwriting font-bold text-2xl text-ink">
                  Your personal study notebook is empty 📝
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-sm mx-auto">
                  Upload your handwritten or typed lecture notes (PDF) to unlock AI summaries, concept maps, flashcards, and quizzes.
                </p>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>Upload Your First Note</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upload Personal Note Modal */}
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#fdfbf7] dark:bg-slate-800 notebook-ruled-bg rounded-3xl shadow-2xl border border-stone-300 dark:border-slate-700 p-6 relative">
              <h2 className="font-handwriting font-bold text-2xl text-ink mb-1">
                Upload Student Note 📄
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mb-4">
                PDF format • Strictly isolated to your private student study session.
              </p>

              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Note Title
                  </label>
                  <input
                    type="text"
                    required
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g. Operating Systems - Unit 3 Processes"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-sans text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Select Note PDF
                  </label>
                  <input
                    type="file"
                    required
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
                  >
                    {isUploading ? 'Uploading...' : 'Upload & Process'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Live Processing Modal for newly uploaded notes */}
        {processingNoteId && (
          <ProcessingModal
            isOpen={!!processingNoteId}
            type="note"
            itemId={processingNoteId}
            onComplete={() => {
              setProcessingNoteId(null);
              fetchPersonalNotes();
            }}
            onClose={() => setProcessingNoteId(null)}
          />
        )}
      </div>
    </div>
  );
};
