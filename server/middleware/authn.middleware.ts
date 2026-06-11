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
 * Creates a JWT token for the user
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next function
 * @returns {void}
 */

export function createToken(req: Request, res: Response, next: NextFunction) {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Internal server error" });
  }

  const { username, email } = req.body;

  const token = jwt.sign(
    {
      username,
      email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  res.json({ token });
}
