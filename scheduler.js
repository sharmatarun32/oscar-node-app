const cron = require("node-cron");
const {
  processInvoice,
  processJobHistory,
} = require("./src/scripts/cronFunctions");

const syncData = async () => {
  try {
    await processInvoice();

    await processJobHistory();

    console.log("Data synced successfully.");
  } catch (error) {
    console.error("Error syncing data:", error);
  }
};

cron.schedule(process.env.CRON_SCHEDULE, syncData, {
  scheduled: true,
  timezone: "UTC",
});
