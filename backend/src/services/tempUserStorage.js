// Temporary user storage for email verification

class TempUserStorage {
  constructor() {
    this.tempUsers = new Map();

    // Cleanup expired entries every 10 minutes
    setInterval(
      () => {
        this.cleanupExpired();
      },
      10 * 60 * 1000
    );
  }

  // Store temporary user data with OTP
  store(email, userData, otpCode) {
    const tempUser = {
      ...userData,
      otpCode,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      createdAt: new Date(),
    };

    this.tempUsers.set(email, tempUser);
    console.log(`📝 Temporary user data stored for: ${email}`);
    return tempUser;
  }

  // Get temporary user data
  get(email) {
    const tempUser = this.tempUsers.get(email);

    if (!tempUser) {
      return null;
    }

    // Check if expired
    if (new Date() > tempUser.otpExpiry) {
      this.tempUsers.delete(email);
      return null;
    }

    return tempUser;
  }

  // Verify OTP and get user data
  verifyOTP(email, otpCode) {
    const tempUser = this.get(email);

    if (!tempUser) {
      throw new Error('Registration session not found or expired');
    }

    if (tempUser.otpCode !== otpCode) {
      throw new Error('Invalid OTP code');
    }

    if (new Date() > tempUser.otpExpiry) {
      this.tempUsers.delete(email);
      throw new Error('OTP code has expired');
    }

    return tempUser;
  }

  // Remove temporary user data
  remove(email) {
    const removed = this.tempUsers.delete(email);
    if (removed) {
      console.log(`🗑️ Temporary user data removed for: ${email}`);
    }
    return removed;
  }

  // Regenerate OTP for existing temporary user
  regenerateOTP(email) {
    const tempUser = this.get(email);

    if (!tempUser) {
      throw new Error('Registration session not found');
    }

    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    tempUser.otpCode = newOtpCode;
    tempUser.otpExpiry = newOtpExpiry;

    this.tempUsers.set(email, tempUser);
    console.log(`🔄 OTP regenerated for: ${email}`);
    return newOtpCode;
  }

  // Cleanup expired entries
  cleanupExpired() {
    const now = new Date();
    let cleaned = 0;

    for (const [email, tempUser] of this.tempUsers.entries()) {
      if (now > tempUser.otpExpiry) {
        this.tempUsers.delete(email);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired temporary user registrations`);
    }
  }

  // Get current storage stats
  getStats() {
    return {
      totalTempUsers: this.tempUsers.size,
      emails: Array.from(this.tempUsers.keys()),
    };
  }
}

export default new TempUserStorage();
