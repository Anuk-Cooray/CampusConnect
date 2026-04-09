import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Store, 
  PlusCircle, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Package, 
  X, 
  CheckCircle,
  AlertCircle,
  Search,
  Heart,
  Eye,
  Clock,
  Shield,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Code,
  Headphones,
  Monitor,
  ArrowLeft,
  Verified,
  Clock3,
  PhoneCall,
  Utensils,
  Crown,
  Flame,
  Layers,
  Palette,
  Home,
  Gamepad,
  Shirt,
  Watch,
  Car,
  Music,
  Briefcase,
  BookOpen,
  Laptop,
  Camera,
  Tag,
  GraduationCap,
  DollarSign,
  Calendar,
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  Filter,
  Share2,
  Loader
} from 'lucide-react';

// ==================== API BASE URL ====================
const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = 'http://localhost:5000';

// Helper function to get correct image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads/')) return `${API_URL}${imagePath}`;
  if (imagePath.startsWith('uploads/')) return `${API_URL}/${imagePath}`;
  return `${API_URL}/uploads/${imagePath}`;
};

// ==================== VALIDATION FUNCTIONS ====================

// Student ID validation for ITxxxxxxxx format
const validateStudentId = (studentId) => {
  if (!studentId || !studentId.trim()) return 'Student ID is required';
  const cleanId = studentId.trim().toUpperCase();
  const pattern = /^IT\d{8}$/;
  if (!pattern.test(cleanId)) {
    return 'Student ID must be in format: ITxxxxxxxx (e.g., IT23328020)';
  }
  return '';
};

// NIC validation (Sri Lankan NIC format)
const validateNic = (nic) => {
  if (!nic || !nic.trim()) return 'NIC number is required';
  const cleanNic = nic.trim().replace(/-/g, '');
  if (cleanNic.length === 10 && /^[0-9]{9}[vVxX]$/.test(cleanNic)) return '';
  if (cleanNic.length === 12 && /^[0-9]{12}$/.test(cleanNic)) return '';
  return 'Invalid NIC format. Use format: 123456789V (old) or 199512345678 (new)';
};

const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email is required';
  if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email)) return 'Valid email address is required';
  return '';
};

const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return 'Phone number is required';
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  if (cleanPhone.length >= 9 && cleanPhone.length <= 15 && /^[0-9]+$/.test(cleanPhone)) return '';
  return 'Valid phone number is required (9-15 digits)';
};

const validatePrice = (price) => {
  if (!price && price !== 0) return 'Price is required';
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) return 'Price must be a number';
  if (numPrice <= 0) return 'Price must be greater than 0';
  if (numPrice > 10000) return 'Price cannot exceed $10,000';
  return '';
};

const validateTitle = (title) => {
  if (!title || !title.trim()) return 'Title is required';
  if (title.length < 3) return 'Title must be at least 3 characters';
  if (title.length > 100) return 'Title cannot exceed 100 characters';
  return '';
};

const validateDescription = (description) => {
  if (!description || !description.trim()) return 'Description is required';
  if (description.length < 10) return 'Description must be at least 10 characters';
  if (description.length > 500) return 'Description cannot exceed 500 characters';
  return '';
};

const validateName = (name) => {
  if (!name || !name.trim()) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (name.length > 50) return 'Name cannot exceed 50 characters';
  return '';
};

const validateShopName = (shopName) => {
  if (!shopName || !shopName.trim()) return 'Shop name is required';
  if (shopName.length < 3) return 'Shop name must be at least 3 characters';
  if (shopName.length > 50) return 'Shop name cannot exceed 50 characters';
  return '';
};

const validateImageFile = (file) => {
  if (!file) return 'Image is required';
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) return 'Please upload a valid image file (jpg, jpeg, png, webp, gif)';
  if (file.size > 5 * 1024 * 1024) return 'Image size must be less than 5MB';
  return '';
};

// ==================== CATEGORY ICONS ====================
const categoryIcons = {
  Textbooks: BookOpen,
  Electronics: Laptop,
  Furniture: Home,
  Audio: Headphones,
  Clothing: Shirt,
  Sports: Gamepad,
  Gaming: Gamepad,
  Accessories: Watch,
  Other: Package
};

// ==================== SERVICE OPTIONS ====================
const serviceOptions = [
  "Web Development", "Python Programming", "Data Structures", "React/Next.js",
  "JavaScript Tutoring", "UI/UX Design", "Graphic Design", "Video Editing",
  "Photography", "Content Writing", "Resume Writing", "Interview Prep",
  "Snack Delivery", "Coffee Runs", "Meal Prep", "Grocery Delivery",
  "Bike Repair", "Electronics Repair", "Phone Screen Replacement",
  "Language Tutoring", "Math Tutoring", "Science Tutoring", "Test Prep",
  "Music Lessons", "Fitness Training", "Yoga Classes", "Dance Lessons",
  "Event Planning", "Marketing Services", "Social Media Management"
];

// ==================== ITEM CATEGORIES ====================
const itemCategories = [
  "Textbooks", "Electronics", "Furniture", "Audio", "Clothing", 
  "Sports", "Gaming", "Accessories", "Other"
];

// ==================== ITEM CONDITIONS ====================
const itemConditions = ["Like New", "Excellent", "Good", "Fair"];

// ==================== MAIN APP ====================
const App = () => {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [studentShops, setStudentShops] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showShopForm, setShowShopForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [likedItems, setLikedItems] = useState([]);
  const [showContactModal, setShowContactModal] = useState({ show: false, type: '', data: null });
  const [loading, setLoading] = useState({ items: true, shops: true });
  const [categories, setCategories] = useState(['all']);
  const [debugInfo, setDebugInfo] = useState('');

  // Get current user from localStorage
  const currentUser = {
    id: localStorage.getItem('userId') || localStorage.getItem('studentId') || 'IT23328020',
    name: localStorage.getItem('userName') || 'Student User',
    email: localStorage.getItem('userEmail') || '',
    studentId: localStorage.getItem('studentId') || 'IT23328020',
    role: localStorage.getItem('userRole') || 'Student'
  };

  // ==================== API CALLS ====================
  
  // Fetch approved items - show ALL approved items
  const fetchItems = async () => {
    setLoading(prev => ({ ...prev, items: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/items/approved`);
      const data = await response.json();
      console.log('Items API Response:', data);
      
      if (data.success) {
        // Show ALL approved items (don't filter by current user)
        // This allows students to see all items including their own
        const allItems = data.data;
        setMarketplaceItems(allItems);
        
        // Extract unique categories
        const uniqueCats = ['all', ...new Set(allItems.map(item => item.category).filter(Boolean))];
        setCategories(uniqueCats);
        
        setDebugInfo(`Loaded ${allItems.length} items`);
      } else {
        console.error('API returned error:', data);
        setDebugInfo('Failed to load items: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setDebugInfo('Error loading items: ' + error.message);
      showNotification('Failed to load items', 'error');
    } finally {
      setLoading(prev => ({ ...prev, items: false }));
    }
  };

  // Fetch approved shops - show ALL approved shops
  const fetchShops = async () => {
    setLoading(prev => ({ ...prev, shops: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/shops/approved`);
      const data = await response.json();
      console.log('Shops API Response:', data);
      
      if (data.success) {
        // Show ALL approved shops
        const allShops = data.data;
        setStudentShops(allShops);
        setDebugInfo(prev => `${prev} | Loaded ${allShops.length} shops`);
      } else {
        console.error('API returned error:', data);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      showNotification('Failed to load shops', 'error');
    } finally {
      setLoading(prev => ({ ...prev, shops: false }));
    }
  };

  // Create new item
  const createItem = async (formData) => {
    try {
      const data = new FormData();
      data.append('data', JSON.stringify({
        title: formData.title,
        category: formData.category,
        price: parseFloat(formData.price),
        condition: formData.condition,
        description: formData.description,
        sellerName: formData.sellerName,
        contact: currentUser.email || formData.contactEmail,
        phone: formData.phone,
        studentId: currentUser.studentId || formData.studentId,
        nic: formData.nic,
        location: formData.location || 'Campus',
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      }));
      if (formData.imageFile) {
        data.append('image', formData.imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        body: data
      });
      const result = await response.json();
      if (result.success) {
        showNotification('Item listed successfully! Waiting for admin approval.', 'success');
        fetchItems(); // Refresh list
        return true;
      } else {
        showNotification(result.message || 'Failed to list item', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error creating item:', error);
      showNotification('Failed to create item', 'error');
      return false;
    }
  };

  // Create new shop
  const createShop = async (formData) => {
    try {
      const data = new FormData();
      data.append('shopName', formData.shopName);
      data.append('owner', formData.owner);
      data.append('services', JSON.stringify(formData.services));
      data.append('description', formData.description);
      data.append('contactEmail', currentUser.email || formData.contactEmail);
      data.append('phone', formData.phone);
      data.append('studentId', currentUser.studentId || formData.studentId);
      data.append('nic', formData.nic);
      data.append('location', formData.location || 'Campus');
      data.append('priceRange', formData.priceRange || 'Contact for pricing');
      data.append('availability', formData.availability || 'Flexible hours');
      if (formData.imageFile) {
        data.append('image', formData.imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/shops`, {
        method: 'POST',
        body: data
      });
      const result = await response.json();
      if (result.success) {
        showNotification('Shop registered successfully! Waiting for admin approval.', 'success');
        fetchShops(); // Refresh list
        return true;
      } else {
        showNotification(result.message || 'Failed to register shop', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error creating shop:', error);
      showNotification('Failed to create shop', 'error');
      return false;
    }
  };

  // Increment item views
  const incrementViews = async (itemId) => {
    try {
      await fetch(`${API_BASE_URL}/items/${itemId}/views`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  // Increment item likes
  const incrementLikes = async (itemId) => {
    try {
      await fetch(`${API_BASE_URL}/items/${itemId}/likes`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Error incrementing likes:', error);
    }
  };

  // Update shop rating
  const updateShopRating = async (shopId, rating) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shops/${shopId}/rating`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
      const result = await response.json();
      if (result.success) {
        fetchShops(); // Refresh shops
      }
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  const contactSeller = async (sellerData, buyerData, itemTitle, itemType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/seller`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sellerEmail: sellerData.contact || sellerData.email,
          sellerName: sellerData.name || sellerData.owner,
          buyerName: buyerData.name,
          buyerEmail: buyerData.email,
          message: buyerData.message,
          itemTitle: itemTitle,
          itemType: itemType,
          phone: buyerData.phone || ''
        })
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Server response:', text);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        showNotification('Message sent successfully! The seller will contact you soon.', 'success');
        return true;
      } else {
        showNotification(result.message || 'Failed to send message', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error sending contact:', error);
      showNotification('Failed to send message. Please try again.', 'error');
      return false;
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchItems();
    fetchShops();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleViewItem = async (item) => {
    setSelectedItem(item);
    await incrementViews(item._id);
    // Update local view count
    setMarketplaceItems(prev => prev.map(i => 
      i._id === item._id ? { ...i, views: (i.views || 0) + 1 } : i
    ));
  };

  const toggleLike = async (itemId) => {
    if (likedItems.includes(itemId)) {
      setLikedItems(likedItems.filter(id => id !== itemId));
    } else {
      setLikedItems([...likedItems, itemId]);
      await incrementLikes(itemId);
      showNotification('Added to saved items', 'success');
    }
  };

  const handleAddItem = async (newItem) => {
    const success = await createItem(newItem);
    if (success) {
      setShowItemForm(false);
    }
  };

  const handleAddShop = async (newShop) => {
    const success = await createShop(newShop);
    if (success) {
      setShowShopForm(false);
    }
  };

  const handleContactSubmit = async (contactData) => {
    if (showContactModal.type === 'item') {
      await contactSeller(
        showContactModal.data,
        contactData,
        selectedItem?.title || 'Item',
        'item'
      );
    } else {
      await contactSeller(
        showContactModal.data,
        contactData,
        selectedShop?.shopName || 'Service',
        'shop'
      );
    }
    setShowContactModal({ show: false, type: '', data: null });
  };

  // Filter items - only show approved items
  const filteredItems = marketplaceItems.filter(item => {
    // Only show approved items
    if (item.status !== 'approved') return false;
    
    const matchesSearch = searchTerm === '' || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sellerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filter shops - only show approved shops
  const filteredShops = studentShops.filter(shop => {
    // Only show approved shops
    if (shop.status !== 'approved') return false;
    
    return searchTerm === '' ||
      shop.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.services?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      shop.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
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

      {/* Debug Info (remove in production) */}
      {debugInfo && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900/90 text-gray-400 text-xs px-3 py-2 rounded-lg">
          {debugInfo}
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactModal.show && (
        <ContactFormModal 
          seller={showContactModal.data}
          itemTitle={showContactModal.type === 'item' ? selectedItem?.title : selectedShop?.shopName}
          onClose={() => setShowContactModal({ show: false, type: '', data: null })}
          onSubmit={handleContactSubmit}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-gray-700/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                <ShoppingBag className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">UniMarket</h1>
                <p className="text-xs text-gray-400">Student Marketplace & Services</p>
              </div>
              <span className="hidden sm:flex text-xs bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full font-medium items-center gap-1 border border-orange-500/30">
                <Sparkles size={12} /> Campus Community
              </span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => { setActiveTab('marketplace'); setSelectedItem(null); setSelectedShop(null); }}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'marketplace' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                <Package size={18} /> Marketplace
              </button>
              <button
                onClick={() => { setActiveTab('shops'); setSelectedItem(null); setSelectedShop(null); }}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'shops' 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25 scale-105' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                <Store size={18} /> Student Shops
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* User Info Banner */}
        <div className="mb-6 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-medium">{currentUser.name}</p>
              <p className="text-gray-400 text-sm">{currentUser.email}</p>
              <p className="text-gray-500 text-xs">Student ID: {currentUser.studentId}</p>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                <GraduationCap className="text-blue-400" size={28} />
                Welcome to UniMarket
              </h2>
              <p className="text-gray-300">Buy, sell, and connect with fellow students. Save money, earn extra, and build community!</p>
            </div>
            <button
              onClick={() => activeTab === 'marketplace' ? setShowItemForm(true) : setShowShopForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all duration-200"
            >
              <PlusCircle size={20} /> {activeTab === 'marketplace' ? 'Sell an Item' : 'Start Your Shop'}
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search items, shops, services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all"
            />
          </div>
          {activeTab === 'marketplace' && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm cursor-pointer appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Category Icons Display for Marketplace */}
        {activeTab === 'marketplace' && categoryFilter === 'all' && (
          <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b border-gray-700">
            {itemCategories.map(cat => {
              const CategoryIcon = categoryIcons[cat] || Package;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700 transition-all border border-gray-700 hover:border-blue-500/50 group"
                >
                  <CategoryIcon size={20} className="text-gray-400 group-hover:text-blue-400" />
                  <span className="text-xs text-gray-400 group-hover:text-white">{cat}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Marketplace Section */}
        {activeTab === 'marketplace' && (
          <div>
            {selectedItem ? (
              <ItemDetailView 
                item={selectedItem} 
                onBack={() => setSelectedItem(null)} 
                onLike={toggleLike} 
                isLiked={likedItems.includes(selectedItem._id)}
                onContactClick={(seller) => setShowContactModal({ show: true, type: 'item', data: seller })}
              />
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Flame className="text-orange-500" size={24} />
                    Available Items ({filteredItems.length})
                  </h2>
                </div>
                {loading.items ? (
                  <div className="flex justify-center items-center py-16">
                    <Loader className="animate-spin text-blue-500" size={48} />
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-16 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
                    <Package className="mx-auto text-gray-500" size={64} />
                    <p className="mt-4 text-gray-400">No approved items found.</p>
                    <p className="text-sm text-gray-500 mt-2">Sell an item and wait for admin approval!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => {
                      const CategoryIcon = categoryIcons[item.category] || Package;
                      return (
                        <div key={item._id} 
                          className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-blue-500/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                          onClick={() => handleViewItem(item)}>
                          <div className="relative h-48 overflow-hidden bg-gray-700">
                            <img 
                              src={getImageUrl(item.image)} 
                              alt={item.title} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                              }}
                            />
                            <div className="absolute top-3 right-3">
                              <button 
                                onClick={(e) => { e.stopPropagation(); toggleLike(item._id); }}
                                className="p-2 bg-gray-900/80 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition border border-gray-700"
                              >
                                <Heart size={18} className={likedItems.includes(item._id) ? "fill-red-500 text-red-500" : "text-gray-300"} />
                              </button>
                            </div>
                            <div className="absolute bottom-3 left-3 flex gap-2">
                              <span className="px-2 py-1 bg-blue-500/90 backdrop-blur-sm rounded-lg text-xs text-white font-medium flex items-center gap-1">
                                <CategoryIcon size={12} /> {item.category}
                              </span>
                              <span className="px-2 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-lg text-xs text-white font-medium">{item.condition}</span>
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg text-white line-clamp-1">{item.title}</h3>
                              <div className="text-right">
                                {item.promotionPrice ? (
                                  <div className="text-right">
                                    <span className="text-xl font-bold text-orange-400">${item.promotionPrice}</span>
                                    <span className="text-sm text-gray-400 line-through ml-1">${item.price}</span>
                                  </div>
                                ) : (
                                  <span className="text-2xl font-bold text-orange-400">${item.price}</span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.description}</p>
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {item.tags.slice(0, 2).map((tag, idx) => (
                                  <span key={idx} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">#{tag}</span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center justify-between text-sm border-t border-gray-700 pt-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                  {item.sellerName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-200">{item.sellerName}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Eye size={12} /> {item.views || 0}
                                <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Student Shops Section */}
        {activeTab === 'shops' && (
          <div>
            {selectedShop ? (
              <ShopDetailView 
                shop={selectedShop} 
                onBack={() => setSelectedShop(null)}
                onContactClick={(shop) => setShowContactModal({ show: true, type: 'shop', data: shop })}
                onRate={updateShopRating}
              />
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Crown className="text-yellow-500" size={24} />
                    Student-Run Shops ({filteredShops.length})
                  </h2>
                </div>
                {loading.shops ? (
                  <div className="flex justify-center items-center py-16">
                    <Loader className="animate-spin text-orange-500" size={48} />
                  </div>
                ) : filteredShops.length === 0 ? (
                  <div className="text-center py-16 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
                    <Store className="mx-auto text-gray-500" size={64} />
                    <p className="mt-4 text-gray-400">No approved shops found.</p>
                    <p className="text-sm text-gray-500 mt-2">Start your own student shop and wait for admin approval!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredShops.map(shop => (
                      <div key={shop._id} 
                        className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-orange-500/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                        onClick={() => setSelectedShop(shop)}>
                        <div className="relative h-40 overflow-hidden bg-gray-700">
                          <img 
                            src={getImageUrl(shop.image)} 
                            alt={shop.shopName} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg px-3 py-1">
                            <span className="text-white text-sm font-medium flex items-center gap-1"><DollarSign size={12} /> {shop.priceRange || 'Contact for pricing'}</span>
                          </div>
                          <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                            <Store size={20} className="text-white" />
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-xl text-white">{shop.shopName}</h3>
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400">★</span>
                              <span className="text-sm text-gray-300">{shop.rating || 5.0}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">by {shop.owner}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {shop.services?.slice(0, 3).map((service, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">{service}</span>
                            ))}
                            {shop.services?.length > 3 && <span className="text-xs text-gray-500">+{shop.services.length - 3}</span>}
                          </div>
                          <p className="text-sm text-gray-300 line-clamp-2 mb-3">{shop.description}</p>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <MapPin size={12} /> {shop.location?.split(',')[0] || 'Campus'}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock size={12} /> {shop.availability || 'Flexible'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showItemForm && <ItemFormModal onClose={() => setShowItemForm(false)} onSubmit={handleAddItem} currentUser={currentUser} />}
      {showShopForm && <ShopFormModal onClose={() => setShowShopForm(false)} onSubmit={handleAddShop} currentUser={currentUser} />}
    </div>
  );
};

// ==================== CONTACT FORM MODAL ====================
const ContactFormModal = ({ seller, itemTitle, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
        <div className="p-5 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail size={20} className="text-blue-400" />
            Contact {seller?.name || seller?.owner}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-gray-400">Regarding: <span className="text-white font-medium">{itemTitle}</span></p>
          
          <div>
            <input
              type="text"
              placeholder="Your Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full p-3 bg-gray-700 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <input
              type="email"
              placeholder="Your Email *"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full p-3 bg-gray-700 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white`}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <input
              type="tel"
              placeholder="Your Phone Number (optional)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>
          
          <div>
            <textarea
              placeholder="Your Message *"
              rows="4"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className={`w-full p-3 bg-gray-700 border ${errors.message ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white resize-none`}
            />
            {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
          </div>
          
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-all">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

// ==================== ITEM DETAIL VIEW ====================
const ItemDetailView = ({ item, onBack, onLike, isLiked, onContactClick }) => {
  const CategoryIcon = categoryIcons[item.category] || Package;
  
  return (
    <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-700 animate-fade-in">
      <div className="relative h-64 md:h-96 bg-gray-700">
        <img 
          src={getImageUrl(item.image)} 
          alt={item.title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        <button onClick={onBack} className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:scale-110 transition border border-gray-700">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <button onClick={() => onLike(item._id)} className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:scale-110 transition border border-gray-700">
          <Heart size={20} className={isLiked ? "fill-red-500 text-red-500" : "text-white"} />
        </button>
      </div>
      <div className="p-6 md:p-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30 flex items-center gap-1">
            <CategoryIcon size={14} /> {item.category}
          </span>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm border border-emerald-500/30">{item.condition}</span>
          {item.tags?.map((tag, idx) => (
            <span key={idx} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">#{tag}</span>
          ))}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{item.title}</h1>
        <div className="flex items-center gap-4 mb-4">
          {item.promotionPrice ? (
            <>
              <span className="text-4xl font-bold text-orange-400">${item.promotionPrice}</span>
              <span className="text-2xl text-gray-400 line-through">${item.price}</span>
              <span className="text-emerald-400 text-lg font-medium">
                -{Math.round(((item.price - item.promotionPrice) / item.price) * 100)}% OFF
              </span>
            </>
          ) : (
            <span className="text-4xl font-bold text-orange-400">${item.price}</span>
          )}
        </div>
        <p className="text-gray-300 mb-6 leading-relaxed">{item.description}</p>
        
        <div className="bg-gray-700/50 rounded-xl p-5 mb-6 border border-gray-600">
          <h3 className="font-semibold text-lg mb-3 text-white flex items-center gap-2"><User size={20} /> Seller Information</h3>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
              {item.sellerName?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-semibold text-white">{item.sellerName}</p>
              <p className="text-sm text-gray-400 font-mono">Student ID: {item.studentId}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-gray-300"><MapPin size={14} /> {item.location}</p>
            <p className="flex items-center gap-2 text-gray-300"><Calendar size={14} /> Listed {new Date(item.createdAt).toLocaleDateString()}</p>
            <p className="flex items-center gap-2 text-gray-300"><Eye size={14} /> {item.views || 0} views</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => onContactClick({ name: item.sellerName, contact: item.contact, phone: item.phone, studentId: item.studentId, nic: item.nic, location: item.location })}
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <PhoneCall size={20} /> Contact Seller
          </button>
          <button className="px-6 py-3 border border-gray-600 rounded-xl font-semibold text-gray-300 hover:bg-gray-700 transition-all flex items-center gap-2">
            <Share2 size={20} /> Share
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== SHOP DETAIL VIEW ====================
const ShopDetailView = ({ shop, onBack, onContactClick, onRate }) => {
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);

  const handleRate = () => {
    if (rating > 0) {
      onRate(shop._id, rating);
      setShowRating(false);
      setRating(0);
    }
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-700 animate-fade-in">
      <div className="relative h-56 md:h-72 bg-gray-700">
        <img 
          src={getImageUrl(shop.image)} 
          alt={shop.shopName} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        <button onClick={onBack} className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:scale-110 transition border border-gray-700">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="absolute bottom-4 left-4 w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-xl border-2 border-white/20">
          <Store size={28} className="text-white" />
        </div>
      </div>
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{shop.shopName}</h1>
            <p className="text-gray-400">Owned by {shop.owner}</p>
            <p className="text-sm text-gray-500 font-mono mt-1">Student ID: {shop.studentId}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-yellow-400">{shop.rating || 5.0}</span>
              <span className="text-gray-400">★</span>
              <button 
                onClick={() => setShowRating(!showRating)}
                className="text-xs bg-gray-700 px-2 py-1 rounded-lg text-gray-300 hover:bg-gray-600"
              >
                Rate
              </button>
            </div>
            <span className="text-sm text-gray-500">({shop.reviews || 0} reviews)</span>
          </div>
        </div>
        
        {showRating && (
          <div className="mb-4 p-4 bg-gray-700 rounded-xl">
            <p className="text-sm text-gray-300 mb-2">Rate this shop:</p>
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-500'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <button onClick={handleRate} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">Submit Rating</button>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          {shop.services?.map((service, idx) => (
            <span key={idx} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm border border-emerald-500/30">{service}</span>
          ))}
        </div>
        
        <p className="text-gray-300 mb-6 leading-relaxed">{shop.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
            <h3 className="font-semibold mb-2 text-white flex items-center gap-2"><DollarSign size={18} /> Price Range</h3>
            <p className="text-gray-300">{shop.priceRange || 'Contact for pricing'}</p>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
            <h3 className="font-semibold mb-2 text-white flex items-center gap-2"><MapPin size={18} /> Location</h3>
            <p className="text-gray-300">{shop.location || 'Campus'}</p>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
            <h3 className="font-semibold mb-2 text-white flex items-center gap-2"><Clock3 size={18} /> Availability</h3>
            <p className="text-gray-300">{shop.availability || 'Flexible hours'}</p>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
            <h3 className="font-semibold mb-2 text-white flex items-center gap-2"><Phone size={18} /> Contact</h3>
            <p className="text-gray-300">{shop.phone}</p>
            <p className="text-gray-400 text-sm">{shop.contact}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => onContactClick(shop)}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <PhoneCall size={20} /> Contact Shop
          </button>
          <button className="px-6 py-3 border border-gray-600 rounded-xl font-semibold text-gray-300 hover:bg-gray-700 transition-all flex items-center gap-2">
            <ExternalLink size={20} /> View Portfolio
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== ITEM FORM MODAL ====================
const ItemFormModal = ({ onClose, onSubmit, currentUser }) => {
  const [formData, setFormData] = useState({
    title: '', price: '', category: '', condition: 'Like New', description: '',
    sellerName: currentUser.name || '', contactEmail: currentUser.email || '', phone: '', location: '', tags: '',
    studentId: currentUser.studentId || '', nic: '', imageFile: null
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'title': return validateTitle(value);
      case 'price': return validatePrice(value);
      case 'category': return !value ? 'Category is required' : '';
      case 'description': return validateDescription(value);
      case 'sellerName': return validateName(value);
      case 'contactEmail': return validateEmail(value);
      case 'phone': return validatePhone(value);
      case 'studentId': return validateStudentId(value);
      case 'nic': return validateNic(value);
      case 'imageFile': return validateImageFile(value);
      default: return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'tags' && key !== 'location') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      if (touched.imageFile) {
        const error = validateImageFile(file);
        setErrors({ ...errors, imageFile: error });
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm() && !submitting) {
      setSubmitting(true);
      await onSubmit(formData);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
        <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">List an Item for Sale</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition"><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Product Image *</label>
              <label className={`flex p-3 bg-gray-700 border ${errors.imageFile && touched.imageFile ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white placeholder-gray-400 cursor-pointer flex items-center justify-center gap-2 hover:bg-gray-600 transition`}>
                <Upload size={20} />
                {formData.imageFile ? formData.imageFile.name : 'Click to upload image'}
                <input type="file" accept="image/*" onChange={handleFileChange} onBlur={() => { setTouched({ ...touched, imageFile: true }); }} className="hidden" />
              </label>
              {errors.imageFile && touched.imageFile && <p className="text-red-400 text-xs mt-1">{errors.imageFile}</p>}
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-600" />
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Item Title *</label>
              <input name="title" value={formData.title} onChange={handleChange} onBlur={handleBlur} className={`w-full p-3 bg-gray-700 border ${errors.title && touched.title ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white`} placeholder="e.g., Calculus Textbook" />
              {errors.title && touched.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Price ($) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} onBlur={handleBlur} className={`w-full p-3 bg-gray-700 border ${errors.price && touched.price ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white`} placeholder="35" />
              {errors.price && touched.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} onBlur={handleBlur} className={`w-full p-3 bg-gray-700 border ${errors.category && touched.category ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white`}>
                <option value="">Select Category</option>
                {itemCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && touched.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Condition</label>
              <select name="condition" value={formData.condition} onChange={handleChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white">
                {itemConditions.map(cond => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tags (comma separated)</label>
              <input name="tags" value={formData.tags} onChange={handleChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white" placeholder="textbook, math, study" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleChange} onBlur={handleBlur} className={`w-full p-3 bg-gray-700 border ${errors.description && touched.description ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white`} placeholder="Describe your item..."></textarea>
              {errors.description && touched.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>
            
            <div className="md:col-span-2 border-t border-gray-700 pt-4">
              <h3 className="font-semibold mb-3 text-white">Seller Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input name="sellerName" value={formData.sellerName} onChange={handleChange} onBlur={handleBlur} placeholder="Full Name *" className={`w-full p-3 bg-gray-700 border ${errors.sellerName && touched.sellerName ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white`} />
                  {errors.sellerName && touched.sellerName && <p className="text-red-400 text-xs mt-1">{errors.sellerName}</p>}
                </div>
                <div>
                  <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} onBlur={handleBlur} placeholder="Email *" className={`w-full p-3 bg-gray-700 border ${errors.contactEmail && touched.contactEmail ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white`} />
                  {errors.contactEmail && touched.contactEmail && <p className="text-red-400 text-xs mt-1">{errors.contactEmail}</p>}
                </div>
                <div>
                  <input name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} placeholder="Phone Number *" className={`w-full p-3 bg-gray-700 border ${errors.phone && touched.phone ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white`} />
                  {errors.phone && touched.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <input name="studentId" value={formData.studentId} onChange={handleChange} onBlur={handleBlur} placeholder="Student ID (ITxxxxxxxx) *" className={`w-full p-3 bg-gray-700 border ${errors.studentId && touched.studentId ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white font-mono`} />
                  {errors.studentId && touched.studentId && <p className="text-red-400 text-xs mt-1">{errors.studentId}</p>}
                  <p className="text-gray-500 text-xs mt-1">Example: IT23328020</p>
                </div>
                <div>
                  <input name="nic" value={formData.nic} onChange={handleChange} onBlur={handleBlur} placeholder="NIC Number *" className={`w-full p-3 bg-gray-700 border ${errors.nic && touched.nic ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white font-mono`} />
                  {errors.nic && touched.nic && <p className="text-red-400 text-xs mt-1">{errors.nic}</p>}
                  <p className="text-gray-500 text-xs mt-1">Example: 123456789V or 199512345678</p>
                </div>
                <div>
                  <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <button type="submit" disabled={submitting} className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-all disabled:opacity-50">
            {submitting ? <Loader className="animate-spin mx-auto" size={24} /> : 'Post Item for Sale'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==================== SHOP FORM MODAL ====================
const ShopFormModal = ({ onClose, onSubmit, currentUser }) => {
  const [formData, setFormData] = useState({
    shopName: '', owner: currentUser.name || '', services: [], description: '', contactEmail: currentUser.email || '', phone: '', location: '', priceRange: '',
    studentId: currentUser.studentId || '', nic: '', imageFile: null
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const [customService, setCustomService] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'shopName': return validateShopName(value);
      case 'owner': return validateName(value);
      case 'description': return validateDescription(value);
      case 'contactEmail': return validateEmail(value);
      case 'phone': return validatePhone(value);
      case 'studentId': return validateStudentId(value);
      case 'nic': return validateNic(value);
      case 'imageFile': return validateImageFile(value);
      default: return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'services' && key !== 'location' && key !== 'priceRange') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    if (selectedServices.length === 0) newErrors.services = 'At least one service is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const addService = () => {
    if (customService && !selectedServices.includes(customService)) {
      const newServices = [...selectedServices, customService];
      setSelectedServices(newServices);
      setFormData({ ...formData, services: newServices });
      setErrors({ ...errors, services: '' });
      setCustomService('');
    }
  };

  const removeService = (service) => {
    const newServices = selectedServices.filter(s => s !== service);
    setSelectedServices(newServices);
    setFormData({ ...formData, services: newServices });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm() && !submitting) {
      setSubmitting(true);
      await onSubmit({ ...formData, services: selectedServices });
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
        <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Register Your Student Shop</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition"><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Shop Image *</label>
              <label className={`flex p-3 bg-gray-700 border ${errors.imageFile && touched.imageFile ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white cursor-pointer flex items-center justify-center gap-2 hover:bg-gray-600 transition`}>
                <Upload size={20} />
                {formData.imageFile ? formData.imageFile.name : 'Click to upload image'}
                <input type="file" accept="image/*" onChange={handleFileChange} onBlur={() => setTouched({ ...touched, imageFile: true })} className="hidden" />
              </label>
              {errors.imageFile && touched.imageFile && <p className="text-red-400 text-xs mt-1">{errors.imageFile}</p>}
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Shop Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-600" />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Shop Name *</label>
              <input name="shopName" value={formData.shopName} onChange={handleChange} onBlur={handleBlur} className={`w-full p-3 bg-gray-700 border ${errors.shopName && touched.shopName ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white`} placeholder="e.g., CodeCraft Tutoring" />
              {errors.shopName && touched.shopName && <p className="text-red-400 text-xs mt-1">{errors.shopName}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Owner Name *</label>
              <input name="owner" value={formData.owner} onChange={handleChange} onBlur={handleBlur} className={`w-full p-3 bg-gray-700 border ${errors.owner && touched.owner ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white`} placeholder="Your Full Name" />
              {errors.owner && touched.owner && <p className="text-red-400 text-xs mt-1">{errors.owner}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Services *</label>
              <div className="flex gap-2 mb-2">
                <select 
                  value={customService} 
                  onChange={(e) => setCustomService(e.target.value)}
                  className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
                >
                  <option value="">Select a service</option>
                  {serviceOptions.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
                <button 
                  type="button"
                  onClick={addService}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition flex items-center gap-1"
                >
                  <Plus size={18} /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2 min-h-[60px] p-2 bg-gray-700/30 rounded-xl">
                {selectedServices.map(service => (
                  <span key={service} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm border border-emerald-500/30 flex items-center gap-1">
                    {service}
                    <button type="button" onClick={() => removeService(service)} className="hover:text-red-400 ml-1">×</button>
                  </span>
                ))}
                {selectedServices.length === 0 && <span className="text-gray-500 text-sm">No services added yet</span>}
              </div>
              {errors.services && <p className="text-red-400 text-xs mt-1">{errors.services}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleChange} onBlur={handleBlur} className={`w-full p-3 bg-gray-700 border ${errors.description && touched.description ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white`} placeholder="Describe your shop and what you offer..."></textarea>
              {errors.description && touched.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Price Range</label>
              <input name="priceRange" value={formData.priceRange} onChange={handleChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white" placeholder="$20-40/hour" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
              <input name="location" value={formData.location} onChange={handleChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white" placeholder="Building, Room, or Online" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Contact Email *</label>
              <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} onBlur={handleBlur} className={`w-full p-3 bg-gray-700 border ${errors.contactEmail && touched.contactEmail ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white`} />
              {errors.contactEmail && touched.contactEmail && <p className="text-red-400 text-xs mt-1">{errors.contactEmail}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number *</label>
              <input name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} className={`w-full p-3 bg-gray-700 border ${errors.phone && touched.phone ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white`} />
              {errors.phone && touched.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Student ID *</label>
              <input name="studentId" value={formData.studentId} onChange={handleChange} onBlur={handleBlur} placeholder="ITxxxxxxxx" className={`w-full p-3 bg-gray-700 border ${errors.studentId && touched.studentId ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white font-mono`} />
              {errors.studentId && touched.studentId && <p className="text-red-400 text-xs mt-1">{errors.studentId}</p>}
              <p className="text-gray-500 text-xs mt-1">Example: IT23328020</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">NIC Number *</label>
              <input name="nic" value={formData.nic} onChange={handleChange} onBlur={handleBlur} placeholder="123456789V or 199512345678" className={`w-full p-3 bg-gray-700 border ${errors.nic && touched.nic ? 'border-red-500' : 'border-gray-600'} rounded-xl text-white font-mono`} />
              {errors.nic && touched.nic && <p className="text-red-400 text-xs mt-1">{errors.nic}</p>}
              <p className="text-gray-500 text-xs mt-1">Example: 123456789V (old) or 199512345678 (new)</p>
            </div>
          </div>
          
          <button type="submit" disabled={submitting} className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:scale-105 transition-all disabled:opacity-50">
            {submitting ? <Loader className="animate-spin mx-auto" size={24} /> : 'Register Your Shop'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;