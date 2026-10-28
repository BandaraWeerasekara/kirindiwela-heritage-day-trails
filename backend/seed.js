import bcrypt from "bcryptjs";
import db from "./db.js";
// Coordinates are approximate - verify on Google Maps before the demo.
const P = [
["Pilikuttuwa Raja Maha Viharaya","Religious,Heritage",6,"Ancient cave temple with over 99 prehistoric caves and a rock-cut stairway.",7.2640,80.1500],
["Maligatenna Raja Maha Viharaya & Aranya","Religious,Nature",10,"Mountain temple with panoramic views and ancient meditation caves.",7.2900,80.1000],
["Meethirigala Nissarana Vanaya","Nature,Meditation",14,"Serene forest monastery set in a protected natural reserve.",7.1900,80.0700],
["Uruwala Walagamba Raja Maha Viharaya","Religious,Heritage",8,"Historic temple linked to King Vattagamani Abhaya (Walagamba).",7.2300,80.0500],
["Koskolalanda Aranya Senasanaya","Nature,Meditation",12,"Quiet forest hermitage nestled in deep greenery.",7.2000,80.1900],
["Ethugalpura Viharaya","Religious,Cultural",5,"Local temple with traditional regional Buddhist architecture.",7.2500,80.1300],
["Kirindiwela Town Temple","Religious,Cultural",1,"Central community religious site with vibrant shrine rooms.",7.2330,80.1170],
["Heenatillawa Temple","Religious,Nature",9,"Quiet rural temple surrounded by rubber and paddy lands.",7.1700,80.1300],
["Radawana Sri Bodhirukkarama Vihara","Religious,Cultural",4,"Village temple with old-school artistic murals.",7.2200,80.1500],
["Prakramaramaya, Kirindiwela","Religious,Cultural",2,"Local spiritual centre hosting community cultural events.",7.2400,80.1100]];
await db.query("DELETE FROM places");
for (const p of P) await db.query(
 "INSERT INTO places(name,category,distance,description,opening_times,travel_tips,latitude,longitude) VALUES(?,?,?,?,?,?,?,?)",
 [p[0],p[1],p[2],p[3],"6:00 AM - 6:00 PM","Dress modestly (white or light colours), remove shoes and hats, be quiet.",p[4],p[5]]);
await db.query("DELETE FROM admins");
await db.query("INSERT INTO admins(username,password_hash) VALUES(?,?)",["admin",await bcrypt.hash("admin123",10)]);
console.log("Seeded. Admin login: admin / admin123 (change it!)"); process.exit();
