import express from "express";
import { getDashboardResumen } from "../controllers/dashboard.js";
export const dashboardRouter = express.Router();

dashboardRouter.get("/resumen", getDashboardResumen);
