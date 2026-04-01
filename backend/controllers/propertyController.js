const Property = require("../models/Property");
const fs = require("fs");
const path = require("path");
const logAction = require("../utils/logAction");

// ➕ Ajouter un bien immobilier
exports.createProperty = async (req, res) => {
  try {
    const thumbnailPath = req.files?.thumbnail?.[0]?.path;
    const imagePaths = req.files?.images?.map((file) => file.path) || [];

    const relativeThumbnail = thumbnailPath
      ?.split("uploads")[1]
      ?.replace(/\\/g, "/");
    const relativeImages = imagePaths.map((img) =>
      img.split("uploads")[1]?.replace(/\\/g, "/")
    );

    const property = new Property({
      ...req.body,
      thumbnail: relativeThumbnail ? `uploads${relativeThumbnail}` : "",
      images: relativeImages.map((img) => `uploads${img}`),
      owner: req.user._id,
    });

    await property.save();
    logAction(
      req.user._id,
      "createProperty",
      `Ajout de l'annonce ${property._id}`
    );
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 📜 Liste mes propriétés
exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📜 Liste avec recherche, tri, pagination, filtres
exports.getAllProperties = async (req, res) => {
  try {
    const {
      search = "",
      type,
      location,
      minPrice,
      maxPrice,
      minSurface,
      maxSurface,
      bedrooms,
      bathrooms,
      garage,
      garden,
      validated,
      sort,
      page = 1,
      limit = 4,
    } = req.query;

    const filter = {};

    if (search) {
      const normalizedSearch = search
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      filter.$or = [
        { title: { $regex: normalizedSearch, $options: "i" } },
        { description: { $regex: normalizedSearch, $options: "i" } },
        { location: { $regex: normalizedSearch, $options: "i" } },
      ];
    }

    if (type) filter.type = type;
    if (location) filter.location = location;
    if (bedrooms) filter.bedrooms = parseInt(bedrooms);
    if (bathrooms) filter.bathrooms = parseInt(bathrooms);
    if (garage) filter.garage = garage === "true";
    if (garden) filter.garden = garden === "true";
    if (validated) filter.validated = validated === "true";
    const { isSold } = req.query;
    if (isSold === "true") filter.isSold = true;
    if (isSold === "false") filter.isSold = false;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    if (minSurface || maxSurface) {
      filter.surface = {};
      if (minSurface) filter.surface.$gte = parseInt(minSurface);
      if (maxSurface) filter.surface.$lte = parseInt(maxSurface);
    }

    const sortOption = {};
    if (sort === "asc") sortOption.price = 1;
    else if (sort === "desc") sortOption.price = -1;
    else sortOption.createdAt = -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Property.countDocuments(filter);

    const properties = await Property.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("owner", "email avatar address");

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: properties,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Une propriété par ID + info propriétaire
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "owner",
      "email avatar address phone"
    );
    if (!property) return res.status(404).json({ error: "Bien non trouvé" });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Modifier une annonce (par propriétaire uniquement)
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!property) {
      return res.status(404).json({ error: "Bien non trouvé ou non autorisé" });
    }

    Object.keys(req.body).forEach((key) => {
      property[key] = req.body[key];
    });

    if (req.files?.thumbnail?.[0]) {
      if (property.thumbnail) {
        try {
          await fs.promises.unlink(
            path.join(__dirname, "../", property.thumbnail)
          );
        } catch {}
      }
      const relativeThumb = req.files.thumbnail[0].path
        .split("uploads")[1]
        ?.replace(/\\/g, "/");
      property.thumbnail = `uploads${relativeThumb}`;
    }

    if (req.files?.images?.length > 0) {
      const newImages = req.files.images.map((file) => {
        const rel = file.path.split("uploads")[1]?.replace(/\\/g, "/");
        return `uploads${rel}`;
      });
      property.images.push(...newImages);
    }

    await property.save();
    logAction(
      req.user._id,
      "updateProperty",
      `Modification de l'annonce ${property._id}`
    );
    res.json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🗑 Supprimer une annonce (propriétaire ou admin)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "Bien non trouvé" });

    const isOwner = property.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ error: "Non autorisé à supprimer ce bien" });
    }

    for (const imgPath of property.images) {
      try {
        await fs.promises.unlink(path.join(__dirname, "../", imgPath));
      } catch {}
    }

    if (property.thumbnail) {
      try {
        await fs.promises.unlink(
          path.join(__dirname, "../", property.thumbnail)
        );
      } catch {}
    }

    await property.deleteOne();
    logAction(
      req.user._id,
      "deleteProperty",
      `Suppression de l'annonce ${property._id}`
    );
    res.json({ message: "Bien supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression:", error);
    res.status(500).json({ error: "Erreur serveur interne" });
  }
};

// 🪩 Supprimer une image individuelle
exports.deletePropertyImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imagePath } = req.body;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ error: "Bien non trouvé" });
    }

    const isOwner = property.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Non autorisé" });
    }

    property.images = property.images.filter((img) => img !== imagePath);

    await fs.promises
      .unlink(path.join(__dirname, "../", imagePath))
      .catch(() => {});

    await property.save();
    logAction(
      req.user._id,
      "deletePropertyImage",
      `Suppression image ${imagePath} pour ${property._id}`
    );
    res.json({ message: "Image supprimée", images: property.images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleSoldStatus = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: "Annonce introuvable." });
    }

    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "Accès refusé." });
    }

    property.isSold = !property.isSold;
    await property.save();

    logAction(
      req.user._id,
      "toggleSoldStatus",
      `Annonce ${property._id} marquée comme vendue=${property.isSold}`
    );

    res.json({
      message: property.isSold
        ? "Annonce marquée comme vendue."
        : "Statut 'vendue' annulé.",
      isSold: property.isSold,
    });
  } catch (err) {
    console.error("Erreur toggleSoldStatus:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
