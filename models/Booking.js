const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    station: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingStation", required: true },

    vehicleType: { type: String, enum: ["2W", "4W"], required: true },
    vehicleNumber: { type: String, required: true },

    ev: { type: Boolean, default: false },

    startTime: { type: Date, required: true },
    endTime: { type: Date },

    ratePerHour: Number,
    evRatePerHour: Number,

    totalHours: Number,
    totalAmount: Number,

    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
