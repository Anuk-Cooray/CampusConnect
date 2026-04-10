import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api/lecture-materials';

const LectureMaterials = () => {
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
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'Admin';
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
        setSuccess('Material updated!');
      } else {
        if (!file) { setError('Please select a PDF file'); setLoading(false); return; }
        await axios.post(API, formData, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
        setSuccess('Material uploaded!');
      }
      resetForm();
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const response = await axios.get(`${API}/${id}/download`, { 
        headers, 
        responseType: 'blob' 
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download file');
    }
  };

  const handleEdit = (mat) => {
    setTitle(mat.title);
    setSubject(mat.subject);
    setDescription(mat.description || '');
    setEditingId(mat._id);
    setFile(null);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await axios.delete(`${API}/${id}`, { headers });
      setSuccess('Material deleted.');
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 font-sans">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/study-support')} className="flex items-center space-x-1 text-slate-500 hover:text-teal-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              <span className="text-sm font-semibold">Study Support</span>
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <h1 className="text-xl font-extrabold tracking-tight">
              <span className="text-teal-600">Lecture</span> <span className="text-slate-800">Materials</span>
            </h1>
          </div>
          {isAdmin && (
            <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold">Admin</span>
          )}
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

        {/* Upload Form (Admin Only) */}
        {isAdmin && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingId ? '✏️ Edit Material' : '📤 Upload Material'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Title</label>
                  <input type="text" required placeholder="e.g. Data Structures Lecture 1" value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Subject Code</label>
                  <input type="text" required placeholder="e.g. IT2030" value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                    PDF File {editingId && <span className="text-slate-400">(optional)</span>}
                  </label>
                  <input type="file" accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm file:mr-3 file:px-3 file:py-1 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700 file:font-semibold file:text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Description</label>
                <textarea placeholder="Brief description of the material content..." value={description}
                  onChange={(e) => setDescription(e.target.value)} rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm" />
              </div>
              <div className="flex items-end gap-3">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-teal-200 hover:shadow-xl transition-all active:scale-95 disabled:opacity-60">
                  {loading ? 'Saving...' : editingId ? 'Update Material' : 'Upload Material'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm}
                    className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Materials List */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">📚 Lecture Materials</h2>
          {materials.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-teal-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-slate-400 font-medium">No materials uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((mat) => (
                <div key={mat._id} className="group border border-slate-100 rounded-2xl p-5 hover:shadow-md hover:border-teal-300 transition-all hover:bg-teal-50/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white shadow flex-shrink-0">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-800 text-sm truncate">{mat.title}</h3>
                          <p className="text-xs text-slate-500">{mat.subject}</p>
                        </div>
                      </div>
                      {mat.description && (
                        <p className="text-xs text-slate-600 mb-2 pl-15 line-clamp-2">{mat.description}</p>
                      )}
                      <div className="text-xs text-slate-400 pl-15">
                        <span>by {mat.uploadedBy?.name || 'Admin'}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(mat.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button 
                        onClick={() => handleDownload(mat._id, mat.fileName)}
                        className="flex items-center gap-1 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 px-4 py-2.5 rounded-lg transition-all active:scale-95 shadow-md">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        PDF
                      </button>
                      {isAdmin && (
                        <>
                          <button onClick={() => handleEdit(mat)} className="text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg transition-all">Edit</button>
                          <button onClick={() => handleDelete(mat._id)} className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-all">Delete</button>
                        </>
                      )}
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

export default LectureMaterials;
