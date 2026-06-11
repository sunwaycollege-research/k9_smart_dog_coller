import express from "express";
import Initialize from "./app/init.js";
import listen from "./app/listen.js";
import applyMiddleware from "./app/middlewares.js";
import appRouter from "./app/routes.js";

const app = express();

applyMiddleware(app);

await Initialize();

app.use("/", appRouter);

listen(app);
