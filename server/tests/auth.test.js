import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

describe("Authentication API", () => {
  let testUser;

  beforeEach(() => {
    testUser = {
      firstName: "Test",
      lastName: "User",
      email: `test${Date.now()}${Math.random()}@example.com`,
      password: "Password123!",
    };
  });

  it("should successfully signup a new user", async () => {
    const res = await request(app).post("/api/auth/signup").send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    
    const userInDb = await User.findOne({ email: testUser.email });
    expect(userInDb).not.toBeNull();
  });

  it("should prevent duplicate signup", async () => {
    await request(app).post("/api/auth/signup").send(testUser);
    const res = await request(app).post("/api/auth/signup").send(testUser);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should successfully login", async () => {
    await request(app).post("/api/auth/signup").send(testUser);

    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it("should reject incorrect password", async () => {
    await request(app).post("/api/auth/signup").send(testUser);

    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "WrongPassword!",
    });
    expect(res.status).toBe(400); // Usually 400 or 401
    expect(res.body.success).toBe(false);
  });

  it("should reject invalid JWT", async () => {
    const res = await request(app)
      .get("/api/navbar/add-details")
      .set("Authorization", "Bearer invalid.jwt.token");
    expect(res.status).toBe(401);
  });

  it("should reject expired JWT", async () => {
    await request(app).post("/api/auth/signup").send(testUser);
    const user = await User.findOne({ email: testUser.email });
    
    const expiredToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1ms" }
    );
    
    await new Promise((resolve) => setTimeout(resolve, 10));

    const res = await request(app)
      .get("/api/navbar/add-details")
      .set("Authorization", `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });
});
