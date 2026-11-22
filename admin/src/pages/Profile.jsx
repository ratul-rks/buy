import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../config";
import { logout } from "../redux/authSlice";
import toast from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaUserShield,
  FaSignOutAlt,
  FaEdit,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { MdDashboard, MdSettings, MdSecurity } from "react-icons/md";

const Profile = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (token) {
      fetchProfileData();
      fetchStats();
    }
  }, [token]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverUrl}/api/user/profile`, {
        headers: { 
          token,
          "Content-Type": "application/json"
        },
      });

      if (response.data.success) {
        setProfileData(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Use user from Redux if API fails
      if (user) {
        setProfileData(user);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const headers = { 
        token,
        "Content-Type": "application/json"
      };
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        axios.get(`${serverUrl}/api/order/stats`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${serverUrl}/api/user/users`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${serverUrl}/api/product/list`, { headers }).catch(() => ({ data: { success: false } })),
      ]);

      if (ordersRes.data.success) {
        setStats((prev) => ({
          ...prev,
          totalOrders: ordersRes.data.stats?.totalOrders || 0,
          totalRevenue: ordersRes.data.stats?.totalRevenue || 0,
        }));
      }

      if (usersRes.data.success) {
        setStats((prev) => ({
          ...prev,
          totalUsers: usersRes.data.users?.length || 0,
        }));
      }

      if (productsRes.data.success) {
        setStats((prev) => ({
          ...prev,
          totalProducts: productsRes.data.products?.length || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const displayUser = profileData || user;

  if (loading && !displayUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FaUser className="text-blue-600" />
          Profile Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Manage your account and view statistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {displayUser?.avatar ? (
                  <img
                    src={displayUser.avatar}
                    alt={displayUser.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-2xl border-4 border-blue-100">
                    {getUserInitials(displayUser?.name || displayUser?.email)}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {displayUser?.name || "Admin User"}
                  </h2>
                  <p className="text-gray-500 flex items-center gap-2 mt-1">
                    <FaEnvelope className="text-sm" />
                    {displayUser?.email || "admin@example.com"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    displayUser?.isActive !== false
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {displayUser?.isActive !== false ? (
                    <>
                      <FaCheckCircle className="mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="mr-1" />
                      Inactive
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FaUserShield className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {displayUser?.role || "Admin"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <FaCalendarAlt className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(displayUser?.createdAt)}
                  </p>
                </div>
              </div>

              {displayUser?.lastLogin && (
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <FaClock className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(displayUser.lastLogin)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <MdSecurity className="text-orange-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <p className="font-semibold text-gray-900">
                    {displayUser?.isActive !== false ? "Verified" : "Suspended"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
              >
                <MdDashboard className="text-blue-600 text-xl" />
                <div>
                  <p className="font-medium text-gray-900">Dashboard</p>
                  <p className="text-sm text-gray-500">View overview</p>
                </div>
              </button>

              <button
                onClick={() => navigate("/settings")}
                className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
              >
                <MdSettings className="text-purple-600 text-xl" />
                <div>
                  <p className="font-medium text-gray-900">Settings</p>
                  <p className="text-sm text-gray-500">Manage preferences</p>
                </div>
              </button>

              <button
                onClick={() => navigate("/users")}
                className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
              >
                <FaUser className="text-green-600 text-xl" />
                <div>
                  <p className="font-medium text-gray-900">Users</p>
                  <p className="text-sm text-gray-500">Manage users</p>
                </div>
              </button>

              <button
                onClick={() => navigate("/notifications")}
                className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
              >
                <FaEnvelope className="text-orange-600 text-xl" />
                <div>
                  <p className="font-medium text-gray-900">Notifications</p>
                  <p className="text-sm text-gray-500">View alerts</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Stats & Logout Card */}
        <div className="space-y-6">
          {/* Statistics Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Total Orders</span>
                <span className="text-2xl font-bold">{stats.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Total Users</span>
                <span className="text-2xl font-bold">{stats.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Total Products</span>
                <span className="text-2xl font-bold">{stats.totalProducts}</span>
              </div>
              <div className="pt-4 border-t border-blue-500">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Total Revenue</span>
                  <span className="text-2xl font-bold">
                    ${stats.totalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/settings")}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <FaEdit className="text-gray-600" />
                <span className="font-medium text-gray-900">Edit Profile</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-left group"
              >
                <FaSignOutAlt className="text-red-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-red-600">Logout</span>
              </button>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <MdSecurity className="text-yellow-600 text-xl mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Security Tip</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Always log out when you're done managing the admin panel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

