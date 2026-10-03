import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Time Tracking API", () => {
  let token;
  let taskId;
  let entryId;

  beforeAll(async () => {
    // Signup user
    const res = await request(app).post("/api/auth/signup").send({
      firstName: "Timer",
      email: "timerwxlff@example.com",
      password: "Password123!",
    });
    token = res.body.data.token;

    // Create a user task to track time against
    const taskRes = await request(app)
      .post("/api/user-tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        taskTitle: "Test Timer Task",
        category: "project_development",
        estimatedDurationInMinutes: 60,
      });
    taskId = taskRes.body.data.task.id;
  });

  it("should prevent starting timer for invalid task", async () => {
    const res = await request(app)
      .post("/api/time-entries")
      .set("Authorization", `Bearer ${token}`)
      .send({
        taskId: "507f1f77bcf86cd799439011", // Fake objectId
      });
    expect(res.status).toBe(404);
  });

  it("should start a time entry", async () => {
    const res = await request(app)
      .post("/api/time-entries")
      .set("Authorization", `Bearer ${token}`)
      .send({
        taskId,
        title: "Working on tests",
      });
      
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.timeEntry.entryStatus).toBe("active");
    entryId = res.body.data.timeEntry.id;
  });

  it("should prevent starting a second active timer", async () => {
    const res = await request(app)
      .post("/api/time-entries")
      .set("Authorization", `Bearer ${token}`)
      .send({
        taskId,
      });
      
    expect(res.status).toBe(400); // My race condition fix
    expect(res.body.error).toBe("Conflict");
  });

  it("should calculate duration correctly on stop", async () => {
    // Manually pass endTimestamp 30 minutes in the future for testing
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 mins

    const res = await request(app)
      .put(`/api/time-entries/${entryId}/stop`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        endTimestamp: endTime.toISOString(),
        focusScore: 4,
      });
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.timeEntry.entryStatus).toBe("completed");
    
    // Test the duration calculation logic
    expect(res.body.data.timeEntry.durationInMinutes).toBeGreaterThanOrEqual(29);
    expect(res.body.data.timeEntry.durationInMinutes).toBeLessThanOrEqual(31);
  });
});
