/**
 * Create an admin account from the command line.
 *
 * POST /admin/signup now requires an existing admin (audit finding F2), which
 * leaves no way to create the first one — or to recover if every account is
 * locked behind an authenticator nobody can reach. This script is that path.
 *
 * Usage:
 *   pnpm create-admin <email>                 # generates a strong password
 *   pnpm create-admin <email> <password>      # uses the password you supply
 *
 * The account is created with two-factor authentication OFF, so it signs in
 * with just an email and password. It can be enabled later from Settings.
 */
import "dotenv/config";
import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../api/models/admin";

const MIN_PASSWORD_LENGTH = 12;
const BCRYPT_ROUNDS = 12; // matches adminControllers

// Ambiguous characters (0/O, 1/l/I) are excluded so the password can be read
// off a screen and typed without guesswork.
const ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*";

const generatePassword = (length = 20) => {
  const bytes = crypto.randomBytes(length * 2);
  let out = "";
  for (let i = 0; out.length < length && i < bytes.length; i++) {
    // Reject values that would bias the distribution via modulo.
    const max = 256 - (256 % ALPHABET.length);
    if (bytes[i] >= max) continue;
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
};

(async () => {
  const [, , emailArg, passwordArg] = process.argv;

  if (!emailArg) {
    console.error("Usage: pnpm create-admin <email> [password]");
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    console.error(`"${email}" is not a valid email address.`);
    process.exit(1);
  }

  if (passwordArg && passwordArg.length < MIN_PASSWORD_LENGTH) {
    console.error(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters (the API enforces the same rule).`
    );
    process.exit(1);
  }

  const password = passwordArg || generatePassword();
  const generated = !passwordArg;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set.");
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log(`Connected to database "${mongoose.connection.name}"`);

  try {
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.error(`\nAn admin with ${email} already exists — nothing was changed.`);
      console.error("To change its password, sign in and use Settings, or delete it first.");
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const admin = new Admin({
      email,
      passwordHash,
      isTwoFactorEnabled: false, // sign in with email + password only
    });
    await admin.save();

    console.log("\nAdmin created.\n");
    console.log(`  email    : ${email}`);
    console.log(`  password : ${password}`);
    console.log(`  2FA      : disabled`);
    console.log(`  id       : ${admin._id}`);

    if (generated) {
      console.log(
        "\nThis password is shown once and is not recoverable — store it now."
      );
    }
  } finally {
    await mongoose.connection.close();
  }
})().catch((err) => {
  console.error("Failed to create admin:", err instanceof Error ? err.message : err);
  process.exit(1);
});
