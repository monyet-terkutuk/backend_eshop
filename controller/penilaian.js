const express = require("express");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const { Penilaian } = require("../model/penilaian");
const { Criteria } = require("../model/criteria");
const { Alternatif } = require("../model/alternatif");

// Create Penilaian
router.post(
  "",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { criteria_id, alternatif_id, nilai } = req.body;

      if (!criteria_id || !alternatif_id) {
        return res.status(400).json({
          success: false,
          message: "Please fill all the fields",
        });
      }

      const penilaian = new Penilaian({
        criteria_id: criteria_id,
        alternatif_id: alternatif_id,
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

// Get all Penilaian with related Criteria and Alternatif
router.get(
  "",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const allPenilaian = await Penilaian.find();
      let alternatifResults = {};
      let criteriaMaxValues = {};

      // Collect all penilaian results and find max values for each criteria
      for (let penilaian of allPenilaian) {
        const criteria = await Criteria.findById(penilaian.criteria_id);
        const alternatif = await Alternatif.findById(penilaian.alternatif_id);

        if (!alternatifResults[alternatif.kode_alternatif]) {
          alternatifResults[alternatif.kode_alternatif] = {
            _id: alternatif._id.toString(),
            kode_alternatif: alternatif.kode_alternatif,
          };
        }

        alternatifResults[alternatif.kode_alternatif][
          `hasil_${criteria.criteria_code}`
        ] = penilaian.nilai;

        // Track max value for each criteria
        if (
          !criteriaMaxValues[criteria.criteria_code] ||
          criteriaMaxValues[criteria.criteria_code] < penilaian.nilai
        ) {
          criteriaMaxValues[criteria.criteria_code] = penilaian.nilai;
        }
      }

      // Normalize the values
      let normalizationResults = Object.values(alternatifResults).map(
        (alternatif) => {
          let normalizedValues = {};
          for (const [key, value] of Object.entries(criteriaMaxValues)) {
            normalizedValues[`hasil_${key}`] =
              alternatif[`hasil_${key}`] / value;
          }
          return {
            _id: alternatif._id,
            kode_alternatif: alternatif.kode_alternatif,
            ...normalizedValues,
          };
        }
      );

      // Convert the alternatifResults object into an array for penilaian
      const penilaianResults = Object.values(alternatifResults);

      res.status(200).json({
        success: true,
        penilaian: penilaianResults,
        normalisasi: normalizationResults,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
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
