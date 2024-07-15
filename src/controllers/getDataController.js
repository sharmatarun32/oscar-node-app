const PostgresInvoice = require("../models/PostgresInvoice");
const PostgresOrder = require("../models/PostgresOrder");
const { Op } = require("sequelize");
const {
  processInvoice,
  processJobHistory,
} = require("../scripts/cronFunctions");
const { getPageAndLimit } = require("../scripts/helper");

async function runInvoiceData(req, res) {
  try {
    await processInvoice();
    return res.status(200).json("completed!");
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
}

async function runJobHistory(req, res) {
  try {
    await processJobHistory();
    return res.status(200).json("completed!");
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
}

async function getInvoiceData(req, res) {
  try {
    const { fromDate, toDate, ...param } = req.query;
    const { skip, limit, page } = getPageAndLimit(param);

    const dataCount = await PostgresInvoice.count({
      where: {
        row_modified_on: {
          [Op.gte]: fromDate,
          [Op.lte]: toDate,
        },
      },
    });
    let data;
    if (dataCount > 0) {
      data = await PostgresInvoice.findAll({
        where: {
          row_modified_on: {
            [Op.gte]: fromDate,
            [Op.lte]: toDate,
          },
        },
        order: [["row_modified_on", "DESC"]],
        offset: skip,
        limit,
      });
    }
    const result = {
      data,
      total: dataCount || 0,
      page,
      limit,
    };
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function getJobHistory(req, res) {
  const { fromDate, toDate, ...param } = req.query;
  const { skip, limit, page } = getPageAndLimit(param);
  const dataCount = await PostgresOrder.count({
    where: {
      row_modified_on: {
        [Op.gte]: fromDate,
        [Op.lte]: toDate,
      },
    },
  });
  let data;
  if (dataCount > 0) {
    data = await PostgresOrder.findAll({
      where: {
        row_modified_on: {
          [Op.gte]: fromDate,
          [Op.lte]: toDate,
        },
      },
      order: [["row_modified_on", "DESC"]],
      offset: skip,
      limit,
    });
  }
  const result = {
    data,
    total: dataCount || 0,
    page,
    limit,
  };
  return res.status(200).json(result);
}

module.exports = {
  runInvoiceData,
  runJobHistory,
  getInvoiceData,
  getJobHistory,
};
