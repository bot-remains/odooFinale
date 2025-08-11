import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-quickcourt.jpg";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Dummy credentials for testing
  const dummyCredentials = [
    { email: "user@quickcourt.com", password: "user123", role: "user", redirectTo: "/venues" },
    { email: "owner@quickcourt.com", password: "owner123", role: "owner", redirectTo: "/owner/dashboard" },
    { email: "admin@quickcourt.com", password: "admin123", role: "admin", redirectTo: "/admin/dashboard" }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check dummy credentials
    const user = dummyCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (user) {
      toast({
        title: "Login successful! 🎉",
        description: `Welcome back! Redirecting to ${user.role} dashboard...`,
      });

      // Store user info in localStorage (for demo purposes)
      localStorage.setItem('user', JSON.stringify({
        email: user.email,
        role: user.role
      }));

      // Trigger a custom event to update header
      window.dispatchEvent(new Event('userLoggedIn'));

      setTimeout(() => {
        navigate(user.redirectTo);
      }, 1500);
    } else {
      toast({
        title: "Invalid credentials",
        description: "Please check your email and password and try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-white text-black">
      <SEO title="Login – QuickCourt" description="Log in to book courts, manage facilities, or administer QuickCourt." />
      
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 z-10" />
        <img 
          src={heroImage} 
          alt="QuickCourt" 
          className="w-full h-full object-cover"
        />

      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">QUICKCOURT</h1>
            <h2 className="text-xl font-semibold mb-8">LOGIN</h2>
          </div>

          {/* Demo Credentials Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Demo Credentials:</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <div><strong>User:</strong> user@quickcourt.com / user123</div>
              <div><strong>Owner:</strong> owner@quickcourt.com / owner123</div>
              <div><strong>Admin:</strong> admin@quickcourt.com / admin123</div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-gray-300 text-black placeholder-gray-500"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-gray-300 text-black placeholder-gray-500 pr-10"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-black text-white hover:bg-gray-800 font-medium py-2.5 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            {/* Signup Link */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:text-blue-800 underline">
                Sign up
              </Link>
            </p>

            {/* Forgot Password */}
            <p className="text-center text-sm">
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 underline">
                Forgot password?
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
