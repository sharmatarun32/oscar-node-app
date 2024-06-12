const MssqlOrder = require("../models/MssqlOrder");
const MssqlInvoice = require("../models/MssqlInvoice");
const PostgresOrder = require("../models/PostgresOrder");
const PostgresInvoice = require("../models/PostgresInvoice");
const { Op } = require("sequelize");
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE, 1000);

const processBatch = async (model, targetModel, where, batchSize) => {
  let offset = 0;
  let moreRecords = true;
  let successCount = 0;
  console.log(`Batch process Started...................`);

  try {
    while (moreRecords) {
      const records = await model.findAll({
        where,
        offset,
        limit: batchSize,
      });

      if (records.length > 0) {
        const recordData = records.map((record) => record.toJSON());

        await targetModel.bulkCreate(recordData, {
          updateOnDuplicate: Object.keys(targetModel.rawAttributes),
        });
        offset += records.length;
        successCount += records.length;
        console.log(`Processed ${successCount} records.`);
      } else {
        moreRecords = false;
      }
    }

    console.log(`Successfully added/updated ${successCount} records.`);
    console.log(`Batch process Completed...................`);
    return successCount;
  } catch (error) {
    console.error("Error during batch processing:", error);
    throw error;
  }
};

const processInvoice = async () => {
  try {
    const cond = await PostgresInvoice.findOne({
      order: [["row_modified_on", "DESC"]],
      attributes: ["row_unique_id", "row_modified_on"],
    });
    if (cond) {
      const condition = {
        row_unique_id: { [Op.gt]: cond?.dataValues?.row_unique_id },
      };
      await processBatch(MssqlInvoice, PostgresInvoice, condition, BATCH_SIZE);
    }
  } catch (error) {
    console.error("Error during batch processing:", error);
    throw error;
  }
};

const processJobHistory = async () => {
  try {
    const cond = await PostgresOrder.findOne({
      order: [["row_modified_on", "DESC"]],
      attributes: ["row_unique_id", "row_modified_on"],
    });
    if (cond) {
      const condition = {
        row_unique_id: { [Op.gt]: cond?.dataValues?.row_unique_id },
      };
      await processBatch(MssqlOrder, PostgresOrder, condition, BATCH_SIZE);
    }
  } catch (error) {
    console.error("Error during batch processing:", error);
    throw error;
  }
};

module.exports = {
  processBatch,
  processInvoice,
  processJobHistory,
};
