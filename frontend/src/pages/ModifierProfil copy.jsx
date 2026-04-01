import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  const [avatarPreview, setAvatarPreview] = useState(""); // <-- Pour affichage
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

        setFormData((prev) => ({
          ...prev,
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          password: "",
          currentPassword: "",
        }));
        setInitialData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          password: "",
          currentPassword: "",
        });

        if (res.data.avatar) {
          // Si l'URL ne commence pas par http, on l'ajoute
          const url = res.data.avatar.startsWith("http")
            ? res.data.avatar
            : `http://localhost:3000/${res.data.avatar}`;
          setAvatarPreview(url);
        }

        setConfirmPassword("");
        setShowPasswordFields(false);
      } catch {
        setErreur("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUser();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // <- affiche immédiatement
    }
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
      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

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

  if (loading) return <p>Chargement...</p>;

  function formatPhone(value) {
    const digits = value.replace(/\D/g, "").replace(/^261/, "");
    const formatted = digits
      .replace(/^(\d{2})(\d{2})(\d{3})(\d{2}).*/, "$1 $2 $3 $4")
      .trim();
    return `+261 ${formatted}`;
  }

  function handlePhoneChange(e) {
    let input = e.target.value.replace(/\D/g, "");
    if (!input.startsWith("261")) {
      input = "261" + input;
    }
    if (input.length > 12) {
      input = input.slice(0, 12);
    }
    setFormData((prev) => ({
      ...prev,
      phone: "+" + input,
    }));
  }

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      setConfirmPassword("");
      setAvatarFile(null);
      setErreur("");
      setSuccess("");
      setShowPasswordFields(false);
      setAvatarPreview("");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: "2rem" }}>
      <h2>Modifier le profil</h2>

      {erreur && <p style={{ color: "red" }}>{erreur}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <button
        type="button"
        onClick={() => {
          if (showPasswordFields) {
            setFormData((prev) => ({
              ...prev,
              currentPassword: "",
              password: "",
            }));
            setConfirmPassword("");
            setShowPasswordFields(false);
          } else {
            setShowPasswordFields(true);
          }
        }}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: showPasswordFields ? "#999" : "#0077cc",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
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
        <label>
          Nom :
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nom complet"
          />
        </label>

        <label>
          Email :
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Adresse email"
            required
          />
        </label>

        <label>
          Téléphone :
          <input
            type="tel"
            name="phone"
            value={formatPhone(formData.phone)}
            onChange={handlePhoneChange}
            placeholder="+261 XX XX XXX XX"
            maxLength={17}
          />
        </label>

        <label>
          Adresse :
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Adresse"
          />
        </label>

        {showPasswordFields && (
          <>
            <label>
              Ancien mot de passe :
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword || ""}
                onChange={handleChange}
                placeholder="Mot de passe actuel"
              />
            </label>
            <label>
              Nouveau mot de passe :
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nouveau mot de passe"
              />
            </label>
            <label>
              Confirmer le mot de passe :
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez le mot de passe"
              />
            </label>
          </>
        )}

        <label>
          Photo de profil :
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>

        {avatarPreview && (
          <div style={{ marginBottom: "1rem" }}>
            <img
              src={avatarPreview}
              alt="Aperçu de la photo"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1rem",
          }}
        >
          <button
            type="submit"
            style={{
              padding: "0.6rem 1.2rem",
              backgroundColor: "#0077cc",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Enregistrer les modifications
          </button>

          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: "0.6rem 1.2rem",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Réinitialiser
          </button>
        </div>
      </form>
    </div>
  );
}

export default ModifierProfil;
