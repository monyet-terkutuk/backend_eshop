const { HasilAkhir } = require("../model/hasil_akhir");
const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
// const { HasilAkhir } = require("../model/hasilAkhir");

// create new hasil akhir
router.post(
  "",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const hasilAkhirData = req.body;

      // Create a new HasilAkhir document
      const hasilAkhir = new HasilAkhir({
        rangking: hasilAkhirData.rangking,
        nilai: hasilAkhirData.nilai,
        alternatif_id: hasilAkhirData.alternatif_id,
      });

      // Save the document to the database
      await hasilAkhir.save();

      res.status(201).json({
        success: true,
        hasilAkhir,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all hasil akhir
router.get(
  "",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Fetch all HasilAkhir documents from the database
      const hasilAkhir = await HasilAkhir.find();

      res.status(200).json({
        success: true,
        hasilAkhir,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get hasil akhir by ID
router.get(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const hasilAkhirId = req.params.id;

      // Fetch the HasilAkhir document by ID from the database
      const hasilAkhir = await HasilAkhir.findById(hasilAkhirId);

      // Check if the document with the given ID exists
      if (!hasilAkhir) {
        return next(new ErrorHandler("Hasil Akhir not found", 404));
      }

      res.status(200).json({
        success: true,
        hasilAkhir,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update hasil akhir by ID
router.put(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const hasilAkhirId = req.params.id;
      const updatedData = req.body;

      // Fetch the HasilAkhir document by ID from the database
      const hasilAkhir = await HasilAkhir.findById(hasilAkhirId);

      // Check if the document with the given ID exists
      if (!hasilAkhir) {
        return next(new ErrorHandler("HasilAkhir not found", 404));
      }

      // Update the HasilAkhir document
      await HasilAkhir.findByIdAndUpdate(hasilAkhirId, updatedData, {
        new: true, // Return the modified document
        runValidators: true, // Run model validation on update
      });

      res.status(200).json({
        success: true,
        message: "HasilAkhir updated successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete hasil akhir by ID
router.delete(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const hasilAkhirId = req.params.id;

      // Fetch the HasilAkhir document by ID from the database
      const hasilAkhir = await HasilAkhir.findById(hasilAkhirId);

      // Check if the document with the given ID exists
      if (!hasilAkhir) {
        return next(new ErrorHandler("HasilAkhir not found", 404));
      }

      // Delete the HasilAkhir document
      await HasilAkhir.findByIdAndDelete(hasilAkhirId);

      res.status(200).json({
        success: true,
        message: "HasilAkhir deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
