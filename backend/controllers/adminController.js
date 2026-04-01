const fs = require("fs");
const Property = require("../models/Property");
const User = require("../models/User");
const path = require("path");

// Fonction simple de journalisation dans un fichier texte
const logAction = (userId, action, details) => {
  const logMessage = `[${new Date().toISOString()}] User:${userId} - Action: ${action} - Details: ${details}\n`;
  const logPath = path.join(__dirname, "../logs/actions.log");
  fs.appendFile(logPath, logMessage, (err) => {
    if (err) console.error("Erreur journalisation:", err);
  });
};

// 🟢 Route GET pour récupérer toutes les annonces (admin uniquement)
exports.getAllPropertiesAdmin = async (req, res) => {
  try {
    const properties = await Property.find().populate("owner", "email name");
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Valider une propriété (admin uniquement)
exports.validateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Annonce introuvable" });
    }

    property.validated = !property.validated; // toggle true/false
    await property.save();

    // Journalisation
    logAction(
      req.user._id,
      "validateProperty",
      `Annonce ${property._id} validée=${property.validated}`
    );

    res.status(200).json({
      message: `Annonce ${property.validated ? "validée" : "invalide"}`,
      property,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ❌ Supprimer une annonce (admin uniquement, avec suppression d’images)
exports.adminDeleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Annonce non trouvée" });
    }

    // 🔥 Supprimer toutes les images associées
    await Promise.all(
      property.images.map(
        (imgPath) => fs.promises.unlink(imgPath).catch(() => {}) // ignore si fichier introuvable
      )
    );

    // 🧨 Supprimer la propriété de la base
    await property.deleteOne();

    // Journalisation
    logAction(
      req.user._id,
      "adminDeleteProperty",
      `Annonce ${property._id} supprimée`
    );

    res.json({ message: "Annonce supprimée par l’admin", property });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Afficher tout les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -tokens"); // cacher mdp
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Supprimer un utilisateur par l'admin (sauf admin)
exports.deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    if (user.role === "admin") {
      return res
        .status(403)
        .json({ error: "Impossible de supprimer un administrateur" });
    }

    // 🔥 Supprimer l'avatar s’il existe
    if (user.avatar) {
      await fs.promises.unlink(user.avatar).catch(() => {});
    }

    // 🏠 Supprimer toutes les propriétés de cet utilisateur + leurs images
    const properties = await Property.find({ owner: user._id });
    for (const property of properties) {
      // Supprimer les images de chaque propriété
      await Promise.all(
        property.images.map((imgPath) =>
          fs.promises.unlink(imgPath).catch(() => {})
        )
      );
      await property.deleteOne(); // Supprimer la propriété de MongoDB
    }

    // ❌ Supprimer l'utilisateur
    await user.deleteOne();

    // Journalisation
    logAction(
      req.user._id,
      "deleteUserByAdmin",
      `Utilisateur ${user._id} supprimé avec ${properties.length} annonces`
    );

    res.json({
      message: "Utilisateur et ses annonces supprimés",
      user,
      deletedProperties: properties.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Rechercher des utilisateurs par nom ou email (admin uniquement)
exports.searchUsers = async (req, res) => {
  const { search } = req.query; // on récupère 'search' depuis la query string
  try {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } }, // utiliser 'search' ici
        { email: { $regex: search, $options: "i" } }, // utiliser 'search' ici
      ],
      role: { $ne: "admin" }, // éviter de retourner les admins
    }).select("-password -tokens"); // ne pas renvoyer mot de passe ni tokens

    res.json(users); // renvoyer directement la liste d'utilisateurs (tableau)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//consulter le profil complet d’un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // exclut le mot de passe
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
