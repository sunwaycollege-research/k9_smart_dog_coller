import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";

/**
 * Checks if the JWT token is valid
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next function
 * @returns {void}
 *
 */

export async function isValidJWT(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Internal server error" });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

/**
 * General API limiter — 100 requests per 15 minutes per IP
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next function
 * @returns {void}
 *
 */

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again after 15 minutes" },
});

/** Auth limiter — stricter: 10 requests per 15 minutes per IP
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next function
 * @returns {void}
 *
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many auth attempts, please try again after 15 minutes",
  },
});
