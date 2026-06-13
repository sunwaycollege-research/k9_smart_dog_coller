import express from "express";
import {
  registerPet,
  assignCollar,
  checkCollar,
  updateAttributes,
  getPetAttributes,
} from "../controller/pet.controller.js";
import { authLimiter, isValidJWT } from "../middleware/authz.middleware.js";

const PetRouter = express.Router();

PetRouter.post("/register", isValidJWT, authLimiter, registerPet);
PetRouter.post("/assign-collar", isValidJWT, authLimiter, assignCollar);
PetRouter.post("/check-collar", isValidJWT, authLimiter, checkCollar);
PetRouter.post("/update-attributes", updateAttributes);
PetRouter.get("/:petId/attributes", isValidJWT, getPetAttributes);

export default PetRouter;
