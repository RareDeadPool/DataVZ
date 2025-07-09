import React, { useState } from "react";

const faqs = [
  {
    question: "How do I upload a new dataset?",
    answer: "Go to the Projects page, click 'Upload', and follow the instructions to add your dataset.",
  },
  {
    question: "How can I invite team members?",
    answer: "Navigate to the Team section, click 'Invite', and enter their email addresses.",
  },
  {
    question: "How do I reset my password?",
    answer: "Go to Settings > Security and click 'Reset Password'. Follow the instructions sent to your email.",
  },
];

export default function HelpPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSubmitted(false);
    try {
      const res = await fetch("http://localhost:5000/api/support/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Help & Support</h1>
      <h2 className="text-lg font-semibold mb-2">Frequently Asked Questions</h2>
      <ul className="mb-8">
        {faqs.map((faq, idx) => (
          <li key={idx} className="mb-4">
            <div className="font-medium">Q: {faq.question}</div>
            <div className="text-gray-700">A: {faq.answer}</div>
          </li>
        ))}
      </ul>
      <h2 className="text-lg font-semibold mb-2">Contact Support</h2>
      {submitted && (
        <div className="text-green-600 mb-4">Thank you! Your message has been sent.</div>
      )}
      {error && (
        <div className="text-red-600 mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          className="w-full border rounded px-3 py-2"
          value={form.name}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          className="w-full border rounded px-3 py-2"
          value={form.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <textarea
          name="message"
          placeholder="How can we help you?"
          className="w-full border rounded px-3 py-2"
          value={form.message}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
