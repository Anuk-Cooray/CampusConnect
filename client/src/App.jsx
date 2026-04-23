import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import MainDashboard from "./pages/MainDashboard.jsx";
import JobPortal from "./pages/JobPortal.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminJobPortal from "./pages/AdminJobPortal.jsx";
import AdminApplicationViewer from "./pages/AdminApplicationViewer.jsx";
import AdminQAManager from "./pages/AdminQAManager.jsx";
import AdminStudySupportOversight from "./pages/AdminStudySupportOversight.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import AdminMarketplace from "./pages/AdminMarketplace.jsx";
import StudentMarketplaceDashboard from "./pages/StudentMarketplaceDashboard.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";
import ApplicationTracker from "./pages/ApplicationTracker.jsx";
import StudySupportDashboard from "./pages/StudySupportDashboard.jsx";
import StudyBooking from "./pages/StudyBooking.jsx";
import LectureMaterials from "./pages/LectureMaterials.jsx";
import CreateKuppiSession from "./pages/CreateKuppiSession.jsx";
import UpcomingKuppiSessions from "./pages/UpcomingKuppiSessions.jsx";
import QandA from "./pages/QandA.jsx";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<MainDashboard />} />
      <Route path="/jobs" element={<JobPortal />} />
      <Route path="/profile" element={<StudentProfile />} />
      <Route path="/applications/track" element={<ApplicationTracker />} />

      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin/jobs" element={<AdminJobPortal />} />
      <Route path="/admin/applications" element={<AdminApplicationViewer />} />
      <Route path="/admin/qa" element={<AdminQAManager />} />
      <Route path="/admin/study-support" element={<AdminStudySupportOversight />} />
      <Route path="/admin/marketplace" element={<AdminMarketplace />} />
      
      
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/marketplace/dashboard" element={<StudentMarketplaceDashboard />} />
      <Route path="/study-support" element={<StudySupportDashboard />} />
      <Route path="/study-support/bookings" element={<StudyBooking />} />
      <Route path="/study-support/materials" element={<LectureMaterials />} />
      <Route path="/study-support/kuppi/create" element={<CreateKuppiSession />} />
      <Route path="/study-support/kuppi/upcoming" element={<UpcomingKuppiSessions />} />
      <Route path="/study-support/kuppi" element={<UpcomingKuppiSessions />} />
      <Route path="/study-support/qna" element={<QandA />} />
    </Routes>
  );
}
