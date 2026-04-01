import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./style/Register.css";

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = form, 2 = code
  const [code, setCode] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "+261 ",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numeric = value.replace(/\D/g, "");
      const withoutPrefix = numeric.startsWith("261")
        ? numeric.slice(3)
        : numeric;
      const trimmed = withoutPrefix.slice(0, 9);
      let formatted = "+261";
      if (trimmed.length > 0) formatted += " " + trimmed.slice(0, 2);
      if (trimmed.length > 2) formatted += " " + trimmed.slice(2, 4);
      if (trimmed.length > 4) formatted += " " + trimmed.slice(4, 7);
      if (trimmed.length > 7) formatted += " " + trimmed.slice(7, 9);

      setForm({ ...form, phone: formatted });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSendCode = async () => {
    try {
      await axios.post("http://localhost:3000/api/auth/send-code", {
        email: form.email,
      });
      setStep(2);
      setInfo("Un code de confirmation vous a été envoyé par email.");
      setError("");
    } catch (err) {
      const message =
        err.response?.data?.error ||
        "Impossible d’envoyer le code. Vérifiez l’adresse email.";

      setError(message);
      setInfo("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      // Étape 1 = Validation initiale et envoi du code
      if (form.password !== form.confirmPassword) {
        return setError("Les mots de passe ne correspondent pas");
      }

      const numericPhone = form.phone.replace(/\D/g, "");
      const withoutPrefix = numericPhone.startsWith("261")
        ? numericPhone.slice(3)
        : numericPhone;
      if (withoutPrefix.length !== 9) {
        return setError("Veuillez entrer un numéro de téléphone complet.");
      }

      handleSendCode();
    } else {
      // Étape 2 = Vérifier le code puis inscrire
      try {
        const res = await axios.post(
          "http://localhost:3000/api/auth/verify-code",
          {
            email: form.email,
            code,
          }
        );

        if (res.data.success) {
          const registerRes = await axios.post(
            "http://localhost:3000/api/users/register",
            form
          );
          localStorage.setItem("token", registerRes.data.token);
          localStorage.setItem("user", JSON.stringify(registerRes.data.user));
          window.dispatchEvent(new Event("userChanged"));
          localStorage.setItem(
            "flashMessage",
            "Bienvenue, vous êtes maintenant connecté !"
          );

          navigate("/");
        }
      } catch (err) {
        console.error(err);
        setError("Le code est invalide ou a expiré.");
      }
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-left">
        <h1>
          Bienvenue sur <span>Immo</span>
        </h1>
        <p>
          Créez un compte gratuitement pour publier ou explorer des annonces
          immobilières partout à Madagascar.
        </p>
        <p className="login-link">
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </div>

      <div className="register-right">
        <h2>Créer un compte</h2>

        {info && <div className="info-message">{info}</div>}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <label htmlFor="name">Nom complet</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <label htmlFor="email">Adresse e-mail</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <label htmlFor="phone">Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (
                    e.target.selectionStart < 5 &&
                    (e.key === "Backspace" || e.key === "ArrowLeft")
                  ) {
                    e.preventDefault();
                  }
                }}
                required
              />

              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <label htmlFor="confirmPassword">Confirmer mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </>
          )}

          {step === 2 && (
            <>
              <label htmlFor="code">Code de vérification</label>
              <input
                type="text"
                name="code"
                placeholder="Ex : 123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </>
          )}

          <p className="legal-text">
            En créant un compte, vous acceptez nos{" "}
            <a href="#">conditions d'utilisation</a> et notre{" "}
            <a href="#">politique de confidentialité</a>.
          </p>

          {error && <div className="error-message">{error}</div>}

          <button type="submit">
            {step === 1 ? "S'inscrire" : "Valider et s'inscrire"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
