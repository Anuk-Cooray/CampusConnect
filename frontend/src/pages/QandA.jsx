import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api/questions';

const CATEGORIES = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'ITPM', 'SE', 'DS', 'AI', 'General'];

const QandA = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [editingId, setEditingId] = useState(null);
  const [answerText, setAnswerText] = useState({});
  const [expandedQ, setExpandedQ] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterCat, setFilterCat] = useState('');

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(API, { headers });
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchQuestions(); }, []);

  const resetForm = () => {
    setForm({ title: '', description: '', category: '' });
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, form, { headers });
        setSuccess('Question updated!');
      } else {
        await axios.post(API, form, { headers });
        setSuccess('Question posted!');
      }
      resetForm();
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (q) => {
    setForm({ title: q.title, description: q.description, category: q.category });
    setEditingId(q._id);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await axios.delete(`${API}/${id}`, { headers });
      setSuccess('Question deleted.');
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleAnswer = async (questionId) => {
    const text = answerText[questionId]?.trim();
    if (!text) return;
    try {
      await axios.post(`${API}/${questionId}/answers`, { text }, { headers });
      setAnswerText({ ...answerText, [questionId]: '' });
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post answer');
    }
  };

  const handleAccept = async (questionId, answerId) => {
    try {
      await axios.put(`${API}/${questionId}/answers/${answerId}/accept`, {}, { headers });
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept answer');
    }
  };

  const filtered = filterCat ? questions.filter((q) => q.category === filterCat) : questions;

  const categoryColor = (cat) => {
    const colors = {
      'Year 1': 'bg-blue-50 text-blue-600', 'Year 2': 'bg-teal-50 text-teal-600',
      'Year 3': 'bg-amber-50 text-amber-600', 'Year 4': 'bg-red-50 text-red-600',
      'ITPM': 'bg-violet-50 text-violet-600', 'SE': 'bg-pink-50 text-pink-600',
      'DS': 'bg-emerald-50 text-emerald-600', 'AI': 'bg-indigo-50 text-indigo-600',
      'General': 'bg-slate-100 text-slate-600',
    };
    return colors[cat] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 font-sans">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/study-support')} className="flex items-center space-x-1 text-slate-500 hover:text-rose-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              <span className="text-sm font-semibold">Study Support</span>
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <h1 className="text-xl font-extrabold tracking-tight">
              <span className="text-rose-600">Q&A</span> <span className="text-slate-800">Forum</span>
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-medium flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {success}
          </div>
        )}

        {/* Ask a Question Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {editingId ? '✏️ Edit Question' : '❓ Ask a Question'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Title</label>
                <input type="text" required placeholder="e.g. How does polymorphism work?" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Category</label>
                <select required value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm bg-white">
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Description</label>
              <textarea required rows={4} placeholder="Explain your question in detail..." value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-rose-200 hover:shadow-xl transition-all active:scale-95 disabled:opacity-60">
                {loading ? 'Posting...' : editingId ? 'Update Question' : 'Post Question'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setFilterCat('')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${!filterCat ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white text-slate-500 border border-slate-200 hover:border-rose-300'}`}>
            All
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filterCat === c ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white text-slate-500 border border-slate-200 hover:border-rose-300'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Questions List */}
        <div className="space-y-5">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-rose-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-slate-400 font-medium">No questions yet. Be the first to ask!</p>
            </div>
          ) : (
            filtered.map((q) => (
              <div key={q._id} className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-rose-100 transition-all overflow-hidden">
                {/* Question Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColor(q.category)}`}>
                          {q.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          {q.answers?.length || 0} answer{q.answers?.length !== 1 ? 's' : ''}
                        </span>
                        {q.answers?.some((a) => a.isAccepted) && (
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-bold">✓ Solved</span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{q.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{q.description}</p>
                    </div>
                    {q.author?._id === userId && (
                      <div className="flex gap-1 ml-4 flex-shrink-0">
                        <button onClick={() => handleEdit(q)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(q._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                        {q.author?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{q.author?.name || 'Anonymous'}</span>
                    </div>
                    <button onClick={() => setExpandedQ(expandedQ === q._id ? null : q._id)}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors flex items-center">
                      {expandedQ === q._id ? 'Hide' : 'View'} Answers
                      <svg className={`w-4 h-4 ml-1 transition-transform ${expandedQ === q._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Answers Section (Expandable) */}
                {expandedQ === q._id && (
                  <div className="border-t border-slate-100 bg-slate-50/50">
                    {q.answers && q.answers.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {q.answers.map((a) => (
                          <div key={a._id} className={`px-6 py-4 ${a.isAccepted ? 'bg-green-50/60' : ''}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-400 to-slate-500 flex items-center justify-center text-white text-xs font-bold">
                                    {a.author?.name?.charAt(0).toUpperCase() || '?'}
                                  </div>
                                  <span className="text-xs font-semibold text-slate-600">{a.author?.name || 'Anonymous'}</span>
                                  {a.isAccepted && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">✓ Accepted</span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed ml-8">{a.text}</p>
                              </div>
                              {q.author?._id === userId && !a.isAccepted && (
                                <button onClick={() => handleAccept(q._id, a._id)}
                                  className="ml-3 px-3 py-1.5 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-all flex-shrink-0">
                                  ✓ Accept
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-6 py-6 text-center text-sm text-slate-400">No answers yet. Be the first to help!</div>
                    )}

                    {/* Add Answer */}
                    <div className="px-6 py-4 border-t border-slate-100">
                      <div className="flex gap-3">
                        <input type="text" placeholder="Write your answer..."
                          value={answerText[q._id] || ''}
                          onChange={(e) => setAnswerText({ ...answerText, [q._id]: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAnswer(q._id); }}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-sm" />
                        <button onClick={() => handleAnswer(q._id)}
                          className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95">
                          Answer
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default QandA;
