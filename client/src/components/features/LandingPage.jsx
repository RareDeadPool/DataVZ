import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ThemeToggle } from '../common/mode-toggle';
import { 
  BarChart3, 
  Database, 
  Zap, 
  Shield, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  BrainCircuit,
  GitBranch,
  MessageSquare,
  Layers,
  Clock,
  FileText,
  Share2,
  Target,
  TrendingUp,
  Bot
} from 'lucide-react';
import datavizLogo from '/dataviz-logo.png'

const features = [
  {
    icon: BrainCircuit,
    title: "Vizard AI Assistant",
    description: "Ask questions in natural language and get instant insights, charts, and analysis from your data",
    highlight: true,
  },
  {
    icon: Users,
    title: "Project Workspace",
    description: "Collaborate in real-time with your team on shared projects and dashboards",
    highlight: true,
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Create stunning visualizations with our powerful analytics engine and interactive charts",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security with end-to-end encryption, compliance, and advanced permissions",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Process large datasets in seconds with our optimized engine and smart caching",
  },
  {
    icon: Database,
    title: "Multiple Data Sources",
    description: "Connect to Excel, CSV, databases, APIs, and cloud services effortlessly",
  },
]

const vizardFeatures = [
  {
    icon: MessageSquare,
    title: "Natural Language Queries",
    description: "Ask questions like 'Show me sales trends for Q4' and get instant visual answers"
  },
  {
    icon: Target,
    title: "Smart Pattern Detection",
    description: "AI automatically identifies trends, outliers, and meaningful patterns in your data"
  },
  {
    icon: TrendingUp,
    title: "Predictive Insights",
    description: "Get forecasts and predictions based on historical data and machine learning"
  },
  {
    icon: Bot,
    title: "Chart Generation",
    description: "Instantly create the perfect chart type for your data with AI recommendations"
  }
]

const workspaceFeatures = [
  {
    icon: GitBranch,
    title: "Version Control",
    description: "Track changes, manage versions, and never lose important project iterations"
  },
  {
    icon: Share2,
    title: "Real-time Collaboration",
    description: "Multiple team members can edit, comment, and work together simultaneously"
  },
  {
    icon: Layers,
    title: "Project Organization",
    description: "Organize charts, datasets, and reports in structured, shareable project spaces"
  },
  {
    icon: Clock,
    title: "Activity Timeline",
    description: "See who changed what and when with detailed project activity history"
  }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Data Analyst at TechCorp",
    content: "Vizard AI has completely transformed how we analyze data. What used to take hours now takes minutes!",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "Business Intelligence Manager",
    content: "The collaboration features in Project Workspace have made our team 3x more productive. Game changer!",
    rating: 5,
  },
  {
    name: "Emily Davis",
    role: "Marketing Director",
    content: "Beautiful visualizations that actually help us make better decisions. The AI insights are incredible!",
    rating: 5,
  },
]

export default function LandingPage({ onGetStarted, onSignIn }) {
  return (
    <div className="min-h-screen bg-background theme-transition">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50 theme-transition">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src={datavizLogo} alt="DataViz Logo" className="w-8 h-8 rounded-lg object-contain" />
              <span className="text-xl font-bold text-foreground">DataViz</span>
            </div>
            <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#vizard" className="text-muted-foreground hover:text-foreground transition-colors">
                AI Assistant
              </a>
              <a href="#workspace" className="text-muted-foreground hover:text-foreground transition-colors">
                Workspace
              </a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                Reviews
              </a>
              <ThemeToggle />
              <Button variant="outline" onClick={onSignIn} className="hover-lift">Sign In</Button>
              <Button onClick={onGetStarted} className="btn-primary hover-lift">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-2 sm:px-4 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Data Visualization Platform
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
            Transform Your Data Into
            <span className="text-primary"> Intelligent Insights</span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-balance animate-fade-in" style={{animationDelay: '100ms'}}>
            Meet Vizard, your AI assistant that turns complex data into beautiful visualizations. 
            Collaborate seamlessly with your team in powerful project workspaces designed for modern data professionals.
          </p>
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center animate-fade-in" style={{animationDelay: '200ms'}}>
            <Button size="lg" className="btn-primary gap-2 h-12 px-8 font-semibold hover-lift" onClick={onGetStarted}>
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 font-semibold hover:bg-accent hover:text-accent-foreground transition-all duration-200">
              Watch Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required 2 14-day free trial 2 Cancel anytime
          </p>
        </div>
      </section>

      {/* Vizard AI Section */}
      <section id="vizard" className="py-12 sm:py-20 px-2 sm:px-4 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <Badge variant="secondary" className="mb-4 font-medium">
              <BrainCircuit className="w-4 h-4 mr-2" />
              Meet Vizard
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your AI Data Assistant
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Ask questions in plain English and get instant answers, charts, and insights from your data.
            </p>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {vizardFeatures.map((feature, idx) => (
              <Card key={idx} className="flex flex-col items-center text-center p-4 sm:p-6 bg-white/80 dark:bg-background/80 backdrop-blur-sm">
                <div className="mb-4 p-3 rounded-full bg-primary/10 dark:bg-primary/20">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg font-semibold mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">{feature.description}</CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-2 sm:px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <Badge variant="secondary" className="mb-4 font-medium">
              <BarChart3 className="w-4 h-4 mr-2" />
              Platform Features
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need for data-driven success
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our suite of tools for analytics, collaboration, and security.
            </p>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="flex flex-col items-center text-center p-4 sm:p-6 bg-white/80 dark:bg-background/80 backdrop-blur-sm">
                <div className="mb-4 p-3 rounded-full bg-primary/10 dark:bg-primary/20">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg font-semibold mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">{feature.description}</CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workspace Section */}
      <section id="workspace" className="py-12 sm:py-20 px-2 sm:px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <Badge variant="secondary" className="mb-4 font-medium">
              <Users className="w-4 h-4 mr-2" />
              Project Workspace
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Collaborate in Real Time
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Work together with your team on shared projects, dashboards, and reports.
            </p>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {workspaceFeatures.map((feature, idx) => (
              <Card key={idx} className="flex flex-col items-center text-center p-4 sm:p-6 bg-white/80 dark:bg-background/80 backdrop-blur-sm">
                <div className="mb-4 p-3 rounded-full bg-primary/10 dark:bg-primary/20">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg font-semibold mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">{feature.description}</CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 sm:py-20 px-2 sm:px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <Badge variant="secondary" className="mb-4 font-medium">
              <Star className="w-4 h-4 mr-2" />
              What Our Users Say
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Data Professionals
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              See how Vizard is helping teams unlock the power of their data.
            </p>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="flex flex-col items-center text-center p-4 sm:p-6 bg-white/80 dark:bg-background/80 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400" />
                  ))}
                </div>
                <CardTitle className="text-base sm:text-lg font-semibold mb-2">{testimonial.name}</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground mb-1">{testimonial.role}</CardDescription>
                <p className="text-sm sm:text-base text-muted-foreground mb-2">"{testimonial.content}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Data?</h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join thousands of professionals who trust DataViz and Vizard for their data visualization needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3 hover-lift" onClick={onGetStarted}>
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-primary-foreground/20 hover:bg-primary-foreground/10 text-primary-foreground bg-transparent"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">DataViz</span>
              </div>
              <p className="text-muted-foreground">The most powerful data visualization platform for modern businesses.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Vizard AI</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Workspace</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 DataViz Professional Suite. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}