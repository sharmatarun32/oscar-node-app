const express = require("express");
const router = express.Router();
const {
  runInvoiceData,
  runJobHistory,
  getInvoiceData,
  getJobHistory,
} = require("../controllers/getDataController");
const basicAuth = require("../middleware/auth");
const { reqValidate } = require("../requestValidator");

router.post("/runInvoiceData", basicAuth, runInvoiceData);
router.post("/runJobHistory", basicAuth, runJobHistory);

router.get("/getInvoiceData", basicAuth, reqValidate, getInvoiceData);
router.get("/getJobHistory", basicAuth, reqValidate, getJobHistory);

module.exports = router;
