const router = require("express").Router();
const Booking = require("../models/Booking");
const ParkingStation = require("../models/ParkingStation");
const User = require("../models/User");
const { calculateAmount } = require("../utils/pricing");
const auth = require("../middleware/auth.middleware");

/* =====================================================
   PREVIEW PRICE (USER-AWARE)
===================================================== */
router.post("/preview", auth, async (req, res) => {
  try {
    const { stationId, ev } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    const station = await ParkingStation.findById(stationId);
    if (!station) return res.status(404).json({ message: "Station not found" });

    const field = user.vehicleType === "2W" ? "twoW" : "fourW";

    if (!station[field].enabled) {
      return res.status(400).json({ message: "Vehicle not supported here" });
    }

    if (ev && !station[field].ev) {
      return res.status(400).json({ message: "EV charger not available" });
    }

    return res.json({
      ratePerHour: station[field].rate,
      evRatePerHour: ev ? station[field].evRate : 0,
    });
  } catch (err) {
    console.error("PREVIEW ERROR:", err);
    res.status(500).json({ message: "Failed to preview price" });
  }
});

/* =====================================================
   START BOOKING (SECURE)
===================================================== */
router.post("/start", auth, async (req, res) => {
  try {
    const { stationId, slotNumber, ev } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    // Prevent multiple active bookings
    const existing = await Booking.findOne({
      user: user._id,
      status: "ACTIVE",
    });
    if (existing) {
      return res.status(400).json({
        message: "You already have an active booking",
      });
    }

    const station = await ParkingStation.findById(stationId);
    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }

    const field = user.vehicleType === "2W" ? "twoW" : "fourW";

    if (!station[field].enabled) {
      return res.status(400).json({ message: "Vehicle not supported" });
    }

    if (ev && !station[field].ev) {
      return res.status(400).json({ message: "EV charger not available" });
    }

    const totalSlots = station[field].slots;

    // Slot capacity check
    const activeCount = await Booking.countDocuments({
      station: stationId,
      vehicleType: user.vehicleType,
      status: "ACTIVE",
    });

    if (activeCount >= totalSlots) {
      return res.status(400).json({ message: "Slots full" });
    }

    const booking = await Booking.create({
      user: user._id,
      station: stationId,
      vehicleType: user.vehicleType,
      vehicleNumber: user.vehicleNumber,
      slotNumber,
      ev,
      startTime: new Date(),
      ratePerHour: station[field].rate,
      evRatePerHour: ev ? station[field].evRate : 0,
      status: "ACTIVE",
    });

    res.status(201).json({
      message: "Booking started",
      booking,
    });
  } catch (err) {
    console.error("START BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to start booking" });
  }
});

/* =====================================================
   STOP BOOKING
===================================================== */
router.post("/stop/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id,
      status: "ACTIVE",
    });

    if (!booking) {
      return res.status(404).json({ message: "Active booking not found" });
    }

    const endTime = new Date();

    const { hours, total } = calculateAmount({
      startTime: booking.startTime,
      endTime,
      rate: booking.ratePerHour,
      evRate: booking.evRatePerHour,
      ev: booking.ev,
    });

    booking.endTime = endTime;
    booking.totalHours = hours;
    booking.totalAmount = total;
    booking.status = "COMPLETED";

    await booking.save();

    res.json({
      message: "Booking completed",
      booking,
    });
  } catch (err) {
    console.error("STOP BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to stop booking" });
  }
});

/* =====================================================
   USER BOOKING HISTORY
===================================================== */
router.get("/history", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("station", "name place")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("HISTORY ERROR:", err);
    res.status(500).json({ message: "Failed to load booking history" });
  }
});

module.exports = router;
