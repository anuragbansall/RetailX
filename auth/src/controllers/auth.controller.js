import User from "../models/User.model.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  const { username, email, password, fullName, role, addresses } = req.body;

  try {
    const isExistingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (isExistingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      role,
      addresses,
    });

    const savedUser = await newUser.save();

    return res.status(201).json({
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      fullName: savedUser.fullName,
      role: savedUser.role,
      addresses: savedUser.addresses,
    });
  } catch (error) {
    // Handle race condition errors when unique index constraint is violated (duplicate key error 11000)
    if (error.code === 11000) {
      return res.status(409).json({ message: "User already exists" });
    }

    console.error("Error during user registration:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
