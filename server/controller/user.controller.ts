import type { Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createToken } from "../middleware/authn.middleware.js";

/**
 * Register a new user
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */

export async function registerUser(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function LoginUser(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
