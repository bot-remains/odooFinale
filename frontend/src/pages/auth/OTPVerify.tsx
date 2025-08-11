import SEO from "@/components/SEO";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import heroImage from "@/assets/hero-quickcourt.jpg";

const OTPVerify = () => {
  return (
    <div className="min-h-screen flex bg-white text-black">
      <SEO title="Verify your email – QuickCourt" description="Complete your signup by verifying the OTP sent to your email." />
      
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 z-10" />
        <img 
          src={heroImage} 
          alt="QuickCourt" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-8 left-8 z-20">
          <div className="text-green-600 font-medium text-lg">IMAGE</div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">QUICKCOURT</h1>
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-5 h-5 text-orange-500 mr-2" />
              <h2 className="text-xl font-semibold">VERIFY YOUR EMAIL</h2>
            </div>
          </div>

          <form className="space-y-6">
            {/* Description */}
            <div className="text-center space-y-4">
              <p className="text-green-600 text-sm">
                We've sent a code to your email: user@example.com
              </p>
              
              {/* OTP Input */}
              <div className="flex justify-center">
                <InputOTP maxLength={6} aria-label="One-time password input">
                  <InputOTPGroup>
                    <InputOTPSlot 
                      index={0} 
                      className="w-12 h-12 border-gray-300 bg-transparent text-black text-lg"
                    />
                    <InputOTPSlot 
                      index={1} 
                      className="w-12 h-12 border-gray-300 bg-transparent text-black text-lg"
                    />
                    <InputOTPSlot 
                      index={2} 
                      className="w-12 h-12 border-gray-300 bg-transparent text-black text-lg"
                    />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot 
                      index={3} 
                      className="w-12 h-12 border-gray-300 bg-transparent text-black text-lg"
                    />
                    <InputOTPSlot 
                      index={4} 
                      className="w-12 h-12 border-gray-300 bg-transparent text-black text-lg"
                    />
                    <InputOTPSlot 
                      index={5} 
                      className="w-12 h-12 border-gray-300 bg-transparent text-black text-lg"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {/* Verify Button */}
            <Button 
              type="submit" 
              className="w-full bg-black text-white hover:bg-gray-800 font-medium py-2.5 mt-8"
              asChild
            >
              <Link to="/">Verify & Continue</Link>
            </Button>

            {/* Resend Links */}
            <div className="text-center space-y-2 text-sm">
              <p className="text-gray-600">
                Didn't receive the code?{" "}
                <Link to="#" className="text-blue-600 hover:text-blue-800 underline">
                  Resend OTP
                </Link>
              </p>
              <p className="text-gray-600">
                Wrong email?{" "}
                <Link to="#" className="text-blue-600 hover:text-blue-800 underline">
                  Edit Email
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPVerify;
