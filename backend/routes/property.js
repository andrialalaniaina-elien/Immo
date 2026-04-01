const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authentification");
const propertyController = require("../controllers/propertyController");
const upload = require("../middlewares/upload");

// ➕ Ajouter une propriété avec images
router.post(
  "/",
  auth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 30 },
  ]),
  propertyController.createProperty
);

// 📃 Liste de mes propriétés
router.get("/my", auth, propertyController.getMyProperties);

// 🔍 Voir une propriété par ID
router.get("/:id", propertyController.getPropertyById);

// 📃 Liste des propriétés avec filtres, recherche, tri, pagination
router.get("/", propertyController.getAllProperties);

// ✏️ Modifier une propriété (avec gestion images)
router.patch(
  "/:id",
  auth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 15 },
  ]),
  propertyController.updateProperty
);

// ❌ Supprimer une propriété
router.delete("/:id", auth, propertyController.deleteProperty);

// ❌ Supprimer une image individuelle d'une propriété
router.patch("/:id/image", auth, propertyController.deletePropertyImage);

// ✅ Marquer ou annuler "vendue"
router.put("/:id/toggle-sold", auth, propertyController.toggleSoldStatus);

module.exports = router;
