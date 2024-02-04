const mongoose = require("mongoose");

const penilaianSchema = new mongoose.Schema(
  {
    criteria_id: {
      type: String,
    },
    alternatif_id: {
      type: String,
    },
    nilai: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Penilaian", penilaianSchema);
