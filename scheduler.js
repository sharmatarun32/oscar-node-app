const cron = require("node-cron");
require("dotenv").config();

const {
  processInvoice,
  processJobHistory,
} = require("./src/scripts/cronFunctions");

const syncData = async () => {
  try {
    console.log("---------sync data initialized------------");
    await processInvoice();

    await processJobHistory();

    console.log("Data synced successfully.");
  } catch (error) {
    console.error("Error syncing data:", error);
  }
};

const cronScd = process.env.CRON_SCHEDULE || '15 8 * * *';

cron.schedule(cronScd, syncData, {
  scheduled: true,
  timezone: "UTC",
});
