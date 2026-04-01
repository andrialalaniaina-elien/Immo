import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortOrderUsers, setSortOrderUsers] = useState("desc");

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Charger les utilisateurs
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

    // Charger les annonces
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
        {}, // pas besoin d'envoyer un body
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Mettre à jour dynamiquement la propriété modifiée
      setProperties((prev) =>
        prev.map((p) =>
          p._id === propertyId ? { ...p, validated: !currentValidated } : p
        )
      );
    } catch (error) {
      console.error("Erreur lors de la validation :", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const confirmDelete = window.confirm(
        "Voulez-vous vraiment supprimer cet utilisateur ?"
      );
      if (!confirmDelete) return;

      await axios.delete(`http://localhost:3000/api/admin/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Supprimer l'utilisateur de la liste localement
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer cette annonce ?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:3000/api/admin/${propertyId}/admin`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Mettre à jour la liste localement
      setProperties((prev) => prev.filter((p) => p._id !== propertyId));
      alert("Annonce supprimée avec succès.");
    } catch (error) {
      console.error("Erreur suppression annonce :", error);
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Espace Admin</h1>

      {/* Utilisateurs */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Utilisateurs</h2>
        <div className="mb-4">
          <label htmlFor="sortOrderUsers" className="mr-2 font-medium">
            Trier utilisateurs par date d'inscription :
          </label>
          <select
            id="sortOrderUsers"
            value={sortOrderUsers}
            onChange={(e) => setSortOrderUsers(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="desc">Plus récents</option>
            <option value="asc">Plus anciens</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Nom</th>
                <th className="px-4 py-2 border">Rôle</th>
                <th className="px-4 py-2 border">Adresse</th>
                <th className="px-4 py-2 border">Téléphone</th>
                <th className="px-4 py-2 border">Date d'inscription</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...users]
                .sort((a, b) => {
                  return sortOrderUsers === "asc"
                    ? new Date(a.createdAt) - new Date(b.createdAt)
                    : new Date(b.createdAt) - new Date(a.createdAt);
                })
                .map((user) => (
                  <tr key={user._id} className="text-center">
                    <td className="border px-4 py-2">{user.email}</td>
                    <td className="border px-4 py-2">{user.name || "-"}</td>
                    <td className="border px-4 py-2">{user.role}</td>
                    <td className="border px-4 py-2">{user.address || "-"}</td>
                    <td className="border px-4 py-2">{user.phone || "-"}</td>
                    <td className="border px-4 py-2">
                      {formatDistanceToNow(new Date(user.createdAt), {
                        locale: fr,
                        addSuffix: true,
                      })}
                    </td>
                    <td className="border px-4 py-2 flex justify-center gap-2">
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Supprimer
                      </button>
                      <Link
                        to={`/profil/${user._id}`}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
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

      {/* Annonces */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Annonces</h2>
        <div className="mb-4">
          <label htmlFor="sortOrder" className="mr-2 font-medium">
            Trier par date :
          </label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="desc">Plus récentes</option>
            <option value="asc">Plus anciennes</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Titre</th>
                <th className="px-4 py-2 border">Ville</th>
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">Prix</th>
                <th className="px-4 py-2 border">Date publication</th>
                <th className="px-4 py-2 border">Validée</th>
                <th className="px-4 py-2 border">Propriétaire</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...properties]
                .sort((a, b) => {
                  return sortOrder === "asc"
                    ? new Date(a.createdAt) - new Date(b.createdAt)
                    : new Date(b.createdAt) - new Date(a.createdAt);
                })
                .map((prop) => (
                  <tr key={prop._id} className="text-center">
                    <td className="border px-4 py-2">{prop.title}</td>
                    <td className="border px-4 py-2">{prop.location || "-"}</td>
                    <td className="border px-4 py-2">{prop.propertyType}</td>
                    <td className="border px-4 py-2">{prop.price} Ar</td>
                    <td className="border px-4 py-2">
                      {formatDistanceToNow(new Date(prop.createdAt), {
                        locale: fr,
                        addSuffix: true,
                      })}
                    </td>
                    <td className="border px-4 py-2">
                      {prop.validated ? (
                        <button
                          onClick={() =>
                            handleValidate(prop._id, prop.validated)
                          }
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 text-sm"
                        >
                          ✅OUI Annuler validation
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleValidate(prop._id, prop.validated)
                          }
                          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
                        >
                          ❌ Non validée: Valider
                        </button>
                      )}
                    </td>

                    <td className="border px-4 py-2">
                      {prop.owner?.name || prop.owner?.email || "-"}
                    </td>
                    <td className="border px-4 py-2 flex flex-col gap-2 items-center">
                      <Link
                        to={`/annonce/${prop._id}`}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm"
                      >
                        Voir l'annonce
                      </Link>

                      <button
                        onClick={() => handleDeleteProperty(prop._id)}
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-sm"
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
    </div>
  );
};

export default AdminDashboard;
