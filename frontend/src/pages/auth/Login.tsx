import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-quickcourt.jpg";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

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

          <form className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                className="w-full bg-transparent border-gray-300 text-black placeholder-gray-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-transparent border-gray-300 text-black placeholder-gray-500 pr-10"
                  placeholder="Enter your password"
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
              className="w-full bg-black text-white hover:bg-gray-800 font-medium py-2.5 mt-8"
            >
              Login
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
