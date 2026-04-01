const mongoose = require("mongoose");

async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Base de données MongoDB connectée !");
  } catch (e) {
    console.error("❌ Erreur de connexion à MongoDB :", e);
    process.exit(1);
  }
}

module.exports = { connectDb };
