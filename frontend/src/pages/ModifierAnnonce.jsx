import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./style/ModifierAnnonce.css";

const ModifierAnnonce = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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

  const [thumbnail, setThumbnail] = useState({
    isExisting: false,
    url: null,
    file: null,
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Charger les données de l'annonce
  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/properties/${id}`)
      .then((res) => {
        const data = res.data;

        setFormData({
          title: data.title,
          description: data.description,
          price: data.price,
          location: data.location,
          type: data.type,
          surface: data.surface,
          rooms: data.rooms,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          garage: data.garage,
          garden: data.garden,
          yearBuilt: data.yearBuilt,
        });

        // Image principale
        if (data.thumbnail) {
          setThumbnail({
            isExisting: true,
            url: data.thumbnail,
            file: null,
          });
          setThumbnailPreview(`http://localhost:3000/${data.thumbnail}`);
        }

        // Images supplémentaires
        const existingImgs = (data.images || []).map((url) => ({
          isExisting: true,
          url,
        }));
        setImages(existingImgs);
      })
      .catch(() => {
        setError("Erreur lors du chargement de l'annonce.");
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail({
      isExisting: false,
      url: null,
      file,
    });
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 30) {
      setError("Vous ne pouvez pas ajouter plus de 30 images.");
      return;
    }

    const newImages = files.map((file) => ({
      isExisting: false,
      file,
    }));

    setImages((prev) => [...prev, ...newImages]);
    setError("");
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!formData.title.trim()) return setError("Le titre est requis");
    if (!formData.description.trim())
      return setError("La description est requise");
    if (Number(formData.price) <= 0)
      return setError("Le prix doit être supérieur à 0");
    if (Number(formData.surface) <= 0)
      return setError("La surface doit être supérieure à 0");
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous devez être connecté pour modifier une annonce.");
      return;
    }

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (thumbnail.isExisting && thumbnail.url) {
      data.append("existingThumbnail", thumbnail.url);
    } else if (thumbnail.file) {
      data.append("thumbnail", thumbnail.file);
    }

    images.forEach((imgObj) => {
      if (imgObj.isExisting) {
        data.append("existingImages", imgObj.url);
      } else if (imgObj.file) {
        data.append("images", imgObj.file);
      }
    });

    try {
      await axios.patch(`http://localhost:3000/api/properties/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("✅ Annonce modifiée avec succès !");
      setTimeout(() => {
        navigate("/annonce/mes-annonces");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la modification de l'annonce.");
    }
  };

  return (
    <div className="modifierannonce-container">
      <button
        className="modifierannonce-back-button"
        onClick={() => navigate(-1)}
      >
        Retour
      </button>
      {success && <p className="modifier-success-message">{success}</p>}
      {error && <p className="modifierannonce-erreur">{error}</p>}
      <h1>Modifier l’annonce</h1>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="modifierannonce-main-section">
          <div className="modifierannonce-main-image">
            <img
              src={
                thumbnail.isExisting && thumbnail.url
                  ? `http://localhost:3000/${thumbnail.url}`
                  : thumbnailPreview || "/house-placeholder.jpg"
              }
              alt="Aperçu"
            />
            <label className="modifierannonce-image-button">
              + Modifier l'image principale
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <div className="modifierannonce-details">
            <div className="modifierannonce-details-left">
              <ul className="modifierannonce-details-list">
                <li>
                  <input
                    name="title"
                    type="text"
                    placeholder="Titre"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </li>
                <li>
                  <input
                    name="location"
                    type="text"
                    placeholder="Lieu"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </li>
                <li>
                  <input
                    name="price"
                    type="number"
                    placeholder="Prix (Ar)"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </li>
                <li>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
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
                  />
                </li>
                <li>
                  <input
                    name="rooms"
                    type="number"
                    placeholder="Pièces"
                    value={formData.rooms}
                    onChange={handleChange}
                  />
                </li>
                <li>
                  <input
                    name="bedrooms"
                    type="number"
                    placeholder="Chambres"
                    value={formData.bedrooms}
                    onChange={handleChange}
                  />
                </li>
                <li>
                  <input
                    name="bathrooms"
                    type="number"
                    placeholder="Salles de bain"
                    value={formData.bathrooms}
                    onChange={handleChange}
                  />
                </li>
                <li>
                  <input
                    name="yearBuilt"
                    type="number"
                    placeholder="Année de construction"
                    value={formData.yearBuilt}
                    onChange={handleChange}
                  />
                </li>
                <li>
                  <label>
                    <input
                      type="checkbox"
                      name="garage"
                      checked={formData.garage}
                      onChange={handleChange}
                    />{" "}
                    Garage
                  </label>
                </li>
                <li>
                  <label>
                    <input
                      type="checkbox"
                      name="garden"
                      checked={formData.garden}
                      onChange={handleChange}
                    />{" "}
                    Jardin
                  </label>
                </li>
              </ul>
            </div>

            <div className="modifierannonce-details-right">
              <textarea
                name="description"
                placeholder="Description de l'annonce"
                value={formData.description}
                onChange={handleChange}
                required
                className="modifierannonce-description"
                rows={10}
              />
            </div>
          </div>
        </div>

        {/* Galerie images */}
        <div className="modifierannonce-gallery-wrapper">
          <div className="modifierannonce-gallery-bar">
            <label htmlFor="extra-images" className="modifierannonce-add-btn">
              <div className="pluus">+</div> Ajouter
            </label>
            <input
              type="file"
              id="extra-images"
              multiple
              accept="image/*"
              onChange={handleAddImages}
              style={{ display: "none" }}
            />

            <div className="modifierannonce-gallery">
              {images.length === 0 ? (
                <span className="modifierannonce-gallery-placeholder">
                  Images supplémentaires
                </span>
              ) : (
                images.map((imgObj, index) => (
                  <div key={index} className="modifierannonce-gallery-item">
                    <button
                      type="button"
                      className="modifierannonce-remove-btn"
                      onClick={() => handleRemoveImage(index)}
                    >
                      ×
                    </button>
                    <img
                      src={
                        imgObj.isExisting
                          ? `http://localhost:3000/${imgObj.url}`
                          : URL.createObjectURL(imgObj.file)
                      }
                      alt={`img-${index}`}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modifierannonce-submit-wrapper">
          <button type="submit" className="modifierannonce-publier">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifierAnnonce;
