const express = require("express");
const cors = require("cors");
const path = require("path");
const DB = require("@ajayos/nodedb");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// DB init
const dbPath = path.join(__dirname, "database.sql");
const nodedb = new DB(dbPath);

// ---------- INITIAL SETUP ----------
async function initDB() {
  if (!(await nodedb.getDB("users"))) {
    await nodedb.setDB("users", "init", { ok: true });
  }

  if (!(await nodedb.getDB("slots"))) {
    for (let i = 1; i <= 10; i++) {
      await nodedb.setDB("slots", `2W_${i}`, {
        slot_no: `2W-${i}`,
        type: "2W",
        userId: null,
        start: null,
        token: null,
      });
    }

    for (let i = 1; i <= 5; i++) {
      await nodedb.setDB("slots", `4W_${i}`, {
        slot_no: `4W-${i}`,
        type: "4W",
        userId: null,
        start: null,
        token: null,
      });
    }
  }
}

// ============= USER API =============

// CREATE USER
app.post("/create", async (req, res) => {
  const { userId, password, vehicleType } = req.body;

  if (!userId || !password || !vehicleType)
    return res.status(400).json({ error: "Missing fields" });

  if (!["2W", "4W"].includes(vehicleType))
    return res.status(400).json({ error: "Invalid vehicle type" });

  if (await nodedb.getDB("users", userId))
    return res.status(400).json({ error: "User exists" });

  await nodedb.setDB("users", userId, {
    userId,
    password,
    vehicleType,
    bookedSlot: null,
  });

  res.json({ success: true, message: "User created" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { userId, password } = req.body;

  const user = await nodedb.getDB("users", userId);
  if (!user || user.password !== password)
    return res.status(400).json({ error: "Invalid login" });

  res.json({ success: true, user });
});

// ============= SLOT BOOKING =============

// BOOK SLOT (NO HOURS)
app.post("/slot/book", async (req, res) => {
  const { userId, slot_no } = req.body;

  if (!userId || !slot_no)
    return res.status(400).json({ error: "Missing fields" });

  const user = await nodedb.getDB("users", userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.bookedSlot)
    return res.status(400).json({ error: "You already booked a slot" });

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
  });

  await nodedb.setDB("users", userId, {
    ...user,
    bookedSlot: slot_no,
  });

  res.json({
    success: true,
    slot_no,
    start,
    token,
    message: "Slot booked successfully",
  });
});

// RELEASE SLOT (AUTO CALCULATE TIME + RATE)
app.post("/slot/release", async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const user = await nodedb.getDB("users", userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!user.bookedSlot)
    return res.status(400).json({ error: "You have no active slot" });

  const slot = await nodedb.getDB("slots", user.bookedSlot);

  const end = Date.now();
  const durationMs = end - slot.start;
  const hours = Math.ceil(durationMs / (60 * 60 * 1000)); // Round UP to next hour

  const rate = slot.type === "2W" ? 5 : 15;
  const cost = hours * rate;

  // Clear slot
  await nodedb.setDB("slots", user.bookedSlot, {
    ...slot,
    userId: null,
    start: null,
    token: null,
  });

  // Clear user booking
  await nodedb.setDB("users", userId, {
    ...user,
    bookedSlot: null,
  });

  res.json({
    success: true,
    slot_no: slot.slot_no,
    token: slot.token,
    parked_hours: hours,
    rate,
    cost,
    message: "Slot released & bill calculated",
  });
});

// GET ALL SLOTS
app.get("/slots", async (req, res) => {
  const result = [];

  for (let i = 1; i <= 10; i++) {
    result.push(await nodedb.getDB("slots", `2W_${i}`));
  }

  for (let i = 1; i <= 5; i++) {
    result.push(await nodedb.getDB("slots", `4W_${i}`));
  }

  res.json(result);
});

// START SERVER
const PORT = 3000;
app.listen(PORT, async () => {
  await initDB();
  console.log(`Server running on http://localhost:${PORT}`);
});
