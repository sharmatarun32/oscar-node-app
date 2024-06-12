const { postgresSequelize, mssqlSequelize } = require("../config/sequelize");
const Sequelize = require("sequelize");
const MssqlOrder = require("../models/MssqlOrder");
const MssqlInvoice = require("../models/MssqlInvoice");
const PostgresOrder = require("../models/PostgresOrder");
const PostgresInvoice = require("../models/PostgresInvoice");
const TableLock = require("../models/TableLock");

const syncModels = async () => {
  try {
    await mssqlSequelize.sync({ force: false, alter: false });
    console.log("MSSQL models synced.");

    await postgresSequelize.sync();
    console.log("PostgreSQL models synced.");
  } catch (error) {
    console.error("Error syncing models:", error);
  }
};

syncModels();
