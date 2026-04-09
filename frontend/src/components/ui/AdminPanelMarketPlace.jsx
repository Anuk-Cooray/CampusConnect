import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Store, 
  Package, 
  X, 
  Send ,
  CheckCircle,
  AlertCircle,
  Search,
  Eye,
  Clock,
  Shield,
  Sparkles,
  Crown,
  Flame,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Tag,
  DollarSign,
  ChevronRight,
  ArrowLeft,
  Users,
  Settings,
  LayoutDashboard,
  ShoppingCart,
  Store as StoreIcon,
  RefreshCw,
  Filter,
  MoreVertical,
  Check,
  X as XIcon,
  Trash2,
  FileText,
  Building2,
  GraduationCap,
  Loader2,
  MessageSquare,
  CreditCard,
  TrendingUp,
  Award,
  BarChart3,
  Bell,
  Menu,
  LogOut,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  BookOpen,
  Laptop,
  Home,
  Headphones,
  Utensils,
  Code,
  Camera,
  Heart,
  Eye as EyeIcon,
  ThumbsUp,
  Star,
  Zap,
  Gift,
  Truck,
  Globe,
  Smartphone,
  Watch,
  Music,
  Gamepad,
  Shirt,
  Bike
} from 'lucide-react';

// ==================== API SERVICE ====================
const API_BASE_URL = 'http://localhost:5000/api';

const apiService = {
  // Admin endpoints
  getPendingRequests: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/pending-requests`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  contactSeller: async (contactData) => {
    const response = await fetch(`${API_BASE_URL}/admin/contact-seller`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Item endpoints
  approveItem: async (id) => {
    const response = await fetch(`${API_BASE_URL}/items/${id}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  rejectItem: async (id) => {
    const response = await fetch(`${API_BASE_URL}/items/${id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  deleteItem: async (id) => {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Shop endpoints
  approveShop: async (id) => {
    const response = await fetch(`${API_BASE_URL}/shops/${id}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  rejectShop: async (id) => {
    const response = await fetch(`${API_BASE_URL}/shops/${id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  deleteShop: async (id) => {
    const response = await fetch(`${API_BASE_URL}/shops/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Get approved items
  getApprovedItems: async () => {
    const response = await fetch(`${API_BASE_URL}/items/approved`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get approved shops
  getApprovedShops: async () => {
    const response = await fetch(`${API_BASE_URL}/shops/approved`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

// ==================== ADMIN PANEL COMPONENT ====================
const AdminPanel = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalItems: 0,
    totalShops: 0,
    pendingItems: 0,
    pendingShops: 0
  });
  const [contactForm, setContactForm] = useState({
    buyerName: '',
    buyerEmail: '',
    message: ''
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  // Load data from backend
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPendingRequests(),
        loadApprovedContent(),
        loadStats()
      ]);
    } catch (error) {
      showNotification('Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const requests = await apiService.getPendingRequests();
      // Transform pending requests to have consistent structure
      const transformedRequests = requests.map(req => {
        if (req.type === 'item') {
          return {
            ...req,
            seller: {
              name: req.sellerName || req.seller?.name || 'Unknown Seller',
              contact: req.contactEmail || req.seller?.contact || req.contact || 'N/A',
              phone: req.phone || req.seller?.phone || 'N/A',
              studentId: req.studentId || req.seller?.studentId || 'N/A',
              nic: req.nic || req.seller?.nic || 'N/A'
            }
          };
        }
        return req;
      });
      setPendingRequests(transformedRequests);
    } catch (error) {
      console.error('Error loading pending requests:', error);
      showNotification('Failed to load pending requests', 'error');
    }
  };

  const loadApprovedContent = async () => {
    try {
      const [items, shops] = await Promise.all([
        apiService.getApprovedItems(),
        apiService.getApprovedShops()
      ]);
      
      // Transform items to have consistent seller structure
      const transformedItems = items.map(item => ({
        ...item,
        type: 'item',
        seller: {
          name: item.sellerName || item.seller?.name || 'Unknown Seller',
          contact: item.contactEmail || item.seller?.contact || item.contact || 'N/A',
          phone: item.phone || item.seller?.phone || 'N/A',
          studentId: item.studentId || item.seller?.studentId || 'N/A',
          nic: item.nic || item.seller?.nic || 'N/A'
        }
      }));
      
      const transformedShops = shops.map(shop => ({
        ...shop,
        type: 'shop'
      }));
      
      const approvedContent = [
        ...transformedItems,
        ...transformedShops
      ].sort((a, b) => new Date(b.approvedDate || b.createdAt) - new Date(a.approvedDate || a.createdAt));
      
      setApprovedItems(approvedContent);
    } catch (error) {
      console.error('Error loading approved content:', error);
      showNotification('Failed to load approved content', 'error');
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await apiService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleApprove = async (request) => {
    try {
      if (request.type === 'item') {
        await apiService.approveItem(request._id);
      } else {
        await apiService.approveShop(request._id);
      }
      
      showNotification(`${request.type === 'item' ? 'Item' : 'Shop'} "${request.type === 'item' ? request.title : request.shopName}" has been approved!`, 'success');
      await loadAllData();
      setShowDetailModal(false);
    } catch (error) {
      showNotification('Failed to approve: ' + error.message, 'error');
    }
  };

  const handleReject = async (request) => {
    try {
      if (request.type === 'item') {
        await apiService.rejectItem(request._id);
      } else {
        await apiService.rejectShop(request._id);
      }
      
      showNotification(`${request.type === 'item' ? 'Item' : 'Shop'} "${request.type === 'item' ? request.title : request.shopName}" has been rejected.`, 'error');
      await loadAllData();
      setShowDetailModal(false);
    } catch (error) {
      showNotification('Failed to reject: ' + error.message, 'error');
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`⚠️ Are you sure you want to delete this ${item.type}?\n\nThis action cannot be undone.`)) {
      try {
        if (item.type === 'item') {
          await apiService.deleteItem(item._id);
        } else {
          await apiService.deleteShop(item._id);
        }
        showNotification(`${item.type === 'item' ? 'Item' : 'Shop'} deleted successfully.`, 'success');
        await loadAllData();
      } catch (error) {
        showNotification('Failed to delete: ' + error.message, 'error');
      }
    }
  };

  const handleContactSeller = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    setSendingEmail(true);
    try {
      const sellerEmail = selectedRequest.type === 'item' 
        ? (selectedRequest.seller?.contact || selectedRequest.contactEmail || selectedRequest.contact)
        : (selectedRequest.contact || selectedRequest.contactEmail);
      const sellerName = selectedRequest.type === 'item' 
        ? (selectedRequest.seller?.name || selectedRequest.sellerName)
        : (selectedRequest.owner || selectedRequest.shopOwner);
      const itemTitle = selectedRequest.type === 'item' 
        ? selectedRequest.title 
        : selectedRequest.shopName;
      
      await apiService.contactSeller({
        sellerEmail,
        sellerName,
        buyerName: contactForm.buyerName,
        buyerEmail: contactForm.buyerEmail,
        message: contactForm.message,
        itemTitle
      });
      
      showNotification('Email sent successfully to the seller!', 'success');
      setShowContactModal(false);
      setContactForm({ buyerName: '', buyerEmail: '', message: '' });
    } catch (error) {
      showNotification('Failed to send email: ' + error.message, 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  const filteredPending = pendingRequests.filter(req => {
    const matchesType = filterType === 'all' || req.type === filterType;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = req.type === 'item' 
      ? (req.title?.toLowerCase().includes(searchLower) ||
         req.seller?.name?.toLowerCase().includes(searchLower) ||
         req.category?.toLowerCase().includes(searchLower))
      : (req.shopName?.toLowerCase().includes(searchLower) ||
         req.owner?.toLowerCase().includes(searchLower) ||
         req.services?.some(s => s.toLowerCase().includes(searchLower)));
    return matchesType && matchesSearch;
  });

  const filteredApproved = approvedItems.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    if (item.type === 'item') {
      return item.title?.toLowerCase().includes(searchLower) ||
             item.seller?.name?.toLowerCase().includes(searchLower);
    } else {
      return item.shopName?.toLowerCase().includes(searchLower) ||
             item.owner?.toLowerCase().includes(searchLower);
    }
  });

  const openDetailModal = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const openContactModal = (request) => {
    setSelectedRequest(request);
    setShowContactModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-down">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl ${
            notification.type === 'success' 
              ? 'bg-emerald-500/90 border border-emerald-400/30' 
              : 'bg-rose-500/90 border border-rose-400/30'
          } text-white`}>
            {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-700">
            <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText size={20} className="text-blue-400" />
                {selectedRequest.type === 'item' ? 'Item Details' : 'Shop Details'}
              </h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-700 rounded-full transition">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              {selectedRequest.type === 'item' ? (
                <div className="space-y-4">
                  <div className="relative h-48 rounded-xl overflow-hidden">
                    <img 
                      src={selectedRequest.image?.startsWith('http') ? selectedRequest.image : `http://localhost:5000${selectedRequest.image}`} 
                      alt={selectedRequest.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedRequest.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">{selectedRequest.category}</span>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">{selectedRequest.condition}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-orange-400">${selectedRequest.price}</span>
                    {selectedRequest.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">${selectedRequest.originalPrice}</span>
                    )}
                    {selectedRequest.promotionPrice && (
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs flex items-center gap-1">
                        <Zap size={12} /> Sale: ${selectedRequest.promotionPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300">{selectedRequest.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.tags?.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">#{tag}</span>
                    ))}
                  </div>
                  
                  {/* PUBLISHER/SELLER DETAILS SECTION - FIXED */}
                  <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-xl p-4 border border-blue-500/30">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <User size={16} className="text-blue-400" /> 
                      Publisher / Seller Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Full Name</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <User size={14} className="text-blue-400" />
                          {selectedRequest.seller?.name || selectedRequest.sellerName || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Email Address</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <Mail size={14} className="text-blue-400" />
                          {selectedRequest.seller?.contact || selectedRequest.contactEmail || selectedRequest.contact || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Phone Number</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <Phone size={14} className="text-blue-400" />
                          {selectedRequest.seller?.phone || selectedRequest.phone || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Student ID</p>
                        <p className="text-white font-mono text-sm">
                          {selectedRequest.seller?.studentId || selectedRequest.studentId || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">NIC Number</p>
                        <p className="text-white font-mono text-sm">
                          {selectedRequest.seller?.nic || selectedRequest.nic || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Location</p>
                        <p className="text-white flex items-center gap-2">
                          <MapPin size={14} className="text-blue-400" />
                          {selectedRequest.location || 'Campus'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Calendar size={16} className="text-blue-400" /> 
                      Submission Details
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Submitted: {new Date(selectedRequest.submittedDate || selectedRequest.createdAt).toLocaleString()}
                    </p>
                    <p className="text-gray-300 text-sm mt-1">
                      Status: <span className={`font-semibold ${selectedRequest.status === 'pending' ? 'text-orange-400' : 'text-emerald-400'}`}>
                        {selectedRequest.status?.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative h-48 rounded-xl overflow-hidden">
                    <img 
                      src={selectedRequest.image?.startsWith('http') ? selectedRequest.image : `http://localhost:5000${selectedRequest.image}`} 
                      alt={selectedRequest.shopName} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg px-3 py-1">
                      <span className="text-white text-sm font-medium">{selectedRequest.priceRange}</span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedRequest.shopName}</h2>
                    <p className="text-gray-400">Owned by {selectedRequest.owner}</p>
                  </div>
                  <p className="text-gray-300">{selectedRequest.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.services?.map((service, idx) => (
                      <span key={idx} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">{service}</span>
                    ))}
                  </div>
                  
                  {/* PUBLISHER/OWNER DETAILS SECTION FOR SHOPS */}
                  <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-500/30">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <StoreIcon size={16} className="text-purple-400" /> 
                      Shop Owner Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Owner Name</p>
                        <p className="text-white font-medium">{selectedRequest.owner || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Email Address</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <Mail size={14} className="text-purple-400" />
                          {selectedRequest.contact || selectedRequest.contactEmail || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Phone Number</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <Phone size={14} className="text-purple-400" />
                          {selectedRequest.phone || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Student ID</p>
                        <p className="text-white font-mono text-sm">{selectedRequest.studentId || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">NIC Number</p>
                        <p className="text-white font-mono text-sm">{selectedRequest.nic || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Availability</p>
                        <p className="text-white">{selectedRequest.availability || 'Flexible hours'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleApprove(selectedRequest)}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={20} /> Approve Request
                </button>
                <button
                  onClick={() => handleReject(selectedRequest)}
                  className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl font-semibold hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <XIcon size={20} /> Reject Request
                </button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openContactModal(selectedRequest);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={20} /> Contact Seller/Owner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Seller Modal */}
      {showContactModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare size={20} className="text-blue-400" />
                Contact {selectedRequest.type === 'item' ? 'Seller' : 'Owner'}
              </h3>
              <button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-gray-700 rounded-full transition">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleContactSeller} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  required
                  value={contactForm.buyerName}
                  onChange={(e) => setContactForm({...contactForm, buyerName: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Your Email</label>
                <input
                  type="email"
                  required
                  value={contactForm.buyerEmail}
                  onChange={(e) => setContactForm({...contactForm, buyerEmail: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@university.edu"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Message</label>
                <textarea
                  required
                  rows="4"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`I'm interested in your ${selectedRequest.type === 'item' ? selectedRequest.title : selectedRequest.shopName}...`}
                />
              </div>
              <button
                type="submit"
                disabled={sendingEmail}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sendingEmail ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                {sendingEmail ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-gray-700/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition group">
                <ArrowLeft size={20} className="text-gray-400 group-hover:text-white" />
              </button>
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2.5 rounded-xl shadow-lg">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Admin Dashboard</h1>
                <p className="text-xs text-gray-400">Manage marketplace requests and content</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={loadAllData}
                className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition group"
                title="Refresh"
              >
                <RefreshCw size={20} className="text-gray-400 group-hover:text-white" />
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <div className="text-sm">
                  <p className="text-white font-medium">Admin User</p>
                  <p className="text-gray-400 text-xs">admin@university.edu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl p-4 border border-orange-500/30 hover:border-orange-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Total</p>
                <p className="text-3xl font-bold text-white">{stats.totalPending}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/30 flex items-center justify-center">
                <Clock size={24} className="text-orange-400" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/30 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Items</p>
                <p className="text-3xl font-bold text-white">{stats.pendingItems}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center">
                <Package size={24} className="text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Shops</p>
                <p className="text-3xl font-bold text-white">{stats.pendingShops}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center">
                <StoreIcon size={24} className="text-purple-400" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/30 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approved Total</p>
                <p className="text-3xl font-bold text-white">{stats.totalApproved}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                <CheckCircle size={24} className="text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/30 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approved Items</p>
                <p className="text-3xl font-bold text-white">{stats.totalItems}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center">
                <Package size={24} className="text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approved Shops</p>
                <p className="text-3xl font-bold text-white">{stats.totalShops}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center">
                <StoreIcon size={24} className="text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-t-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Clock size={18} /> Pending Requests
            {stats.totalPending > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.totalPending}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-3 rounded-t-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'approved'
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <CheckCircle size={18} /> Approved Content
            {stats.totalApproved > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.totalApproved}</span>
            )}
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input
              type="text"
              placeholder={activeTab === 'pending' ? "🔍 Search pending requests by title, name, or category..." : "🔍 Search approved items and shops..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all"
            />
          </div>
          {activeTab === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-1 ${
                  filterType === 'all' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Filter size={14} /> All
              </button>
              <button
                onClick={() => setFilterType('item')}
                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-1 ${
                  filterType === 'item' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Package size={14} /> Items
              </button>
              <button
                onClick={() => setFilterType('shop')}
                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-1 ${
                  filterType === 'shop' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <StoreIcon size={14} /> Shops
              </button>
            </div>
          )}
        </div>

        {/* Pending Requests Tab */}
        {activeTab === 'pending' && (
          <div>
            {filteredPending.length === 0 ? (
              <div className="text-center py-16 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
                <CheckCircle className="mx-auto text-gray-500" size={64} />
                <p className="mt-4 text-gray-400 text-lg">No pending requests found</p>
                <p className="text-gray-500 text-sm">All caught up! Great job managing the marketplace.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPending.map(request => (
                  <div key={request._id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all group">
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                          <img 
                            src={request.image?.startsWith('http') ? request.image : `http://localhost:5000${request.image}`} 
                            alt={request.type === 'item' ? request.title : request.shopName} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {request.type === 'item' ? (
                                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs flex items-center gap-1 border border-blue-500/30">
                                    <Package size={10} /> Item Request
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs flex items-center gap-1 border border-purple-500/30">
                                    <StoreIcon size={10} /> Shop Request
                                  </span>
                                )}
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Calendar size={10} /> {new Date(request.submittedDate || request.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                {request.type === 'item' ? request.title : request.shopName}
                              </h3>
                              <p className="text-sm text-gray-400 flex items-center gap-1">
                                <User size={12} /> 
                                {request.type === 'item' 
                                  ? (request.seller?.name || request.sellerName || 'Unknown Seller')
                                  : (request.owner || 'Unknown Owner')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {request.type === 'item' && (
                                <div className="text-right">
                                  <span className="text-xl font-bold text-orange-400">${request.price}</span>
                                  {request.promotionPrice && (
                                    <span className="text-xs text-emerald-400 ml-1">→ ${request.promotionPrice}</span>
                                  )}
                                </div>
                              )}
                              {request.type === 'shop' && (
                                <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 rounded-lg text-sm font-medium border border-orange-500/30">
                                  {request.priceRange}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                            {request.type === 'item' ? request.description : request.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {request.type === 'item' ? (
                              <>
                                <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full flex items-center gap-1">
                                  <Tag size={10} /> {request.category}
                                </span>
                                <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">{request.condition}</span>
                              </>
                            ) : (
                              request.services?.slice(0, 3).map((service, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">{service}</span>
                              ))
                            )}
                          </div>
                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={() => openDetailModal(request)}
                              className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all flex items-center gap-1"
                            >
                              <Eye size={14} /> View Details
                            </button>
                            <button
                              onClick={() => handleApprove(request)}
                              className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(request)}
                              className="px-4 py-2 bg-rose-500/20 text-rose-400 rounded-lg text-sm font-medium hover:bg-rose-500/30 transition-all flex items-center gap-1"
                            >
                              <XIcon size={14} /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Approved Content Tab */}
        {activeTab === 'approved' && (
          <div>
            {filteredApproved.length === 0 ? (
              <div className="text-center py-16 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
                <CheckCircle className="mx-auto text-gray-500" size={64} />
                <p className="mt-4 text-gray-400 text-lg">No approved content found</p>
                <p className="text-gray-500 text-sm">Approve pending requests to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApproved.map(item => (
                  <div key={item._id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden hover:border-emerald-500/50 transition-all group">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={item.image?.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} 
                        alt={item.type === 'item' ? item.title : item.shopName} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                      
                      {/* Type Badge */}
                      <div className="absolute top-3 left-3">
                        {item.type === 'item' ? (
                          <span className="px-2 py-1 bg-blue-500/90 backdrop-blur-sm rounded-lg text-xs text-white flex items-center gap-1 shadow-lg">
                            <Package size={10} /> Item
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-purple-500/90 backdrop-blur-sm rounded-lg text-xs text-white flex items-center gap-1 shadow-lg">
                            <StoreIcon size={10} /> Shop
                          </span>
                        )}
                      </div>
                      
                      {/* Delete Button */}
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 bg-red-500/90 backdrop-blur-sm rounded-xl hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg"
                          title="Delete this item"
                        >
                          <Trash2 size={16} className="text-white" />
                        </button>
                      </div>
                      
                      {/* Price/Services Badge */}
                      {item.type === 'item' ? (
                        <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg px-3 py-1.5 shadow-lg">
                          {item.promotionPrice ? (
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold">${item.promotionPrice}</span>
                              <span className="text-white/60 text-xs line-through">${item.price}</span>
                            </div>
                          ) : (
                            <span className="text-white font-bold">${item.price}</span>
                          )}
                        </div>
                      ) : (
                        <div className="absolute bottom-3 left-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg px-3 py-1.5 shadow-lg">
                          <span className="text-white text-sm font-medium">{item.priceRange}</span>
                        </div>
                      )}
                      
                      {/* Stats for items */}
                      {item.type === 'item' && (
                        <div className="absolute bottom-3 right-3 flex gap-2">
                          <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white flex items-center gap-1">
                            <EyeIcon size={10} /> {item.views || 0}
                          </span>
                          <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white flex items-center gap-1">
                            <Heart size={10} /> {item.likes || 0}
                          </span>
                        </div>
                      )}
                      
                      {/* Rating for shops */}
                      {item.type === 'shop' && item.rating && (
                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white flex items-center gap-1">
                          <Star size={10} className="fill-yellow-400 text-yellow-400" /> {item.rating} ({item.reviews || 0})
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-white text-lg mb-1 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                        {item.type === 'item' ? item.title : item.shopName}
                      </h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <User size={12} />
                        {item.type === 'item' 
                          ? (item.seller?.name || item.sellerName || 'Unknown Seller')
                          : (item.owner || 'Unknown Owner')}
                      </p>
                      
                      {item.type === 'item' ? (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full flex items-center gap-1">
                            <Tag size={10} /> {item.category}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">{item.condition}</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.services?.slice(0, 2).map((service, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">{service}</span>
                          ))}
                          {item.services?.length > 2 && (
                            <span className="text-xs px-2 py-1 bg-gray-700 text-gray-400 rounded-full">+{item.services.length - 2}</span>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={10} /> {new Date(item.approvedDate || item.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => openDetailModal(item)}
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-all hover:gap-2"
                        >
                          <Eye size={12} /> View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;