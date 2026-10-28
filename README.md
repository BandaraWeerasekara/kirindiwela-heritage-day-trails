# Kirindiwela Day-Visit Planner (React + Express + MySQL)

## 1. Setup
1. Install Node.js (v18+) and MySQL.
2. Create the database: `mysql -u root -p < backend/schema.sql`
3. Backend: `cd backend && cp .env.example .env` (edit password + JWT_SECRET), then
   `npm install && npm run seed && npm start`  (API on http://localhost:5000)
4. Frontend (second terminal): `cd frontend && npm install && npm run dev` -> http://localhost:5173
5. Admin login after seeding: admin / admin123 (change it).

## 2. Architecture (SRS section 8)
Browser (React) --/api JSON--> Express --SQL--> MySQL. The map is an iframe to Google Maps (no key needed).

## 3. Requirement -> code
FR-01/02/03: GET /api/places + Home()
FR-04/05: GET /api/places/:id + Detail() (map iframe)
FR-06/07/08: PlanProvider + Plan() (saved in localStorage)
FR-09: /api/login (bcrypt + JWT) + `auth` middleware
FR-10..13: POST/PUT/DELETE routes + Admin() (confirm() before delete)

## 4. Notes
- Coordinates in seed.js are approximate: verify each on Google Maps.
- SQL uses ? placeholders everywhere (prevents SQL injection).
