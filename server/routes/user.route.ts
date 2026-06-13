import { Router } from "express";
import { isValidPassword } from "../middleware/authn.middleware.js";
import { isValidJWT } from "../middleware/authz.middleware.js";
import { registerUser, LoginUser, updateHome, getMe } from "../controller/user.controller.js";
import { authLimiter } from "../middleware/authz.middleware.js";

const userRouter = Router();

userRouter.post("/register", isValidPassword, authLimiter, registerUser);
userRouter.post("/login",    isValidPassword, authLimiter, LoginUser);
userRouter.patch("/home",    isValidJWT,                   updateHome);
userRouter.get("/me",        isValidJWT,                   getMe);

export default userRouter;

