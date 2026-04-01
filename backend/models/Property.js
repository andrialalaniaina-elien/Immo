const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["maison", "terrain", "appartement"],
    required: true,
  },
  surface: {
    type: Number,
    default: 0,
  },
  rooms: {
    type: Number,
    default: 0,
  },
  bedrooms: {
    type: Number,
    default: 0,
  },
  bathrooms: {
    type: Number,
    default: 0,
  },
  garage: {
    type: Boolean,
    default: false,
  },
  garden: {
    type: Boolean,
    default: false,
  },
  yearBuilt: {
    type: Number,
    default: null,
  },
  isSold: {
    type: Boolean,
    default: false,
  },
  images: {
    type: [String], // liste des chemins d’images
    default: [],
  },
  thumbnail: {
    type: String, // une image principale
    default: "",
  },
  validated: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Property = mongoose.model("Property", propertySchema);
module.exports = Property;
