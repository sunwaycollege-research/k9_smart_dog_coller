import express, { type Express } from "express";
import cors from "cors";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://skkcg1pw-3000.inc1.devtunnels.ms",
  "https://k9-smart-dog-coller-fu4c.vercel.app",
];

export default function applyMiddleware(app: Express) {
  const corsMiddleware = cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, mobile apps)
      if (!origin) {
        return callback(null, true);
      }
      const isLocalhost =
        origin.startsWith("http://localhost:") || origin === "http://localhost";
      const isDevTunnels = origin.endsWith(".devtunnels.ms");
      if (isLocalhost || isDevTunnels || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  app.use(corsMiddleware);

  // Handle pre-flight OPTIONS for all routes in Express 5
  app.options(/.*$/, corsMiddleware);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}
