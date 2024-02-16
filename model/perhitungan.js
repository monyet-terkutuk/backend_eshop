const mongoose = require("mongoose");

const perhitunganSchema = new mongoose.Schema(
  {
    nilai: {
      type: Array,
    },
    penilaian_id: {
      type: Number,
    },
    hasil_akhir_id: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Perhitungan = mongoose.model("Perhitungan", perhitunganSchema);

module.exports = Perhitungan;
