import { Router } from "express";
import { isValidPassword } from "../middleware/authn.middleware.js";
import { registerUser, LoginUser } from "../controller/user.controller.js";
import { authLimiter } from "../middleware/authz.middleware.js";

const userRouter = Router();

userRouter.post("/register", isValidPassword, authLimiter, registerUser);
userRouter.post("/login", isValidPassword, authLimiter, LoginUser);

export default userRouter;
