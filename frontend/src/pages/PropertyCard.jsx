import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

function PropertyCard({ property }) {
  return (
    <div
      style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem" }}
    >
      <img
        src={
          property.thumbnail
            ? `http://localhost:3000/${property.thumbnail}`
            : "/house-placeholder.jpg"
        }
        alt={property.title}
        style={{ width: "100%", height: "200px", objectFit: "cover" }}
      />
      <h3>{property.title}</h3>
      <p>{property.location}</p>
      <p>{Number(property.price).toLocaleString("fr-FR")} Ar</p>
      <p style={{ fontSize: "0.9rem", color: "#555" }}>
        Publiée{" "}
        {formatDistanceToNow(new Date(property.createdAt), {
          addSuffix: true,
          locale: fr,
        })}
      </p>
      <Link to={`/annonce/${property._id}`}>Voir les détails</Link>
    </div>
  );
}

export default PropertyCard;
