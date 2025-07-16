import React, { useState } from "react";
import { 
  HelpCircle, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  BookOpen,
  ChevronDown,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const faqs = [
  {
    question: "How do I upload a new dataset?",
    answer: "Go to the Projects page, click 'Upload', and follow the instructions to add your dataset.",
  },
  {
    question: "How do I invite collaborators?",
    answer: "You can share your project with others by exporting or sharing your data and charts.",
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
  const [openFaqs, setOpenFaqs] = useState({});

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

  const toggleFaq = (index) => {
    setOpenFaqs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-slate-100 dark:from-primary/10 dark:via-background dark:to-slate-900">
      <div className="max-w-4xl mx-auto py-8 px-2 sm:px-4 space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-slate-600 dark:from-primary dark:to-slate-400 bg-clip-text text-transparent">
            Help & Support
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>

        {/* FAQ Section */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-background/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq, idx) => (
              <Collapsible key={idx} open={openFaqs[idx]} onOpenChange={() => toggleFaq(idx)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 sm:p-4 h-auto text-left hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <span className="font-medium">{faq.question}</span>
                    {openFaqs[idx] ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <div className="pt-2 text-muted-foreground border-t border-slate-200 dark:border-slate-700">
                    {faq.answer}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>

        {/* Contact Support Section */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-background/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success/Error Messages */}
            {submitted && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Name</label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  name="message"
                  placeholder="Describe your issue or question in detail..."
                  value={form.message}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full sm:w-auto flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>

            {/* Support Info */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium">Response Time</h4>
                  <p className="text-muted-foreground">
                    We typically respond within 24 hours during business days.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Priority Support</h4>
                  <p className="text-muted-foreground">
                    For urgent issues, please include "URGENT" in your message subject.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-background/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Additional Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                <h4 className="font-medium mb-2">Documentation</h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive guides and tutorials
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                <h4 className="font-medium mb-2">Video Tutorials</h4>
                <p className="text-sm text-muted-foreground">
                  Step-by-step video walkthroughs
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                <h4 className="font-medium mb-2">Community Forum</h4>
                <p className="text-sm text-muted-foreground">
                  Connect with other users
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
