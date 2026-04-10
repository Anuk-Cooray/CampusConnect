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
import AdminApplicationViewer from './components/AdminApplicationViewer.jsx';
import AdminQAManager from './components/AdminQAManager.jsx';
import Marketplace from './components/Marketplace.jsx';
import AdminMarketplace from './components/AdminMarketplace.jsx';
import AdminAccommodationPage from "./pages/AdminAccommodationPage";
import AccommodationsPage from "./pages/AccommodationsPage";
import TimeManagementPage from "./pages/TimeManagementPage.tsx";
import StudentProfile from './components/StudentProfile.jsx';
import ApplicationTracker from './components/ApplicationTracker.jsx';
import AccommodationForm from "./components/accommodation/AccommodationForm";
import AccommodationDetail from "./components/accommodation/AccommodationDetail";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Student routes */}
        <Route path="/dashboard" element={<MainDashboard />} />
        <Route path="/jobs" element={<JobPortal />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/applications/track" element={<ApplicationTracker />} />

        {/* Admin routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/jobs" element={<AdminJobPortal />} />
        <Route path="/admin/applications" element={<AdminApplicationViewer />} />
        <Route path="/admin/qa" element={<AdminQAManager />} />
        <Route path="/admin/marketplace" element={<AdminMarketplace />} />
       

        {/* Group member placeholders */}
        <Route path="/accommodations" element={<AccommodationsPage />} />
        <Route path="/accommodations/new" element={<AccommodationForm />} />
        <Route path="/accommodations/:id/edit" element={<AccommodationForm />} />
        <Route path="/accommodations/:id" element={<AccommodationDetail />} />
        <Route path="/admin/accommodation" element={<Navigate to="/admin/accommodations" replace />} />
        <Route path="/admin/accommodations" element={<AdminAccommodationPage />} />
        <Route path="/time-management" element={<TimeManagementPage />} />
        <Route
          path="/marketplace"
          element={<Marketplace />}
        />
        <Route
          path="/study-support"
          element={<div className="p-8 text-center">Study Support</div>}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);

