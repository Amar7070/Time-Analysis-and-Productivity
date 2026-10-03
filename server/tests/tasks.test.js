import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("User Tasks API", () => {
  const testUser = {
    firstName: "Task",
    email: "task1ouon8@example.com",
    password: "Password123!",
  };
  
  let token;
  let taskId;

  beforeAll(async () => {
    const res = await request(app).post("/api/auth/signup").send(testUser);
    token = res.body.data.token;
  });

  it("should prevent unauthorized task creation", async () => {
    const res = await request(app).post("/api/user-tasks");
    expect(res.status).toBe(401);
  });

  it("should reject invalid task input", async () => {
    const res = await request(app)
      .post("/api/user-tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        // Missing title
        category: "work",
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should create a personal task", async () => {
    const res = await request(app)
      .post("/api/user-tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        taskTitle: "Test Task",
        taskDescription: "A test task",
        category: "project_development",
        priorityLevel: "high",
        estimatedDurationInMinutes: 60,
      });
      
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.task).toBeDefined();
    taskId = res.body.data.task.id;
  });

  it("should update a personal task", async () => {
    const res = await request(app)
      .put(`/api/user-tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        taskStatus: "in_progress",
      });
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.task.status).toBe("in_progress");
  });

  it("should prevent unauthorized update operation", async () => {
    // Create another user
    const otherUserRes = await request(app).post("/api/auth/signup").send({
      firstName: "Other",
      email: "otherle947@example.com",
      password: "Password123!",
    });
    const otherToken = otherUserRes.body.data.token;

    // Try to update first user's task
    const res = await request(app)
      .put(`/api/user-tasks/${taskId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        taskStatus: "completed",
      });
      
    expect(res.status).toBe(404); // Should be not found because it's scoped to userId
  });
});
