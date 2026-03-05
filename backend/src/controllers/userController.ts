import { Request, Response } from "express";
import userModel from "../models/userModel";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



const JWT_SECRET = process.env.JWT_SECRET as string;
const TOKEN_EXPIRY = "7d";

const createToken = (id: string) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

export async function registerUser(req: Request, res: Response) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = createToken(newUser._id.toString());

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;

  // check if fields exist
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    // check if user exists
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // create token
    const token = createToken(user._id.toString());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}




export async function getCurrentUser(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const user = await userModel.findById(req.user.id).select("name email");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export async function updateUserProfile(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { name, email } = req.body;

  try {
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Fetch current user to compare values
    const currentUser = await userModel.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if anything actually changed
    const isSameName = name && name === currentUser.name;
    const isSameEmail = email && email === currentUser.email;

    if (isSameName && isSameEmail) {
      return res.status(400).json({ success: false, message: "No changes detected" });
    }

    if (name && name === currentUser.name && !email) {
      return res.status(400).json({ success: false, message: "No changes detected" });
    }

    if (email && email === currentUser.email && !name) {
      return res.status(400).json({ success: false, message: "No changes detected" });
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(req.user.id, { name, email }, { new: true, runValidators: true })
      .select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function updatePassword(req: Request, res: Response) {
  // Guard Clause: Ensure user is authenticated
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { oldPassword, newPassword } = req.body;

  // Validate input
  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Both passwords are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters",
    });
  }

  try {
    // Find user and explicitly select password
    const user = await userModel.findById(req.user.id).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Verify the old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect old password" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user document
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}