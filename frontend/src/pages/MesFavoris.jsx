import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import ConfirmationPopup from "../components/ConfirmationPopup";
import "./style/MesFavoris.css";

const backendUrl = "http://localhost:3000";

function MesFavoris() {
  const [favoris, setFavoris] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();

  // Popup confirmation
  const [showPopup, setShowPopup] = useState(false);
  const [propertyToRemove, setPropertyToRemove] = useState(null);

  // Filtres
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [sort, setSort] = useState("");

  // Chargement des favoris
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchFavoris = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/users/me/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFavoris(res.data);
      } catch (err) {
        console.error(err);
        setErreur("Erreur lors du chargement de vos favoris.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavoris();
  }, [navigate]);

  // Filtrage local
  useEffect(() => {
    let result = [...favoris];
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
  }, [favoris, search, type, prixMin, prixMax, sort]);

  // Ouverture du popup de confirmation
  const handleRemoveClick = (propertyId) => {
    setPropertyToRemove(propertyId);
    setShowPopup(true);
  };

  // Confirmation suppression
  const confirmRemove = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Veuillez vous connecter.");
      setShowPopup(false);
      setPropertyToRemove(null);
      return;
    }

    try {
      await axios.post(
        `${backendUrl}/api/users/me/favorites/${propertyToRemove}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFavoris((prev) =>
        prev.filter((item) => item._id !== propertyToRemove)
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors du retrait des favoris.");
    } finally {
      setShowPopup(false);
      setPropertyToRemove(null);
    }
  };

  // Annuler suppression
  const cancelRemove = () => {
    setShowPopup(false);
    setPropertyToRemove(null);
  };

  return (
    <div className="favoris-container">
      <div className="favorisgauche">
        {/* Filtres */}
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
        <h2>💖 Mes Annonces Favoris</h2>
        {/* Résultats */}
        {loading ? (
          <p>Chargement...</p>
        ) : erreur ? (
          <p className="favoris-erreur">{erreur}</p>
        ) : filtered.length === 0 ? (
          <p className="favoris-empty">Vous n'avez ucune annonce favoris</p>
        ) : (
          <div className="favoris-grid">
            {filtered.map((property) => (
              <div key={property._id} className="favoris-card">
                <Link to={`/annonce/${property._id}`} className="favoris-link">
                  <div className="favoris-image">
                    <img
                      src={
                        property.thumbnail
                          ? `${backendUrl}/${property.thumbnail}`
                          : "/house-placeholder.jpg"
                      }
                      alt={property.title}
                    />
                    {property.isSold && (
                      <div className="favorissold-badge">VENDU</div>
                    )}
                  </div>
                  <h3>{property.title}</h3>
                  <p>{Number(property.price).toLocaleString("fr-FR")} Ar</p>
                  <p>{property.location}</p>
                  <p>{property.type}</p>
                </Link>
                <button
                  className="remove-button"
                  onClick={() => handleRemoveClick(property._id)}
                >
                  ✖ Retirer des favoris
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popup de confirmation */}
      {showPopup && (
        <ConfirmationPopup
          message="Voulez-vous vraiment retirer cette annonce ?"
          onConfirm={confirmRemove}
          onCancel={cancelRemove}
        />
      )}
    </div>
  );
}

export default MesFavoris;
