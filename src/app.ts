import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./presentation/routes/authRoutes";
import bookingRoutes from "./presentation/routes/bookingRoutes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "Car Rental Backend API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

export default app;
