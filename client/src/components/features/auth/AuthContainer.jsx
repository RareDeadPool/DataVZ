import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/common/mode-toggle';
import { 
  BarChart3, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Zap,
  Users,
  BrainCircuit,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" className="mr-3">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Handle Google OAuth token from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show success message and redirect
      setSuccess('Google sign-in successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccess('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isLogin) {
        setSuccess('Welcome back! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setSuccess('Account created successfully! Please check your email to verify your account.');
        setTimeout(() => {
          setIsLogin(true);
          setFormData({ email: '', password: '', name: '', confirmPassword: '' });
          setSuccess('');
        }, 2000);
      }
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect to Google OAuth endpoint
    const googleAuthUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
    window.location.href = googleAuthUrl;
  };

  const benefits = [
    {
      icon: BrainCircuit,
      title: 'AI-powered insights with Vizard',
      description: 'Natural language queries and smart analytics'
    },
    {
      icon: Users,
      title: 'Collaborative project workspaces',
      description: 'Real-time team collaboration and sharing'
    },
    {
      icon: Shield,
      title: 'Enterprise-grade security',
      description: 'Bank-level encryption and compliance'
    },
    {
      icon: Zap,
      title: 'Lightning-fast performance',
      description: 'Process large datasets in seconds'
    }
  ];

  return (
    <div className="min-h-screen bg-background theme-transition">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center hover-glow">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold gradient-text">DataViz Professional</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Left Side - Benefits */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-blue-500/10"></div>
          <div className="max-w-lg relative">
            <Badge variant="secondary" className="mb-8 hover-lift">
              <Sparkles className="w-4 h-4 mr-2" />
              Welcome to DataViz Professional
            </Badge>
            <h1 className="text-4xl font-extrabold text-foreground mb-6 leading-tight">
              Transform Your Data Into 
              <span className="gradient-text block">Intelligent Insights</span>
            </h1>
            <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
              Join thousands of professionals using our AI-powered platform to create stunning visualizations and collaborate seamlessly.
            </p>
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-background/50 rounded-xl backdrop-blur-sm hover-lift">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-sm text-primary font-medium">
                ✨ 14-day free trial • No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-foreground">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-muted-foreground mt-3 text-lg">
                {isLogin 
                  ? 'Sign in to access your DataViz workspace' 
                  : 'Start your journey with AI-powered data visualization'
                }
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-scale-in">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-200 text-sm font-medium">{success}</span>
              </div>
            )}

            {/* Error Message */}
            {errors.general && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-scale-in">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-800 dark:text-red-200 text-sm font-medium">{errors.general}</span>
              </div>
            )}

            <Card className="shadow-2xl border-0 card-elevated bg-background/80 backdrop-blur-sm">
              <CardHeader className="space-y-2 pb-8">
                <CardTitle className="text-2xl text-center font-bold">
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </CardTitle>
                <CardDescription className="text-center text-base">
                  {isLogin 
                    ? 'Enter your credentials to access your account' 
                    : 'Create your account to get started'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Google Sign-in Button - New Innovative Design */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 google-btn text-base font-semibold relative overflow-hidden"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <GoogleIcon />
                  Continue with Google
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-4 text-muted-foreground font-medium">Or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`pl-10 h-12 text-base ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : 'focus-ring'}`}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{errors.name}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`pl-10 h-12 text-base ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'focus-ring'}`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`pl-10 pr-12 h-12 text-base ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'focus-ring'}`}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 w-10 p-0 hover:bg-muted"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">{errors.password}</p>
                    )}
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`pl-10 h-12 text-base ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : 'focus-ring'}`}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{errors.confirmPassword}</p>
                      )}
                    </div>
                  )}

                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" className="rounded border-border w-4 h-4" />
                        <span className="text-muted-foreground">Remember me</span>
                      </label>
                      <a href="/request-password-reset" className="text-sm text-primary hover:underline font-medium">
                        Forgot password?
                      </a>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full btn-primary gap-2 h-12 font-bold text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        {isLogin ? 'Sign In to Dashboard' : 'Create Your Account'}
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center pt-4">
                  <p className="text-muted-foreground">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setFormData({ email: '', password: '', name: '', confirmPassword: '' });
                        setErrors({});
                        setSuccess('');
                      }}
                      className="text-primary hover:underline font-semibold"
                      disabled={isLoading}
                    >
                      {isLogin ? 'Sign up for free' : 'Sign in instead'}
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>

            {!isLogin && (
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-primary hover:underline font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
