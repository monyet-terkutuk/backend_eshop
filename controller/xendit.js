const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const midtransClient = require("midtrans-client");
const Order = require("../model/order");

// Create Snap API instance
let snap = new midtransClient.Snap({
  isProduction: false,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

router.post(
  "/process",
  catchAsyncErrors(async (req, res, next) => {
    const { amount, order_id } = req.body;

    try {
      if (!amount || !order_id) {
        throw new Error("Please provide all required fields");
      }

      let parameter = {
        transaction_details: {
          order_id,
          gross_amount: amount,
        },
        credit_card: {
          secure: true,
        },
      };

      const transaction = await snap.createTransaction(parameter);

      // transaction redirect_url
      let redirectUrl = transaction.redirect_url;
      console.log("redirectUrl:", redirectUrl);

      res.status(200).json({
        success: true,
        url: redirectUrl,
      });
    } catch (error) {
      let errorMessage = "An error occurred while processing the request";

      // Jika error yang terjadi adalah error dari Midtrans API
      if (error.apiResponse) {
        const apiErrorResponse = error.apiResponse.body;
        errorMessage = apiErrorResponse.error_messages.join(", ");
      } else if (error.message) {
        errorMessage = error.message;
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  })
);

router.post(
  "/notification",
  catchAsyncErrors(async (req, res, next) => {
    console.log(req.body);
    try {
      const notificationData = req.body;

      const orderId = notificationData.order_id;
      const transactionStatus = notificationData.transaction_status;

      // Temukan order berdasarkan orderId
      const order = await Order.findOne({ _id: orderId });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Perbarui status pembayaran berdasarkan transaction_status
      if (transactionStatus === "settlement") {
        // Jika status pembayaran adalah settlement
        order.status = "Completed";
        order.paymentInfo.id = notificationData.transaction_id;
        order.paymentInfo.status = notificationData.transaction_status;
        order.paymentInfo.type = notificationData.payment_type;
        order.paidAt = new Date(notificationData.settlement_time);
      } else if (transactionStatus === "pending") {
        // Jika status pembayaran adalah pending
        order.status = "Pending";
      }

      // Simpan perubahan ke dalam dokumen order
      await order.save();

      console.log(
        `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}.`
      );

      res.status(200).json({
        success: true,
        message: "Update Status Success",
      });
    } catch (error) {
      let errorMessage = "An error occurred while processing the request";

      // Jika error yang terjadi adalah error dari Midtrans API
      if (error.apiResponse) {
        const apiErrorResponse = error.apiResponse.body;
        errorMessage = apiErrorResponse.error_messages.join(", ");
      } else if (error.message) {
        errorMessage = error.message;
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  })
);

module.exports = router;
