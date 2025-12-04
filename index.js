const express = require("express");
const cors = require("cors");
const path = require("path");
const DB = require("@ajayos/nodedb");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const dbPath = path.join(__dirname, "database.sql");
const nodedb = new DB(dbPath);

// ========================= INIT DB ===========================
async function initDB() {

  if (!(await nodedb.getDB("users"))) {
    await nodedb.setDB("users", "init", { ok: true });
  }

  if (!(await nodedb.getDB("slots"))) {

    // 10 TWO WHEELER SLOTS
    for (let i = 1; i <= 10; i++) {
      await nodedb.setDB("slots", `2W_${i}`, {
        slot_no: `2W-${i}`,
        type: "2W",
        userId: null,
        start: null,
        token: null,
        evStart: null,      // EV charging start time (optional)
        evActive: false,
      });
    }

    // 5 FOUR WHEELER SLOTS
    for (let i = 1; i <= 5; i++) {
      await nodedb.setDB("slots", `4W_${i}`, {
        slot_no: `4W-${i}`,
        type: "4W",
        userId: null,
        start: null,
        token: null,
        evStart: null,
        evActive: false,
      });
    }
  }
}

// ========================= USER SIGNUP ===========================
app.post("/create", async (req, res) => {
  const { userId, password, vehicleType } = req.body;

  if (!userId || !password || !vehicleType)
    return res.status(400).json({ error: "Missing fields" });

  if (!["2W", "4W"].includes(vehicleType))
    return res.status(400).json({ error: "Invalid vehicle type" });

  if (await nodedb.getDB("users", userId))
    return res.status(400).json({ error: "User already exists" });

  await nodedb.setDB("users", userId, {
    userId,
    password,
    vehicleType,
    bookedSlot: null
  });

  res.json({ success: true, message: "Account created!" });
});

// ========================= LOGIN ===========================
app.post("/login", async (req, res) => {
  const { userId, password } = req.body;

  const user = await nodedb.getDB("users", userId);
  if (!user || user.password !== password)
    return res.status(400).json({ error: "Invalid login" });

  res.json({ success: true, user });
});

// ========================= BOOK PARKING SLOT ===========================
app.post("/slot/book", async (req, res) => {
  const { userId, slot_no } = req.body;

  if (!userId || !slot_no)
    return res.status(400).json({ error: "Missing fields" });

  const user = await nodedb.getDB("users", userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.bookedSlot)
    return res.status(400).json({ error: "Already booked a slot" });

  const slot = await nodedb.getDB("slots", slot_no);
  if (!slot) return res.status(404).json({ error: "Slot not found" });

  if (slot.type !== user.vehicleType)
    return res.status(400).json({ error: "Wrong slot type for your vehicle" });

  if (slot.userId)
    return res.status(400).json({ error: "Slot already booked" });

  const start = Date.now();
  const token = `PARK-${slot.slot_no}-${Math.floor(Math.random() * 999999)}`;

  await nodedb.setDB("slots", slot_no, {
    ...slot,
    userId,
    start,
    token,
    evStart: null,
    evActive: false
  });

  await nodedb.setDB("users", userId, {
    ...user,
    bookedSlot: slot_no
  });

  res.json({
    success: true,
    slot_no: slot.slot_no,
    token,
    message: "Parking slot booked!"
  });
});

// ========================= START EV CHARGING ===========================
app.post("/slot/ev/start", async (req, res) => {
  const { userId } = req.body;

  const user = await nodedb.getDB("users", userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!user.bookedSlot)
    return res.status(400).json({ error: "No parking slot booked" });

  const slot = await nodedb.getDB("slots", user.bookedSlot);

  if (slot.evActive)
    return res.status(400).json({ error: "EV charging already active" });

  await nodedb.setDB("slots", user.bookedSlot, {
    ...slot,
    evStart: Date.now(),
    evActive: true
  });

  res.json({ success: true, message: "EV charging started!" });
});

// ========================= STOP EV CHARGING ===========================
app.post("/slot/ev/stop", async (req, res) => {
  const { userId } = req.body;

  const user = await nodedb.getDB("users", userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const slot = await nodedb.getDB("slots", user.bookedSlot);

  if (!slot.evActive)
    return res.status(400).json({ error: "No EV charging active" });

  const durationMs = Date.now() - slot.evStart;
  const hours = Math.ceil(durationMs / (60 * 60 * 1000));

  const evRate = 12; // EV rate
  const evCost = hours * evRate;

  await nodedb.setDB("slots", user.bookedSlot, {
    ...slot,
    evStart: null,
    evActive: false,
  });

  res.json({
    success: true,
    hours,
    evRate,
    evCost,
    message: "EV charging stopped"
  });
});

// ========================= RELEASE PARKING SLOT ===========================
app.post("/slot/release", async (req, res) => {
  const { userId } = req.body;

  const user = await nodedb.getDB("users", userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const slot = await nodedb.getDB("slots", user.bookedSlot);
  if (!slot) return res.status(404).json({ error: "Slot not found" });

  const durationMs = Date.now() - slot.start;
  const hours = Math.ceil(durationMs / (60 * 60 * 1000));

  const parkingRate = slot.type === "2W" ? 5 : 15;
  const parkingCost = hours * parkingRate;

  let evCost = 0;
  if (slot.evActive && slot.evStart) {
    const evHours = Math.ceil((Date.now() - slot.evStart) / (60 * 60 * 1000));
    evCost = evHours * 12; // EV = ₹12/hr
  }

  // Clear slot
  await nodedb.setDB("slots", user.bookedSlot, {
    ...slot,
    userId: null,
    start: null,
    token: null,
    evActive: false,
    evStart: null
  });

  // Clear user
  await nodedb.setDB("users", userId, {
    ...user,
    bookedSlot: null
  });

  res.json({
    success: true,
    slot_no: slot.slot_no,
    token: slot.token,
    parking_hours: hours,
    parkingRate,
    parkingCost,
    evCost,
    total: parkingCost + evCost,
    message: "Parking slot released"
  });
});

// ========================= GET ALL SLOTS ===========================
app.get("/slots", async (req, res) => {
  const list = [];

  for (let i = 1; i <= 10; i++)
    list.push(await nodedb.getDB("slots", `2W_${i}`));

  for (let i = 1; i <= 5; i++)
    list.push(await nodedb.getDB("slots", `4W_${i}`));

  res.json(list);
});

// ========================= START SERVER ===========================
app.listen(3000, async () => {
  await initDB();
  console.log("Server running at http://localhost:3000");
});
