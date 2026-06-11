import { Router } from "express";
import petRouter from "../routes/user.route.js";

const appRouter = Router();

appRouter.get("/", (req, res) => {
  res.json({
    message: "Welcome to the K9 Smart Dog Collar API",
  });
});

appRouter.use("/pet", petRouter);

export default appRouter;
