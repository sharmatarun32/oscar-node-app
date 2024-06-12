const Yup = require("yup");

const apiSchema = Yup.object().shape({
  fromDate: Yup.date()
    .required("fromDate is required")
    .typeError("fromDate must be a valid date")
    .max(Yup.ref("toDate"), "fromDate must be before toDate"),
  toDate: Yup.date()
    .required("toDate is required")
    .typeError("toDate must be a valid date")
    .min(Yup.ref("fromDate"), "toDate must be after fromDate"),
  page: Yup.number()
    .integer("page must be an integer")
    .positive("page must be a positive number")
    .default(1),
  limit: Yup.number()
    .integer("limit must be an integer")
    .positive("limit must be a positive number")
    .default(10),
});

module.exports = { apiSchema };
