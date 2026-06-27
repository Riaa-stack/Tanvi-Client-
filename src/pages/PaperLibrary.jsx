import React, { useState, useEffect } from 'react';
import { useSubject } from '../context/SubjectContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../context/AuthContext.jsx';
import CompactToggle from '../components/CompactToggle.jsx';
import { 
  FileText, 
  Upload, 
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  Download, 
  Clock, 
  CheckCircle2, 
  GraduationCap, 
  CalendarDays 
} from 'lucide-react';

export default function PaperLibrary() {
  const { activeSubject } = useSubject();
  const { user } = useAuth();
  const { isCompact } = useTheme();

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [year, setYear] = useState('2026');
  const [semester, setSemester] = useState('');
  const [examType, setExamType] = useState('End Semester Exam (ESE)');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (activeSubject) {
      setSemester(activeSubject.semester.toString());
      fetchPapers();
    } else {
      setPapers([]);
      setLoading(false);
    }
  }, [activeSubject]);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/papers', {
        params: { subject_id: activeSubject.id }
      });
      setPapers(res.data);
    } catch (err) {
      console.error('Failed to load papers catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setUploadError('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadError('');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!selectedFile) {
      setUploadError('Please select or drag in a text or PDF exam paper file to upload.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('subject_id', activeSubject.id);
    formData.append('year', year);
    formData.append('semester', semester);
    formData.append('exam_type', examType);
    formData.append('paper_file', selectedFile);

    try {
      const res = await api.post('/api/papers/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const count = res.data.pipeline?.questionsCount || 0;
      setUploadSuccess(`Paper uploaded! Gemini AI parsed text & extracted ${count} structured questions into Unit syllabus maps.`);
      setSelectedFile(null);
      await fetchPapers();
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.response?.data?.error || 'Failed to upload and process paper.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePaper = async (id) => {
    if (!window.confirm('Are you sure you want to delete this paper? All parsed questions, topics, and weights mapped from this file will be deleted permanently!')) {
      return;
    }
    try {
      await api.delete(`/api/papers/${id}`);
      await fetchPapers();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  };

  if (!activeSubject) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
        <FileText className="h-12 w-12 text-indigo-500 mb-3" />
        <h3 className="font-extrabold text-gray-850 dark:text-gray-100">No subject selected</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm text-center mt-1">
          Select a subject from the **Subjects** panel to access previous exam papers and trigger AI parsing pipelines.
        </p>
      </div>
    );
  }

  return (
    <div className={`${isCompact ? 'space-y-4' : 'space-y-6'} font-sans`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-lg">
            Catalog: {activeSubject.code}
          </span>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">
            Exam Paper Library
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-normal mt-0.5">
            Browse catalogs of previous year Mid Semester Exams (MSE) and End Semester Exams (ESE) for {activeSubject.name}.
          </p>
        </div>

        <div className="shrink-0">
          <CompactToggle />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Papers Directory */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cataloged Papers ({papers.length})</h3>

          <div className="space-y-3">
            {loading ? (
              <div className="py-20 text-center space-y-2">
                <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Scanning papers database...</p>
              </div>
            ) : papers.length > 0 ? (
              papers.map((paper) => (
                <div 
                  key={paper.id}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <FileText className="h-6 w-6" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-950 px-2.5 py-0.5 rounded-md">
                          Year {paper.year}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-md">
                          {paper.exam_type}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-gray-850 dark:text-gray-100">{paper.file_name}</h4>
                      
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500 font-semibold">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>Uploaded at {new Date(paper.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side download link & deletion */}
                  <div className="flex items-center gap-2">
                    <a
                      href={paper.file_path}
                      download
                      referrerPolicy="no-referrer"
                      className="p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-xl text-gray-650 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all flex items-center justify-center cursor-pointer"
                      title="Download exam paper text"
                    >
                      <Download className="h-4.5 w-4.5" />
                    </a>

                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDeletePaper(paper.id)}
                        className="p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-xl text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center justify-center cursor-pointer"
                        title="Delete exam paper"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <h3 className="font-extrabold text-gray-850 dark:text-gray-100">Papers library is empty</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto mt-1">
                  There are no papers cataloged for {activeSubject.name} yet. {user?.role === 'admin' ? 'Use the admin upload panel on the right to upload a paper!' : 'Ask your academic admin to upload a previous year paper.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1/3: Drag and Drop Upload form (Admins only) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Administrative Operations</h3>

          {user?.role === 'admin' ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="space-y-1">
                <h4 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 leading-none">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Gemini AI Paper Pipeline
                </h4>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Upload exam papers in plain text format to trigger the OCR and auto-mapping pipelines.</p>
              </div>

              {/* Status messages */}
              {uploadError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300">
                  {uploadError}
                </div>
              )}
              {uploadSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/20 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Year Select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Exam Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 text-xs font-bold rounded-xl px-3 py-2 text-gray-850 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>

                {/* Semester Select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Semester</label>
                  <input
                    type="number"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 text-xs font-semibold rounded-xl px-3 py-2 text-gray-850 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Exam Type Select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Examination Pattern</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 text-xs font-bold rounded-xl px-3 py-2 text-gray-850 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="End Semester Exam (ESE)">End Semester Exam (ESE)</option>
                    <option value="Mid Semester Exam (MSE)">Mid Semester Exam (MSE)</option>
                    <option value="Practical Lab Exam">Practical Lab Exam</option>
                  </select>
                </div>

                {/* Drag and Drop Zone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Upload File (.txt or PDF)</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      isDragOver
                        ? 'border-indigo-500 bg-indigo-50/20'
                        : selectedFile
                          ? 'border-emerald-500/50 bg-emerald-50/10'
                          : 'border-gray-200 dark:border-gray-800 hover:border-indigo-400'
                    }`}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      accept=".txt,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-1.5 w-full h-full">
                      <Upload className={`h-8 w-8 ${selectedFile ? 'text-emerald-500' : 'text-indigo-500'}`} />
                      {selectedFile ? (
                        <>
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{selectedFile.name}</span>
                          <span className="text-[10px] text-gray-400 font-semibold uppercase">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-bold text-gray-850 dark:text-gray-200">Drag in files or click to browse</span>
                          <span className="text-[9px] text-gray-400 font-semibold uppercase">Supports plain text or PDF papers</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing AI pipeline...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Process & Parse Paper
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-none">Student Workspaces</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal mt-1 font-medium">
                    As a student, you have view and download access to previous papers. Admin users can upload papers to run OCR and feed syllabus mapping weights automatically.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
