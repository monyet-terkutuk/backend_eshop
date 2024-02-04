const mongoose = require("mongoose");

const alternatifSchema = new mongoose.Schema(
  {
    kode_alternatif: {
      type: String,
      required: [true, "Please enter your Kode Alternatif!"],
    },
    bauran_promosi: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  { timestamps: true }
);

const Alternatif = mongoose.model("Alternatif", alternatifSchema);

module.exports = { Alternatif };
