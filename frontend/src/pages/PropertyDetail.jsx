import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import "./style/PropertyDetail.css";

const backendUrl = "http://localhost:3000/";

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`${backendUrl}api/properties/${id}`);
        setProperty(res.data);
        const token = localStorage.getItem("token");
        if (token) {
          const resFav = await axios.get(
            `${backendUrl}api/users/me/favorites`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const favoris = resFav.data || [];
          setIsFavorited(favoris.some((p) => p._id === id));
        }
      } catch (err) {
        console.error(err);
        setErreur("Erreur lors du chargement des détails.");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const imgSrc = (url) =>
    url.startsWith("http") ? url : `${backendUrl}${url}`;

  const formatMalagasyPhone = (phone) => {
    if (!phone) return "";
    let digits = phone.replace(/\D/g, "");

    if (digits.startsWith("261")) {
      digits = digits.slice(3);
    } else if (digits.startsWith("0")) {
      digits = digits.slice(1);
    }

    let formatted = "+261 ";
    if (digits.length >= 2) formatted += digits.slice(0, 2);
    if (digits.length >= 4) formatted += " " + digits.slice(2, 4);
    if (digits.length >= 7) formatted += " " + digits.slice(4, 7);
    if (digits.length >= 9) formatted += " " + digits.slice(7, 9);

    return formatted.trim();
  };

  if (loading) return <p>Chargement...</p>;
  if (erreur) return <p className="erreur">{erreur}</p>;
  if (!property) return <p>Aucune annonce trouvée.</p>;

  const {
    title,
    description,
    location,
    price,
    surface,
    bedrooms,
    bathrooms,
    garage,
    garden,
    type,
    createdAt,
    thumbnail,
    images,
    owner,
  } = property;

  return (
    <div className="detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        Retour
      </button>

      <div className="main-section">
        <div className="main-image">
          <img
            src={thumbnail ? imgSrc(thumbnail) : "/house-placeholder.jpg"}
            alt={title}
            onError={(e) => (e.target.src = "/placeholder.jpg")}
          />
          {property.isSold && <div className="detailsold-badge">VENDU</div>}
        </div>

        <div className="details">
          <div className="details-left">
            <h1>{title}</h1>
            <p className="location">{location}</p>
            <p className="price">{price.toLocaleString()} Ar</p>

            <ul className="details-list">
              <li>🏷️ Type : {type}</li>
              <li>📐 Surface : {surface} m²</li>
              <li>🛏️ Chambres : {bedrooms}</li>
              <li>🛁 Salles de bain : {bathrooms}</li>
              <li>🚗 Garage : {garage ? "Oui" : "Non"}</li>
              <li>🌳 Jardin : {garden ? "Oui" : "Non"}</li>
              <li>
                📅 Publiée{" "}
                {formatDistanceToNow(new Date(createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </li>

              <button
                className={`favorite-button ${isFavorited ? "active" : ""}`}
                onClick={async () => {
                  const token = localStorage.getItem("token");
                  if (!token) return alert("Veuillez vous connecter.");
                  try {
                    await axios.post(
                      `${backendUrl}api/users/me/favorites/${property._id}`,
                      {},
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setIsFavorited(!isFavorited);
                  } catch {
                    alert("Erreur favoris");
                  }
                }}
              >
                {isFavorited
                  ? "❤️ Retirer des favoris"
                  : "🤍 Ajouter aux favoris"}
              </button>
            </ul>
          </div>

          <div className="details-right">
            <p className="description">{description}</p>
          </div>
        </div>
      </div>

      {images?.length > 0 && (
        <div className="gallery">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={imgSrc(img)}
              alt={`${title}-${idx}`}
              onClick={() =>
                navigate("/image-viewer", {
                  state: { images: images.map(imgSrc), currentIndex: idx },
                })
              }
              onError={(e) => (e.target.src = "/placeholder.jpg")}
            />
          ))}
        </div>
      )}

      {owner && (
        <div className="contact-seller">
          <h3>Contact du vendeur</h3>
          <p>Email : {owner.email}</p>
          {owner.phone && <p>Téléphone : {formatMalagasyPhone(owner.phone)}</p>}
          {owner.address && <p>Adresse : {owner.address}</p>}
        </div>
      )}
    </div>
  );
}

export default PropertyDetail;
