import type { Request, Response } from "express";
import Collar from "../models/collar.model.js";

/**
 * Register a new collar into the system
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */

export const createCollar = async (req: Request, res: Response) => {
  try {
    const { modelNo } = req.body;

    if (!modelNo) {
      return res.status(400).json({ message: "Collar model number is required" });
    }

    const existing = await Collar.findOne({ modelNo });
    if (existing) {
      return res.status(400).json({ message: "Collar with this model number already exists" });
    }

    const collar = await Collar.create({ modelNo });

    res.status(201).json({
      message: "Collar registered successfully",
      collar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
