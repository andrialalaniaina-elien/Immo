const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const EmailVerificationCode = require("../models/EmailVerificationCode");
const User = require("../models/User"); // ✅ Import modèle User

// Envoi du code de confirmation avec vérification de l'email
router.post("/send-code", async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error:
          "Cet email est déjà utilisé. Veuillez vous connecter ou utiliser une autre adresse.",
      });
    }

    // 2. Générer un code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // expire en 20 min

    // 3. Sauvegarder le code
    await EmailVerificationCode.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    // 4. Transporteur
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 5. Envoyer email
    await transporter.sendMail({
      from: `"Immo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Code de confirmation",
      text: `Votre code de confirmation est : ${code}`,
    });

    res.json({ message: "Code envoyé à votre adresse e-mail." });
  } catch (err) {
    console.error("Erreur lors de l'envoi du code :", err);
    res.status(500).json({ error: "Erreur serveur lors de l'envoi du code." });
  }
});

// ✅ Vérification du code
router.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;

  try {
    const record = await EmailVerificationCode.findOne({ email });

    if (!record) {
      return res
        .status(400)
        .json({ error: "Aucun code trouvé pour cet email." });
    }

    if (record.code !== code) {
      return res.status(400).json({ error: "Code incorrect." });
    }

    if (new Date() > record.expiresAt) {
      return res
        .status(400)
        .json({ error: "Code expiré. Veuillez en demander un nouveau." });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur lors de la vérification du code :", err);
    res.status(500).json({ error: "Erreur serveur lors de la vérification." });
  }
});

// ✅ Réinitialisation mot de passe : envoi du code
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ error: "Aucun compte correspond avec cet e-mail" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000);

    await EmailVerificationCode.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    // ✅ Définir transporter ici aussi
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Immo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Code de réinitialisation de mot de passe",
      text: `Votre code : ${code}`,
    });

    res.json({ message: "Code envoyé à votre adresse email" });
  } catch (err) {
    console.error("Erreur forgot-password :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Vérification du code pour réinitialisation
router.post("/verify-reset-code", async (req, res) => {
  const { email, code } = req.body;

  try {
    const record = await EmailVerificationCode.findOne({ email });
    if (!record) return res.status(400).json({ error: "Code introuvable" });
    if (record.code !== code)
      return res.status(400).json({ error: "Code incorrect" });
    if (new Date() > record.expiresAt)
      return res.status(400).json({ error: "Code expiré" });

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur vérification reset code :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Changement du mot de passe
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Mot de passe mis à jour avec succès" });
  } catch (err) {
    console.error("Erreur reset-password :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
