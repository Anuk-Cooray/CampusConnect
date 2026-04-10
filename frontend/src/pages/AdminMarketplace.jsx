import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanelMarketPlace from "../components/ui/AdminPanelMarketPlace";

const AdminMarketplace = () => {
  const navigate = useNavigate();
  return <AdminPanelMarketPlace onBack={() => navigate('/admin-dashboard')} />;
};

export default AdminMarketplace;

