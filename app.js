const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(
  cors(
    {
      origin: "https://www.ivannata.com",
      credentials: true,
    },
    (req, callback) => {
      callback(null, true);
    }
  )
);

app.use(express.json());
app.use(cookieParser());
// app.use("/", (req, res) => {
//   res.send("Hello BE!");
// });

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
}

// import routes
const user = require("./controller/user");
const shop = require("./controller/shop");
const product = require("./controller/product");
const event = require("./controller/event");
const coupon = require("./controller/coupounCode");
const payment = require("./controller/payment");
const order = require("./controller/order");
const conversation = require("./controller/conversation");
const message = require("./controller/message");
const withdraw = require("./controller/withdraw");
const xendit = require("./controller/xendit");
const criteria = require("./controller/criteria");
const alternatif = require("./controller/alternatif");
const penilaian = require("./controller/penilaian");

app.use("/api/v2/user", user);
app.use("/api/v2/conversation", conversation);
app.use("/api/v2/message", message);
app.use("/api/v2/order", order);
app.use("/api/v2/shop", shop);
app.use("/api/v2/product", product);
app.use("/api/v2/event", event);
app.use("/api/v2/coupon", coupon);
app.use("/api/v2/payment", payment);
app.use("/api/v2/withdraw", withdraw);
app.use("/api/v2/xendit", xendit);
app.use("/api/v2/criteria", criteria);
app.use("/api/v2/alternatif", alternatif);
app.use("/api/v2/penilaian", penilaian);
// app.use("", welcome);

// it's for ErrorHandling
app.use(ErrorHandler);

module.exports = app;
