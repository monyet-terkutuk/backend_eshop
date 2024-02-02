const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// const Xendit = require("xendit-node");
// const x = new Xendit({
//   secretKey: process.env.XENDIT_SECRET_KEY,
// });

const { Xendit } = require("xendit-node");
const x = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY,
});

router.post(
  "/process",
  catchAsyncErrors(async (req, res, next) => {
    const { amount, email, order_id } = req.body;

    if (!amount || !email || !order_id) {
      return next(new Error("Please provide all required fields"));
    }

    const createInvoice = async () => {
      const invoiceItems = await x.invoice.createInvoice({
        externalID: order_id,
        amount,
        payerEmail: email,
        description: "Invoice payment",
      });

      return invoiceItems.id;
    };

    const invoiceId = await createInvoice();

    const createPayment = async (invoiceId) => {
      const createPaymentParams = {
        externalID: order_id,
        invoiceID: invoiceId,
        amount,
      };

      const payment = await x.invoice.createInvoice(createPaymentParams);
      return payment.id;
    };

    const paymentId = await createPayment(invoiceId);

    res.status(200).json({
      success: true,

      paymentId,
    });
  })
);

router.get(
  "/xenditapikey",
  catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({ xenditApikey: process.env.XENDIT_SECRET_KEY });
  })
);

router.post("/webhooks", (req, res) => {
  const payload = req.body; // Data pemberitahuan dari Xendit
  // Proses data pemberitahuan sesuai kebutuhan bisnis Anda
  console.log("Received Xendit Webhook:", payload);
  res.status(200).end(); // Balas ke Xendit untuk konfirmasi penerimaan pemberitahuan
});

module.exports = router;
