const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authentification");
const upload = require("../middlewares/upload");
const userController = require("../controllers/userController");

// Auth routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", auth, userController.logout);
router.get("/me", auth, userController.me);
router.patch("/me", auth, upload.single("avatar"), userController.updateUser);
router.delete("/me", auth, userController.deleteUser);

// Favoris
router.post("/me/favorites/:propertyId", auth, userController.toggleFavorite);
router.get("/me/favorites", auth, userController.getFavorites);

module.exports = router;
