import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api/lecture-materials';

const AdminStudySupportOversight = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(API, { headers });
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchMaterials(); }, []);

  const resetForm = () => {
    setTitle('');
    setSubject('');
    setDescription('');
    setFile(null);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('description', description);
    if (file) formData.append('file', file);

    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, formData, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
        setSuccess('Material updated successfully!');
      } else {
        if (!file) { setError('Please select a PDF file'); setLoading(false); return; }
        await axios.post(API, formData, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
        setSuccess('Material uploaded successfully!');
      }
      resetForm();
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mat) => {
    setTitle(mat.title);
    setSubject(mat.subject);
    setDescription(mat.description);
    setEditingId(mat._id);
    setFile(null);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      await axios.delete(`${API}/${id}`, { headers });
      setSuccess('Material deleted successfully.');
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
      <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/admin')} className="flex items-center space-x-1 text-slate-400 hover:text-orange-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              <span className="text-sm font-semibold">Admin Dashboard</span>
            </button>
            <div className="h-6 w-px bg-slate-700"></div>
            <h1 className="text-xl font-extrabold tracking-tight">
              <span className="text-orange-400">Study Support</span> <span className="text-slate-300">Oversight</span>
            </h1>
          </div>
          <span className="px-3 py-1 bg-orange-900/30 text-orange-400 rounded-full text-xs font-bold border border-orange-700">Management</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-2xl text-red-300 text-sm font-medium flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-2xl text-green-300 text-sm font-medium flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {success}
          </div>
        )}

        {/* Lecture Materials Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-white mb-2">📚 Lecture Materials Management</h2>
          <p className="text-slate-400">Upload, edit, and manage lecture materials for students</p>
        </div>

        {/* Upload Form */}
        <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-8 mb-10">
          <h3 className="text-2xl font-bold text-white mb-6">
            {editingId ? '✏️ Edit Lecture Material' : '📤 Upload New Material'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Title</label>
                <input type="text" required placeholder="e.g. Data Structures Lecture 1" value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm text-white placeholder-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Subject Code</label>
                <input type="text" required placeholder="e.g. IT2030" value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm text-white placeholder-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  PDF File {editingId && <span className="text-slate-500">(optional)</span>}
                </label>
                <input type="file" accept=".pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-orange-500 outline-none transition-all text-sm text-slate-300 file:mr-3 file:px-3 file:py-1 file:rounded-lg file:border-0 file:bg-orange-900/30 file:text-orange-300 file:font-semibold file:text-xs file:cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Description</label>
              <textarea placeholder="Brief description of the material content..." value={description}
                onChange={(e) => setDescription(e.target.value)} rows="3"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm text-white placeholder-slate-500" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-60">
                {loading ? 'Processing...' : editingId ? 'Update Material' : 'Upload Material'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl border border-slate-700 transition-all">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Materials List */}
        <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
          <h3 className="text-2xl font-bold text-white mb-6">📋 All Uploaded Materials ({materials.length})</h3>
          {materials.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-slate-400 font-medium">No materials uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((mat) => (
                <div key={mat._id} className="group border border-slate-700 rounded-2xl p-5 hover:border-orange-600 hover:shadow-lg hover:shadow-orange-500/10 transition-all bg-slate-800/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow flex-shrink-0">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-white text-sm truncate">{mat.title}</h4>
                          <p className="text-xs text-slate-400">{mat.subject}</p>
                        </div>
                      </div>
                      {mat.description && (
                        <p className="text-xs text-slate-400 mb-2 pl-15 line-clamp-1">{mat.description}</p>
                      )}
                      <div className="text-xs text-slate-500 pl-15 space-x-2">
                        <span>Uploaded: {new Date(mat.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{(mat.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleEdit(mat)} className="px-4 py-2 text-xs font-bold text-amber-300 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-700/50 rounded-lg transition-all">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(mat._id)} className="px-4 py-2 text-xs font-bold text-red-300 bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 rounded-lg transition-all">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminStudySupportOversight;
