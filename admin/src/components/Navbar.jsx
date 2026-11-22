import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { logo } from "../assets/images";
import { FaUser, FaCog, FaChevronDown, FaUserShield } from "react-icons/fa";
import { MdNotifications, MdDashboard, MdShoppingCart, MdWarning, MdPersonAdd } from "react-icons/md";
import axios from "axios";
import { serverUrl } from "../config";

const Navbar = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch notifications
  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchUnreadCount();
      // Refresh notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      setLoadingNotifications(true);
      const response = await axios.get(`${serverUrl}/api/notification`, {
        params: { limit: 5, isRead: "false" },
        headers: { 
          token,
          "Content-Type": "application/json"
        },
      });
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const response = await axios.get(
        `${serverUrl}/api/notification/unread-count`,
        { headers: { token } }
      );
      if (response.data.success) {
        setUnreadCount(response.data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <MdShoppingCart className="text-blue-600 text-lg" />;
      case "low_stock":
        return <MdWarning className="text-orange-600 text-lg" />;
      case "user_registration":
        return <MdPersonAdd className="text-green-600 text-lg" />;
      default:
        return <MdNotifications className="text-gray-600 text-lg" />;
    }
  };

  const formatTime = (date) => {
    try {
      const now = new Date();
      const notificationDate = new Date(date);
      const diffInSeconds = Math.floor((now - notificationDate) / 1000);
      
      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? "s" : ""} ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? "s" : ""} ago`;
      return notificationDate.toLocaleDateString();
    } catch {
      return "Recently";
    }
  };

  const getUserInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };


  const userMenuItems = [
    { icon: FaUser, label: "Profile", path: "/profile" },
    { icon: MdDashboard, label: "Dashboard", path: "/" },
    { icon: FaCog, label: "Settings", path: "/settings" },
  ];

  return (
    <header className="border-b border-gray-200 w-full sticky top-0 left-0 z-40 bg-white shadow-sm">
      <div className="py-2.5 flex items-center justify-between px-4">
        {/* Logo Section */}
        <Link to={"/"} className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="logo"
            className="w-20 sm:w-24 transition-transform duration-200 group-hover:scale-105"
          />
          <div className="hidden sm:block">
            <p className="text-xs uppercase font-bold tracking-wide text-blue-600">
              Admin Panel
            </p>
            <p className="text-xs text-gray-500">Dashboard v1.0</p>
          </div>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Admin Badge */}
          <div className="hidden md:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
            <FaUserShield className="text-blue-600 text-sm" />
            <span className="text-sm font-medium text-blue-700">Admin</span>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                if (!isNotificationOpen) {
                  fetchNotifications();
                }
              }}
              className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
            >
              <MdNotifications className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-96 overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">
                    {unreadCount > 0
                      ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                      : "All caught up!"}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <MdNotifications className="text-4xl mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-50 last:border-b-0 cursor-pointer"
                        onClick={() => {
                          setIsNotificationOpen(false);
                          navigate("/notifications");
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-100 flex-shrink-0">
                  <Link
                    to="/notifications"
                    onClick={() => setIsNotificationOpen(false)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium block text-center"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          {user && (
            <div className="relative" ref={userMenuRef}>
              {/* User Info - Desktop */}
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-3 text-sm text-gray-600 mr-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>

                {/* User Avatar & Dropdown */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors duration-200"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-semibold text-sm">
                      {getUserInitials(user?.name || user?.email)}
                    </div>
                  )}
                  <FaChevronDown
                    className={`text-gray-600 text-sm transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {/* User Info in Dropdown */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900 truncate">
                      {user.name || user.email}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
                        Online
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    {userMenuItems.map((item, index) => (
                      <Link
                        key={index}
                        to={item.path}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <item.icon className="text-gray-400" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
