import { Navigate } from "react-router-dom";

function PrivateRouteAdmin({ children }) {
  const user = JSON.parse(localStorage.getItem("user")); // ou récupère le user stocké

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />; // redirige vers login si pas admin
  }

  return children; // affiche le composant si admin
}

export default PrivateRouteAdmin;
