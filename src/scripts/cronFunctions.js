const MssqlOrder = require("../models/MssqlOrder");
const MssqlInvoice = require("../models/MssqlInvoice");
const PostgresOrder = require("../models/PostgresOrder");
const PostgresInvoice = require("../models/PostgresInvoice");
const TableLock = require("../models/TableLock");
const { Op } = require("sequelize");
require("dotenv").config();

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 1000;

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
    const lock = await TableLock.findOne({
      where: { id: 1 },
    });
    if (lock?.dataValues.is_locked === false) {
      const cond = await PostgresInvoice.findOne({
        order: [["row_modified_on", "DESC"]],
        attributes: ["row_unique_id", "row_modified_on"],
      });
      if (cond) {
        const condition = {
          row_unique_id: { [Op.gt]: cond?.dataValues?.row_unique_id },
        };
        await TableLock.update({ is_locked: true }, { where: { id: 1 } });
        await processBatch(
          MssqlInvoice,
          PostgresInvoice,
          condition,
          BATCH_SIZE
        );
        await TableLock.update({ is_locked: false }, { where: { id: 1 } });
      }
    } else {
      console.error("ar invoice table is locked.");
    }
  } catch (error) {
    await TableLock.update({ is_locked: false }, { where: { id: 1 } });
    console.error("Error during batch processing:", error);
    throw error;
  }
};

const processJobHistory = async () => {
  try {
    const lock = await TableLock.findOne({
      where: { id: 2 },
    });
    if (lock?.dataValues.is_locked === false) {
      const cond = await PostgresOrder.findOne({
        order: [["row_modified_on", "DESC"]],
        attributes: ["row_unique_id", "row_modified_on"],
      });
      if (cond) {
        const condition = {
          row_unique_id: { [Op.gt]: cond?.dataValues?.row_unique_id },
        };
        await TableLock.update({ is_locked: true }, { where: { id: 2 } });
        await processBatch(MssqlOrder, PostgresOrder, condition, BATCH_SIZE);
        await TableLock.update({ is_locked: false }, { where: { id: 2 } });
      }
    } else {
      console.error("job history table is locked.");
    }
  } catch (error) {
    await TableLock.update({ is_locked: false }, { where: { id: 2 } });
    console.error("Error during batch processing:", error);
    throw error;
  }
};

module.exports = {
  processBatch,
  processInvoice,
  processJobHistory,
};
