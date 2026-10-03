import User from "../modal/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

// 1. Generate OTP and send via EmailJS from Backend
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // To prevent user enumeration, always return a success message
    // even if the user doesn't exist, and don't send an email in that case.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, an OTP has been sent.",
      });
    }

    // Generate 6 digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordOtp = await bcrypt.hash(otp, salt);

    // Set expiration (e.g., 5 minutes)
    user.resetPasswordOtpExpires = Date.now() + 5 * 60 * 1000;

    await user.save();

    // Dispatch Email via EmailJS REST API from the Backend
    if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID) {
      const emailPayload = {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY, // Optional, but recommended
        template_params: {
          to_email: user.email,
          to_name: user.firstName,
          otp: otp,
          message: `Your OTP for password reset is: ${otp}`,
        },
      };

      try {
        const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailPayload),
        });
        
        if (!emailResponse.ok) {
           console.error("EmailJS backend error:", await emailResponse.text());
        }
      } catch (err) {
        console.error("Failed to call EmailJS:", err);
      }
    } else {
      console.warn("EmailJS credentials missing from backend. Email not sent.");
    }

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, an OTP has been sent.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Select the sensitive fields
    const user = await User.findOne({ email }).select(
      "+resetPasswordOtp +resetPasswordOtpExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res
        .status(400)
        .json({ message: "Invalid request or OTP expired" });
    }

    if (Date.now() > user.resetPasswordOtpExpires) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpires = undefined;
      await user.save();
      return res.status(400).json({ message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOtp);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.status(200).json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 3. Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email }).select(
      "+resetPasswordOtp +resetPasswordOtpExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res
        .status(400)
        .json({ message: "Invalid request or OTP expired" });
    }

    // Double check OTP validity to be safe (stateless check)
    if (Date.now() > user.resetPasswordOtpExpires) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOtp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
