import type { Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createToken } from "../middleware/authn.middleware.js";

/**
 * Register a new user
 * Requires: username, email, password
 */
export async function registerUser(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "username, email and password are required" });
    }

    const usernameTaken = await User.findOne({
      username: username.trim().toLowerCase(),
    });
    if (usernameTaken) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const emailTaken = await User.findOne({
      email: email.trim().toLowerCase(),
    });
    if (emailTaken) {
      return res
        .status(400)
        .json({ message: "An account with that email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        pets: user.pets,
        home: user.home,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Login — accepts username OR email in the `identifier` field
 * Body: { identifier: string, password: string }
 */
export async function LoginUser(req: Request, res: Response) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "identifier (username or email) and password are required",
      });
    }

    const normalized = identifier.trim().toLowerCase();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);

    const user = isEmail
      ? await User.findOne({ email: normalized })
      : await User.findOne({ username: normalized });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with that username or email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = createToken(user.username, user.email);
    return res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        pets: user.pets,
        home: user.home,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Set / update the authenticated user's home coordinates
 * Body: { coordinates: { latitude: number, longitude: number } }
 * Requires: isValidJWT middleware
 */
export async function updateHome(req: Request, res: Response) {
  try {
    const { coordinates } = req.body as {
      coordinates?: { latitude?: number; longitude?: number };
    };

    if (
      !coordinates ||
      typeof coordinates.latitude !== "number" ||
      typeof coordinates.longitude !== "number"
    ) {
      return res.status(400).json({
        message:
          "coordinates.latitude and coordinates.longitude (numbers) are required",
      });
    }

    const { email } = req.user as { username: string; email: string };

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { home: { coordinates } } },
      { new: true },
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "Home location updated",
      home: user.home,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Get the current authenticated user's profile with populated pets
 * Requires: isValidJWT middleware
 */
export async function getMe(req: Request, res: Response) {
  try {
    const { email } = req.user as { username: string; email: string };
    const user = await User.findOne({ email }).populate("pets");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        pets: user.pets,
        home: user.home,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

