const { Alternatif } = require("../model/alternatif");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const express = require("express");
const { Penilaian } = require("../model/penilaian");
const router = express.Router();

// create new alternatif
router.post(
  "",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { kode_alternatif, bauran_promosi, type } = req.body;

      // Validasi input
      if (!kode_alternatif || !bauran_promosi || !type) {
        return res.status(400).json({
          success: false,
          message: "Please fill all the fields",
        });
      }

      // Cek apakah kode_alternatif sudah digunakan
      const existingAlternatif = await Alternatif.findOne({
        kode_alternatif: kode_alternatif,
      });

      if (existingAlternatif) {
        return res.status(400).json({
          success: false,
          message: "Kode Alternatif is already in use",
        });
      }

      // Buat objek Alternatif baru
      const alternatif = new Alternatif({
        kode_alternatif,
        bauran_promosi,
        type,
      });

      // Simpan ke database
      await alternatif.save();

      res.status(201).json({
        success: true,
        alternatif,
      });
    } catch (error) {
      // Tangani kesalahan dengan ErrorHandler
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get all Alternatif
router.get(
  "",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const allAlternatif = await Alternatif.find();

      res.status(200).json({
        success: true,
        alternatif: allAlternatif,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get Alternatif by ID
router.get(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const alternatifId = req.params.id;

      const alternatif = await Alternatif.findById(alternatifId);

      if (!alternatif) {
        return next(new ErrorHandler("Alternatif not found", 404));
      }

      res.status(200).json({
        success: true,
        alternatif,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update Alternatif by ID
router.put(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const alternatifId = req.params.id;
      const { kode_alternatif, bauran_promosi, type } = req.body;

      const alternatif = await Alternatif.findById(alternatifId);

      if (!alternatif) {
        return next(new ErrorHandler("Alternatif not found", 404));
      }

      //   // Cek apakah kode_alternatif yang diinginkan sudah ada di database selain di data yang sedang diupdate
      //   const existingAlternatif = await Alternatif.findOne({
      //     kode_alternatif,
      //     _id: { $ne: alternatifId }, // Tidak mencocokkan dengan data yang sedang diupdate
      //   });

      //   if (existingAlternatif) {
      //     return next(new ErrorHandler("Kode Alternatif already exists", 400));
      //   }

      alternatif.kode_alternatif = kode_alternatif;
      alternatif.bauran_promosi = bauran_promosi;
      alternatif.type = type;

      await alternatif.save();

      res.status(200).json({
        success: true,
        alternatif,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete Alternatif by ID
router.delete(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const alternatifId = req.params.id;

      const deletedAlternatif = await Alternatif.findByIdAndDelete(
        alternatifId
      );

      const deletePenilaian = await Penilaian.deleteMany({
        alternatif_id: alternatifId,
      });

      if (!deletedAlternatif) {
        return next(new ErrorHandler("Alternatif not found", 404));
      }

      res.status(200).json({
        success: true,
        message: "Alternatif deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
