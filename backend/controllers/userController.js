const User = require("../models/User");
const Property = require("../models/Property");
const logAction = require("../utils/logAction"); // Assure-toi d'avoir ce fichier

exports.register = async (req, res) => {
  try {
    const user = new User(req.body);
    const token = await user.generateAuthToken();

    await logAction(
      user._id,
      "register",
      `Nouvel utilisateur inscrit : ${user.email}`
    );

    res.status(201).json({ user, token });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();

    await logAction(user._id, "login", `Connexion utilisateur : ${user.email}`);

    res.json({ user, token });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((t) => t.token !== req.token);
    await req.user.save();

    await logAction(
      req.user._id,
      "logout",
      `Déconnexion utilisateur : ${req.user.email}`
    );

    res.json({ message: "Déconnecté" });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.me = async (req, res) => {
  res.json(req.user);
};

const bcrypt = require("bcryptjs");

exports.updateUser = async (req, res) => {
  const updates = Object.keys(req.body);

  // On ajoute 'currentPassword' uniquement pour pouvoir le lire (pas pour mettre à jour)
  const allowedUpdates = [
    "name",
    "email",
    "password",
    "address",
    "phone",
    "currentPassword",
  ];

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Modifications non autorisées." });
  }

  try {
    // Si on veut modifier le mot de passe, il faut d’abord vérifier l’ancien
    if (req.body.password) {
      if (!req.body.currentPassword) {
        return res.status(400).send({ error: "Ancien mot de passe requis." });
      }

      const isMatch = await req.user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .send({ error: "Ancien mot de passe incorrect." });
      }
    }

    // Mise à jour des champs sauf currentPassword
    updates.forEach((update) => {
      if (update !== "currentPassword") {
        req.user[update] = req.body[update];
      }
    });

    if (req.file) {
      req.user.avatar = `uploads/${req.file.filename}`;
    }

    await req.user.save();

    await logAction(
      req.user._id,
      "updateUser",
      `Mise à jour profil utilisateur`
    );

    res.send(req.user);
  } catch (error) {
    console.error("Erreur updateUser:", error);
    res.status(500).send(error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // Supprimer toutes les annonces de l'utilisateur
    await Property.deleteMany({ owner: userId });

    // Supprimer l'utilisateur lui-même
    await req.user.deleteOne();

    await logAction(
      userId,
      "deleteUser",
      "Suppression du compte utilisateur et ses annonces"
    );

    res.send({ message: "Utilisateur et ses annonces supprimés." });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).send({ error: "Erreur lors de la suppression du compte" });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const user = req.user;
    const propertyId = req.params.propertyId;

    const index = user.favorites.indexOf(propertyId);

    if (index === -1) {
      // Ajouter
      user.favorites.push(propertyId);
      await logAction(
        user._id,
        "addFavorite",
        `Ajout de la propriété ${propertyId} aux favoris`
      );
    } else {
      // Supprimer
      user.favorites.splice(index, 1);
      await logAction(
        user._id,
        "removeFavorite",
        `Suppression de la propriété ${propertyId} des favoris`
      );
    }

    await user.save();
    res.send({ favorites: user.favorites });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour des favoris." });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    await req.user.populate("favorites");
    res.send(req.user.favorites);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des favoris." });
  }
};
