import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./style/ModifierProfil.css";

function ModifierProfil() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    currentPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [initialAvatarUrl, setInitialAvatarUrl] = useState(""); // <-- ajouté pour garder l'url initiale
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [initialData, setInitialData] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          password: "",
          currentPassword: "",
        });
        setInitialData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          password: "",
          currentPassword: "",
        });

        if (res.data.avatar) {
          const url = res.data.avatar.startsWith("http")
            ? res.data.avatar
            : `http://localhost:3000/${res.data.avatar}`;
          setAvatarPreview(url);
          setInitialAvatarUrl(url); // <-- on garde l'url initiale ici
        } else {
          const placeholder = "/profil-placeholder.jpg"; // image par défaut dans public
          setAvatarPreview(placeholder);
          setInitialAvatarUrl(placeholder);
        }
      } catch {
        setErreur("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUser();
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "").replace(/^261/, "");
    const formatted = digits
      .replace(/^(\d{2})(\d{2})(\d{3})(\d{2}).*/, "$1 $2 $3 $4")
      .trim();
    return `+261 ${formatted}`;
  };

  const handlePhoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    if (!input.startsWith("261")) {
      input = "261" + input;
    }
    if (input.length > 12) {
      input = input.slice(0, 12);
    }
    setFormData((prev) => ({ ...prev, phone: "+" + input }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setSuccess("");

    try {
      if (formData.phone) {
        const malagasyPhoneRegex = /^\+261(32|33|34|38)\d{7}$/;
        if (!malagasyPhoneRegex.test(formData.phone)) {
          setErreur(
            "Numéro de téléphone invalide. Format attendu : +26134xxxxxxx"
          );
          return;
        }
      }

      if (showPasswordFields) {
        if (!formData.currentPassword) {
          setErreur("Veuillez saisir votre ancien mot de passe.");
          return;
        }
        if (formData.password.length < 6) {
          setErreur(
            "Le nouveau mot de passe doit contenir au moins 6 caractères."
          );
          return;
        }
        if (formData.password !== confirmPassword) {
          setErreur("Les mots de passe ne correspondent pas.");
          return;
        }
      }

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      if (avatarFile) data.append("avatar", avatarFile);

      await axios.patch("http://localhost:3000/api/users/me", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Profil mis à jour avec succès !");
      setTimeout(() => navigate("/profil"), 1500);
    } catch (err) {
      setErreur(
        err.response?.data?.error || "Erreur lors de la mise à jour du profil."
      );
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      setConfirmPassword("");
      setAvatarFile(null);
      setErreur("");
      setSuccess("");
      setShowPasswordFields(false);
      setAvatarPreview(initialAvatarUrl || ""); // <-- remet l'avatar initial
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="modifier-container">
      {erreur && <p className="errorr">{erreur}</p>}
      {success && <p className="successs">{success}</p>}
      <div className="modifier-card">
        <div
          className="modifier-avatar-section"
          style={{ position: "relative" }}
        >
          {avatarPreview && (
            <>
              <img
                src={avatarPreview}
                alt="Aperçu"
                className="modifier-avatar"
              />
              <button
                type="button"
                className="btn-change-avatar"
                onClick={() => document.getElementById("avatarInput").click()}
              >
                Changer image
              </button>
            </>
          )}
          {/* Input file caché */}
          <input
            id="avatarInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        <div className="modifier-form-section">
          <h2>Modifier le profil</h2>

          <button
            type="button"
            className="btn-password-toggle"
            onClick={() => {
              setShowPasswordFields(!showPasswordFields);
              if (!showPasswordFields) {
                setFormData((prev) => ({
                  ...prev,
                  currentPassword: "",
                  password: "",
                }));
                setConfirmPassword("");
              }
            }}
          >
            {showPasswordFields
              ? "Ne pas changer le mot de passe"
              : "Modifier mot de passe"}
          </button>

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            encType="multipart/form-data"
          >
            <div className="modifier-field">
              <label>Nom :</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="modifier-field">
              <label>Email :</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="modifier-field">
              <label>Téléphone :</label>
              <input
                type="tel"
                name="phone"
                value={formatPhone(formData.phone)}
                onChange={handlePhoneChange}
                maxLength={17}
              />
            </div>

            <div className="modifier-field">
              <label>Adresse :</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            {showPasswordFields && (
              <>
                <div className="modifier-field">
                  <label>Ancien mot de passe :</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </div>
                <div className="modifier-field">
                  <label>Nouveau mot de passe :</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div className="modifier-field">
                  <label>Confirmer le mot de passe :</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="modifier-btns">
              <button type="submit" className="btn-primary">
                Enregistrer
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleReset}
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModifierProfil;
