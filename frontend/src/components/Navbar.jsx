import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./style/Navbar.css";
import ConfirmationPopup from "./ConfirmationPopup";

function Navbar() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const searchRef = useRef(null);
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // États pour popups
  const [showPopupLogout, setShowPopupLogout] = useState(false);
  const [showPopupDeposer, setShowPopupDeposer] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }

    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener("userChanged", handleStorageChange);
    return () => {
      window.removeEventListener("userChanged", handleStorageChange);
    };
  }, []);

  // Fermer le champ de recherche si on clique ailleurs et si rien n'est écrit dedans
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !menuRef.current?.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setMenuOpen(false);
      }
      if (
        !searchRef.current?.contains(event.target) &&
        event.target.tagName !== "IMG" &&
        searchTerm === ""
      ) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchTerm]);

  // Gestion déconnexion
  const handleLogout = () => {
    setShowPopupLogout(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.dispatchEvent(new Event("userChanged"));
    navigate("/login");
    setShowPopupLogout(false);
  };

  const cancelLogout = () => {
    setShowPopupLogout(false);
  };

  // Gestion popup "déposer une annonce" quand non connecté
  const handleClickDeposerAnnonce = (e) => {
    e.preventDefault();
    setShowPopupDeposer(true);
  };

  const confirmDeposerAnnonce = () => {
    setShowPopupDeposer(false);
  };

  const cancelDeposerAnnonce = () => {
    setShowPopupDeposer(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <img src="/logo-maison.jpg" alt="" id="logoImg" />
          Immo
        </div>

        <div ref={menuRef} className={`menu ${menuOpen ? "menu-open" : ""}`}>
          <div className="acceuil">
            <Link
              to="/"
              className={`link ${
                location.pathname === "/" ? "active-link" : ""
              }`}
              id="acceuil"
            >
              Accueil
            </Link>
          </div>
          {!user ? (
            <>
              <div className="divlink">
                <Link
                  to="/login"
                  className={`link ${
                    location.pathname === "/login" ? "active-link" : ""
                  }`}
                >
                  Se connecter
                </Link>
              </div>
              <div className="divlink">
                <Link
                  to="/register"
                  className={`link ${
                    location.pathname === "/register" ? "active-link" : ""
                  }`}
                >
                  S'inscrire
                </Link>
              </div>
              <div className="divlink">
                <Link
                  to="/annonce/ajouter"
                  className={`link ${
                    location.pathname === "/annonce/ajouter"
                      ? "active-link"
                      : ""
                  }`}
                  onClick={handleClickDeposerAnnonce}
                >
                  Déposer une annonce
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="divlink">
                <Link
                  to="annonce/mes-annonces"
                  className={`link ${
                    location.pathname === "/annonce/mes-annonces"
                      ? "active-link"
                      : ""
                  }`}
                >
                  Mes annonces
                </Link>
              </div>
              <div className="divlink">
                <Link
                  to="/favoris"
                  className={`link ${
                    location.pathname === "/favoris" ? "active-link" : ""
                  }`}
                >
                  ❤️ Mes Favoris
                </Link>
              </div>

              <div className="divlink">
                <Link
                  to="annonce/ajouter"
                  className={`link ${
                    location.pathname === "/annonce/ajouter"
                      ? "active-link"
                      : ""
                  }`}
                >
                  + Ajouter une annonce
                </Link>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                Se déconnecter
              </button>
              <span
                id="profilbloc"
                className={`link ${
                  location.pathname === "/profil" ? "active-link" : ""
                }`}
              >
                <div className="divlink">
                  <Link to="/profil" className="profil-link">
                    <img
                      src={
                        user?.avatar
                          ? `http://localhost:3000/${user.avatar}`
                          : "/profil-placeholder.jpg"
                      }
                      alt="Profil"
                      className="user-avatar"
                    />
                  </Link>
                </div>
              </span>

              {user.role === "admin" && (
                <div className="divlink">
                  <Link
                    to="/admin"
                    className={`link ${
                      location.pathname === "/admin" ? "active-link" : ""
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Espace Admin
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        <div className="right-controls">
          <div ref={searchRef} className="search-wrapper">
            {showSearch && (
              <div className="search-form">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  autoFocus
                />
              </div>
            )}

            <img
              src="./search-icon.svg"
              alt="search"
              className="search-icon"
              onClick={() => {
                if (searchTerm.trim()) {
                  navigate(
                    `/annonces?search=${encodeURIComponent(searchTerm.trim())}`
                  );
                  setShowSearch(false);
                  setSearchTerm("");
                } else {
                  setShowSearch((prev) => !prev);
                }
              }}
            />
          </div>

          <button
            ref={buttonRef}
            onClick={() => setMenuOpen(!menuOpen)}
            className={`hamburger ${menuOpen ? "hamburger-open" : ""}`}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Popup déconnexion */}
      {showPopupLogout && (
        <ConfirmationPopup
          message="Voulez-vous vraiment vous déconnecter ?"
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />
      )}

      {/* Popup déposer annonce */}
      {showPopupDeposer && (
        <ConfirmationPopup
          message="Veuillez vous connecter d'abord pour déposer une annonce. Voulez-vous vous connecter maintenant ?"
          onConfirm={confirmDeposerAnnonce}
          onCancel={cancelDeposerAnnonce}
        />
      )}
    </>
  );
}

export default Navbar;
