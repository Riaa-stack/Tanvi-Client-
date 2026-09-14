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
} from 'lucide-react';
import { notesApi } from '@/services/api/notes';
import { Note } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { PencilLoader } from '@/components/notebook/PencilLoader';
import { ProcessingModal } from '@/components/processing/ProcessingModal';
import { toast } from '@/store/useToastStore';

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload dialog state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Processing state
  const [processingNoteId, setProcessingNoteId] = useState<string | null>(null);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const res = await notesApi.getNotes(1, 50);
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
        toast.success('Note uploaded! Starting processing...');
        setIsUploadOpen(false);
        setNoteTitle('');
        setSelectedFile(null);
        setProcessingNoteId(res.data.note_id);
        fetchNotes();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to upload note.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (noteId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesApi.deleteNote(noteId);
      toast.success('Note deleted successfully.');
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch {
      toast.error('Failed to delete note.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f7f4ed]">
      <TopBar title="Personal Study Notes Library" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-handwriting font-bold text-3xl md:text-4xl text-ink flex items-center gap-2">
              <span>My Study Notes</span> 📚
            </h1>
            <p className="text-xs md:text-sm text-slate-600 font-sans mt-0.5">
              Upload lecture notes for strictly note-grounded summaries, diagrams, flashcards, and quizzes.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all font-sans shrink-0"
          >
            <Plus size={16} />
            <span>Upload New Note</span>
          </button>
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <PencilLoader size="md" message="Loading your notes library..." />
          </div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note) => (
              <NavLink
                key={note.id}
                to={`/student/notes/${note.id}`}
                className="p-6 rounded-2xl bg-[#fdfbf7] notebook-ruled-bg border border-stone-200/90 shadow-paper hover:shadow-card-lift transition-all flex flex-col justify-between group relative"
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
                      onClick={(e) => handleDelete(note.id, e)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 font-sans">
                    {note.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-sans">
                    <Clock size={12} />
                    <span>
                      Uploaded {new Date(note.uploaded_at).toLocaleDateString()}
                    </span>
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-stone-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium text-[11px]">
                    Strict Note AI Grounding
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
          <div className="py-16 text-center bg-[#fdfbf7] notebook-ruled-bg rounded-3xl border border-stone-200 p-8 space-y-3">
            <h3 className="font-handwriting font-bold text-2xl text-ink">
              Your notebook library is empty 📝
            </h3>
            <p className="text-xs text-slate-500 font-sans max-w-sm mx-auto">
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

        {/* Upload Note Modal */}
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#fdfbf7] notebook-ruled-bg rounded-3xl shadow-2xl border border-stone-300 p-6 relative">
              <h2 className="font-handwriting font-bold text-2xl text-ink mb-1">
                Upload Student Note 📄
              </h2>
              <p className="text-xs text-slate-500 font-sans mb-4">
                PDF format • Strictly isolated to your private student study session.
              </p>

              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Note Title
                  </label>
                  <input
                    type="text"
                    required
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g. Operating Systems - Unit 3 Processes"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-sans text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Note PDF
                  </label>
                  <input
                    type="file"
                    required
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-slate-700 font-semibold text-xs"
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
              fetchNotes();
            }}
            onClose={() => setProcessingNoteId(null)}
          />
        )}
      </div>
    </div>
  );
};
