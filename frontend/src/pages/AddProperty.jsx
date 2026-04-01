import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style/AddProperty.css"; // ✅ CSS spécifique à cette page

const AddProperty = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    type: "maison",
    surface: "",
    rooms: "",
    bedrooms: "",
    bathrooms: "",
    garage: false,
    garden: false,
    yearBuilt: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const validate = () => {
    if (!formData.title.trim()) return setError("Le titre est requis");
    if (!formData.description.trim())
      return setError("La description est requise");
    if (Number(formData.price) <= 0)
      return setError("Le prix doit être supérieur à 0");
    if (Number(formData.surface) <= 0)
      return setError("La surface doit être supérieure à 0");
    if (!thumbnail) return setError("L'image principale est requise");
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous devez être connecté pour ajouter une annonce.");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    data.append("thumbnail", thumbnail);
    images.forEach((img) => data.append("images", img));

    try {
      await axios.post("http://localhost:3000/api/properties", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/annonce/mes-annonces");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création de l'annonce.");
    }
  };

  return (
    <div className="addproperty-container">
      <button className="addproperty-back-button" onClick={() => navigate(-1)}>
        Retour
      </button>
      {error && <p className="addproperty-erreur">{error}</p>}
      <h1>Ajouter une annonce</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="addproperty-main-section">
          {/* Image principale */}
          <div className="addproperty-main-image">
            <img
              src={
                thumbnail
                  ? URL.createObjectURL(thumbnail)
                  : "/house-placeholder.jpg"
              }
              alt="Aperçu"
            />

            <label className="addproperty-image-button">
              + Ajouter une image principale
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {/* Champs du formulaire */}
          <div className="addproperty-details">
            <div className="addproperty-details-left">
              <ul className="addproperty-details-list">
                <li>
                  <input
                    name="title"
                    type="text"
                    placeholder="Titre"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full p-1"
                  />
                </li>
                <li>
                  <input
                    name="location"
                    type="text"
                    placeholder="Lieu"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full p-1"
                  />
                </li>
                <li>
                  <input
                    name="price"
                    type="number"
                    placeholder="Prix (Ar)"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full p-1"
                  />
                </li>
                <li>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full p-1"
                  >
                    <option value="maison">Maison</option>
                    <option value="appartement">Appartement</option>
                    <option value="terrain">Terrain</option>
                  </select>
                </li>
                <li>
                  <input
                    name="surface"
                    type="number"
                    placeholder="Surface (m²)"
                    value={formData.surface}
                    onChange={handleChange}
                    min="1"
                    className="w-full p-1"
                  />
                </li>
                <li>
                  <input
                    name="rooms"
                    type="number"
                    placeholder="Nombre de pièces"
                    value={formData.rooms}
                    onChange={handleChange}
                    min="0"
                    className="w-full p-1"
                  />
                </li>
                <li>
                  <input
                    name="bedrooms"
                    type="number"
                    placeholder="Chambres"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    min="0"
                    className="w-full p-1"
                  />
                </li>
                <li>
                  <input
                    name="bathrooms"
                    type="number"
                    placeholder="Salles de bain"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min="0"
                    className="w-full p-1"
                  />
                </li>
                <li>
                  <input
                    name="yearBuilt"
                    type="number"
                    placeholder="Année de construction"
                    value={formData.yearBuilt}
                    onChange={handleChange}
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full p-1"
                  />
                </li>
                <li>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="garage"
                      checked={formData.garage}
                      onChange={handleChange}
                    />
                    <span>Garage</span>
                  </label>
                </li>
                <li>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="garden"
                      checked={formData.garden}
                      onChange={handleChange}
                    />
                    <span>Jardin</span>
                  </label>
                </li>
              </ul>
            </div>

            <div className="addproperty-details-right">
              <textarea
                name="description"
                placeholder="Description de l'annonce"
                value={formData.description}
                onChange={handleChange}
                required
                className="addproperty-description"
                rows={10}
              />
            </div>
          </div>
        </div>
        <div className="addproperty-gallery-wrapper">
          <div className="addproperty-gallery-bar">
            {/* ➕ Bouton à gauche */}
            <label htmlFor="extra-images" className="addproperty-add-btn">
              <div className="pluus">+</div> Ajouter
            </label>
            <input
              type="file"
              id="extra-images"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files);

                if (images.length + files.length > 30) {
                  setError(
                    "Vous ne pouvez pas ajouter plus de 30 images supplémentaires."
                  );
                  return;
                }

                setImages((prev) => [...prev, ...files]);
                setError(""); // réinitialise le message si tout est OK
              }}
              style={{ display: "none" }}
            />

            {/* 🖼️ Galerie à droite */}
            <div className="addproperty-gallery">
              {images.length === 0 ? (
                <span className="addproperty-gallery-placeholder">
                  Images supplémentaires
                </span>
              ) : (
                images.map((img, index) => (
                  <div key={index} className="addproperty-gallery-item">
                    <button
                      type="button"
                      className="addproperty-remove-btn"
                      onClick={() =>
                        setImages((prev) => prev.filter((_, i) => i !== index))
                      }
                    >
                      ×
                    </button>
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`image-${index}`}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="addproperty-submit-wrapper">
          <button type="submit" className="addproperty-publier">
            Publier l'annonce
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;
