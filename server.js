require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://192.168.1.4:5173",
    credentials: true,
  }),
);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/stations", require("./routes/station"));
app.use("/api/user/stations", require("./routes/station.user"));
app.use("/api/bookings", require("./routes/booking"));


app.get("/", (_, res) => {
  res.send("Parking System API running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
