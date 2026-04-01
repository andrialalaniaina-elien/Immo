import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import ConfirmationPopup from "../components/ConfirmationPopup";
import "./style/MesFavoris.css";
import "./style/MesAnnonces.css";

const backendUrl = "http://localhost:3000";

function MesAnnonces() {
  const [annonces, setAnnonces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Popup confirmation suppression
  const [showPopup, setShowPopup] = useState(false);
  const [annonceToDelete, setAnnonceToDelete] = useState(null);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAnnonces = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/properties/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnnonces(res.data);
      } catch (err) {
        console.error(err);
        setErreur("Erreur lors du chargement des annonces.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonces();
  }, [navigate]);

  useEffect(() => {
    let result = [...annonces];
    if (search) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.location.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (type) result = result.filter((item) => item.type === type);
    if (prixMin)
      result = result.filter((item) => item.price >= Number(prixMin));
    if (prixMax)
      result = result.filter((item) => item.price <= Number(prixMax));
    if (sort === "asc") result.sort((a, b) => a.price - b.price);
    if (sort === "desc") result.sort((a, b) => b.price - a.price);
    setFiltered(result);
  }, [annonces, search, type, prixMin, prixMax, sort]);

  // Ouvrir popup confirmation suppression
  const handleDeleteClick = (id) => {
    setAnnonceToDelete(id);
    setShowPopup(true);
  };

  // Confirmer suppression
  const confirmDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      setShowPopup(false);
      setAnnonceToDelete(null);
      return;
    }

    try {
      await axios.delete(`${backendUrl}/api/properties/${annonceToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnonces((prev) =>
        prev.filter((annonce) => annonce._id !== annonceToDelete)
      );
      setMessage("✅ L'annonce a été supprimée avec succès !");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Erreur suppression :", error);
      alert("Erreur lors de la suppression.");
    } finally {
      setShowPopup(false);
      setAnnonceToDelete(null);
    }
  };

  // Annuler suppression
  const cancelDelete = () => {
    setShowPopup(false);
    setAnnonceToDelete(null);
  };

  const handleToggleSold = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.put(
        `${backendUrl}/api/properties/${id}/toggle-sold`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAnnonces((prev) =>
        prev.map((annonce) =>
          annonce._id === id ? { ...annonce, isSold: !annonce.isSold } : annonce
        )
      );
    } catch (error) {
      console.error("Erreur statut :", error);
      alert("❌ Une erreur est survenue.");
    }
  };

  return (
    <div className="favoris-container">
      <div className="favorisgauche">
        <div className="favoris-filters">
          <input
            type="text"
            placeholder="Recherche"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Tous types</option>
            <option value="maison">Maison</option>
            <option value="appartement">Appartement</option>
            <option value="terrain">Terrain</option>
          </select>
          <input
            type="number"
            placeholder="Prix min"
            value={prixMin}
            onChange={(e) => setPrixMin(e.target.value)}
          />
          <input
            type="number"
            placeholder="Prix max"
            value={prixMax}
            onChange={(e) => setPrixMax(e.target.value)}
          />
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">Trier par prix</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      <div className="favorisdroite">
        <h2>Mes Annonces Publiées</h2>

        {message && <div className="favoris-success">{message}</div>}

        {loading ? (
          <p>Chargement...</p>
        ) : erreur ? (
          <p className="favoris-erreur">{erreur}</p>
        ) : filtered.length === 0 ? (
          <p className="favoris-empty">Vous n'avez publié aucune annonce.</p>
        ) : (
          <div className="favoris-grid">
            {filtered.map((annonce) => (
              <div key={annonce._id} className="favoris-card">
                <Link to={`/annonce/${annonce._id}`} className="favoris-link">
                  <div className="favoris-image">
                    <img
                      src={
                        annonce.thumbnail
                          ? `${backendUrl}/${annonce.thumbnail}`
                          : "/house-placeholder.jpg"
                      }
                      alt={annonce.title}
                    />
                    {annonce.isSold && (
                      <div className="favorissold-badge">VENDU</div>
                    )}
                  </div>
                  <h3>{annonce.title}</h3>
                  <p>{Number(annonce.price).toLocaleString("fr-FR")} Ar</p>
                  <p>{annonce.location}</p>
                  <p>{annonce.type}</p>
                </Link>

                <div className="favoris-actions">
                  <button onClick={() => handleToggleSold(annonce._id)}>
                    {annonce.isSold ? "Annuler VENDUE" : "Marquer VENDUE"}
                  </button>
                  <button
                    onClick={() => navigate(`/annonce/modifier/${annonce._id}`)}
                    disabled={annonce.isSold}
                  >
                    Modifier
                  </button>
                  <button onClick={() => handleDeleteClick(annonce._id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popup confirmation suppression */}
      {showPopup && (
        <ConfirmationPopup
          message="Voulez-vous vraiment supprimer cette annonce ?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}

export default MesAnnonces;
