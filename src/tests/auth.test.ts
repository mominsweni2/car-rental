import request from "supertest";
import { describe, it, expect } from "@jest/globals";
import app from "../app";

describe("Auth API", () => {
  const testEmail = `test${Date.now()}@example.com`;
  const forcedAdminEmail = `admin-attempt${Date.now()}@example.com`;

  it("should register user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: testEmail,
      password: "123456",
    });

    expect(res.statusCode).toBe(201);
  }, 15000);

  it("should login user", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: testEmail,
      password: "123456",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  }, 15000);

  it("should ignore admin role from registration input", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Forced Admin",
      email: forcedAdminEmail,
      password: "123456",
      role: "admin",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe("user");
  }, 15000);
});
