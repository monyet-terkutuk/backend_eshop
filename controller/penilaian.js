const express = require("express");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const { Penilaian } = require("../model/penilaian");
const { Criteria } = require("../model/criteria");
const { Alternatif } = require("../model/alternatif");
const { HasilAkhir } = require("../model/hasil_akhir");
const Perhitungan = require("../model/perhitungan");

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
            bauran_promosi: alternatif.bauran_promosi,
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

      // Calculate Qi for each alternative
      let QiResults = normalizationResults.map((normalized) => {
        let sum = 0; // This will be used for the summation part of the Qi formula
        let product = 1; // This will be used for the product part of the Qi formula
        let Wj; // You need to define how to get the weight for each criterion

        for (let i = 1; i <= Object.keys(criteriaMaxValues).length; i++) {
          // Assuming you have a way to get the weight (Wj) for each criterion
          Wj = 1 / Object.keys(criteriaMaxValues).length; // This should be replaced with the actual weight of the criterion
          sum += normalized[`hasil_C${i}`] * Wj;
          product *= Math.pow(normalized[`hasil_C${i}`], Wj);
        }

        let Qi = 0.5 * sum + 0.5 * product;

        return {
          alternatif_id: normalized._id,
          kode_alternatif: normalized.kode_alternatif,
          bauran_promosi: normalized.bauran_promosi,
          nilai: Qi,
        };
      });

      // Sort Qi results to get ranking
      QiResults.sort((a, b) => b.nilai - a.nilai);
      QiResults.forEach((result, index) => {
        result.ranking = index + 1; // Assign ranking based on sorted order
      });

      // Save Qi results in HasilAkhir model
      for (let result of QiResults) {
        const hasilAkhir = new HasilAkhir(result);
        await hasilAkhir.save();
      }

      res.status(200).json({
        success: true,
        penilaian: penilaianResults,
        normalisasi: normalizationResults,
        Qi: QiResults, // Contains Qi calculation results with 'kode_alternatif' and 'bauran_promosi'
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
