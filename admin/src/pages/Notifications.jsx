import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config";
import toast from "react-hot-toast";
import {
  MdNotifications,
  MdNotificationsActive,
  MdNotificationsOff,
  MdDelete,
  MdCheckCircle,
  MdShoppingCart,
  MdWarning,
  MdPersonAdd,
} from "react-icons/md";

const Notifications = () => {
  const { token } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, order, low_stock, user_registration
  const [unreadCount, setUnreadCount] = useState(0);

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
  }, [filter, token]);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params = {};
      if (filter === "unread") {
        params.isRead = "false";
      } else if (filter !== "all") {
        params.type = filter;
      }

      const response = await axios.get(`${serverUrl}/api/notification`, {
        params,
        headers: { 
          token,
          "Content-Type": "application/json"
        },
      });

      if (response.data.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      } else {
        toast.error(response.data.message || "Failed to load notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        serverUrl: serverUrl,
      });
      
      let errorMessage = "Failed to load notifications";
      
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorMessage = `Network Error: Cannot connect to server at ${serverUrl}. Please check if the server is running.`;
      } else if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
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

  const markAsRead = async (notificationId) => {
    try {
      const response = await axios.put(
        `${serverUrl}/api/notification/mark-read`,
        { notificationId },
        { headers: { token } }
      );

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success("Notification marked as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await axios.put(
        `${serverUrl}/api/notification/mark-all-read`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await axios.delete(`${serverUrl}/api/notification`, {
        data: { notificationId },
        headers: { token },
      });

      if (response.data.success) {
        setNotifications((prev) =>
          prev.filter((notif) => notif._id !== notificationId)
        );
        toast.success("Notification deleted");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const deleteAllRead = async () => {
    try {
      const response = await axios.delete(
        `${serverUrl}/api/notification/read`,
        { headers: { token } }
      );

      if (response.data.success) {
        setNotifications((prev) => prev.filter((notif) => !notif.isRead));
        toast.success(`${response.data.deletedCount} notifications deleted`);
      }
    } catch (error) {
      console.error("Error deleting read notifications:", error);
      toast.error("Failed to delete read notifications");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <MdShoppingCart className="text-blue-600" />;
      case "low_stock":
        return <MdWarning className="text-orange-600" />;
      case "user_registration":
        return <MdPersonAdd className="text-green-600" />;
      default:
        return <MdNotifications className="text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "order":
        return "bg-blue-50 border-blue-200";
      case "low_stock":
        return "bg-orange-50 border-orange-200";
      case "user_registration":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
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

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MdNotificationsActive className="text-blue-600" />
              Notifications
            </h1>
            <p className="text-gray-500 mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <MdCheckCircle />
                Mark All Read
              </button>
            )}
            <button
              onClick={deleteAllRead}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <MdDelete />
              Delete Read
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: "all", label: "All" },
          { value: "unread", label: "Unread" },
          { value: "order", label: "Orders" },
          { value: "low_stock", label: "Low Stock" },
          { value: "user_registration", label: "Registrations" },
        ].map((filterOption) => (
          <button
            key={filterOption.value}
            onClick={() => setFilter(filterOption.value)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === filterOption.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <MdNotificationsOff className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No notifications found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg border-2 transition-all ${
                notification.isRead
                  ? getNotificationColor(notification.type)
                  : `${getNotificationColor(notification.type)} ring-2 ring-blue-300`
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3
                        className={`font-semibold ${
                          notification.isRead ? "text-gray-700" : "text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{formatTime(notification.createdAt)}</span>
                        <span className="capitalize">
                          {notification.type.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <MdCheckCircle />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <MdDelete />
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
  );
};

export default Notifications;

