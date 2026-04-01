import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import "./style/PropertyList.css";

function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const [params, setParams] = useSearchParams();
  const page = parseInt(params.get("page") || "1");
  const search = params.get("search") || "";
  const type = params.get("type") || "";
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";
  const sort = params.get("sort") || "";
  const isSold = params.get("isSold") || "";

  const limit = 18;

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:3000/api/properties", {
          params: {
            page,
            limit,
            search,
            type,
            minPrice,
            maxPrice,
            sort,
            isSold,
          },
        });

        setProperties(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
      } catch {
        setErreur("Erreur lors du chargement des annonces.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [page, search, type, minPrice, maxPrice, sort, isSold]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(params);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== "page") newParams.set("page", "1"); // reset à page 1 si autre filtre
    setParams(newParams);
  };

  return (
    <div className="property-list-container">
      <div className="agauche">
        {/* Filtres */}
        <div className="filters">
          <input
            type="text"
            placeholder="Recherche"
            value={search}
            onChange={(e) => updateParam("search", e.target.value)}
          />
          <select
            value={type}
            onChange={(e) => updateParam("type", e.target.value)}
          >
            <option value="">Tous types</option>
            <option value="maison">Maison</option>
            <option value="appartement">Appartement</option>
            <option value="terrain">Terrain</option>
          </select>
          <input
            type="number"
            placeholder="Prix min"
            value={minPrice}
            onChange={(e) => updateParam("minPrice", e.target.value)}
          />
          <input
            type="number"
            placeholder="Prix max"
            value={maxPrice}
            onChange={(e) => updateParam("maxPrice", e.target.value)}
          />
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
          >
            <option value="">Trier par prix</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </select>
          <select
            value={isSold}
            onChange={(e) => updateParam("isSold", e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="true">Annonces vendues</option>
            <option value="false">Annonces disponibles</option>
          </select>
        </div>
      </div>
      <div className="adroite">
        <h2>Annonces disponibles</h2>
        {/* Résultats */}
        {loading ? (
          <p>Chargement...</p>
        ) : erreur ? (
          <p className="erreur">{erreur}</p>
        ) : properties.length === 0 ? (
          <p>Aucune annonce trouvée.</p>
        ) : (
          <div className="property-grid">
            {properties.map((prop) => (
              <Link
                to={`/annonce/${prop._id}`}
                key={prop._id}
                className="property-card"
              >
                <div className="image-wrapper">
                  <img
                    src={
                      prop.thumbnail
                        ? `http://localhost:3000/${prop.thumbnail}`
                        : "/house-placeholder.jpg"
                    }
                    alt={prop.title}
                  />
                  {prop.isSold && <div className="sold-badge">VENDU</div>}
                </div>

                <h3>{prop.title}</h3>
                <p>{Number(prop.price).toLocaleString("fr-FR")} Ar</p>
                <p>{prop.location}</p>
                <p>{prop.type}</p>
                <p className="publish-date">
                  Publiée{" "}
                  {formatDistanceToNow(new Date(prop.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={page <= 1}
              onClick={() => updateParam("page", page - 1)}
            >
              ⬅ Précédent
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => updateParam("page", i + 1)}
                className={page === i + 1 ? "active" : ""}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page >= totalPages}
              onClick={() => updateParam("page", page + 1)}
            >
              Suivant ➡
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyList;
