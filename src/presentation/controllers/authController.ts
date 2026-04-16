import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../../infrastructure/models/UserModel";
import { logger } from "../../infrastructure/logger/logger";

const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};

export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res
        .status(400)
        .json({ message: "Name, email and password are required" });
      return;
    }

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user._id.toString(), user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Registration failed");
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id.toString(), user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Login failed");
    res.status(500).json({ message: "Server error during login" });
  }
};
