import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./style/ProfilUtilisateurAdmin.css";

const ProfilUtilisateurAdmin = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/admin/profil/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data);
      } catch (error) {
        setErreur("Impossible de charger le profil.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, token]);

  if (loading)
    return <p className="admin-error admin-loading">Chargement...</p>;
  if (erreur) return <p className="admin-error">{erreur}</p>;
  if (!user) return <p className="admin-error">Aucun utilisateur trouvé.</p>;

  return (
    <div className="admin-profil-container">
      <div className="admin-profil-card">
        <img
          src={
            user?.avatar
              ? `http://localhost:3000/${user.avatar}`
              : "/profil-placeholder.jpg"
          }
          alt="Profil utilisateur"
          className="admin-profil-avatar"
        />

        <div className="admin-profil-info">
          <h2 className="admin-profil-title">Informations personnelles</h2>

          <div className="admin-profil-field">
            <span className="admin-label">Nom :</span>
            <span>{user.name || "Non renseigné"}</span>
          </div>

          <div className="admin-profil-field">
            <span className="admin-label">Email :</span>
            <span>{user.email}</span>
          </div>

          <div className="admin-profil-field">
            <span className="admin-label">Téléphone :</span>
            <span>{user.phone || "Non renseigné"}</span>
          </div>

          <div className="admin-profil-field">
            <span className="admin-label">Adresse :</span>
            <span>{user.address || "Non renseignée"}</span>
          </div>

          <div className="admin-profil-field">
            <span className="admin-label">Rôle :</span>
            <span>
              {user.role === "admin" ? "Administrateur" : "Utilisateur"}
            </span>
          </div>

          <div className="admin-profil-field">
            <span className="admin-label">Inscrit depuis :</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="admin-profil-btn">
            <Link to="/admin" className="admin-btn-primary">
              ⬅ Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilUtilisateurAdmin;
