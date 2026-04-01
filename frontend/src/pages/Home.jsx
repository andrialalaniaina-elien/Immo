import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./style/Home.css";

function Home() {
  const [search, setSearch] = useState("");
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flashMessage, setFlashMessage] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/annonces?search=${encodeURIComponent(search.trim())}`);
    }
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/properties?limit=4"
        );
        setFeatured(res.data.data);
      } catch {
        console.error("Erreur lors du chargement des annonces en vedette.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();

    // Gérer le message temporaire après login/register
    const message = localStorage.getItem("flashMessage");
    if (message) {
      setFlashMessage(message);
      localStorage.removeItem("flashMessage");

      setTimeout(() => {
        setFlashMessage(null);
      }, 4000); // 4 secondes
    }
  }, []);

  return (
    <div className="home">
      {flashMessage && <div className="flash-message">{flashMessage}</div>}

      {/* Section Hero */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1> Trouvez la maison de vos rêves à Madagascar</h1>
          <p>
            Explorez des centaines d’annonces immobilières partout sur l’île.
          </p>
          <Link to="/annonces">
            <button className="cta-button">Voir les annonces</button>
          </Link>
        </div>
      </section>

      {/* Section Recherche */}
      <section className="search-section">
        <form
          onSubmit={handleSearch}
          style={{ display: "inline-flex", gap: "0.5rem" }}
        >
          <input
            type="text"
            placeholder="Rechercher par ville, type ou description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Rechercher</button>
        </form>
      </section>

      {/* Section Annonces en vedette */}
      <section className="featured-listings">
        {loading ? (
          <p style={{ textAlign: "center" }}>Chargement des annonces...</p>
        ) : featured.length === 0 ? (
          <p style={{ textAlign: "center" }}>Aucune annonce trouvée.</p>
        ) : (
          <div className="listings-grid">
            {featured.map((prop) => (
              <Link key={prop._id} to={`/annonce/${prop._id}`}>
                <img
                  src={
                    prop.thumbnail?.startsWith("http")
                      ? prop.thumbnail
                      : `http://localhost:3000/${prop.thumbnail}`
                  }
                  alt={prop.title}
                  onError={(e) => (e.target.src = "/placeholder.jpg")}
                />

                <h3>{prop.title}</h3>
                <p>
                  {prop.price.toLocaleString()} Ar - {prop.location}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
