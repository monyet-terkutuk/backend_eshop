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
      const { name, type, value, criteria_code } = req.body;

      const criteria = new Criteria({
        name,
        type,
        value,
        criteria_code,
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
      const { name, type, value, criteria_code } = req.body;
      const criteriaId = req.params.id;

      const criteria = await Criteria.findById(criteriaId);

      if (!criteria) {
        return next(new ErrorHandler("Criteria not found", 404));
      }

      criteria.name = name;
      criteria.type = type;
      criteria.value = value;
      criteria.criteria_code = criteria_code;

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
      // Ambil semua kriteria beserta sub-criteria dari database
      const criteriaWithSubCriteria = await Criteria.find().populate(
        "sub_criteria"
      );

      res.status(200).json({
        success: true,
        criteriaWithSubCriteria: criteriaWithSubCriteria,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// router.get(
//   "/sub-criteria/data",
//   catchAsyncErrors(async (req, res, next) => {
//     try {
//       // Ambil semua sub-criteria dari database
//       const allSubCriteria = await SubCriteria.find();

//       res.status(200).json({
//         success: true,
//         subCriteria: allSubCriteria,
//       });
//     } catch (error) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   })
// );

// Delete sub-criteria by ID
router.delete(
  "/sub-criteria/:id",
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
  "/sub-criteria/:parentId/:childId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const subCriteriaId = req.params.parentId;
      const criteriaId = req.params.childId;

      const subCriteria = await SubCriteria.findById(subCriteriaId);

      const subCriteriaChild = subCriteria.sub_criteria.find(
        (sc) => sc._id.toString() === criteriaId
      );

      if (!subCriteria) {
        return next(new ErrorHandler("Sub-criteria not found", 404));
      }

      res.status(200).json({
        success: true,
        parent: subCriteria,
        child: subCriteriaChild,
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

// get all sub criteria
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

// add sub criteria
router.put(
  "/add/:criteria_id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, value, description } = req.body;
      const criteria_id = req.params.criteria_id; // This is how you get path parameters

      // You should use findOneAndUpdate to find the document and update it atomically
      const updatedSubCriteria = await SubCriteria.findOneAndUpdate(
        { criteria_id: criteria_id }, // find a document by criteria_id
        {
          $push: { sub_criteria: { name, value, criteria_id, description } }, // push to the sub_criteria array
        },
        { new: true } // option to return the modified document
      );

      if (!updatedSubCriteria) {
        return next(new ErrorHandler("Criteria not found", 404));
      }

      res.status(201).json({
        success: true,
        subCriteria: updatedSubCriteria,
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
      const { sub_child_id, name, value, description } = req.body;

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
      targetSubCriteria.description = description;

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

router.delete(
  "/delete/:sub_criteria_id/:sub_child_id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { sub_criteria_id, sub_child_id } = req.params;

      const existingSubCriteria = await SubCriteria.findOne({
        _id: sub_criteria_id,
      });

      if (!existingSubCriteria) {
        return next(new ErrorHandler("Sub-criteria not found", 404));
      }

      const subCriteriaIndex = existingSubCriteria.sub_criteria.findIndex(
        (sc) => sc._id.toString() === sub_child_id
      );

      if (subCriteriaIndex === -1) {
        return next(new ErrorHandler("Sub-criteria not found in array", 404));
      }

      existingSubCriteria.sub_criteria.splice(subCriteriaIndex, 1);

      await existingSubCriteria.save();

      res.status(200).json({
        success: true,
        message: "Success delete sub-criteria child",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// update sub-criteria child by ID
router.put(
  "/sub-criteria/:oarentId/:childId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const subCriteriaId = req.params.oarentId;
      const criteriaId = req.params.childId;
      const { name, value, description } = req.body;

      const subCriteria = await SubCriteria.findById(subCriteriaId);

      if (!subCriteria) {
        return next(new ErrorHandler("Sub-criteria not found", 404));
      }

      const targetSubCriteria = subCriteria.sub_criteria.find(
        (sc) => sc._id.toString() === criteriaId
      );

      if (!targetSubCriteria) {
        return next(new ErrorHandler("Sub-criteria not found in array", 404));
      }

      // update child
      targetSubCriteria.name = name;
      targetSubCriteria.value = value;
      targetSubCriteria.description = description;

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
