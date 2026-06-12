import { Router } from "express";
import UserRouter from "../routes/user.route.js";
import PetRouter from "../routes/pet.routes.js";
import CollarRouter from "../routes/collar.routes.js";

const appRouter = Router();

appRouter.get("/", (req, res) => {
  res.json({
    message: "Welcome to the K9 Smart Dog Collar API",
  });
});

appRouter.use("/user", UserRouter);
appRouter.use("/pet", PetRouter);
appRouter.use("/collar", CollarRouter);

export default appRouter;
