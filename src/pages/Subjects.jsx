import React, { useState } from 'react';
import { useSubject } from '../context/SubjectContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../context/AuthContext.jsx';
import CompactToggle from '../components/CompactToggle.jsx';
import { BookOpen, Plus, Trash2, Edit3, BookmarkCheck, FolderMinus, Layers, GraduationCap, X, Check } from 'lucide-react';

export default function Subjects() {
  const { subjects, activeSubject, selectSubject, refreshSubjects } = useSubject();
  const { user } = useAuth();
  const { isCompact } = useTheme();
  
  // Modal / Editing State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [semester, setSemester] = useState('');
  const [branch, setBranch] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setSemester('');
    setBranch('');
    setDescription('');
    setError('');
    setShowForm(true);
  };

  const openEditModal = (subject) => {
    setEditingId(subject.id);
    setName(subject.name);
    setCode(subject.code);
    setSemester(subject.semester.toString());
    setBranch(subject.branch);
    setDescription(subject.description);
    setError('');
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !code || !semester || !branch) {
      setError('Name, Code, Semester, and Branch are required fields.');
      setLoading(false);
      return;
    }

    const payload = {
      name,
      code,
      semester: parseInt(semester, 10),
      branch,
      description
    };

    try {
      if (editingId) {
        await api.put(`/api/subjects/${editingId}`, payload);
      } else {
        await api.post('/api/subjects', payload);
      }
      await refreshSubjects();
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save subject.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject? This will delete all mapped syllabus units, questions, and weightage data permanently!')) {
      return;
    }
    try {
      await api.delete(`/api/subjects/${id}`);
      if (activeSubject?.id === id) {
        selectSubject(null);
      }
      await refreshSubjects();
    } catch (err) {
      alert('Failed to delete subject: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSetActive = (subject) => {
    selectSubject(subject);
  };

  return (
    <div className={`${isCompact ? 'space-y-4' : 'space-y-6'} font-sans`}>
      {/* Title section with Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Academic Subjects Catalog</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-normal mt-0.5">Choose your primary focus to populate analytics and chat assistant context.</p>
        </div>

        <div className="flex items-center gap-3">
          <CompactToggle />
          {user?.role === 'admin' && (
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-sm transition-all shadow-md flex items-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="h-4.5 w-4.5" />
              Add Subject
            </button>
          )}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub) => {
          const isActive = activeSubject?.id === sub.id;
          return (
            <div 
              key={sub.id} 
              className={`bg-white dark:bg-gray-900 border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden ${
                isActive 
                  ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/10 dark:ring-indigo-400/10' 
                  : 'border-gray-100 dark:border-gray-800'
              }`}
            >
              {/* Highlight badge for Active subject */}
              {isActive && (
                <div className="absolute top-0 right-0 bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-1 text-[10px] font-bold rounded-bl-2xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Check className="h-3 w-3" /> Focus Context
                </div>
              )}

              {/* Top Meta Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg">
                    {sub.code}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-950 px-2 py-0.5 rounded-lg">
                    Semester {sub.semester}
                  </span>
                </div>
                
                <h3 className="text-lg font-extrabold text-gray-850 dark:text-gray-100 leading-tight pr-12">{sub.name}</h3>
                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 block uppercase tracking-wide">{sub.branch}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-3 leading-relaxed pt-1">{sub.description || 'No description provided.'}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800/80 pt-4 mt-2">
                <button
                  onClick={() => handleSetActive(sub)}
                  disabled={isActive}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 font-extrabold cursor-default'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/10'
                  }`}
                >
                  <BookmarkCheck className="h-4 w-4" />
                  {isActive ? 'Focused Workspace' : 'Set as Focus'}
                </button>

                {/* Admin Management Tools */}
                {user?.role === 'admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(sub)}
                      className="p-2 text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl transition-all"
                      title="Edit Subject"
                    >
                      <Edit3 className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                      title="Delete Subject"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {subjects.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
            <FolderMinus className="h-12 w-12 text-indigo-500 mb-3" />
            <h3 className="font-extrabold text-gray-850 dark:text-gray-100">Subjects directory is empty</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mt-1">
              There are no academic subjects added yet. {user?.role === 'admin' ? 'Click Add Subject above to create one!' : 'Please wait for your admin to configure some.'}
            </p>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-extrabold text-gray-900 dark:text-white">
                  {editingId ? 'Edit Academic Subject' : 'Add New Subject'}
                </h3>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 dark:text-gray-500 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS-501"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Semester</label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    min="1"
                    max="10"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Database Management Systems"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Academic Branch</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science & Engineering"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Description</label>
                <textarea
                  rows="3"
                  placeholder="Briefly summarize syllabus topics, credit metrics, or evaluation criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-1"
                >
                  {loading && <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
