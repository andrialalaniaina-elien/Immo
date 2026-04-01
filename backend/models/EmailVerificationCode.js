const mongoose = require("mongoose");

const EmailVerificationCodeSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model(
  "EmailVerificationCode",
  EmailVerificationCodeSchema
);
