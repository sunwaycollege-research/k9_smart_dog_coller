import type { Request, Response } from "express";
import mongoose from "mongoose";
import Pet from "../models/pet.model.js";
import User from "../models/user.model.js";
import Collar from "../models/collar.model.js";
import PetAttributes from "../models/pet.attributes.model.js";

export async function registerPet(req: Request, res: Response) {
  try {
    const {
      name,
      breed,
      age,
      gender,
      color,
      weight,
      vaccinations,
      healthNotes,
      temperament,
      owner,
    } = req.body;

    // validation
    if (!name || !breed || !age || !gender || !color || !weight || !owner) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //find owner
    const user = await User.findById(owner);
    if (!user) {
      return res.status(404).json({
        message: "You are not an owner. ",
      });
    }

    const pet = await Pet.create({
      name,
      breed,
      age,
      gender,
      color,
      weight,
      vaccinations,
      healthNotes,
      temperament,
      owner,
    });

    // add pet to user
    user.pets.push(pet._id);
    await user.save();

    res.status(201).json({
      message: "Your pet has been added to our system.",
      pet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const assignCollar = async (req: Request, res: Response) => {
  try {
    const { collarModelNo, petId } = req.body;

    if (!collarModelNo || !petId) {
      return res
        .status(400)
        .json({ message: "Collar model number and pet ID are required" });
    }

    let collar = await Collar.findOne({ modelNo: collarModelNo });
    if (!collar) {
      collar = await Collar.create({
        modelNo: collarModelNo,
        status: "unassigned",
      });
    }

    if (collar.status === "assigned" && String(collar.petId) !== String(petId)) {
      return res.status(400).json({
        message: "Collar is already assigned to another pet",
      });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    pet.collarId = collar._id;
    pet.collarModelNo = collar.modelNo;
    collar.petId = pet._id;
    collar.status = "assigned";

    await pet.save();
    await collar.save();

    res.status(200).json({
      message: "Collar assigned to pet successfully",
      pet,
      collar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkCollar = async (req: Request, res: Response) => {
  try {
    const { collarModelNo } = req.body;

    if (!collarModelNo) {
      return res
        .status(400)
        .json({ message: "Collar model number is required" });
    }

    let collar = await Collar.findOne({ modelNo: collarModelNo });

    if (!collar) {
      collar = await Collar.create({
        modelNo: collarModelNo,
        status: "unassigned",
      });
    }

    res.status(200).json({
      message: "Collar found",
      collar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAttributes = async (req: Request, res: Response) => {
  try {
    const { collarModelNo, petId, attributes } = req.body;

    if (!collarModelNo || !petId || !attributes) {
      return res.status(400).json({
        message: "Collar model number, pet ID, and attributes are required",
      });
    }

    const collar = await Collar.findOne({ modelNo: collarModelNo });
    if (!collar) {
      return res.status(404).json({ message: "Collar not found" });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // Find the existing document to snapshot current live values as history
    const existing = await PetAttributes.findOne({
      petId: pet._id,
      collarId: collar._id,
    });

    const updateQuery: Record<string, object> = {
      $set: {
        coordinates: attributes.coordinates,
        heartRate: attributes.heartRate,
        temperature: attributes.temperature,
        batteryLevel: attributes.batteryLevel,
        status: attributes.status,
      },
    };

    // Only archive previous data if a document already exists
    if (existing) {
      const previousSnapshot = {
        coordinates: existing.coordinates,
        heartRate: existing.heartRate,
        temperature: existing.temperature,
        batteryLevel: existing.batteryLevel,
        status: existing.status,
        time: new Date(),
      };
      updateQuery.$push = { history: previousSnapshot };
    }

    const petAttributes = await PetAttributes.findOneAndUpdate(
      { petId: pet._id, collarId: collar._id },
      updateQuery,
      { upsert: true, new: true },
    );

    res.status(200).json({
      message: "Attributes updated successfully",
      petAttributes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPetAttributes = async (req: Request, res: Response) => {
  try {
    const { petId } = req.params;
    if (!petId) {
      return res.status(400).json({ message: "Pet ID is required" });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const results = await PetAttributes.aggregate([
      { $match: { petId: pet._id } },
      {
        $project: {
          petId: 1,
          collarId: 1,
          coordinates: 1,
          heartRate: 1,
          temperature: 1,
          batteryLevel: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          totalHistoryCount: { $size: { $ifNull: ["$history", []] } },
          history: {
            $slice: [
              { $reverseArray: { $ifNull: ["$history", []] } },
              skip,
              limit
            ]
          }
        }
      }
    ]);

    const petAttributes = results[0] || null;

    return res.status(200).json({
      message: "Pet attributes retrieved",
      attributes: petAttributes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

