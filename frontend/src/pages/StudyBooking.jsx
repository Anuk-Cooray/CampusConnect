import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StudySupportNav } from '../components/StudySupportNav';

const API = 'http://localhost:5000/api/study-bookings';

const StudyBooking = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ roomNumber: '', date: '', startTime: '', endTime: '', groupName: '', students: [] });
  const [currentStudent, setCurrentStudent] = useState({ name: '', studentId: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'my'
  const [userName, setUserName] = useState('Student');
  const [userRole, setUserRole] = useState('Student');
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedRole = localStorage.getItem('userRole');
    if (storedName) setUserName(storedName);
    if (storedRole) setUserRole(storedRole);
  }, []);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(API, { headers });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const resetForm = () => {
    setForm({ roomNumber: '', date: '', startTime: '', endTime: '', groupName: '', students: [] });
    setCurrentStudent({ name: '', studentId: '' });
    setEditingId(null);
    setError('');
  };

  const addStudent = () => {
    if (!currentStudent.name.trim() || !currentStudent.studentId.trim()) {
      setError('Please enter both name and student ID');
      return;
    }
    setForm({
      ...form,
      students: [...form.students, currentStudent],
    });
    setCurrentStudent({ name: '', studentId: '' });
    setError('');
  };

  const removeStudent = (index) => {
    setForm({
      ...form,
      students: form.students.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, form, { headers });
        setSuccess('Booking updated successfully!');
      } else {
        await axios.post(API, form, { headers });
        setSuccess('Booking created successfully!');
      }
      resetForm();
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking) => {
    setForm({
      roomNumber: booking.roomNumber,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      groupName: booking.groupName,
      students: booking.students || [],
    });
    setCurrentStudent({ name: '', studentId: '' });
    setEditingId(booking._id);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      await axios.delete(`${API}/${id}`, { headers });
      setSuccess('Booking deleted.');
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <StudySupportNav userName={userName} userRole={userRole} />

      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Messages */}
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

        {/* Booking Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {editingId ? '✏️ Edit Booking' : '📅 New Booking'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Room Number</label>
                <input type="text" required placeholder="e.g. A-101" value={form.roomNumber}
                  onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Date</label>
                <input type="date" required value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Group Name</label>
                <input type="text" required placeholder="e.g. Team Alpha" value={form.groupName}
                  onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Start Time</label>
                <input type="time" required value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">End Time</label>
                <input type="time" required value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm" />
              </div>
            </div>

            {/* Students Section */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">👥 Group Members</h3>
              
              {/* Add Student Input */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-5 border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Student Name</label>
                    <input type="text" placeholder="e.g. John Doe" value={currentStudent.name}
                      onChange={(e) => setCurrentStudent({ ...currentStudent, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Student ID</label>
                    <input type="text" placeholder="e.g. 2023001" value={currentStudent.studentId}
                      onChange={(e) => setCurrentStudent({ ...currentStudent, studentId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm" />
                  </div>
                </div>
                <button type="button" onClick={addStudent}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Add Student
                </button>
              </div>

              {/* Students List */}
              {form.students.length > 0 ? (
                <div className="space-y-2 mb-5">
                  {form.students.map((student, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.studentId}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeStudent(index)}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-all">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic mb-5">No students added yet</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-end gap-3">
              <button type="submit" disabled={loading || form.students.length === 0}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-95 disabled:opacity-60">
                {loading ? 'Saving...' : editingId ? 'Update Booking' : 'Book Room'}
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

        {/* View Switcher Tabs */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-10">
          <div className="flex gap-3 mb-8 border-b border-slate-200">
            <button
              onClick={() => setViewMode('all')}
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
                viewMode === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              All Room Bookings
            </button>
            <button
              onClick={() => setViewMode('my')}
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
                viewMode === 'my'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              My Bookings
            </button>
          </div>

          {/* All Room Bookings View */}
          {viewMode === 'all' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">📋 All Room Bookings</h2>
              {bookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="text-slate-400 font-medium">No bookings yet. Be the first to book!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {bookings.map((b) => (
                    <div key={b._id} className="group border border-slate-100 rounded-2xl p-5 hover:shadow-lg hover:border-blue-200 transition-all hover:bg-blue-50/30">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
                            {b.roomNumber}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{b.groupName}</p>
                            <p className="text-xs text-slate-500">{b.user?.name || 'Unknown User'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center text-sm text-slate-600">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="font-semibold">{b.date}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="font-semibold">{b.startTime} – {b.endTime}</span>
                        </div>
                        <div className="flex items-center text-xs text-slate-500">
                          <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          Booked by: {b.user?.name || 'Unknown'} {b.user?.studentId ? `(${b.user.studentId})` : ''}
                        </div>
                      </div>
                      {b.students && b.students.length > 0 && (
                        <div className="border-t border-slate-200 pt-3">
                          <p className="text-xs font-semibold text-slate-600 mb-2">👥 Members:</p>
                          <div className="space-y-1.5">
                            {b.students.map((student, idx) => (
                              <div key={idx} className="flex items-center text-xs text-slate-700 bg-slate-50 rounded px-2 py-1">
                                <span className="font-semibold">{student.name}</span>
                                <span className="text-slate-500 ml-1">({student.studentId})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Bookings View */}
          {viewMode === 'my' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">✏️ My Bookings</h2>
              {bookings.filter((b) => b.user?._id === userId).length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="text-slate-400 font-medium">You haven't made any bookings yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {bookings.filter((b) => b.user?._id === userId).map((b) => (
                    <div key={b._id} className="group border border-blue-100 rounded-2xl p-5 hover:shadow-lg hover:border-blue-300 transition-all bg-gradient-to-br from-blue-50 to-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                            {b.roomNumber}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{b.groupName}</p>
                            <p className="text-xs text-blue-600 font-semibold">Your Booking</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center text-sm text-slate-600">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {b.date}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {b.startTime} – {b.endTime}
                        </div>
                      </div>
                      {b.students && b.students.length > 0 && (
                        <div className="border-t border-blue-200 pt-3 mb-4">
                          <p className="text-xs font-semibold text-slate-700 mb-2">👥 Group Members:</p>
                          <div className="space-y-1.5">
                            {b.students.map((student, idx) => (
                              <div key={idx} className="flex items-center text-xs text-slate-700 bg-white rounded px-2 py-1 border border-blue-100">
                                <span className="font-semibold">{student.name}</span>
                                <span className="text-slate-500 ml-1">({student.studentId})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(b)} className="flex-1 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 py-2.5 rounded-lg transition-all active:scale-95">
                          <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(b._id)} className="flex-1 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 py-2.5 rounded-lg transition-all active:scale-95">
                          <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudyBooking;
