import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './style.css';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import MainDashboard from './components/MainDashboard.jsx';
import JobPortal from './components/Dashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import AdminJobPortal from './components/AdminJobPortal.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Student routes */}
        <Route path="/dashboard" element={<MainDashboard />} />
        <Route path="/jobs" element={<JobPortal />} />

        {/* Admin routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/jobs" element={<AdminJobPortal />} />

        {/* Group member placeholders */}
        <Route
          path="/accommodation"
          element={<div className="p-8 text-center">Accommodation</div>}
        />
        <Route
          path="/marketplace"
          element={<div className="p-8 text-center">Marketplace</div>}
        />
        <Route
          path="/study-support"
          element={<div className="p-8 text-center">Study Support</div>}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);

