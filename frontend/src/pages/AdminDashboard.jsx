import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import ConfirmationPopup from "../components/ConfirmationPopup"; // adapte le chemin
import "./style/AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [sortOrderUsers, setSortOrderUsers] = useState("desc");
  const [sortOrderProperties, setSortOrderProperties] = useState("desc");

  // viewMode = null (par défaut), "allUsers", "allProperties"
  const [viewMode, setViewMode] = useState(null);

  const token = localStorage.getItem("token");

  // États pour gérer les popups de confirmation
  const [showUserConfirm, setShowUserConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [showPropertyConfirm, setShowPropertyConfirm] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/admin/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Erreur chargement utilisateurs:", error);
      }
    };

    const fetchProperties = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/admin/properties",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProperties(res.data);
      } catch (error) {
        console.error("Erreur chargement propriétés:", error);
      }
    };

    fetchUsers();
    fetchProperties();
  }, [token]);

  const handleValidate = async (propertyId, currentValidated) => {
    try {
      await axios.patch(
        `http://localhost:3000/api/admin/${propertyId}/validate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProperties((prev) =>
        prev.map((p) =>
          p._id === propertyId ? { ...p, validated: !currentValidated } : p
        )
      );
    } catch (error) {
      console.error("Erreur lors de la validation :", error);
    }
  };

  // Ouverture popup suppression utilisateur
  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setShowUserConfirm(true);
  };

  // Confirmation suppression utilisateur
  const confirmDeleteUser = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/admin/${userToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prev) => prev.filter((u) => u._id !== userToDelete));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);
    } finally {
      setShowUserConfirm(false);
      setUserToDelete(null);
    }
  };

  // Annulation suppression utilisateur
  const cancelDeleteUser = () => {
    setShowUserConfirm(false);
    setUserToDelete(null);
  };

  // Ouverture popup suppression annonce
  const handleDeleteProperty = (propertyId) => {
    setPropertyToDelete(propertyId);
    setShowPropertyConfirm(true);
  };

  // Confirmation suppression annonce
  const confirmDeleteProperty = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/admin/${propertyToDelete}/admin`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProperties((prev) => prev.filter((p) => p._id !== propertyToDelete));
      alert("Annonce supprimée avec succès.");
    } catch (error) {
      console.error("Erreur suppression annonce :", error);
      alert("Erreur lors de la suppression.");
    } finally {
      setShowPropertyConfirm(false);
      setPropertyToDelete(null);
    }
  };

  // Annulation suppression annonce
  const cancelDeleteProperty = () => {
    setShowPropertyConfirm(false);
    setPropertyToDelete(null);
  };

  // Tri + limitation inchangés, comme dans ton code original
  const displayedUsers = [...users]
    .sort((a, b) =>
      sortOrderUsers === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    )
    .slice(0, viewMode === null ? 5 : users.length);

  const displayedProperties = [...properties]
    .sort((a, b) =>
      sortOrderProperties === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    )
    .slice(0, viewMode === null ? 5 : properties.length);

  return (
    <div className="admin-dashboard-container p-6">
      <h1 className="admin-dashboard-title">Espace Admin</h1>

      {/* Affichage des totaux */}
      <div className="admin-dashboard-totals">
        <p>
          Total utilisateurs : <strong>{users.length}</strong>
        </p>
        <p>
          Total annonces : <strong>{properties.length}</strong>
        </p>
      </div>

      <div className="admin-dashboard-buttons mb-6 flex gap-4">
        <button
          onClick={() =>
            setViewMode((prev) => (prev === "allUsers" ? null : "allUsers"))
          }
          className={`admin-dashboard-btn-toggle ${
            viewMode === "allUsers" ? "active" : ""
          }`}
        >
          {viewMode === "allUsers" ? "Retour" : "Voir tous les utilisateurs"}
        </button>

        <button
          onClick={() =>
            setViewMode((prev) =>
              prev === "allProperties" ? null : "allProperties"
            )
          }
          className={`admin-dashboard-btn-toggle ${
            viewMode === "allProperties" ? "active" : ""
          }`}
        >
          {viewMode === "allProperties" ? "Retour" : "Voir toutes les annonces"}
        </button>
      </div>

      {/* Affichage des utilisateurs uniquement */}
      {(viewMode === null || viewMode === "allUsers") && (
        <section className="admin-dashboard-section mb-10">
          <h2 className="admin-dashboard-subtitle">Utilisateurs</h2>
          <div className="admin-dashboard-sort mb-4">
            <label
              htmlFor="sortOrderUsers"
              className="admin-dashboard-label mr-2"
            >
              Trier utilisateurs par date d'inscription :
            </label>
            <select
              id="sortOrderUsers"
              value={sortOrderUsers}
              onChange={(e) => setSortOrderUsers(e.target.value)}
              className="admin-dashboard-select"
            >
              <option value="desc">Plus récents</option>
              <option value="asc">Plus anciens</option>
            </select>
          </div>

          <div className="admin-dashboard-table-wrapper">
            <table className="admin-dashboard-table">
              <thead className="admin-dashboard-thead">
                <tr>
                  <th className="admin-dashboard-th">Email</th>
                  <th className="admin-dashboard-th">Nom</th>
                  <th className="admin-dashboard-th">Rôle</th>
                  <th className="admin-dashboard-th">Adresse</th>
                  <th className="admin-dashboard-th">Téléphone</th>
                  <th className="admin-dashboard-th">Date d'inscription</th>
                  <th className="admin-dashboard-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map((user) => (
                  <tr key={user._id} className="admin-dashboard-tr">
                    <td className="admin-dashboard-td">{user.email}</td>
                    <td className="admin-dashboard-td">{user.name || "-"}</td>
                    <td className="admin-dashboard-td">{user.role}</td>
                    <td className="admin-dashboard-td">
                      {user.address || "-"}
                    </td>
                    <td className="admin-dashboard-td">{user.phone || "-"}</td>
                    <td className="admin-dashboard-td">
                      {formatDistanceToNow(new Date(user.createdAt), {
                        locale: fr,
                        addSuffix: true,
                      })}
                    </td>
                    <td className="admin-dashboard-td admin-dashboard-actions">
                      <button
                        className="admin-dashboard-btn-danger"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Supprimer
                      </button>
                      <Link
                        to={`/profil/${user._id}`}
                        className="admin-dashboard-btn-primary"
                      >
                        Voir profil
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Affichage des annonces uniquement */}
      {(viewMode === null || viewMode === "allProperties") && (
        <section className="admin-dashboard-section">
          <h2 className="admin-dashboard-subtitle">Annonces</h2>
          <div className="admin-dashboard-sort mb-4">
            <label
              htmlFor="sortOrderProperties"
              className="admin-dashboard-label mr-2"
            >
              Trier par date :
            </label>
            <select
              id="sortOrderProperties"
              value={sortOrderProperties}
              onChange={(e) => setSortOrderProperties(e.target.value)}
              className="admin-dashboard-select"
            >
              <option value="desc">Plus récentes</option>
              <option value="asc">Plus anciennes</option>
            </select>
          </div>

          <div className="admin-dashboard-table-wrapper">
            <table className="admin-dashboard-table">
              <thead className="admin-dashboard-thead">
                <tr>
                  <th className="admin-dashboard-th">Titre</th>
                  <th className="admin-dashboard-th">Ville</th>
                  <th className="admin-dashboard-th">Type</th>
                  <th className="admin-dashboard-th">Prix</th>
                  <th className="admin-dashboard-th">Date publication</th>
                  <th className="admin-dashboard-th">Validée</th>
                  <th className="admin-dashboard-th">Propriétaire</th>
                  <th className="admin-dashboard-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedProperties.map((prop) => (
                  <tr key={prop._id} className="admin-dashboard-tr">
                    <td className="admin-dashboard-td">{prop.title}</td>
                    <td className="admin-dashboard-td">
                      {prop.location || "-"}
                    </td>
                    <td className="admin-dashboard-td">{prop.propertyType}</td>
                    <td className="admin-dashboard-td">{prop.price} Ar</td>
                    <td className="admin-dashboard-td">
                      {formatDistanceToNow(new Date(prop.createdAt), {
                        locale: fr,
                        addSuffix: true,
                      })}
                    </td>
                    <td className="admin-dashboard-td">
                      {prop.validated ? (
                        <button
                          onClick={() =>
                            handleValidate(prop._id, prop.validated)
                          }
                          className="admin-dashboard-btn-warning"
                        >
                          ✅OUI Annuler validation
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleValidate(prop._id, prop.validated)
                          }
                          className="admin-dashboard-btn-success"
                        >
                          ❌ Non validée: Valider
                        </button>
                      )}
                    </td>
                    <td className="admin-dashboard-td">
                      {prop.owner?.name || prop.owner?.email || "-"}
                    </td>
                    <td className="admin-dashboard-td admin-dashboard-actions admin-dashboard-actions-column">
                      <Link
                        to={`/annonce/${prop._id}`}
                        className="admin-dashboard-btn-primary"
                      >
                        Voir l'annonce
                      </Link>
                      <button
                        onClick={() => handleDeleteProperty(prop._id)}
                        className="admin-dashboard-btn-danger"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Popups de confirmation */}
      {showUserConfirm && (
        <ConfirmationPopup
          message="Voulez-vous vraiment supprimer cet utilisateur ?"
          onConfirm={confirmDeleteUser}
          onCancel={cancelDeleteUser}
        />
      )}

      {showPropertyConfirm && (
        <ConfirmationPopup
          message="Voulez-vous vraiment supprimer cette annonce ?"
          onConfirm={confirmDeleteProperty}
          onCancel={cancelDeleteProperty}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
