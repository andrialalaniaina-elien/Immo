import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./style/Register.css";

function MotDePasseOublie() {
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/auth/forgot-password", {
        email,
      });
      setStep(2);
      setInfo("Un code vous a été envoyé par email.");
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'envoi du code.");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/auth/verify-reset-code", {
        email,
        code,
      });
      setStep(3);
      setInfo(
        "Code vérifié. Vous pouvez maintenant définir un nouveau mot de passe."
      );
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Code invalide ou expiré.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    try {
      await axios.post("http://localhost:3000/api/auth/reset-password", {
        email,
        newPassword,
      });

      localStorage.setItem(
        "flashMessage",
        "Mot de passe mis à jour avec succès !"
      );
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.error || "Erreur lors de la réinitialisation."
      );
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-left">
        <h1>
          Réinitialiser <span>le mot de passe</span>
        </h1>
        <p>Vous avez oublié votre mot de passe ? Pas de souci.</p>
        <p className="login-link">
          <Link to="/login">Retour à la connexion</Link>
        </p>
      </div>

      <div className="register-right">
        <h2>Mot de passe oublié</h2>
        <p>Suivez les étapes pour réinitialiser votre mot de passe.</p>

        {error && <div className="error-message">{error}</div>}
        {info && <div className="info-message">{info}</div>}

        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <label htmlFor="email">Entrez votre adresse e-mail</label>
            <input
              type="email"
              name="email"
              placeholder="Ex : utilisateur@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Envoyer</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <label htmlFor="code">Code de vérification</label>
            <input
              type="text"
              name="code"
              placeholder="Ex : 123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button type="submit">Envoyer le code</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <label htmlFor="newPassword">Nouveau mot de passe</label>
            <input
              type="password"
              name="newPassword"
              placeholder="Entrez un mot de passe sécurisé"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <label htmlFor="confirmPassword">Confirmez le mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmez le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit">Réinitialiser le mot de passe</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default MotDePasseOublie;
