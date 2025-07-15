import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  User, 
  Shield, 
  Palette, 
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { updateProfile } from "@/services/api";
import api from "@/services/api";
import { useTheme } from "@/components/common/theme-provider";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch current user profile
    async function fetchProfile() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/auth/profile");
        setForm({ name: res.data.name || "", email: res.data.email || "", password: "" });
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      await updateProfile(payload);
      setSaved(true);
      setForm(f => ({ ...f, password: "" }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-muted rounded-lg">
            <Settings className="h-6 w-6 text-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and security</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full"
                    disabled={loading}
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-600">{error}</div>
                )}
                <div className="flex items-center justify-between pt-4">
                  <Button type="submit" className="flex items-center gap-2" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  {saved && !error && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Changes saved successfully
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Password Management
                  </Label>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Change Password</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        For your security, password changes require email verification
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/request-password-reset" className="flex items-center gap-2">
                        Update Password
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Theme Preference
                  </Label>
                  <ThemeSwitch />
                  <p className="text-xs text-muted-foreground mt-2">
                    Choose your preferred theme mode.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ThemeSwitch() {
  const { setTheme, theme } = useTheme();
  const isDark = theme === "dark";
  const handleChange = () => setTheme(isDark ? "light" : "dark");
  return (
    <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/30 w-fit">
      <span className="text-sm">Light</span>
      <Switch checked={isDark} onCheckedChange={handleChange} aria-label="Toggle theme" />
      <span className="text-sm">Dark</span>
    </div>
  );
}