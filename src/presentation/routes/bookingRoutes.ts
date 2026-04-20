import { Router } from "express";
import {
  addCar,
  approveBooking,
  createBooking,
  createGuestBooking,
  declineBooking,
  deleteBooking,
  getAdminStats,
  getAllBookings,
  getAllCars,
  updateBookingDates,
} from "../controllers/bookingController";
import { adminOnly, protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/cars", getAllCars);
router.post("/cars", protect, adminOnly, addCar);

router.post("/guest", createGuestBooking);
router.post("/", protect, createBooking);

router.get("/", protect, adminOnly, getAllBookings);
router.put("/:bookingId/approve", protect, adminOnly, approveBooking);
router.put("/:bookingId/decline", protect, adminOnly, declineBooking);
router.put("/:bookingId", protect, adminOnly, updateBookingDates);
router.delete("/:bookingId", protect, adminOnly, deleteBooking);
router.get("/admin/stats", protect, adminOnly, getAdminStats);

export default router;
