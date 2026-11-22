import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { serverUrl } from "../../config";
import { addUser, removeUser, resetOrderCount } from "../redux/orebiSlice";
import Container from "../components/Container";
import {
  FaSignOutAlt,
  FaUserCircle,
  FaPen,
  FaHome,
  FaPhone,
} from "react-icons/fa";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.orebiReducer.userInfo);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (!userInfo) {
      navigate("/signin");
      return;
    }

    // Fetch fresh user data from server
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${serverUrl}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const userData = response.data.user;
          // Update Redux store with fresh data
          dispatch(addUser(userData));
          setForm({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
          });
          setAddresses(userData.addresses || []);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUserProfile();
  }, [userInfo, navigate, dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(removeUser());
    dispatch(resetOrderCount());
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${serverUrl}/api/user/profile`,
        { name: form.name, email: form.email, phone: form.phone, address: form.address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        dispatch(addUser(response.data.user));
        toast.success("Profile updated");
        setEditing(false);
        setAddresses(response.data.user.addresses || []);
      } else {
        toast.error(response.data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not update profile");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${serverUrl}/api/user/addresses/${id}/default`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Default address set");
        // refresh profile
        const r = await axios.get(`${serverUrl}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } });
        if (r.data.success) {
          dispatch(addUser(r.data.user));
          setAddresses(r.data.user.addresses || []);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not set default");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${serverUrl}/api/user/addresses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast.success("Address deleted");
        setAddresses((s) => s.filter((a) => a._id !== id));
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not delete address");
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/*============ Left column: profile card */}
            
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-1 bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-28 h-28 bg-gray-900 rounded-full flex items-center justify-center overflow-hidden">
                  {userInfo.avatar ? (
                    <img src={userInfo.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <FaUserCircle className="text-6xl text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{userInfo.name}</h2>
                  <p className="text-sm text-gray-600">{userInfo.email}</p>
                </div>
                <div className="w-full mt-2">
                  <button onClick={() => setEditing((v) => !v)} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <FaPen /> Edit Profile
                  </button>
                  <button onClick={handleLogout} className="w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </div>
              <div className="mt-6 text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-2"><strong>Member since:</strong> {new Date(userInfo.createdAt).toLocaleDateString()}</div>
                <div className="flex items-center gap-2"><strong>Orders:</strong> {userInfo.orders?.length || 0}</div>
                <div className="flex items-center gap-2"><strong>Last login:</strong> {userInfo.lastLogin ? new Date(userInfo.lastLogin).toLocaleString() : "-"}</div>
              </div>
            </motion.div>

            {/*=============  Right column: details and addresses */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Account</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" className="border rounded-lg px-3 py-2" />
                <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border rounded-lg px-3 py-2" />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="border rounded-lg px-3 py-2 md:col-span-2" />
                <input name="address" value={form.address} onChange={handleChange} placeholder="Primary address" className="border rounded-lg px-3 py-2 md:col-span-2" />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button onClick={handleSaveProfile} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save changes</button>
                <button onClick={() => { setForm({ name: userInfo.name, email: userInfo.email, phone: userInfo.phone || "", address: userInfo.address || "" }); setEditing(false); }} className="px-4 py-2 border rounded-lg">Cancel</button>
              </div>

              <hr className="my-6" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Addresses</h3>
                  <button onClick={() => toast('Use "Add address" in your account to add addresses')} className="text-sm text-indigo-600">Add address</button>
                </div>
                <div className="space-y-3">
                  {addresses.length === 0 && <div className="text-sm text-gray-600">No saved addresses</div>}
                  {addresses.map((addr) => (
                    <div key={addr._id} className={`p-4 border rounded-lg flex justify-between items-start ${addr.isDefault ? 'ring-2 ring-indigo-100' : ''}`}>
                      <div>
                        <div className="font-medium">{addr.label} {addr.isDefault && <span className="text-xs text-white bg-indigo-600 px-2 py-0.5 rounded ml-2">Default</span>}</div>
                        <div className="text-sm text-gray-600">{addr.street}, {addr.city} {addr.state} {addr.zipCode}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-2 mt-1"><FaPhone /> {addr.phone}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {!addr.isDefault && <button onClick={() => handleSetDefault(addr._id)} className="text-sm text-indigo-600">Set default</button>}
                        <button onClick={() => handleDeleteAddress(addr._id)} className="text-sm text-red-600">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>
    );
};

export default Profile;
