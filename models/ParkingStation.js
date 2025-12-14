const mongoose = require("mongoose");

const ParkingStationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    place: { type: String, required: true },
    description: String,

    twoW: {
      enabled: Boolean,
      slots: Number,
      rate: Number,
      ev: Boolean,
      evRate: Number,
    },

    fourW: {
      enabled: Boolean,
      slots: Number,
      rate: Number,
      ev: Boolean,
      evRate: Number,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ParkingStation", ParkingStationSchema);
