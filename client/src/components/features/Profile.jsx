"use client"

import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../../store/slices/authSlice";

const mockActivity = [
  { time: "2 hours ago", action: "Uploaded new dataset 'Q1 Sales'" },
  { time: "1 day ago", action: "Created chart 'Revenue Growth Q1'" },
  { time: "3 days ago", action: "Joined team 'Marketing'" },
];

export default function Profile() {
  const user = useSelector((state) => state.auth.user) || { name: "User", email: "user@email.com" };
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    bio: user.bio || "",
    location: user.location || "",
  });
  const [avatar, setAvatar] = useState(user.avatar || "/placeholder-user.jpg");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState("");
  const [deleteErr, setDeleteErr] = useState("");
  const fileInputRef = useRef();

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  const getAvatarUrl = (avatar) => {
    if (!avatar) return "/placeholder-user.jpg";
    if (avatar.startsWith("http")) return avatar;
    return `http://localhost:5000${avatar}`;
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Sync avatar with Redux user data after refresh or profile update
  useEffect(() => {
    setAvatar(user.avatar || "/placeholder-user.jpg");
  }, [user.avatar]);

  const handleEdit = () => {
    setEditMode(true);
    setSaveMsg("");
    setSaveErr("");
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm({
      name: user.name || "",
      email: user.email || "",
      bio: user.bio || "",
      location: user.location || "",
    });
    setAvatar(user.avatar || "/placeholder-user.jpg");
    setAvatarFile(null);
    setSaveMsg("");
    setSaveErr("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    setSaveErr("");
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const res = await fetch(`${API}/auth/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload avatar");
      setAvatar(data.avatar);
      dispatch(login(data.user));
      setAvatarFile(null);
      setSaveMsg("Avatar updated.");
    } catch (err) {
      setSaveErr(err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    setAvatar("/placeholder-user.jpg");
    setAvatarFile(null);
    setForm((f) => ({ ...f, avatar: "" }));
    setSaveMsg("Avatar removed (save profile to confirm).");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveMsg("");
    setSaveErr("");
    // Only send changed fields
    const updatedFields = {};
    if (form.name && form.name !== user.name) updatedFields.name = form.name;
    if (form.email && form.email !== user.email) updatedFields.email = form.email;
    if (form.bio !== undefined && form.bio !== user.bio) updatedFields.bio = form.bio;
    if (form.location !== undefined && form.location !== user.location) updatedFields.location = form.location;
    // Avatar: only send if changed
    if ((avatar === "/placeholder-user.jpg" && user.avatar) || (avatar !== "/placeholder-user.jpg" && avatar !== user.avatar)) {
      updatedFields.avatar = avatar === "/placeholder-user.jpg" ? "" : avatar;
    }
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      dispatch(login(data));
      setEditMode(false);
      setSaveMsg("Profile updated.");
      // Reset form state to match updated Redux user
      setForm({
        name: data.name || "",
        email: data.email || "",
        bio: data.bio || "",
        location: data.location || "",
      });
    } catch (err) {
      setSaveErr(err.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg("");
    setPwErr("");
    try {
      const res = await fetch(`${API}/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwords),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      setPwMsg("Password changed successfully.");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPwErr(err.message);
    }
  };

  const handleDelete = async () => {
    setDeleteMsg("");
    setDeleteErr("");
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete account");
      setDeleteMsg("Account deleted. Logging out...");
      setTimeout(() => {
        localStorage.removeItem("token");
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      setDeleteErr(err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="flex items-center gap-4 mb-8">
        {getAvatarUrl(avatarFile ? avatar : user.avatar) === "/placeholder-user.jpg" ? (
          <div className="w-20 h-20 rounded-full border flex items-center justify-center bg-gray-100 text-3xl font-bold text-gray-500">
            {getInitials(user.name)}
          </div>
        ) : (
          <img
            src={getAvatarUrl(avatarFile ? avatar : user.avatar)}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover border"
          />
        )}
        <div>
          <div className="text-lg font-semibold text-foreground dark:text-white">{user.name}</div>
          <div className="text-muted-foreground">{user.email}</div>
          <div className="text-xs text-muted-foreground">{user.role}</div>
        </div>
        <div className="ml-auto flex flex-col gap-2">
          <button
            className="text-sm text-primary underline"
            onClick={() => fileInputRef.current.click()}
            disabled={avatarUploading}
          >
            Change Avatar
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleAvatarChange}
            disabled={avatarUploading}
          />
          <button
            className="text-sm text-destructive underline"
            onClick={handleAvatarRemove}
            disabled={avatarUploading}
          >
            Remove Avatar
          </button>
          {avatarFile && (
            <button
              className="text-xs bg-primary text-primary-foreground rounded px-2 py-1 mt-1"
              onClick={handleAvatarUpload}
              disabled={avatarUploading}
            >
              {avatarUploading ? "Uploading..." : "Upload Avatar"}
            </button>
          )}
        </div>
      </div>
      {editMode ? (
        <form onSubmit={handleSave} className="space-y-4 mb-8">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              className="w-full border rounded px-3 py-2"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              className="w-full border rounded px-3 py-2"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Bio</label>
            <textarea
              name="bio"
              className="w-full border rounded px-3 py-2"
              value={form.bio}
              onChange={handleChange}
              rows={2}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Location</label>
            <input
              type="text"
              name="location"
              className="w-full border rounded px-3 py-2"
              value={form.location}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Save
            </button>
            <button
              type="button"
              className="bg-gray-200 px-4 py-2 rounded"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
          {saveMsg && <div className="text-green-600 mt-2">{saveMsg}</div>}
          {saveErr && <div className="text-red-600 mt-2">{saveErr}</div>}
        </form>
      ) : (
        <div className="mb-8">
          <div className="mb-2"><span className="font-medium">Bio:</span> {user.bio || <span className="text-gray-400">(none)</span>}</div>
          <div className="mb-2"><span className="font-medium">Location:</span> {user.location || <span className="text-gray-400">(none)</span>}</div>
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            onClick={handleEdit}
          >
            Edit Profile
          </button>
          {saveMsg && <div className="text-green-600 mt-2">{saveMsg}</div>}
          {saveErr && <div className="text-red-600 mt-2">{saveErr}</div>}
        </div>
      )}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-2">
          <input
            type="password"
            name="currentPassword"
            className="w-full border rounded px-3 py-2"
            placeholder="Current Password"
            value={passwords.currentPassword}
            onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
            required
          />
          <input
            type="password"
            name="newPassword"
            className="w-full border rounded px-3 py-2"
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
            required
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Change Password
          </button>
        </form>
        {pwMsg && <div className="text-green-600 mt-2">{pwMsg}</div>}
        {pwErr && <div className="text-red-600 mt-2">{pwErr}</div>}
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
        <ul className="space-y-2">
          {mockActivity.map((item, idx) => (
            <li key={idx} className="border-b pb-2">
              <span className="text-gray-800">{item.action}</span>
              <span className="text-xs text-gray-500 ml-2">({item.time})</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h2>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={() => setDeleteConfirm(true)}
        >
          Delete Account
        </button>
        {deleteConfirm && (
          <div className="mt-4 p-4 border border-red-400 bg-red-50 rounded">
            <div className="mb-2 text-red-700 font-semibold">Are you sure you want to delete your account? This action cannot be undone.</div>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded mr-2"
              onClick={handleDelete}
            >
              Yes, Delete My Account
            </button>
            <button
              className="bg-gray-200 px-4 py-2 rounded"
              onClick={() => setDeleteConfirm(false)}
            >
              Cancel
            </button>
            {deleteMsg && <div className="text-green-600 mt-2">{deleteMsg}</div>}
            {deleteErr && <div className="text-red-600 mt-2">{deleteErr}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
