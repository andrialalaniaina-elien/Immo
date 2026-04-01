const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  avatar: {
    type: String, // chemin ou URL vers photo de profil
    default: "",
  },
  address: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
  ],

  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// Ne pas renvoyer mot de passe + tokens
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  return user;
};

// Génère un token JWT
userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
  this.tokens.push({ token });
  await this.save();
  return token;
};

// Vérifie les identifiants
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email incorrect");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Mot de passe incorrect");
  return user;
};

// Hash mot de passe avant enregistrement
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
});

// Compare un mot de passe avec le hash actuel
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
