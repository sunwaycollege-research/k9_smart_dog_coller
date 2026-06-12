// This is Middlewares for Authentication

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function isValidPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  /**
   * Password must:
   * - Be at least 8 characters long
   * - Contain at least one uppercase letter
   * - Contain at least one lowercase letter
   * - Contain at least one digit
   * - Contain at least one special character
   */
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (@$!%*?&^#)",
    });
  }

  next();
}

/**
 * Creates and returns a signed JWT token.
 * Does NOT send any response — the caller owns the response.
 *
 * @param {string} username - The user's username
 * @param {string} email - The user's email
 * @returns {string} Signed JWT token
 */

export function createToken(username: string, email: string): string {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    { username, email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}
