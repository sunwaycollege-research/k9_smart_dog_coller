import express, { type Express } from "express";

export default async function applyMiddleware(app: Express) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}
