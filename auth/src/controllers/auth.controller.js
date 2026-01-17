import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import { clearAuthCookie, setAuthCookie } from "../utils/cookies.js";
import { generateToken, verifyToken } from "../utils/jwt.js";
import redis from "../db/redis.js";

export const register = async (req, res) => {
  try {
    const { username, email, password, fullName, role, addresses } = req.body;

    const isExistingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (isExistingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const savedUser = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      role,
      addresses,
    });

    const token = generateToken({ id: savedUser._id, role: savedUser.role });

    setAuthCookie(res, token);

    return res.status(201).json({
      message: "User registered successfully",
      data: {
        user: {
          id: savedUser._id,
          username: savedUser.username,
          email: savedUser.email,
          fullName: savedUser.fullName,
          role: savedUser.role,
          addresses: savedUser.addresses,
        },
      },
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

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier is being set in validation middleware by express-validator

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password"); // Explicitly select password field for verification

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: user._id, role: user.role });

    setAuthCookie(res, token);

    return res.status(200).json({
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          addresses: user.addresses,
        },
      },
    });
  } catch (error) {
    console.error("Error during user login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (token) {
      // Blacklist the token in Redis with an expiration time matching the token's remaining TTL
      const decoded = verifyToken(token);
      const exp = decoded.exp;
      const now = Math.floor(Date.now() / 1000);
      const ttl = exp - now; // remaining time to live in seconds

      if (ttl > 0) {
        await redis.set(`bl_${token}`, "blacklisted", "EX", ttl);
      }
    }
  } catch (error) {
    console.error("Error during logout token blacklisting:", error);
    // Proceed with logout even if blacklisting fails
  }

  clearAuthCookie(res);

  return res.status(200).json({ message: "Logout successful" });
};

export const getProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User profile fetched successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          addresses: user.addresses,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllAddresses = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User addresses fetched successfully",
      data: {
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addAddress = async (req, res) => {
  try {
    const { id } = req.user;
    const { street, city, state, zipCode, country, isDefault } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses.push({
      street,
      city,
      state,
      zipCode,
      country,
      isDefault,
    });

    await user.save();

    return res.status(201).json({
      message: "Address added successfully",
      data: {
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error("Error adding user address:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.user;
    const { addressId } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    address.deleteOne();
    await user.save();

    return res.status(200).json({
      message: "Address deleted successfully",
      data: {
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error("Error deleting user address:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
