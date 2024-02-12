const Perhitungan = require("../model/perhitungan"); // Ini belum digunakan
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const express = require("express");
const router = express.Router();

// create new perhitungan
router.post(
  "",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const perhitunganData = req.body;

      perhitunganData.nilai = req.body.nilai;

      const perhitungan = new Perhitungan({
        nilai: perhitunganData.nilai,
      });

      await perhitungan.save();

      res.status(201).json({
        success: true,
        perhitungan,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message), 500);
    }
  })
);

// get all perhitungan
router.get(
  "",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const perhitungan = await Perhitungan.find();

      res.status(201).json({
        success: true,
        perhitungan,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message), 500);
    }
  })
);

// Get perhitungan by id
router.get(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const perhitunganId = req.params.id;

      // Fetch the perhitungan document by ID from the database
      const perhitungan = await Perhitungan.findById(perhitunganId);

      // Check if the document with the given ID exists
      if (!perhitungan) {
        return next(new ErrorHandler("Hasil Akhir not found", 404));
      }

      res.status(200).json({
        success: true,
        perhitungan,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update a perhitungan by ID
router.put(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const perhitunganId = req.params.id;
      const updatedData = req.body;

      // Check if the perhitungan with the given ID exists
      const perhitungan = await Perhitungan.findById(perhitunganId);
      if (!perhitungan) {
        return next(new ErrorHandler("Perhitungan not found", 404));
      }

      // Update the perhitungan
      await Perhitungan.findByIdAndUpdate(perhitunganId, updatedData, {
        new: true, // Return the modified document
        runValidators: true, // Run model validation on update
      });

      res.status(200).json({
        success: true,
        message: "Perhitungan updated successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete perhitungan
router.delete(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const perhitunganId = req.params.id;

      const perhitungan = await Perhitungan.findById(perhitunganId);
      if (!perhitungan) {
        return next(new ErrorHandler("Perhitungan not found", 404));
      }

      await Perhitungan.findByIdAndDelete(perhitunganId);

      res.status(200).json({
        success: true,
        message: "Perhitungan deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
