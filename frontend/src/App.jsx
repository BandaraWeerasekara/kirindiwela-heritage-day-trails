import { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, Link, NavLink, useParams, useNavigate } from "react-router-dom";

const CATS = ["Religious", "Heritage", "Nature", "Cultural", "Meditation"];
const ICONS = { Religious: "🛕", Heritage: "🏛️", Nature: "🌿", Cultural: "🎭", Meditation: "🧘" };
// ස්ථාන නමේ තියෙන වචනය -> photo file නම (frontend/public/images/places/)
const PHOTOS = [["pilikuttuwa","pilikuttuwa"],["maligatenna","maligatenna"],["meethirigala","meethirigala"],
  ["uruwala","uruwala"],["koskolalanda","koskolalanda"],["ethugalpura","ethugalpura"],
  ["town temple","kirindiwela-town"],["heenatillawa","heenatillawa"],["radawana","radawana"],
  ["prakramaramaya","prakramaramaya"]];
const photoFor = p => {
  const n = p.name.toLowerCase(); const hit = PHOTOS.find(([k]) => n.includes(k));
  return p.image || (hit ? `/images/places/${hit[1]}.jpg` : null);
};
function Photo({ p, className = "" }) {
  const first = p.category.split(",")[0].trim();
  const src = photoFor(p);
  return (
    <div className={`photo ${className} ${first.toLowerCase()}`}>
      <span className="emoji">{ICONS[first] || "📍"}</span>
      {src && <img src={src} alt={p.name} loading="lazy" onError={e => (e.currentTarget.style.display = "none")} />}
    </div>);
}

const token = () => localStorage.getItem("token");
async function api(url, method = "GET", body) {
  const r = await fetch(url, { method, body: body && JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...(token() && { Authorization: "Bearer " + token() }) } });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

const PlanCtx = createContext();
const usePlan = () => useContext(PlanCtx);
function PlanProvider({ children }) {
  const [plan, setPlan] = useState(() => JSON.parse(localStorage.getItem("plan") || "[]"));
  useEffect(() => localStorage.setItem("plan", JSON.stringify(plan)), [plan]);
  const add = p => setPlan(x => x.some(i => i.id === p.id) ? x : [...x, p]);
  const remove = id => setPlan(x => x.filter(i => i.id !== id));
  return <PlanCtx.Provider value={{ plan, add, remove }}>{children}</PlanCtx.Provider>;
}

function PlaceCard({ p }) {
  const { plan, add } = usePlan();
  const added = plan.some(i => i.id === p.id);
  const first = p.category.split(",")[0].trim().toLowerCase();
  return (
    <article className={"card " + first}>
      <Photo p={p} />
      <span className="dist">{p.distance} km</span>
      <div className="content">
        <div className="chips">
          {p.category.split(",").map(c => <span key={c} className={"chip " + c.trim().toLowerCase()}>{c}</span>)}
        </div>
        <h3><Link to={`/places/${p.id}`}>{p.name}</Link></h3>
        <p>{p.description}</p>
        <button disabled={added} onClick={() => add(p)}>{added ? "✓ In your plan" : "Add to plan"}</button>
      </div>
    </article>);
}

function Home() {
  const [places, setPlaces] = useState([]);
  const [cat, setCat] = useState(""); const [q, setQ] = useState("");
  useEffect(() => {
    api(`/api/places?category=${cat}&q=${encodeURIComponent(q)}`).then(setPlaces).catch(() => setPlaces([]));
  }, [cat, q]);
  return (<>
    <header className="hero"><h1>One day around Kirindiwela</h1>
      <p>Temples, forest monasteries and heritage sites within 25 km. Pick your stops and build your day.</p></header>
    <div className="filters">
      <input placeholder="Search by name" value={q} onChange={e => setQ(e.target.value)} />
      <button className={!cat ? "on" : ""} onClick={() => setCat("")}>All</button>
      {CATS.map(c => <button key={c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{c}</button>)}
    </div>
    <div className="grid">{places.map(p => <PlaceCard key={p.id} p={p} />)}</div>
    {!places.length && <p className="empty">No places match. Clear the search or choose All.</p>}
  </>);
}

function Detail() {
  const { id } = useParams(); const { plan, add } = usePlan();
  const [p, setP] = useState(null);
  useEffect(() => { api(`/api/places/${id}`).then(setP).catch(() => setP(false)); }, [id]);
  if (p === false) return <p className="empty">Place not found.</p>;
  if (!p) return <p className="empty">Loading…</p>;
  return (
    <section className="detail">
      <Photo p={p} className="big" />
      <h1>{p.name}</h1>
      <p className="meta">{p.category.split(",").join(" / ")} · {p.distance} km from Kirindiwela</p>
      <p>{p.description}</p>
      <p><span className="time-btn">🕒 <strong>Opening times:</strong> {p.opening_times || "Not available"}</span></p>
      <p><span className="tips-btn">💡 <strong>Travel tips:</strong> {p.travel_tips || "Not available"}</span></p>
      <button disabled={plan.some(i => i.id === p.id)} onClick={() => add(p)}>Add to plan</button>
      {p.latitude && <iframe title="map" loading="lazy"
        src={`https://maps.google.com/maps?q=${p.latitude},${p.longitude}&z=14&output=embed`} />}
    </section>);
}

function Plan() {
  const { plan, remove } = usePlan();
  return (
    <section className="detail"><h1>My plan</h1>
      {!plan.length && <p className="empty">Your plan is empty. Add places from the Places page.</p>}
      <ol>{[...plan].sort((a, b) => a.distance - b.distance).map(p =>
        <li key={p.id}>{p.name} ({p.distance} km) <button className="link" onClick={() => remove(p.id)}>Remove</button></li>)}</ol>
      {!!plan.length && <p className="meta">Total stops today: {plan.length}</p>}
    </section>);
}

function Login() {
  const [u, setU] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const nav = useNavigate();
  const submit = async e => { e.preventDefault();
    try { const r = await api("/api/login", "POST", { username: u, password: pw });
      localStorage.setItem("token", r.token); nav("/admin"); } catch (x) { setErr(x.message); } };
  return (<form className="detail form" onSubmit={submit}><h1>Admin login</h1>
    <input placeholder="Username" value={u} onChange={e => setU(e.target.value)} />
    <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} />
    {err && <p className="error">{err}</p>}<button>Log in</button></form>);
}

const blank = { name: "", category: "", distance: "", description: "", opening_times: "", travel_tips: "", latitude: "", longitude: "" };
function Admin() {
  const nav = useNavigate();
  const [places, setPlaces] = useState([]); const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null); const [err, setErr] = useState("");
  const load = () => api("/api/places").then(setPlaces);
  useEffect(() => { token() ? load() : nav("/login"); }, []);
  const save = async e => { e.preventDefault(); setErr("");
    try { editId ? await api(`/api/places/${editId}`, "PUT", form) : await api("/api/places", "POST", form);
      setForm(blank); setEditId(null); load(); } catch (x) { setErr(x.message); } };
  const del = async p => { if (confirm(`Delete "${p.name}"?`)) { await api(`/api/places/${p.id}`, "DELETE"); load(); } };
  const logout = () => { localStorage.removeItem("token"); nav("/"); };
  return (<section className="detail"><h1>Manage places</h1><button className="link" onClick={logout}>Log out</button>
    <form className="form" onSubmit={save}>
      {Object.keys(blank).map(k => <input key={k} placeholder={k.replace("_", " ") + (k === "category" ? " (e.g. Religious,Heritage)" : "")}
        value={form[k] ?? ""} onChange={e => setForm({ ...form, [k]: e.target.value })} />)}
      {err && <p className="error">{err}</p>}
      <button>{editId ? "Save changes" : "Add place"}</button>
    </form>
    <table><tbody>{places.map(p => <tr key={p.id}><td>{p.name}</td><td>
      <button className="link" onClick={() => { setForm(p); setEditId(p.id); window.scrollTo(0, 0); }}>Edit</button>
      <button className="link" onClick={() => del(p)}>Delete</button></td></tr>)}</tbody></table></section>);
}

function Nav() {
  const { plan } = usePlan();
  return (
    <nav>
      <Link to="/" className="brand"><span>Kirindiwela Heritage Day Trails</span></Link>
      <NavLink to="/" end>Places</NavLink>
      <NavLink to="/plan">My Plan{plan.length > 0 && <span className="count">{plan.length}</span>}</NavLink>
      <NavLink to="/login">Admin</NavLink>
    </nav>);
}

export default function App() {
  return (<PlanProvider>
    <Nav />
    <main><Routes>
      <Route path="/" element={<Home />} />
      <Route path="/places/:id" element={<Detail />} />
      <Route path="/plan" element={<Plan />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
    </Routes></main>
    <footer>
      <div className="foot-name">Kirindiwela Heritage Day Trails</div>
      <div className="foot-id">e2410436</div>
    </footer>
  </PlanProvider>);
}