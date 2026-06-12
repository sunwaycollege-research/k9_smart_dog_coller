import express from "express";
import { createCollar } from "../controller/collar.controller.js";
import { authLimiter, isValidJWT } from "../middleware/authz.middleware.js";

const CollarRouter = express.Router();

CollarRouter.post("/create", isValidJWT, authLimiter, createCollar);

export default CollarRouter;
