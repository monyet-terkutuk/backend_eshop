const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

router.get(
  "/be",
  catchAsyncErrors(async (req, res, next) => {
    res.status(200).json("Welcome to service BE");
  })
);

module.exports = router;
