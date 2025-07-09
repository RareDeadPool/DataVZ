import React, { useState } from "react";
import { useSelector } from "react-redux";

export default function SettingsPage() {
  const user = useSelector((state) => state.auth.user) || { name: "User", email: "user@email.com" };
  const [form, setForm] = useState({ name: user.name, email: user.email, password: "" });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            name="password"
            className="w-full border rounded px-3 py-2"
            value={form.password}
            onChange={handleChange}
            placeholder="Leave blank to keep unchanged"
          />
                    </div>
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          Save Changes
        </button>
        {saved && <div className="text-green-600 mt-2">Settings saved (mock only).</div>}
      </form>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Theme</h2>
        <div className="flex items-center gap-2">
          <span>Light</span>
          <input type="checkbox" disabled className="mx-2" />
          <span>Dark</span>
          <span className="text-xs text-gray-400 ml-2">(Theme toggle coming soon)</span>
                </div>
              </div>
    </div>
  );
}
