const router = require("express").Router();
const ParkingStation = require("../models/ParkingStation");
const Booking = require("../models/Booking");
const auth = require("../middleware/auth.middleware");
const User = require("../models/User");

/**
 * GET available stations for logged-in user
 * Vehicle type is taken from JWT token
 */
router.get("/available", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    console.log("User Vehicle Type:", user);

    if (!user || !user.vehicleType) {
      return res.status(400).json({
        message: "User vehicle information not found",
      });
    }


    const vehicleType = user.vehicleType; // "2W" | "4W"

    if (!["2W", "4W"].includes(vehicleType)) {
      return res.status(400).json({
        message: "Invalid vehicle type",
      });
    }

    // Dynamic field selection
    const field = vehicleType === "2W" ? "twoW" : "fourW";

    // Find stations that support this vehicle
    const stations = await ParkingStation.find({
      [`${field}.enabled`]: true,
    });

    const results = [];

    for (const station of stations) {
      const totalSlots = station[field].slots;

      // Count active bookings
      const activeBookings = await Booking.countDocuments({
        station: station._id,
        vehicleType,
        status: "ACTIVE",
      });

      const availableSlots = Math.max(
        totalSlots - activeBookings,
        0
      );

      results.push({
        stationId: station._id,
        name: station.name,
        place: station.place,
        description: station.description,

        vehicleType,
        totalSlots,
        availableSlots,

        rate: station[field].rate,

        evSupported: station[field].ev,
        evRate: station[field].ev ? station[field].evRate : null,

        bookingPossible: availableSlots > 0,
      });
    }

    return res.json({
      user: {
        id: user.id,
        phone: user.phone,
        vehicleType,
      },
      stations: results,
    });
  } catch (error) {
    console.error("AVAILABLE STATIONS ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch available stations",
    });
  }
});

module.exports = router;
