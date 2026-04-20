import request from "supertest";
import { describe, it, expect, beforeAll } from "@jest/globals";
import app from "../app";

let userToken: string;
let adminToken: string;
let carId: string;
let bookingId: string;
let declinedBookingId: string;

describe("Booking API", () => {
  const userEmail = `user${Date.now()}@example.com`;

  beforeAll(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Test User",
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
  });

  it("should add a car", async () => {
    const res = await request(app)
      .post("/api/bookings/cars")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Honda",
        model: "Civic",
        type: "Sedan",
        pricePerDay: 90,
        seats: 5,
        available: true,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.car).toBeDefined();
    carId = res.body.car._id;
  }, 15000);

  it("should reject add car with missing fields", async () => {
    const res = await request(app)
      .post("/api/bookings/cars")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Toyota",
        model: "Corolla",
      });

    expect(res.statusCode).toBe(400);
  }, 15000);

  it("should reject add car with invalid price or seats", async () => {
    const res = await request(app)
      .post("/api/bookings/cars")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Bad Car",
        model: "Bad Model",
        type: "Sedan",
        pricePerDay: 0,
        seats: 0,
        available: true,
      });

    expect(res.statusCode).toBe(400);
  }, 15000);

  it("should block add car without token", async () => {
    const res = await request(app).post("/api/bookings/cars").send({
      name: "No Auth Car",
      model: "Blocked",
      type: "Sedan",
      pricePerDay: 50,
      seats: 4,
      available: true,
    });

    expect(res.statusCode).toBe(401);
  }, 15000);

  it("should block normal user from adding a car", async () => {
    const res = await request(app)
      .post("/api/bookings/cars")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "User Car",
        model: "Blocked",
        type: "Sedan",
        pricePerDay: 50,
        seats: 4,
        available: true,
      });

    expect(res.statusCode).toBe(403);
  }, 15000);

  it("should create booking", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        carId,
        startDate: "2026-05-01",
        endDate: "2026-05-03",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.booking).toBeDefined();
    bookingId = res.body.booking._id;
  }, 15000);

  it("should reject booking without token", async () => {
    const res = await request(app).post("/api/bookings").send({
      carId,
      startDate: "2026-05-04",
      endDate: "2026-05-06",
    });

    expect(res.statusCode).toBe(401);
  }, 15000);

  it("should reject booking with missing fields", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        carId,
      });

    expect(res.statusCode).toBe(400);
  }, 15000);

  it("should reject booking with invalid car id", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        carId: "123",
        startDate: "2026-05-04",
        endDate: "2026-05-06",
      });

    expect(res.statusCode).toBe(400);
  }, 15000);

  it("should reject booking when endDate is before startDate", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        carId,
        startDate: "2026-05-10",
        endDate: "2026-05-05",
      });

    expect(res.statusCode).toBe(400);
  }, 15000);

  it("should reject conflicting booking dates", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        carId,
        startDate: "2026-05-01",
        endDate: "2026-05-03",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Car is already booked for the selected dates",
    );
  }, 15000);

  it("should get all bookings as admin", async () => {
    const res = await request(app)
      .get("/api/bookings")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  }, 15000);

  it("should block normal user from admin bookings route", async () => {
    const res = await request(app)
      .get("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  }, 15000);

  it("should approve booking as admin", async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.booking.status).toBe("approved");
  }, 15000);

  it("should reject approve with invalid booking id", async () => {
    const res = await request(app)
      .put("/api/bookings/123/approve")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
  }, 15000);

  it("should reject approving already approved booking", async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
  }, 15000);

  it("should create another booking to decline", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        carId,
        startDate: "2026-05-10",
        endDate: "2026-05-12",
      });

    expect(res.statusCode).toBe(201);
    declinedBookingId = res.body.booking._id;
  }, 15000);

  it("should decline booking as admin", async () => {
    const res = await request(app)
      .put(`/api/bookings/${declinedBookingId}/decline`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.booking.status).toBe("declined");
  }, 15000);

  it("should reject declining already declined booking", async () => {
    const res = await request(app)
      .put(`/api/bookings/${declinedBookingId}/decline`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
  }, 15000);

  it("should update booking as admin", async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        startDate: "2026-05-04",
        endDate: "2026-05-06",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Booking updated successfully");
  }, 15000);

  it("should reject update with invalid booking id", async () => {
    const res = await request(app)
      .put("/api/bookings/123")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        startDate: "2026-05-07",
        endDate: "2026-05-08",
      });

    expect(res.statusCode).toBe(400);
  }, 15000);

  it("should reject update when endDate is before startDate", async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        startDate: "2026-05-10",
        endDate: "2026-05-08",
      });

    expect(res.statusCode).toBe(400);
  }, 15000);

  it("should get admin stats", async () => {
    const res = await request(app)
      .get("/api/bookings/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.totalBookings).toBeDefined();
  }, 15000);

  it("should delete booking as admin", async () => {
    const res = await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Booking deleted successfully");
  }, 15000);

  it("should reject delete with invalid booking id", async () => {
    const res = await request(app)
      .delete("/api/bookings/123")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
  }, 15000);

  it("should get all cars", async () => {
    const res = await request(app).get("/api/bookings/cars");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 15000);

  it("should create guest booking", async () => {
    const res = await request(app).post("/api/bookings/guest").send({
      guestName: "John Doe",
      guestEmail: "john@example.com",
      carId,
      startDate: "2026-05-20",
      endDate: "2026-05-22",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.booking).toBeDefined();
  }, 15000);

  it("should reject guest booking with missing fields", async () => {
    const res = await request(app).post("/api/bookings/guest").send({
      guestName: "Jane Doe",
      carId,
      startDate: "2026-05-25",
      endDate: "2026-05-27",
    });

    expect(res.statusCode).toBe(400);
  }, 15000);

  it("should reject guest booking with invalid email", async () => {
    const res = await request(app).post("/api/bookings/guest").send({
      guestName: "Jane Doe",
      guestEmail: "invalidemail",
      carId,
      startDate: "2026-05-25",
      endDate: "2026-05-27",
    });

    expect(res.statusCode).toBe(400);
  }, 15000);

  it("should reject guest booking with invalid car id", async () => {
    const res = await request(app).post("/api/bookings/guest").send({
      guestName: "Jane Doe",
      guestEmail: "jane@example.com",
      carId: "123",
      startDate: "2026-05-25",
      endDate: "2026-05-27",
    });

    expect(res.statusCode).toBe(400);
  }, 15000);

  it("should reject booking when car is unavailable", async () => {
    const carRes = await request(app)
      .post("/api/bookings/cars")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Unavailable Car",
        model: "Model X",
        type: "SUV",
        pricePerDay: 100,
        seats: 5,
        available: false,
      });

    const unavailableCarId = carRes.body.car._id;

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        carId: unavailableCarId,
        startDate: "2026-05-30",
        endDate: "2026-06-01",
      });

    expect(res.statusCode).toBe(404);
  }, 15000);

  it("should reject guest booking when car is unavailable", async () => {
    const carRes = await request(app)
      .post("/api/bookings/cars")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Unavailable Guest Car",
        model: "Model Y",
        type: "SUV",
        pricePerDay: 110,
        seats: 5,
        available: false,
      });

    const unavailableCarId = carRes.body.car._id;

    const res = await request(app).post("/api/bookings/guest").send({
      guestName: "Guest User",
      guestEmail: "guest@example.com",
      carId: unavailableCarId,
      startDate: "2026-06-05",
      endDate: "2026-06-07",
    });

    expect(res.statusCode).toBe(404);
  }, 15000);
});
