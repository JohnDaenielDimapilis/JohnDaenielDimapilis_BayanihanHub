import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["Admin", "Staff", "User"], default: "User" },
    isActive: { type: Boolean, default: true },
    accountStatus: {
      type: String,
      enum: ["Active", "Temporarily Banned", "Disabled"],
      default: "Active"
    },
    banUntil: { type: Date },
    banReason: { type: String, trim: true },
    bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    privacyConsentAt: { type: Date },
    consentVersion: { type: String, default: "2026.06" }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
