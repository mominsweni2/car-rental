import { Request, Response } from "express";
import mongoose from "mongoose";
import { CarModel } from "../../infrastructure/models/CarModel";
import { BookingModel } from "../../infrastructure/models/BookingModel";
import { AuthRequest } from "../middleware/authMiddleware";
import { logger } from "../../infrastructure/logger/logger";
import { UserModel } from "../../infrastructure/models/UserModel";

const calculateDays = (startDate: Date, endDate: Date): number => {
  const timeDifference = endDate.getTime() - startDate.getTime();
  const days = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  return days;
};

export const createBooking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { carId, startDate, endDate } = req.body;

    if (!carId || !startDate || !endDate) {
      res
        .status(400)
        .json({ message: "carId, startDate and endDate are required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      res.status(400).json({ message: "Invalid car ID" });
      return;
    }

    const car = await CarModel.findById(carId);

    if (!car || !car.available) {
      res.status(404).json({ message: "Car not found or unavailable" });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      res.status(400).json({ message: "End date must be after start date" });
      return;
    }

    const conflictingBooking = await BookingModel.findOne({
      carId,
      status: { $in: ["pending", "approved"] },
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (conflictingBooking) {
      res
        .status(400)
        .json({ message: "Car is already booked for the selected dates" });
      return;
    }

    const totalDays = calculateDays(start, end);
    const totalPrice = totalDays * car.pricePerDay;

    const booking = await BookingModel.create({
      userId: req.user?.id,
      carId,
      startDate: start,
      endDate: end,
      totalPrice,
      status: "pending",
    });

    logger.info(`Registered user booking created for user ${req.user?.id}`);

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    logger.error("Failed to create registered user booking");
    res.status(500).json({ message: "Server error while creating booking" });
  }
};

export const createGuestBooking = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { guestName, guestEmail, carId, startDate, endDate } = req.body;

    if (!guestName || !guestEmail || !carId || !startDate || !endDate) {
      res.status(400).json({
        message:
          "guestName, guestEmail, carId, startDate and endDate are required",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      res.status(400).json({ message: "Invalid car ID" });
      return;
    }

    const car = await CarModel.findById(carId);

    if (!car || !car.available) {
      res.status(404).json({ message: "Car not found or unavailable" });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      res.status(400).json({ message: "End date must be after start date" });
      return;
    }

    const conflictingBooking = await BookingModel.findOne({
      carId,
      status: { $in: ["pending", "approved"] },
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (conflictingBooking) {
      res
        .status(400)
        .json({ message: "Car is already booked for the selected dates" });
      return;
    }

    const totalDays = calculateDays(start, end);
    const totalPrice = totalDays * car.pricePerDay;

    const booking = await BookingModel.create({
      guestName,
      guestEmail,
      carId,
      startDate: start,
      endDate: end,
      totalPrice,
      status: "pending",
    });

    logger.info(`Guest booking created for ${guestEmail}`);

    res.status(201).json({
      message: "Guest booking created successfully",
      booking,
    });
  } catch (error) {
    logger.error("Failed to create guest booking");
    res
      .status(500)
      .json({ message: "Server error while creating guest booking" });
  }
};

export const getAllCars = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cars = await CarModel.find();
    res.status(200).json(cars);
  } catch (error) {
    logger.error("Failed to fetch cars");
    res.status(500).json({ message: "Server error while fetching cars" });
  }
};

export const addCar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, model, type, pricePerDay, seats, available } = req.body;

    if (!name || !model || !type || !pricePerDay || !seats) {
      res.status(400).json({
        message: "name, model, type, pricePerDay and seats are required",
      });
      return;
    }

    const car = await CarModel.create({
      name,
      model,
      type,
      pricePerDay,
      seats,
      available: available ?? true,
    });

    res.status(201).json({
      message: "Car added successfully",
      car,
    });
  } catch (error) {
    logger.error("Failed to add car");
    res.status(500).json({ message: "Server error while adding car" });
  }
};

export const getAllBookings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const bookings = await BookingModel.find()
      .populate("userId", "name email role")
      .populate("carId", "name model type pricePerDay");

    res.status(200).json(bookings);
  } catch (error) {
    logger.error("Failed to fetch all bookings");
    res.status(500).json({ message: "Server error while fetching bookings" });
  }
};

export const approveBooking = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: "Invalid booking ID" });
      return;
    }

    const booking = await BookingModel.findById(bookingId);

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    booking.status = "approved";
    await booking.save();

    logger.info(`Booking approved: ${bookingId}`);

    res.status(200).json({
      message: "Booking approved successfully",
      booking,
    });
  } catch (error) {
    logger.error("Failed to approve booking");
    res.status(500).json({ message: "Server error while approving booking" });
  }
};

export const declineBooking = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: "Invalid booking ID" });
      return;
    }

    const booking = await BookingModel.findById(bookingId);

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    booking.status = "declined";
    await booking.save();

    logger.info(`Booking declined: ${bookingId}`);

    res.status(200).json({
      message: "Booking declined successfully",
      booking,
    });
  } catch (error) {
    logger.error("Failed to decline booking");
    res.status(500).json({ message: "Server error while declining booking" });
  }
};

export const getAdminStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const totalBookings = await BookingModel.countDocuments();
    const pendingBookings = await BookingModel.countDocuments({
      status: "pending",
    });
    const approvedBookings = await BookingModel.countDocuments({
      status: "approved",
    });
    const declinedBookings = await BookingModel.countDocuments({
      status: "declined",
    });

    const approvedBookingList = await BookingModel.find({ status: "approved" });
    const totalRevenue = approvedBookingList.reduce(
      (sum, booking) => sum + booking.totalPrice,
      0,
    );

    res.status(200).json({
      totalUsers,
      totalBookings,
      pendingBookings,
      approvedBookings,
      declinedBookings,
      totalRevenue,
    });
  } catch (error) {
    logger.error("Failed to fetch admin statistics");
    res.status(500).json({ message: "Server error while fetching statistics" });
  }
};
