import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./style/ProfilUtilisateur.css";
import ConfirmationPopup from "../components/ConfirmationPopup"; // Assure-toi du bon chemin

function ProfilUtilisateur() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
        setErreur("Erreur lors du chargement du profil.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUser();
    else setLoading(false);
  }, [token]);

  // Remplace window.confirm par popup personnalisé
  const handleDeleteAccount = () => {
    setShowPopup(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      await axios.delete("http://localhost:3000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("userChanged"));
      navigate("/register");
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      setErreur("Erreur lors de la suppression du compte.");
    } finally {
      setShowPopup(false);
    }
  };

  const cancelDeleteAccount = () => {
    setShowPopup(false);
  };

  if (loading) return <p>Chargement...</p>;
  if (erreur) return <p className="error">{erreur}</p>;
  if (!user) return <p>Aucun utilisateur trouvé.</p>;

  return (
    <div className="profil-container">
      <div className="profil-card">
        <img
          src={
            user?.avatar
              ? `http://localhost:3000/${user.avatar}`
              : "/profil-placeholder.jpg"
          }
          alt="Profil"
          className="profil-avatar"
        />

        <div className="profil-info">
          <h2>Informations personnelles</h2>
          <div className="profil-field">
            <span className="label">Nom :</span>
            <span>{user.name || "Non renseigné"}</span>
          </div>
          <div className="profil-field">
            <span className="label">Email :</span>
            <span>{user.email}</span>
          </div>
          <div className="profil-field">
            <span className="label">Téléphone :</span>
            <span>{user.phone || "Non renseigné"}</span>
          </div>
          <div className="profil-field">
            <span className="label">Adresse :</span>
            <span>{user.address || "Non renseignée"}</span>
          </div>
          <div className="profil-field">
            <span className="label">Inscrit depuis :</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="profil-btn">
            <button
              className="btn-primary"
              onClick={() => navigate("/profil/modifier")}
            >
              Modifier mon profil
            </button>
            <button className="btn-danger" onClick={handleDeleteAccount}>
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <ConfirmationPopup
          message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
          onConfirm={confirmDeleteAccount}
          onCancel={cancelDeleteAccount}
        />
      )}
    </div>
  );
}

export default ProfilUtilisateur;
