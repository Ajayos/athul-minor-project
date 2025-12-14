const router = require("express").Router();
const ParkingStation = require("../models/ParkingStation");
const auth = require("../middleware/auth.middleware");

/**
 * CREATE station
 */
router.post("/", auth, async (req, res) => {
  try {
    const station = await ParkingStation.create({
      ...req.body,
      createdBy: req.user.id,
    });
    res.status(201).json(station);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET all stations
 */
router.get("/", auth, async (_, res) => {
  const stations = await ParkingStation.find().sort({ createdAt: -1 });
  res.json(stations);
});

/**
 * UPDATE station
 */
router.put("/:id", auth, async (req, res) => {
  const station = await ParkingStation.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );
  res.json(station);
});

/**
 * DELETE station
 */
router.delete("/:id", auth, async (req, res) => {
  await ParkingStation.findByIdAndDelete(req.params.id);
  res.json({ message: "Station deleted" });
});

module.exports = router;
