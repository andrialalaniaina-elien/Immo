require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDb } = require("./services/mongoose");

const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const propertyRoutes = require("./routes/property");
const authRoutes = require("./routes/auth");

const app = express();
const port = process.env.PORT || 3000; 

connectDb();

app.use(cors());
app.use(express.json());

// Servir les fichiers uploadés dans /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});
