const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authentification");
const adminController = require("../controllers/adminController");
const isAdmin = require("../middlewares/isAdmin");

router.delete("/:id", auth, isAdmin, adminController.deleteUserByAdmin);
router.get("/", auth, isAdmin, adminController.getAllUsers);

// Validation par l'Admin
router.patch("/:id/validate", auth, isAdmin, adminController.validateProperty);

router.get("/properties", auth, isAdmin, adminController.getAllPropertiesAdmin);

// ❌ Supprimer une annonce (admin)
router.delete("/:id/admin", auth, isAdmin, adminController.adminDeleteProperty);

router.get("/search", auth, isAdmin, adminController.searchUsers);
router.get("/profil/:id", auth, isAdmin, adminController.getUserById);

module.exports = router;
