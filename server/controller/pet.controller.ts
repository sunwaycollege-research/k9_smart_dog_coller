import type { Request, Response } from "express";
import Pet from "../models/pet.model.js";
import User from "../models/user.model.js";

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
