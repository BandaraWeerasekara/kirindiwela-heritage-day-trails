
import bcrypt from "bcryptjs";
import db from "./db.js";

const pw = process.argv[2];
if (!pw || pw.length < 6) {
  console.log("Usage: node setpassword.js YourNewPassword (at least 6 characters)");
  process.exit();
}
await db.query("UPDATE admins SET password_hash=? WHERE username='admin'", [await bcrypt.hash(pw, 10)]);
console.log("Admin password changed.");
process.exit();