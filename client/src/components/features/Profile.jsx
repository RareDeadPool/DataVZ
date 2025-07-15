import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../../store/slices/authSlice";
import { 
  User, 
  Mail, 
  MapPin, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Trash2, 
  Shield, 
  Activity, 
  AlertTriangle,
  Clock,
  Upload,
  Eye,
  Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-slate-100 dark:from-primary/10 dark:via-background dark:to-slate-900">
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-slate-600 dark:from-primary dark:to-slate-400 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-background/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-start gap-6">
              <div className="relative">
                {getAvatarUrl(avatarFile ? avatar : user.avatar) === "/placeholder-user.jpg" ? (
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-3xl font-bold text-slate-500">
                    {getInitials(user.name)}
                  </div>
                ) : (
                  <img
                    src={getAvatarUrl(avatarFile ? avatar : user.avatar)}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  onClick={() => fileInputRef.current.click()}
                  disabled={avatarUploading}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                />
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    {user.role}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  {avatarFile && (
                    <Button
                      size="sm"
                      onClick={handleAvatarUpload}
                      disabled={avatarUploading}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {avatarUploading ? "Uploading..." : "Upload"}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAvatarRemove}
                    disabled={avatarUploading}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>

              <Button
                variant={editMode ? "outline" : "default"}
                onClick={editMode ? handleCancel : handleEdit}
                className="flex items-center gap-2"
              >
                {editMode ? (
                  <>
                    <X className="h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>

            <Separator />

            {/* Form Section */}
            {editMode ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <Input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Bio
                  </label>
                  <Textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      Bio
                    </div>
                    <p className="text-sm">
                      {user.bio || <span className="text-muted-foreground italic">No bio added yet</span>}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Location
                    </div>
                    <p className="text-sm">
                      {user.location || <span className="text-muted-foreground italic">Location not specified</span>}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {saveMsg && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{saveMsg}</AlertDescription>
              </Alert>
            )}
            {saveErr && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{saveErr}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-background/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Current Password
                  </label>
                  <Input
                    type="password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    New Password
                  </label>
                  <Input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" variant="outline">
                Change Password
              </Button>
            </form>

            {pwMsg && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{pwMsg}</AlertDescription>
              </Alert>
            )}
            {pwErr && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{pwErr}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Activity Card */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-background/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivity.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="shadow-lg border-red-200 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            
            {!deleteConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            ) : (
              <div className="space-y-4 p-4 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/30">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  Are you absolutely sure?
                </div>
                <p className="text-sm text-red-600 dark:text-red-400">
                  This action cannot be undone. This will permanently delete your account and remove all associated data.
                </p>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleDelete}>
                    Yes, Delete My Account
                  </Button>
                  <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {deleteMsg && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{deleteMsg}</AlertDescription>
              </Alert>
            )}
            {deleteErr && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{deleteErr}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
