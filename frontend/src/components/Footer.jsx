import "./style/Footer.css";

function Footer() {
  return (
    <footer>
      <div className="ligne"></div>
      <div>
        <div className="gauche">
          <img
            src="/log-maison-footer.jpg"
            alt="Logo JiaKo"
            style={{ width: "80px" }}
          />
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: "bold",
              fontStyle: "oblique",
              color: "rgb(241, 204, 67)",
            }}
          >
            Immo
          </h2>
          <p className="slogan">Trouvez votre chez-vous en toute confiance</p>
        </div>

        <div className="centre">
          <p>© {new Date().getFullYear()} Immo - Tous droits réservés</p>

          <p>
            <a href="/terms">Conditions d'utilisation</a> |{" "}
            <a href="/privacy">Politique de confidentialité</a>
          </p>
        </div>
        <div className="droite"></div>
      </div>
    </footer>
  );
}

export default Footer;
