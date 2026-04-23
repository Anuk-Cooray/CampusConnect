import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api/kuppi-sessions';

const UpcomingKuppiSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    topic: '',
    description: '',
    date: '',
    time: '',
    sessionType: 'inperson',
    location: '',
    meetingLink: '',
    maxParticipants: 20,
  });
  const [showEditModal, setShowEditModal] = useState(false);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, { headers });
      setSessions(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleEdit = (session) => {
    setEditForm({
      topic: session.topic,
      description: session.description || '',
      date: session.date,
      time: session.time,
      sessionType: session.sessionType,
      location: session.location || '',
      meetingLink: session.meetingLink || '',
      maxParticipants: session.maxParticipants || 20,
    });
    setEditingId(session._id);
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!editForm.topic || !editForm.topic.trim()) {
      setError('Topic is required');
      return;
    }

    if (!editForm.date) {
      setError('Date is required');
      return;
    }

    if (!editForm.time) {
      setError('Time is required');
      return;
    }

    if (editForm.sessionType === 'online' && !isMeetingLinkValid(editForm.meetingLink)) {
      setError('Invalid meeting link for online sessions');
      return;
    }

    if (editForm.sessionType === 'inperson' && (!editForm.location || !editForm.location.trim())) {
      setError('Location is required for in-person sessions');
      return;
    }

    try {
      await axios.put(`${API}/${editingId}`, editForm, { headers });
      setSuccess('Session updated!');
      setShowEditModal(false);
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this kuppi session?')) return;
    try {
      await axios.delete(`${API}/${id}`, { headers });
      setSuccess('Session deleted.');
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleJoin = async (id) => {
    try {
      await axios.post(`${API}/${id}/join`, {}, { headers });
      setSuccess('Joined session!');
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join session');
    }
  };

  const handleLeave = async (id) => {
    if (!window.confirm('Leave this session?')) return;
    try {
      await axios.post(`${API}/${id}/leave`, {}, { headers });
      setSuccess('Left session.');
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not leave session');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isTeamsLink = (url) => url && url.includes('teams.microsoft.com');

  const isMeetingLinkValid = (link) => {
    if (!link) return false;
    const lower = link.toLowerCase();
    return (
      lower.includes('teams.microsoft.com') ||
      lower.includes('meet.google.com') ||
      lower.includes('zoom.us') ||
      lower.includes('u_us/j/')
    );
  };

  const isUserParticipant = (session) => {
    return session.participants.some(p => p.user?._id === userId || p.user === userId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 font-sans">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/study-support')}
              className="flex items-center space-x-1 text-slate-500 hover:text-violet-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-semibold">Study Support</span>
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <h1 className="text-xl font-extrabold tracking-tight">
              <span className="text-violet-600">Kuppi</span> <span className="text-slate-800">Sessions</span>
            </h1>
          </div>
          <button
            onClick={() => navigate('/study-support/kuppi/create')}
            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg font-semibold text-sm transition-all"
          >
            + Create Session
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-medium flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        {/* Sessions List */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">📋 Upcoming Sessions</h2>

          {loading ? (
            <div className="text-center py-16">
              <p className="text-slate-400 font-medium">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-violet-50 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-violet-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="text-slate-400 font-medium mb-4">No kuppi sessions yet.</p>
              <button
                onClick={() => navigate('/study-support/kuppi/create')}
                className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg font-semibold text-sm transition-all"
              >
                Create One
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((s) => (
                <div
                  key={s._id}
                  className="group border border-slate-100 rounded-2xl p-6 hover:shadow-xl hover:border-violet-200 transition-all overflow-hidden relative"
                >
                  {/* Session Type Badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center ${
                        s.sessionType === 'online'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {s.sessionType === 'online' ? '💻' : '📍'}
                      {s.sessionType === 'online' ? 'Online' : 'In-Person'}
                    </span>
                  </div>

                  {/* Topic */}
                  <h3 className="font-bold text-slate-800 text-base mb-2 pr-20">{s.topic}</h3>

                  {/* Creator */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                      {s.creator?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-xs text-slate-500">
                      {s.creator?.name || 'Unknown'}
                    </span>
                  </div>

                  {/* Description (if present) */}
                  {s.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{s.description}</p>
                  )}

                  {/* Date & Time */}
                  <div className="space-y-2 mb-4 text-sm text-slate-600">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-violet-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{s.date} at {s.time}</span>
                    </div>

                    {/* Location or Meeting Link */}
                    <div className="flex items-start">
                      <svg
                        className="w-4 h-4 mr-2 text-violet-400 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <div className="flex-1">
                        {s.sessionType === 'online' ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={s.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-violet-600 hover:text-violet-700 font-semibold truncate flex-1"
                            >
                              {isTeamsLink(s.meetingLink) ? '🔗 Join Teams' : '🔗 Join Meeting'}
                            </a>
                            <button
                              onClick={() => copyToClipboard(s.meetingLink, s._id)}
                              className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                              title="Copy link"
                            >
                              {copiedId === s._id ? (
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span>{s.location}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Participants Capacity */}
                  <div className="mb-4 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-600 font-medium">Participants</span>
                      <span className="text-violet-600 font-bold">
                        {s.participants?.length || 0}/{s.maxParticipants}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-purple-500 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${(((s.participants?.length || 0) / s.maxParticipants) * 100).toFixed(0)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {s.creator?._id === userId ? (
                      <>
                        <button
                          onClick={() => handleEdit(s)}
                          className="flex-1 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 py-2 rounded-lg transition-all"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="flex-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition-all"
                        >
                          🗑️ Delete
                        </button>
                      </>
                    ) : isUserParticipant(s) ? (
                      <>
                        {s.sessionType === 'online' && (
                          <a
                            href={s.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 py-2 rounded-lg transition-all text-center"
                          >
                            {isTeamsLink(s.meetingLink) ? '👥 Join Teams' : '👥 Join Call'}
                          </a>
                        )}
                        <button
                          onClick={() => handleLeave(s._id)}
                          className="flex-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-2 rounded-lg transition-all"
                        >
                          Leave
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleJoin(s._id)}
                        disabled={(s.participants?.length || 0) >= s.maxParticipants}
                        className="flex-1 text-xs font-bold text-white bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {(s.participants?.length || 0) >= s.maxParticipants ? '🔒 Full' : '✨ Join'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">✏️ Edit Session</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Topic */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Topic *</label>
                <input
                  type="text"
                  value={editForm.topic}
                  onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Description</label>
                <textarea
                  rows="2"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm resize-none"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Date *</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Time *</label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Session Type *</label>
                <select
                  value={editForm.sessionType}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      sessionType: e.target.value,
                      location: '',
                      meetingLink: '',
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm bg-white"
                >
                  <option value="inperson">📍 In-Person</option>
                  <option value="online">💻 Online</option>
                </select>
              </div>

              {/* Location or Meeting Link */}
              {editForm.sessionType === 'inperson' ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Location *</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Meeting Link *</label>
                  <input
                    type="text"
                    value={editForm.meetingLink}
                    onChange={(e) => setEditForm({ ...editForm, meetingLink: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm"
                  />
                </div>
              )}

              {/* Max Participants */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Max Participants</label>
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={editForm.maxParticipants}
                  onChange={(e) => setEditForm({ ...editForm, maxParticipants: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all"
                >
                  Update Session
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingKuppiSessions;
