import React, { useState, useEffect } from 'react';
import { useSubject } from '../context/SubjectContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../context/AuthContext.jsx';
import CompactToggle from '../components/CompactToggle.jsx';
import { Map, Plus, Trash2, Edit3, Bookmark, AlertCircle, Sparkles, HelpCircle, X, Check, Target } from 'lucide-react';

export default function SyllabusMap() {
  const { activeSubject } = useSubject();
  const { user } = useAuth();
  const { isCompact } = useTheme();

  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [mappedQs, setMappedQs] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Unit creation / editing modal state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [unitNumber, setUnitNumber] = useState('');
  const [unitName, setUnitName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (activeSubject) {
      fetchUnits();
    } else {
      setUnits([]);
      setLoading(false);
    }
  }, [activeSubject]);

  useEffect(() => {
    if (selectedUnit) {
      fetchUnitDetails();
    } else {
      setMappedQs([]);
      setTopics([]);
    }
  }, [selectedUnit]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/units', {
        params: { subject_id: activeSubject.id }
      });
      setUnits(res.data);
      if (res.data.length > 0) {
        setSelectedUnit(res.data[0]);
      } else {
        setSelectedUnit(null);
      }
    } catch (err) {
      console.error('Failed to load subject syllabus units:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitDetails = async () => {
    try {
      // Fetch mapped questions
      const qsRes = await api.get('/api/questions/search', {
        params: { subject_id: activeSubject.id, unit_id: selectedUnit.id }
      });
      
      // Fetch topics for this unit
      const topicsRes = await api.get('/api/analytics/repeated-topics', {
        params: { subject_id: activeSubject.id }
      });

      const filteredTopics = topicsRes.data.filter(t => t.unit_id === selectedUnit.id);
      
      // Load occurrences to show frequency
      const occurrencesRes = await api.get('/api/questions/repeated', {
        params: { subject_id: activeSubject.id }
      });

      const mappedWithFreq = qsRes.data.map(q => {
        const foundRepeat = occurrencesRes.data.find(r => r.id === q.id || r.question_text.toLowerCase().trim() === q.question_text.toLowerCase().trim());
        return {
          ...q,
          frequency: foundRepeat ? foundRepeat.frequency : 1,
          years: foundRepeat ? foundRepeat.years : []
        };
      });

      setMappedQs(mappedWithFreq);
      setTopics(filteredTopics);
    } catch (err) {
      console.error('Failed to load unit breakdown details:', err);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setUnitNumber((units.length + 1).toString());
    setUnitName('');
    setDescription('');
    setError('');
    setShowForm(true);
  };

  const handleOpenEdit = (unit) => {
    setEditingId(unit.id);
    setUnitNumber(unit.unit_number.toString());
    setUnitName(unit.unit_name);
    setDescription(unit.description);
    setError('');
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaveLoading(true);

    if (!unitNumber || !unitName) {
      setError('Unit Number and Unit Name are required.');
      setSaveLoading(false);
      return;
    }

    const payload = {
      subject_id: activeSubject.id,
      unit_number: parseInt(unitNumber, 10),
      unit_name: unitName,
      description
    };

    try {
      if (editingId) {
        const res = await api.put(`/api/units/${editingId}`, payload);
        setSelectedUnit(res.data);
      } else {
        const res = await api.post('/api/units', payload);
        setSelectedUnit(res.data);
      }
      setShowForm(false);
      await fetchUnits();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save unit mapping.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this syllabus unit? All questions associated with this unit will be unmapped, and unit topic score analytics will be purged.')) {
      return;
    }
    try {
      await api.delete(`/api/units/${id}`);
      await fetchUnits();
    } catch (err) {
      alert('Deletion failed: ' + (err.response?.data?.error || err.message));
    }
  };

  if (!activeSubject) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
        <Target className="h-12 w-12 text-indigo-500 mb-3" />
        <h3 className="font-extrabold text-gray-850 dark:text-gray-100">No subject selected</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm text-center mt-1">
          Select a subject from the **Subjects** panel to configure or review syllabus units and mapped exam questions.
        </p>
      </div>
    );
  }

  return (
    <div className={`${isCompact ? 'space-y-4' : 'space-y-6'} font-sans`}>
      {/* Header section with Add Unit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg">
            Syllabus Mapping: {activeSubject.code}
          </span>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">
            Curriculum Unit & Question Mapping
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-normal mt-0.5">
            Organize course chapters, extract important topics, and analyze mapped examination questions for {activeSubject.name}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CompactToggle />
          {user?.role === 'admin' && (
            <button
              onClick={handleOpenCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-sm transition-all shadow-md flex items-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="h-4.5 w-4.5" />
              Add Unit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Units List */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Chapters ({units.length})</h3>
          
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {units.map((unit) => {
              const isSelected = selectedUnit?.id === unit.id;
              return (
                <div
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit)}
                  className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-start justify-between gap-3 relative overflow-hidden ${
                    isSelected
                      ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20'
                      : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-950 text-gray-500 dark:text-gray-400'
                    }`}>
                      Unit {unit.unit_number}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white pt-1">{unit.unit_name}</h4>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium line-clamp-1">{unit.description}</p>
                  </div>

                  {/* Admin edit/delete buttons inside item card */}
                  {user?.role === 'admin' && (
                    <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEdit(unit)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-all"
                        title="Edit chapter"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(unit.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-all"
                        title="Delete chapter"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {units.length === 0 && (
              <div className="py-12 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <HelpCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold">No units mapped</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Please add units to build the subject structure.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Unit Breakdown details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedUnit ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
              {/* Unit Title Header */}
              <div className="pb-4 border-b border-gray-100 dark:border-gray-800 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Unit {selectedUnit.unit_number} Breakdown</span>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">{selectedUnit.unit_name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed pt-1">{selectedUnit.description || 'No description provided for this chapter.'}</p>
              </div>

              {/* Topics Extracted */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Bookmark className="h-4 w-4 text-indigo-500" />
                  Extracted Core Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {topics.length > 0 ? (
                    topics.map(topic => (
                      <span 
                        key={topic.id}
                        className="px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-[11px] font-semibold text-gray-800 dark:text-gray-200 rounded-xl flex items-center gap-1.5"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                        {topic.topic_name}
                        <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 bg-indigo-100/50 dark:bg-indigo-950/40 rounded-full">
                          Score {topic.importance_score}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">No topics parsed for this unit yet. Topics are automatically indexed when papers are uploaded and mapped.</span>
                  )}
                </div>
              </div>

              {/* Questions Mapped */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-purple-500" />
                  Mapped Questions Repository ({mappedQs.length})
                </h4>

                <div className="space-y-3">
                  {mappedQs.length > 0 ? (
                    mappedQs.map((q, idx) => (
                      <div 
                        key={q.id} 
                        className="p-4 bg-gray-50/50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800/80 rounded-2xl hover:border-indigo-500/20 transition-all flex items-start gap-4"
                      >
                        <div className="h-7 w-7 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="space-y-1.5 flex-grow">
                          <p className="text-xs font-bold text-gray-805 dark:text-gray-200 leading-relaxed">
                            "{q.question_text}"
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                              Marks: {q.marks}
                            </span>
                            <span className="text-gray-300 dark:text-gray-800">•</span>
                            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                              Type: {q.question_type}
                            </span>
                            {q.frequency > 1 && (
                              <>
                                <span className="text-gray-300 dark:text-gray-800">•</span>
                                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded-full uppercase">
                                  Repeated {q.frequency}x ({q.years.join(', ')})
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 bg-gray-50 dark:bg-gray-950/40 rounded-2xl border border-dashed border-gray-100 dark:border-gray-800/80 p-6">
                      <AlertCircle className="h-7 w-7 text-gray-400 mb-1.5" />
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-bold">No exam questions mapped</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-1">
                        Questions will appear here once previous year exam papers are uploaded and analyzed.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
              <AlertCircle className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-400 dark:text-gray-500 font-bold">No unit selected</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Select a chapter from the left to view questions and topics mapping.</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
              <div className="flex items-center gap-2">
                <Map className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-extrabold text-gray-900 dark:text-white">
                  {editingId ? 'Edit Syllabus Chapter' : 'Add Syllabus Chapter'}
                </h3>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 dark:text-gray-500 transition-all cursor-pointer">
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

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Chapter Number (Sequence)</label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Chapter Name</label>
                <input
                  type="text"
                  placeholder="e.g. Database Design & Normalization"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Description / Key Topics covered</label>
                <textarea
                  rows="3"
                  placeholder="Briefly state key headings, functional subtopics, dependencies..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all resize-none"
                />
              </div>

              {/* Submit buttons */}
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
                  disabled={saveLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-1"
                >
                  {saveLoading && <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Save chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
