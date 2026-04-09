import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Package, 
  Store, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Tag, 
  Star, 
  Sparkles,
  Percent,
  TrendingUp,
  ArrowLeft,
  X,
  CheckCircle,
  AlertCircle,
  Search,
  Save,
  Clock,
  ShoppingCart,
  ArrowRight,
  Eye,
  Heart,
  Loader,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

// ==================== API BASE URL ====================
const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = 'http://localhost:5000';

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  // Remove /uploads/ if it's already in the path
  const cleanPath = imagePath.replace(/^\/uploads\//, '');
  return `${API_URL}/uploads/${cleanPath}`;
};

// ==================== VALIDATION FUNCTIONS ====================
const validateTitle = (title) => {
  if (!title || !title.trim()) return 'Title is required';
  if (title.length < 3) return 'Title must be at least 3 characters';
  if (title.length > 100) return 'Title cannot exceed 100 characters';
  return '';
};

const validatePrice = (price) => {
  if (!price && price !== 0) return 'Price is required';
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) return 'Price must be a number';
  if (numPrice <= 0) return 'Price must be greater than 0';
  if (numPrice > 10000) return 'Price cannot exceed $10,000';
  return '';
};

const validatePromotionPrice = (promoPrice, originalPrice) => {
  if (!promoPrice) return '';
  const numPromo = parseFloat(promoPrice);
  const numOriginal = parseFloat(originalPrice);
  if (isNaN(numPromo)) return 'Promotion price must be a number';
  if (numPromo <= 0) return 'Promotion price must be greater than 0';
  if (numPromo >= numOriginal) return 'Promotion price must be less than original price';
  return '';
};

const validateDescription = (description) => {
  if (!description || !description.trim()) return 'Description is required';
  if (description.length < 10) return 'Description must be at least 10 characters';
  if (description.length > 500) return 'Description cannot exceed 500 characters';
  return '';
};

const validateCategory = (category) => {
  if (!category) return 'Category is required';
  return '';
};

const validateCondition = (condition) => {
  if (!condition) return 'Condition is required';
  return '';
};

const validateShopName = (shopName) => {
  if (!shopName || !shopName.trim()) return 'Shop name is required';
  if (shopName.length < 3) return 'Shop name must be at least 3 characters';
  if (shopName.length > 50) return 'Shop name cannot exceed 50 characters';
  return '';
};

const validateImageFile = (file) => {
  if (!file) return '';
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) return 'Please upload a valid image file (jpg, jpeg, png, webp, gif)';
  if (file.size > 5 * 1024 * 1024) return 'Image size must be less than 5MB';
  return '';
};

// ==================== STUDENT DASHBOARD COMPONENT ====================
const StudentDashboard = ({ onBack }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (typeof onBack === 'function') onBack();
    else navigate('/dashboard');
  };
  const [activeTab, setActiveTab] = useState('items');
  const [items, setItems] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editingShop, setEditingShop] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [selectedItemForPromo, setSelectedItemForPromo] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [errors, setErrors] = useState({});
  const [updating, setUpdating] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Get current user from localStorage
  const currentUser = {
    id: localStorage.getItem('userId') || localStorage.getItem('studentId') || 'IT23328020',
    name: localStorage.getItem('userName') || 'Student User',
    email: localStorage.getItem('userEmail') || '',
    studentId: localStorage.getItem('studentId') || 'IT23328020',
    avatar: (localStorage.getItem('userName') || 'SU').charAt(0).toUpperCase()
  };

  const showNotificationMessage = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // Fetch student's items from backend
  const fetchStudentItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/items/student/${currentUser.studentId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setItems(data.data || []);
      } else {
        console.error('Failed to fetch items');
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    }
  };

  // Fetch student's shops from backend
  const fetchStudentShops = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/shops/student/${currentUser.studentId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setShops(data.data || []);
      } else {
        console.error('Failed to fetch shops');
        setShops([]);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      setShops([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStudentItems(), fetchStudentShops()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Delete Item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setItems(items.filter(item => item._id !== itemId));
        showNotificationMessage('Item deleted successfully!', 'success');
      } else {
        const error = await response.json();
        showNotificationMessage(error.message || 'Failed to delete item', 'error');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showNotificationMessage('Error deleting item', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Delete Shop
  const handleDeleteShop = async (shopId) => {
    if (!window.confirm('Are you sure you want to delete this shop? This action cannot be undone.')) {
      return;
    }
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/shops/${shopId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setShops(shops.filter(shop => shop._id !== shopId));
        showNotificationMessage('Shop deleted successfully!', 'success');
      } else {
        const error = await response.json();
        showNotificationMessage(error.message || 'Failed to delete shop', 'error');
      }
    } catch (error) {
      console.error('Error deleting shop:', error);
      showNotificationMessage('Error deleting shop', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Update Item with image support
  const handleUpdateItem = async () => {
    const newErrors = {};
    
    let error = validateTitle(editingItem.title);
    if (error) newErrors.title = error;
    
    error = validatePrice(editingItem.price);
    if (error) newErrors.price = error;
    
    error = validateDescription(editingItem.description);
    if (error) newErrors.description = error;
    
    error = validateCategory(editingItem.category);
    if (error) newErrors.category = error;
    
    error = validateCondition(editingItem.condition);
    if (error) newErrors.condition = error;
    
    if (imageFile) {
      error = validateImageFile(imageFile);
      if (error) newErrors.image = error;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (imageFile) {
        // Update with image using FormData
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('title', editingItem.title);
        formData.append('price', editingItem.price);
        formData.append('category', editingItem.category);
        formData.append('condition', editingItem.condition);
        formData.append('description', editingItem.description);
        formData.append('location', editingItem.location || '');
        formData.append('tags', JSON.stringify(editingItem.tags || []));
        
        response = await fetch(`${API_BASE_URL}/items/${editingItem._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: formData
        });
      } else {
        // Update without image
        response = await fetch(`${API_BASE_URL}/items/${editingItem._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: editingItem.title,
            price: editingItem.price,
            category: editingItem.category,
            condition: editingItem.condition,
            description: editingItem.description,
            location: editingItem.location,
            tags: editingItem.tags
          })
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        setItems(items.map(item => item._id === editingItem._id ? data.data : item));
        setShowEditModal(false);
        setEditingItem(null);
        setImageFile(null);
        setImagePreview('');
        showNotificationMessage('Item updated successfully!', 'success');
      } else {
        const error = await response.json();
        showNotificationMessage(error.message || 'Failed to update item', 'error');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      showNotificationMessage('Error updating item', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Update Shop with image support
  const handleUpdateShop = async () => {
    const newErrors = {};
    
    let error = validateShopName(editingShop.shopName);
    if (error) newErrors.shopName = error;
    
    error = validateDescription(editingShop.description);
    if (error) newErrors.description = error;
    
    if (imageFile) {
      error = validateImageFile(imageFile);
      if (error) newErrors.image = error;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (imageFile) {
        // Update with image using FormData
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('shopName', editingShop.shopName);
        formData.append('description', editingShop.description);
        formData.append('location', editingShop.location || '');
        formData.append('priceRange', editingShop.priceRange || '');
        formData.append('availability', editingShop.availability || '');
        formData.append('services', JSON.stringify(editingShop.services || []));
        
        response = await fetch(`${API_BASE_URL}/shops/${editingShop._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: formData
        });
      } else {
        // Update without image
        response = await fetch(`${API_BASE_URL}/shops/${editingShop._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            shopName: editingShop.shopName,
            description: editingShop.description,
            location: editingShop.location,
            priceRange: editingShop.priceRange,
            availability: editingShop.availability,
            services: editingShop.services
          })
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        setShops(shops.map(shop => shop._id === editingShop._id ? data.data : shop));
        setShowEditModal(false);
        setEditingShop(null);
        setImageFile(null);
        setImagePreview('');
        showNotificationMessage('Shop updated successfully!', 'success');
      } else {
        const error = await response.json();
        showNotificationMessage(error.message || 'Failed to update shop', 'error');
      }
    } catch (error) {
      console.error('Error updating shop:', error);
      showNotificationMessage('Error updating shop', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Update Promotion Price
  const handleUpdatePromotion = async () => {
    if (selectedItemForPromo.promotionPrice) {
      const error = validatePromotionPrice(selectedItemForPromo.promotionPrice, selectedItemForPromo.price);
      if (error) {
        setErrors({ promotionPrice: error });
        return;
      }
    }
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/items/${selectedItemForPromo._id}/promotion`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          promotionPrice: selectedItemForPromo.promotionPrice || null
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setItems(items.map(item => item._id === selectedItemForPromo._id ? data.data : item));
        setShowPromoModal(false);
        setSelectedItemForPromo(null);
        if (selectedItemForPromo.promotionPrice) {
          showNotificationMessage('Promotion added successfully! 🎉', 'success');
        } else {
          showNotificationMessage('Promotion removed successfully!', 'success');
        }
      } else {
        const error = await response.json();
        showNotificationMessage(error.message || 'Failed to update promotion', 'error');
      }
    } catch (error) {
      console.error('Error updating promotion:', error);
      showNotificationMessage('Error updating promotion', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem({ ...item });
    setImagePreview(getImageUrl(item.image));
    setImageFile(null);
    setErrors({});
    setShowEditModal(true);
  };

  const handleEditShop = (shop) => {
    setEditingShop({ ...shop });
    setImagePreview(getImageUrl(shop.image));
    setImageFile(null);
    setErrors({});
    setShowEditModal(true);
  };

  const handlePromoteItem = (item) => {
    setSelectedItemForPromo({ ...item });
    setErrors({});
    setShowPromoModal(true);
  };

  const handleRemovePromotion = () => {
    setSelectedItemForPromo({
      ...selectedItemForPromo,
      promotionPrice: null
    });
    setErrors({});
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      const error = validateImageFile(file);
      setErrors({ ...errors, image: error });
    }
  };

  const handleAddService = () => {
    const newService = prompt('Enter new service name:');
    if (newService && newService.trim()) {
      setEditingShop({
        ...editingShop,
        services: [...(editingShop.services || []), newService.trim()]
      });
    }
  };

  const handleRemoveService = (serviceToRemove) => {
    setEditingShop({
      ...editingShop,
      services: (editingShop.services || []).filter(s => s !== serviceToRemove)
    });
  };

  const navigateToMarketplace = () => {
    navigate("/marketplace");
  };

  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredShops = shops.filter(shop =>
    shop.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.services?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Stats
  const stats = {
    totalItems: items.length,
    totalShops: shops.length,
    totalPromoted: items.filter(i => i.promotionPrice).length,
    approvedItems: items.filter(i => i.status === 'approved').length,
    pendingItems: items.filter(i => i.status === 'pending').length
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto text-blue-600" size={48} />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-down">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl ${
            notification.type === 'success' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-rose-500 text-white'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBack} 
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition group"
              >
                <ArrowLeft size={20} className="text-gray-600 group-hover:text-gray-800" />
              </button>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-md">
                <User className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-xs text-gray-500">Manage your items and shops</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={navigateToMarketplace}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm"
              >
                <ShoppingCart size={18} /> Marketplace <ArrowRight size={16} />
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold">{currentUser.avatar}</span>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">{currentUser.name}</p>
                  <p className="text-gray-500 text-xs">{currentUser.studentId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="text-yellow-300" size={24} />
                Welcome back, {currentUser.name}!
              </h2>
              <p className="text-blue-100">Manage your marketplace listings and track your performance</p>
            </div>
            <div className="flex gap-3">
              <div className="px-4 py-2 bg-white/20 rounded-xl text-center backdrop-blur-sm">
                <p className="text-2xl font-bold">{stats.totalItems}</p>
                <p className="text-xs text-blue-100">Total Items</p>
              </div>
              <div className="px-4 py-2 bg-white/20 rounded-xl text-center backdrop-blur-sm">
                <p className="text-2xl font-bold">{stats.totalShops}</p>
                <p className="text-xs text-blue-100">My Shops</p>
              </div>
              <div className="px-4 py-2 bg-orange-500/90 rounded-xl text-center backdrop-blur-sm">
                <p className="text-2xl font-bold">{stats.totalPromoted}</p>
                <p className="text-xs text-orange-100">On Promotion</p>
              </div>
              <div className="px-4 py-2 bg-emerald-500/90 rounded-xl text-center backdrop-blur-sm">
                <p className="text-2xl font-bold">{stats.approvedItems}</p>
                <p className="text-xs text-emerald-100">Approved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-6 py-3 rounded-t-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'items'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Package size={18} /> My Items ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('shops')}
            className={`px-6 py-3 rounded-t-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'shops'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Store size={18} /> My Shops ({shops.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={activeTab === 'items' ? "Search your items by title or category..." : "Search your shops by name or services..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 shadow-sm"
          />
        </div>

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div>
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <Package className="mx-auto text-gray-300" size={64} />
                <p className="mt-4 text-gray-500 text-lg">No items found</p>
                <p className="text-gray-400 text-sm">Start selling by adding your first item!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                  <div key={item._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group">
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img 
                        src={getImageUrl(item.image)} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent"></div>
                      
                      {/* Status Badge */}
                      <div className={`absolute top-3 left-3 rounded-lg px-3 py-1.5 shadow-lg ${
                        item.status === 'approved' ? 'bg-emerald-500' : 
                        item.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'
                      }`}>
                        <span className="text-white text-xs font-bold">{item.status?.toUpperCase()}</span>
                      </div>
                      
                      {/* Promotion Badge */}
                      {item.promotionPrice && (
                        <div className="absolute top-3 left-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg px-3 py-1.5 shadow-lg">
                          <div className="flex items-center gap-1">
                            <Percent size={12} className="text-white" />
                            <span className="text-white text-xs font-bold">SALE</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          onClick={() => handlePromoteItem(item)}
                          className="p-2 bg-orange-500 rounded-xl hover:bg-orange-600 transition-all transform hover:scale-105 shadow-lg"
                          title="Add Promotion"
                        >
                          <Percent size={14} className="text-white" />
                        </button>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-2 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                          title="Edit Item"
                        >
                          <Edit size={14} className="text-white" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          disabled={updating}
                          className="p-2 bg-red-500 rounded-xl hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
                          title="Delete Item"
                        >
                          <Trash2 size={14} className="text-white" />
                        </button>
                      </div>
                      
                      {/* Price Display */}
                      <div className="absolute bottom-3 left-3">
                        {item.promotionPrice ? (
                          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5">
                            <span className="text-orange-400 font-bold text-lg">${item.promotionPrice}</span>
                            <span className="text-gray-400 text-sm line-through">${item.price}</span>
                            <span className="text-emerald-400 text-xs">
                              -{Math.round(((item.price - item.promotionPrice) / item.price) * 100)}%
                            </span>
                          </div>
                        ) : (
                          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5">
                            <span className="text-white font-bold text-lg">${item.price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full flex items-center gap-1">
                          <Tag size={10} /> {item.category}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{item.condition}</span>
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{item.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={10} /> {formatDate(item.createdAt || item.postedDate)}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin size={10} /> {item.location?.split(',')[0] || 'Campus'}
                        </span>
                      </div>
                      {item.views !== undefined && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Eye size={10} /> {item.views || 0} views</span>
                          <span className="flex items-center gap-1"><Heart size={10} /> {item.likes || 0} likes</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shops Tab */}
        {activeTab === 'shops' && (
          <div>
            {filteredShops.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <Store className="mx-auto text-gray-300" size={64} />
                <p className="mt-4 text-gray-500 text-lg">No shops found</p>
                <p className="text-gray-400 text-sm">Create your first student shop!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredShops.map(shop => (
                  <div key={shop._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group">
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img 
                        src={getImageUrl(shop.image)} 
                        alt={shop.shopName} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent"></div>
                      
                      {/* Status Badge */}
                      <div className={`absolute top-3 left-3 rounded-lg px-3 py-1.5 shadow-lg ${
                        shop.status === 'approved' ? 'bg-emerald-500' : 
                        shop.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'
                      }`}>
                        <span className="text-white text-xs font-bold">{shop.status?.toUpperCase()}</span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          onClick={() => handleEditShop(shop)}
                          className="p-2 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                          title="Edit Shop"
                        >
                          <Edit size={14} className="text-white" />
                        </button>
                        <button
                          onClick={() => handleDeleteShop(shop._id)}
                          disabled={updating}
                          className="p-2 bg-red-500 rounded-xl hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
                          title="Delete Shop"
                        >
                          <Trash2 size={14} className="text-white" />
                        </button>
                      </div>
                      
                      {/* Rating */}
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white flex items-center gap-1">
                        <Star size={10} className="fill-yellow-400 text-yellow-400" /> {shop.rating || 5.0} ({shop.reviews || 0})
                      </div>
                      
                      {/* Price Range */}
                      {shop.priceRange && (
                        <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg px-3 py-1.5 shadow-lg">
                          <span className="text-white text-sm font-medium">{shop.priceRange}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-xl mb-1 group-hover:text-purple-600 transition-colors">
                        {shop.shopName}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">Owned by {shop.owner}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(shop.services || []).slice(0, 4).map((service, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full">{service}</span>
                        ))}
                        {(shop.services || []).length > 4 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">+{(shop.services || []).length - 4}</span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{shop.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin size={10} /> {shop.location?.split(',')[0] || 'Campus'}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={10} /> {shop.availability || 'Flexible'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Modal for Items and Shops */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Edit size={20} className="text-blue-600" />
                {editingItem ? 'Edit Item' : 'Edit Shop'}
              </h3>
              <button 
                onClick={() => { 
                  setShowEditModal(false); 
                  setEditingItem(null); 
                  setEditingShop(null); 
                  setErrors({});
                  setImageFile(null);
                  setImagePreview('');
                }} 
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              {/* Image Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex flex-col items-center justify-center w-32 h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                    <div className="flex flex-col items-center justify-center">
                      <Upload size={20} className="text-gray-500" />
                      <span className="text-xs text-gray-500 mt-1">Upload New</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                <p className="text-xs text-gray-400 mt-1">Leave empty to keep current image. Max 5MB.</p>
              </div>

              {editingItem ? (
                // Edit Item Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input 
                      value={editingItem.title || ''} 
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className={`w-full p-3 bg-gray-50 border ${errors.title ? 'border-red-500' : 'border-gray-200'} rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                      <input 
                        type="number"
                        value={editingItem.price || ''} 
                        onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                        className={`w-full p-3 bg-gray-50 border ${errors.price ? 'border-red-500' : 'border-gray-200'} rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select 
                        value={editingItem.category || ''} 
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                        className={`w-full p-3 bg-gray-50 border ${errors.category ? 'border-red-500' : 'border-gray-200'} rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Select Category</option>
                        <option value="Textbooks">Textbooks</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Audio">Audio</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Sports">Sports</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
                    <select 
                      value={editingItem.condition || ''} 
                      onChange={(e) => setEditingItem({ ...editingItem, condition: e.target.value })}
                      className={`w-full p-3 bg-gray-50 border ${errors.condition ? 'border-red-500' : 'border-gray-200'} rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select Condition</option>
                      <option value="Like New">Like New</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                    {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea 
                      rows="4"
                      value={editingItem.description || ''} 
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className={`w-full p-3 bg-gray-50 border ${errors.description ? 'border-red-500' : 'border-gray-200'} rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input 
                      value={editingItem.location || ''} 
                      onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Building A, Room 101"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                    <input 
                      value={(editingItem.tags || []).join(', ')} 
                      onChange={(e) => setEditingItem({ ...editingItem, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., textbook, math, study"
                    />
                  </div>
                </div>
              ) : editingShop ? (
                // Edit Shop Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
                    <input 
                      value={editingShop.shopName || ''} 
                      onChange={(e) => setEditingShop({ ...editingShop, shopName: e.target.value })}
                      className={`w-full p-3 bg-gray-50 border ${errors.shopName ? 'border-red-500' : 'border-gray-200'} rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.shopName && <p className="text-red-500 text-xs mt-1">{errors.shopName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Services *</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(editingShop.services || []).map((service, idx) => (
                        <span key={idx} className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm flex items-center gap-1">
                          {service}
                          <button onClick={() => handleRemoveService(service)} className="hover:text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition"
                    >
                      + Add Service
                    </button>
                    {errors.services && <p className="text-red-500 text-xs mt-1">{errors.services}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea 
                      rows="4"
                      value={editingShop.description || ''} 
                      onChange={(e) => setEditingShop({ ...editingShop, description: e.target.value })}
                      className={`w-full p-3 bg-gray-50 border ${errors.description ? 'border-red-500' : 'border-gray-200'} rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                    <input 
                      value={editingShop.priceRange || ''} 
                      onChange={(e) => setEditingShop({ ...editingShop, priceRange: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="$20-40/hour"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input 
                      value={editingShop.location || ''} 
                      onChange={(e) => setEditingShop({ ...editingShop, location: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Building A, Room 101"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <input 
                      value={editingShop.availability || ''} 
                      onChange={(e) => setEditingShop({ ...editingShop, availability: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mon-Fri, 2pm-8pm"
                    />
                  </div>
                </div>
              ) : null}
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingItem ? handleUpdateItem : handleUpdateShop}
                  disabled={updating}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updating ? <Loader className="animate-spin" size={20} /> : <Save size={20} />} 
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => { 
                    setShowEditModal(false); 
                    setEditingItem(null); 
                    setEditingShop(null);
                    setErrors({});
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {showPromoModal && selectedItemForPromo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Percent size={20} className="text-orange-500" />
                Add Promotion Price
              </h3>
              <button onClick={() => { setShowPromoModal(false); setSelectedItemForPromo(null); setErrors({}); }} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <p className="text-gray-600 text-sm">Item: <span className="text-gray-900 font-medium">{selectedItemForPromo.title}</span></p>
                <p className="text-gray-600 text-sm mt-1">Original Price: <span className="text-gray-900 font-bold">${selectedItemForPromo.price}</span></p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Price</label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    type="number"
                    value={selectedItemForPromo.promotionPrice || ''} 
                    onChange={(e) => setSelectedItemForPromo({ ...selectedItemForPromo, promotionPrice: e.target.value })}
                    className={`w-full pl-10 p-3 bg-gray-50 border ${errors.promotionPrice ? 'border-red-500' : 'border-gray-200'} rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter promotion price"
                  />
                </div>
                {errors.promotionPrice && <p className="text-red-500 text-xs mt-1">{errors.promotionPrice}</p>}
                <p className="text-xs text-gray-500 mt-1">Promotion price must be less than original price (${selectedItemForPromo.price})</p>
              </div>
              
              {selectedItemForPromo.promotionPrice && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 border border-orange-200">
                  <p className="text-sm text-orange-600 flex items-center gap-1">
                    <TrendingUp size={14} /> Promotion Preview
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-900 font-bold text-lg">${selectedItemForPromo.promotionPrice}</span>
                    <span className="text-gray-400 line-through">${selectedItemForPromo.price}</span>
                    <span className="text-emerald-600 text-sm font-medium">
                      -{Math.round(((selectedItemForPromo.price - selectedItemForPromo.promotionPrice) / selectedItemForPromo.price) * 100)}% OFF
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleUpdatePromotion}
                  disabled={updating}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updating ? <Loader className="animate-spin" size={18} /> : <Percent size={18} />}
                  {selectedItemForPromo.promotionPrice ? 'Update Promotion' : 'Add Promotion'}
                </button>
                {selectedItemForPromo.promotionPrice && (
                  <button
                    onClick={handleRemovePromotion}
                    className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;