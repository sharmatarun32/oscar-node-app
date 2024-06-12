const express = require("express");
const router = express.Router();
const {
  runInvoiceData,
  runJobHistory,
  getInvoiceData,
  getJobHistory,
} = require("../controllers/getDataController");
const basicAuth = require("../middleware/auth");

router.get("/runInvoiceData", basicAuth, runInvoiceData);
router.get("/runJobHistory", basicAuth, runJobHistory);

router.post("/getInvoiceData", basicAuth, getInvoiceData);
router.post("/getJobHistory", basicAuth, getJobHistory);

module.exports = router;
