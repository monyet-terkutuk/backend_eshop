const mongoose = require("mongoose");

const perhitunganSchema = new mongoose.Schema(
  {
    nilai: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Perhitungan = mongoose.model("Perhitungan", perhitunganSchema);

module.exports = Perhitungan;
