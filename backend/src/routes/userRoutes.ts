// src/routes/userRoutes.ts
import express from "express";
import { registerUser, loginUser, getCurrentUser, updateUserProfile,  updatePassword } from "../controllers/userController";
import { authMiddleware } from "../middleware/auth";


const userRouter = express.Router();

// Public routes (No middleware required)
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Protected routes (Middleware runs FIRST)
// authMiddleware ensures they have a valid token before getCurrentUser runs
userRouter.get("/me", authMiddleware, getCurrentUser);

userRouter.put('/profile', authMiddleware,updateUserProfile)

userRouter.put('/password', authMiddleware, updatePassword)

export default userRouter;