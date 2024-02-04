const { Criteria, SubCriteria } = require("../model/criteria");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const express = require("express");
const router = express.Router();

// create criteria + create sub criteria
router.post(
  "",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, type, value } = req.body;

      const criteria = new Criteria({
        name,
        type,
        value,
      });

      await criteria.save();

      res.status(201).json({
        success: true,
        criteria,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message), 500);
    }
  })
);

// Update criteria
router.put(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, type, value } = req.body;
      const criteriaId = req.params.id;

      const criteria = await Criteria.findById(criteriaId);

      if (!criteria) {
        return next(new ErrorHandler("Criteria not found", 404));
      }

      criteria.name = name;
      criteria.type = type;
      criteria.value = value;

      await criteria.save();

      res.status(200).json({
        success: true,
        criteria,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get all criteria
router.get(
  "/",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Ambil semua criteria dari database
      const allCriteria = await Criteria.find();

      res.status(200).json({
        success: true,
        criteria: allCriteria,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete criteria + delete sub criteria
router.delete(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const criteriaId = req.params.id;

      // Hapus sub-criteria terkait menggunakan deleteMany
      await SubCriteria.deleteMany({ criteria_id: criteriaId });

      // Hapus kriteria menggunakan deleteOne
      const deletedCriteria = await Criteria.deleteOne({ _id: criteriaId });

      if (deletedCriteria.deletedCount === 0) {
        return next(new ErrorHandler("Criteria not found", 404));
      }

      res.status(200).json({
        success: true,
        message: "Criteria and related sub-criteria deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get criteria by ID
router.get(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const criteriaId = req.params.id;

      const criteria = await Criteria.findById(criteriaId);

      if (!criteria) {
        return next(new ErrorHandler("Criteria not found", 404));
      }

      res.status(200).json({
        success: true,
        criteria,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/sub-criteria/data",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Ambil semua sub-criteria dari database
      const allSubCriteria = await SubCriteria.find();

      res.status(200).json({
        success: true,
        subCriteria: allSubCriteria,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete sub-criteria by ID
router.delete(
  "/sub-criteria/delete/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const subCriteriaId = req.params.id;

      const subCriteria = await SubCriteria.findById(subCriteriaId);

      if (!subCriteria) {
        return next(new ErrorHandler("Sub-criteria not found", 404));
      }

      await subCriteria.deleteOne();

      res.status(200).json({
        success: true,
        message: "Sub-criteria deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get by id sub criteria
router.get(
  "/sub-criteria/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const subCriteriaId = req.params.id;

      const subCriteria = await SubCriteria.findById(subCriteriaId);

      if (!subCriteria) {
        return next(new ErrorHandler("Sub-criteria not found", 404));
      }

      res.status(200).json({
        success: true,
        subCriteria,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// // get all sub criteria
// // get all sub criteria
// router.get(
//   "/sub-criteria/semua",
//   catchAsyncErrors(async (req, res, next) => {
//     try {
//       // Ambil semua sub-criteria dari database
//       const allSubCriteria = await SubCriteria.find();

//       console.log("All SubCriteria:", allSubCriteria);

//       res.status(200).json({
//         success: true,
//         subCriteria: allSubCriteria,
//       });
//     } catch (error) {
//       console.error("Error in /sub-criteria/all route:", error);

//       // Cek apakah error disebabkan oleh "CastError" dan "all" sebagai nilai "_id"
//       if (
//         error.name === "CastError" &&
//         error.path === "_id" &&
//         error.value === "all"
//       ) {
//         return next(new ErrorHandler("Invalid value for _id", 400)); // Ubah status menjadi 400 Bad Request
//       }

//       return next(new ErrorHandler(error.message, 500));
//     }
//   })
// );

router.get(
  "/sub-criteria",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Ambil semua criteria dari database
      const allCriteria = await SubCriteria.find();

      res.status(200).json({
        success: true,
        criteria: allCriteria,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.put(
  "/add/:sub_criteria_id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { sub_criteria_id, name, value } = req.body;

      // // Pastikan sub_criteria_id yang dimasukkan adalah string
      // if (typeof sub_criteria_id !== "string") {
      //   return next(new ErrorHandler("Invalid sub_criteria_id format", 400));
      // }

      // Temukan dokumen yang sesuai dengan sub_criteria_id
      const existingSubCriteria = await SubCriteria.findOne({
        sub_criteria_id,
      });

      if (!existingSubCriteria) {
        return next(new ErrorHandler("Criteria not found", 404));
      }

      // Tambahkan sub_criteria baru ke array yang sudah ada
      existingSubCriteria.sub_criteria.push({ name, value });

      // Simpan perubahan
      await existingSubCriteria.save();

      res.status(201).json({
        success: true,
        subCriteria: existingSubCriteria,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update sub-criteria by ID
router.put(
  "/sub-criteria/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const subCriteriaId = req.params.id;
      const { sub_child_id, name, value } = req.body;

      const subCriteria = await SubCriteria.findById(subCriteriaId);

      if (!subCriteria) {
        return next(new ErrorHandler("Sub-criteria not found", 404));
      }

      const targetSubCriteria = subCriteria.sub_criteria.find(
        (sc) => sc._id.toString() === sub_child_id
      );

      if (!targetSubCriteria) {
        return next(new ErrorHandler("Sub-criteria not found in array", 404));
      }

      targetSubCriteria.name = name;
      targetSubCriteria.value = value;

      await subCriteria.save();

      res.status(200).json({
        success: true,
        subCriteria,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
