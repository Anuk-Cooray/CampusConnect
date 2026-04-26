import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../utils/apiBase';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import StatsCards from '../components/dashboard/StatsCards';
import UpcomingEvents from '../components/dashboard/UpcomingEvents';
import QuickActions from '../components/dashboard/QuickActions';
import Feed from '../components/dashboard/Feed';
import DashboardTrending from '../components/dashboard/DashboardTrending';

const MainDashboard = () => {
  const navigate = useNavigate();
  const getStoredValue = (key, fallback = '') =>
    sessionStorage.getItem(key) || localStorage.getItem(key) || fallback;

  const [userName] = useState(getStoredValue('userName', 'Anuk Cooray'));

  const [feedPosts, setFeedPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [kuppiSessions, setKuppiSessions] = useState([]);
  const [kuppiLoading, setKuppiLoading] = useState(true);

  const currentUserId = getStoredValue('studentId', 'IT23328020');

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/posts`);
      const data = await response.json();
      setFeedPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/${currentUserId}`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const fetchKuppiSessions = async () => {
    setKuppiLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/kuppi-sessions`);
      const data = await res.json();
      setKuppiSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching kuppi sessions:', err);
      setKuppiSessions([]);
    } finally {
      setKuppiLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchNotifications();
    fetchKuppiSessions();
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, { method: 'PUT' });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleCreatePost = async (e, mediaPayload = {}) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsPosting(true);
    try {
      const { mediaFile = null, mediaType = 'none' } = mediaPayload;
      const resolvedMediaType =
        mediaType !== 'none'
          ? mediaType
          : mediaFile
            ? (mediaFile.type?.startsWith('image/') ? 'image' : 'document')
            : 'none';

      const formData = new FormData();
      formData.append('authorName', userName);
      formData.append('content', newPostContent);
      formData.append('mediaType', resolvedMediaType);
      if (mediaFile) {
        formData.append('mediaFile', mediaFile);
      }

      const response = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setNewPostContent('');
        fetchPosts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating post:', error);
      return false;
    } finally {
      setIsPosting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('studentId');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('user');

    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('studentId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatMediaUrl = (path) => (path ? `${API_BASE}/${path.replace(/\\/g, '/')}` : '');

  const stats = {
    postCount: feedPosts.length,
    unreadCount,
    kuppiCount: kuppiSessions.length,
    notificationCount: notifications.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 font-sans text-slate-800">
      <DashboardNavbar
        showNotifDropdown={showNotifDropdown}
        setShowNotifDropdown={setShowNotifDropdown}
        notifications={notifications}
        unreadCount={unreadCount}
        markAsRead={markAsRead}
        handleLogout={handleLogout}
      />

      <div className="max-w-[1440px] mx-auto pt-4 sm:pt-6 px-3 sm:px-5 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5 xl:gap-6 relative items-start">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <DashboardSidebar userName={userName} studentId={currentUserId} />
            </div>
          </aside>

          <main className="space-y-5 min-w-0">
            <WelcomeBanner userName={userName} />
            <StatsCards stats={stats} />
            <QuickActions />
            <UpcomingEvents sessions={kuppiSessions} loading={kuppiLoading} />
            <Feed
              userName={userName}
              newPostContent={newPostContent}
              setNewPostContent={setNewPostContent}
              handleCreatePost={handleCreatePost}
              isPosting={isPosting}
              feedPosts={feedPosts}
              formatMediaUrl={formatMediaUrl}
            />
          </main>

        </div>

        <footer className="mt-8 border-t border-slate-200 pt-6">
          <div className="max-w-5xl mx-auto space-y-4">
            <DashboardTrending />
            <div className="flex flex-wrap gap-x-3 gap-y-1 px-2 text-[11px] font-medium text-slate-500 justify-center">
              <a href="#" className="hover:text-blue-600 hover:underline">
                About
              </a>
              <a href="#" className="hover:text-blue-600 hover:underline">
                Help
              </a>
              <a href="#" className="hover:text-blue-600 hover:underline">
                Privacy
              </a>
              <div className="w-full text-center mt-2 flex items-center justify-center gap-1">
                <span className="font-bold text-blue-600">CampusConnect</span>
                <span>© 2026</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainDashboard;
