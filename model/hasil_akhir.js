const mongoose = require("mongoose");

const hasilAkhirSchema = new mongoose.Schema(
  {
    rangking: {
      type: Number,
    },
    nilai: {
      type: String,
    },
    alternatif_id: {
      type: String,
    },
  },
  { timestamps: true }
);

const HasilAkhir = mongoose.model("Hasil_Akhir", hasilAkhirSchema);

module.exports = { HasilAkhir };
