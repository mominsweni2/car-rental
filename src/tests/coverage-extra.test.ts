import request from "supertest";
import { describe, it, expect, beforeAll } from "@jest/globals";
import app from "../app";

let userToken: string;
let adminToken: string;
let carId: string;
let bookingId: string;

describe("Coverage Extra API", () => {
  const userEmail = `extra${Date.now()}@example.com`;

  beforeAll(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Extra User",
      email: userEmail,
      password: "123456",
    });

    const userLogin = await request(app).post("/api/auth/login").send({
      email: userEmail,
      password: "123456",
    });

    userToken = userLogin.body.token;

    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "123456",
    });

    adminToken = adminLogin.body.token;

    const carRes = await request(app).post("/api/bookings/cars").send({
      name: "Toyota",
      model: "Yaris",
      type: "Sedan",
      pricePerDay: 70,
      seats: 5,
      available: true,
    });

    carId = carRes.body.car._id;

    const bookingRes = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        carId,
        startDate: "2026-06-01",
        endDate: "2026-06-03",
      });

    bookingId = bookingRes.body.booking._id;
  });

  it("should reject duplicate registration", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Extra User",
      email: userEmail,
      password: "123456",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });

  it("should reject invalid login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: userEmail,
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("should block booking without token", async () => {
    const res = await request(app).post("/api/bookings").send({
      carId,
      startDate: "2026-06-05",
      endDate: "2026-06-07",
    });

    expect(res.statusCode).toBe(401);
  });

  it("should reject conflicting booking dates", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        carId,
        startDate: "2026-06-01",
        endDate: "2026-06-03",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Car is already booked for the selected dates",
    );
  });

  it("should decline booking as admin", async () => {
    const newBooking = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        carId,
        startDate: "2026-06-10",
        endDate: "2026-06-12",
      });

    const newBookingId = newBooking.body.booking._id;

    const res = await request(app)
      .put(`/api/bookings/${newBookingId}/decline`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.booking.status).toBe("declined");
  });

  it("should update booking as admin", async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        startDate: "2026-06-04",
        endDate: "2026-06-06",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Booking updated successfully");
  });

  it("should block normal user from admin bookings route", async () => {
    const res = await request(app)
      .get("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Access denied. Admins only.");
  });

  it("should reject invalid car when creating booking", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        carId: "123",
        startDate: "2026-06-20",
        endDate: "2026-06-22",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid car ID");
  });

  it("should reject booking with missing dates", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        carId,
      });

    expect(res.statusCode).toBe(400);
  });

  it("should reject booking with endDate before startDate", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        carId,
        startDate: "2026-07-10",
        endDate: "2026-07-05",
      });

    expect(res.statusCode).toBe(400);
  });

  it("should reject approve with invalid booking id", async () => {
    const res = await request(app)
      .put("/api/bookings/123/approve")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
  });

  it("should reject delete with invalid id", async () => {
    const res = await request(app)
      .delete("/api/bookings/123")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
  });

  it("should return 404 when booking not found", async () => {
    const res = await request(app)
      .get("/api/bookings/65f123456789abcdef123456")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });

  it("should block non-admin from approving booking", async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}/approve`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  });

  it("should reject update with invalid dates", async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        startDate: "2026-08-10",
        endDate: "2026-08-05",
      });

    expect(res.statusCode).toBe(400);
  });

  it("should reject booking without carId", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        startDate: "2026-09-01",
        endDate: "2026-09-03",
      });

    expect(res.statusCode).toBe(400);
  });
  it("should not approve already approved booking", async () => {
    // First approve the booking
    await request(app)
      .put(`/api/bookings/${bookingId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);

    const res = await request(app)
      .put(`/api/bookings/${bookingId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
  });
});
it("should not decline already declined booking", async () => {
  await request(app)
    .put(`/api/bookings/${bookingId}/decline`)
    .set("Authorization", `Bearer ${adminToken}`);

  const res = await request(app)
    .put(`/api/bookings/${bookingId}/decline`)
    .set("Authorization", `Bearer ${adminToken}`);

  expect([400, 409]).toContain(res.statusCode);
});
it("should return 404 when updating non-existing booking", async () => {
  const res = await request(app)
    .put("/api/bookings/65f123456789abcdef123456")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      startDate: "2026-08-01",
      endDate: "2026-08-05",
    });

  expect(res.statusCode).toBe(404);
});
it("should allow approving booking again (no restriction)", async () => {
  const res = await request(app)
    .put(`/api/bookings/${bookingId}/approve`)
    .set("Authorization", `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
});
