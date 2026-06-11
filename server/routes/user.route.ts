import { Router } from "express";
import { isValidPassword } from "../middleware/authn.middleware.js";
import { registerUser } from "../controller/user.controller.js";
import { authLimiter } from "../middleware/authz.middleware.js";

const userRouter = Router();

userRouter.post("/register", isValidPassword, authLimiter, registerUser);

export default userRouter;
