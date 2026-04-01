const Log = require("../models/Log");
const fs = require("fs");
const path = require("path");

const logAction = async (userId, action, ipAddress = "") => {
  try {
    // Écriture dans la base MongoDB
    await Log.create({ user: userId, action, ipAddress });
  } catch (err) {
    console.error("Erreur lors de la journalisation en base :", err);
  }

  // Écriture dans le fichier texte (en mode asynchrone)
  const logMessage = `[${new Date().toISOString()}] User:${userId} - Action: ${action} - IP: ${ipAddress}\n`;
  const logPath = path.join(__dirname, "../logs/actions.log");

  fs.appendFile(logPath, logMessage, (err) => {
    if (err) {
      console.error("Erreur journalisation fichier :", err);
    }
  });
};

module.exports = logAction;
