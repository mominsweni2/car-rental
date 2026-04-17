import { Router } from "express";
import {
  addCar,
  approveBooking,
  createBooking,
  createGuestBooking,
  declineBooking,
  getAdminStats,
  getAllBookings,
  getAllCars,
} from "../controllers/bookingController";
import { adminOnly, protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/cars", getAllCars);
router.post("/cars", addCar);

router.post("/guest", createGuestBooking);
router.post("/", protect, createBooking);

router.get("/", protect, adminOnly, getAllBookings);
router.put("/:bookingId/approve", protect, adminOnly, approveBooking);
router.put("/:bookingId/decline", protect, adminOnly, declineBooking);
router.get("/admin/stats", protect, adminOnly, getAdminStats);

export default router;
