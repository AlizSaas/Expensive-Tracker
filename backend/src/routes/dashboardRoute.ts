import express from "express";

import {getDashboardOverview} from "../controllers/dashboardController";
import { authMiddleware } from "../middleware/auth";


const dashboardRouter = express.Router();

dashboardRouter.get("/", authMiddleware, getDashboardOverview);

export default dashboardRouter;