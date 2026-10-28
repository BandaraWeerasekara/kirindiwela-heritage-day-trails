import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import db from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// Middleware: lets a request pass only if it carries a valid admin token (FR-09)
function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try { jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Please log in as admin" }); }
}

// ---------- Tourist (public) ----------
// FR-01, FR-02, FR-03: list, with optional ?category= and ?q=
app.get("/api/places", async (req, res) => {
  const { category, q } = req.query;
  let sql = "SELECT * FROM places WHERE 1=1"; const args = [];
  if (category) { sql += " AND FIND_IN_SET(?, category)"; args.push(category); }
  if (q) { sql += " AND name LIKE ?"; args.push(`%${q}%`); }
  const [rows] = await db.query(sql + " ORDER BY distance", args);
  res.json(rows);
});
// FR-04: one place
app.get("/api/places/:id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM places WHERE id=?", [req.params.id]);
  rows.length ? res.json(rows[0]) : res.status(404).json({ error: "Not found" });
});

// ---------- Admin ----------
app.post("/api/login", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM admins WHERE username=?", [req.body.username]);
  const ok = rows.length && await bcrypt.compare(req.body.password || "", rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: "Wrong username or password" });
  res.json({ token: jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, { expiresIn: "4h" }) });
});
const F = ["name","category","distance","description","opening_times","travel_tips","latitude","longitude"];
const vals = b => F.map(f => (b[f] === "" ? null : b[f]) ?? null);
app.post("/api/places", auth, async (req, res) => {      // FR-10
  if (!req.body.name || !req.body.category || !req.body.distance)
    return res.status(400).json({ error: "Name, category and distance are required" });
  const [r] = await db.query(`INSERT INTO places(${F}) VALUES(${F.map(() => "?")})`, vals(req.body));
  res.status(201).json({ id: r.insertId });
});
app.put("/api/places/:id", auth, async (req, res) => {   // FR-11
  await db.query(`UPDATE places SET ${F.map(f => f + "=?")} WHERE id=?`, [...vals(req.body), req.params.id]);
  res.json({ ok: true });
});
app.delete("/api/places/:id", auth, async (req, res) => { // FR-12
  await db.query("DELETE FROM places WHERE id=?", [req.params.id]);
  res.json({ ok: true });
});

app.listen(process.env.PORT || 5000, () => console.log("API running"));
