import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./style/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErreur("");

    try {
      const res = await axios.post("http://localhost:3000/api/users/login", {
        email,
        password: motDePasse,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("userChanged"));
      localStorage.setItem(
        "flashMessage",
        "Bienvenue, vous êtes maintenant connecté !"
      );
      navigate("/");
    } catch {
      setErreur("L'adresse e-mail ou le mot de passe est incorrect.");
    }
  };

  return (
    <div className="login-wrapper">
      {/* Colonne gauche */}
      <div className="login-left">
        <h1>
          Bienvenue sur <span>Immo</span>
        </h1>
        <p>
          Connectez-vous pour publier, gérer ou explorer des annonces
          immobilières partout à Madagascar.
        </p>
      </div>

      {/* Colonne droite - formulaire de connexion */}
      <div className="login-right">
        <div className="right-anatiny">
          <div className="login-box">
            <h2>Connexion</h2>
            <p className="intro-text">
              Entrez vos identifiants pour accéder à votre espace personnel.
            </p>

            {erreur && <p className="error-message">{erreur}</p>}

            <form onSubmit={handleLogin}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label>Mot de passe</label>
              <input
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
              />

              <button type="submit">Se connecter</button>
            </form>

            <div className="links">
              <p>
                Vous n'avez pas encore de compte ?{" "}
                <a href="/register">Créer un compte</a>
              </p>
              <p>
                <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
