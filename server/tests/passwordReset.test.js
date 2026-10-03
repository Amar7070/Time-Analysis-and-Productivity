import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import crypto from "crypto";

describe("Password Reset API", () => {
  const testUser = {
    firstName: "Reset",
    email: "resetovbklu@example.com",
    password: "Password123!",
  };

  it("should accept forgot-password request", async () => {
    await request(app).post("/api/auth/signup").send(testUser);
    
    // We expect the email sending to either be mocked or fail silently if not configured,
    // but the API should return success if the user exists.
    const res = await request(app).post("/api/auth/forgot-password").send({
      email: testUser.email,
    });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    const user = await User.findOne({ email: testUser.email }).select("+resetPasswordOtp +resetPasswordOtpExpires");
    expect(user.resetPasswordOtp).toBeDefined();
    expect(user.resetPasswordOtpExpires).toBeDefined();
  });

  it("should reject invalid token/OTP", async () => {
    const res = await request(app).post("/api/auth/verify-otp").send({
      email: testUser.email,
      otp: "000000",
    });
    // User doesn't exist or OTP is wrong
    expect(res.status).toBe(400);
  });

  it("should successfully reset password and prevent token reuse", async () => {
    // 1. Create user
    await request(app).post("/api/auth/signup").send(testUser);
    
    // 2. Generate OTP manually in DB (since we can't read the email)
    const user = await User.findOne({ email: testUser.email });
    const otp = "123456";
    const bcrypt = await import("bcrypt");
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordOtp = await bcrypt.hash(otp, salt);
    user.resetPasswordOtpExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // 3. Verify OTP
    const verifyRes = await request(app).post("/api/auth/verify-otp").send({
      email: testUser.email,
      otp,
    });
    expect(verifyRes.status).toBe(200);
    
    // 4. Reset Password
    const resetRes = await request(app).post("/api/auth/reset-password").send({
      email: testUser.email,
      otp,
      newPassword: "NewPassword123!",
    });
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // 5. Try reusing token (should fail)
    const reuseRes = await request(app).post("/api/auth/reset-password").send({
      email: testUser.email,
      otp,
      newPassword: "AnotherPassword123!",
    });
    expect(reuseRes.status).toBe(400);

    // 6. Verify new password works
    const loginRes = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "NewPassword123!",
    });
    expect(loginRes.status).toBe(200);
  });

  it("should reject expired token", async () => {
    await request(app).post("/api/auth/signup").send(testUser);
    const user = await User.findOne({ email: testUser.email });
    const otp = "654321";
    const bcrypt = await import("bcrypt");
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordOtp = await bcrypt.hash(otp, salt);
    user.resetPasswordOtpExpires = Date.now() - 1000; // Expired
    await user.save();

    const res = await request(app).post("/api/auth/reset-password").send({
      email: testUser.email,
      otp,
      newPassword: "NewPassword123!",
    });
    
    expect(res.status).toBe(400);
  });
});
