import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import emailService from '../services/emailService.js';
import tempUserStorage from '../services/tempUserStorage.js';

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

// Register user
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Check if user already exists in database
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store user data temporarily (not in database yet)
    const tempUserData = {
      name,
      email,
      password,
      role,
    };

    tempUserStorage.store(email, tempUserData, otpCode);

    // Send OTP email
    try {
      await emailService.sendOTPEmail(email, name, otpCode);
      console.log('✅ OTP Email sent successfully to:', email);
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError.message);
      // Continue with registration even if email fails
      console.log('📧 OTP Code (email failed):', otpCode);
    }

    res.status(200).json({
      success: true,
      message:
        'Registration initiated. Please check your email for OTP verification to complete registration.',
      data: {
        email: email,
        message: 'OTP sent to email. Verify to complete registration.',
      },
    });
  } catch (error) {
    console.error('Registration error:', error);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required',
      });
    }

    // Verify OTP from temporary storage
    let tempUserData;
    try {
      tempUserData = tempUserStorage.verifyOTP(email, otpCode);
    } catch (tempError) {
      return res.status(400).json({
        success: false,
        message: tempError.message,
      });
    }

    // Check if user was created in the meantime
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      // Clean up temporary data
      tempUserStorage.remove(email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user in database (already verified)
    const user = await User.create({
      name: tempUserData.name,
      email: tempUserData.email,
      password: tempUserData.password,
      role: tempUserData.role,
      isVerified: true, // Mark as verified since OTP was confirmed
    });

    // Remove temporary data
    tempUserStorage.remove(email);

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.name);
      console.log('✅ Welcome email sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Welcome email error:', emailError.message);
      // Continue even if welcome email fails
    }

    // Generate token for verified user
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: 'Email verified successfully! Registration completed.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);

    if (error.message === 'User already exists with this email') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if user already exists in database
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists and is registered. Please try logging in.',
      });
    }

    // Check if there's temporary user data
    const tempUser = tempUserStorage.get(email);
    if (!tempUser) {
      return res.status(404).json({
        success: false,
        message: 'Registration session not found. Please start registration again.',
      });
    }

    // Regenerate OTP
    const newOtpCode = tempUserStorage.regenerateOTP(email);

    // Send new OTP email
    try {
      await emailService.sendOTPEmail(email, tempUser.name, newOtpCode);
      console.log('✅ New OTP email sent to:', email);
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError.message);
      console.log('📧 New OTP Code (email failed):', newOtpCode);
      // Continue even if email fails, but inform user
    }

    res.json({
      success: true,
      message: 'New OTP sent to your email',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);

    if (error.message === 'Registration session not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email (including password for comparison)
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Compare password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const updatedUser = await user.update({ name, email });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser.toJSON(),
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByEmail(req.user.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await User.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedNewPassword = await User.hashPassword(newPassword);
    await user.update({ password: hashedNewPassword });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
