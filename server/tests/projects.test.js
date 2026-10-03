import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Projects API", () => {
  const testUser = {
    firstName: "Project",
    lastName: "User",
    email: "projectpbp8b3@example.com",
    password: "Password123!",
  };
  
  let token;
  let projectId;

  beforeAll(async () => {
    // Signup and get token
    const res = await request(app).post("/api/auth/signup").send(testUser);
    token = res.body.data.token;
  });

  it("should prevent unauthorized project access", async () => {
    const res = await request(app).get("/api/projects/get-all-user-project");
    expect(res.status).toBe(401);
  });

  it("should create a project", async () => {
    const res = await request(app)
      .post("/api/projects/add-project")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Project",
        description: "A test project",
        priority: "high",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        tags: ["test","vitest"],
      });
      
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.project).toBeDefined();
    projectId = res.body.project._id;
  });

  it("should retrieve projects", async () => {
    const res = await request(app)
      .get("/api/projects/get-all-user-project")
      .set("Authorization", `Bearer ${token}`);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.projects.length).toBeGreaterThan(0);
    expect(res.body.projects[0]._id).toBe(projectId);
  });
});
