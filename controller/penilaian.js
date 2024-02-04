const express = require("express");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const Penilaian = require("../model/penilaian");
const Criteria = require("../model/criteria");
const Alternatif = require("../model/alternatif");

// Create Penilaian
router.post(
  "",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { criteria_id, alternatif_id } = req.body;

      nilai = 0;

      if (!criteria_id || !alternatif_id) {
        return res.status(400).json({
          success: false,
          message: "Please fill all the fields",
        });
      }

      const penilaian = new Penilaian({
        criteria_id,
        alternatif_id,
        nilai: nilai,
      });

      await penilaian.save();

      res.status(201).json({
        success: true,
        penilaian,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get all Penilaian
router.get(
  "",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Ambil semua penilaian dari database
      const allPenilaian = await Penilaian.find();

      // Ambil data kriteria untuk semua penilaian
      const criteriaIds = allPenilaian.map(
        (penilaian) => penilaian.criteria_id
      );
      const allCriteria = await Criteria.findById({ criteriaIds });

      // Ambil data alternatif untuk semua penilaian
      const alternatifIds = allPenilaian.map(
        (penilaian) => penilaian.alternatif_id
      );
      const allAlternatif = await Alternatif.find({
        _id: { $in: alternatifIds },
      });

      res.status(200).json({
        success: true,
        penilaian: allPenilaian,
        criteria: allCriteria,
        alternatif: allAlternatif,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update Penilaian by ID
router.put(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const penilaianId = req.params.id;
      const { criteria_id, alternatif_id, nilai } = req.body;

      if (!criteria_id || !alternatif_id || !nilai) {
        return res.status(400).json({
          success: false,
          message: "Please fill all the fields",
        });
      }

      const penilaian = await Penilaian.findById(penilaianId);

      if (!penilaian) {
        return next(new ErrorHandler("Penilaian not found", 404));
      }

      penilaian.criteria_id = criteria_id;
      penilaian.alternatif_id = alternatif_id;
      penilaian.nilai = nilai;

      await penilaian.save();

      res.status(200).json({
        success: true,
        penilaian,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
