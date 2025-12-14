const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth.middleware");
const dotenv = require("dotenv");
dotenv.config();

/**
 * REGISTER
 */
router.post("/register", async (req, res) => {
  try {
    const { phone, password, vehicleNumber, vehicleType } = req.body;

    if (!phone || !password || !vehicleNumber || !vehicleType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await User.findOne({ phone });
    if (exists) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      phone,
      password: hashed,
      vehicleNumber,
      vehicleType,
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * LOGIN
 */
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // set true in production (HTTPS)
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * CURRENT USER
 */
router.get("/me", auth, async (req, res) => {
  if(!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(req.user.id).select("-password");
 
  res.json({"phone": user.phone,
    "vehicleNumber": user.vehicleNumber,
    "vehicle": user.vehicleType,
    "role": user.role,});
});

/**
 * LOGOUT
 */
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

module.exports = router;
