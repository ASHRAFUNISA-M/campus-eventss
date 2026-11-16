import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, setDoc, deleteDoc, doc, onSnapshot, query, orderBy }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, ORGANISERS } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = id => document.getElementById(id);
let user = null, events = [], regs = [];

// ---------- Auth ----------
$("loginBtn").onclick = () => signInWithPopup(auth, new GoogleAuthProvider());
$("logoutBtn").onclick = () => signOut(auth);

onAuthStateChanged(auth, u => {
  user = u;
  $("loginBtn").hidden = !!u;
  $("logoutBtn").hidden = !u;
  $("userName").textContent = u ? u.displayName : "";
  $("hint").hidden = !!u;
  $("organiser").hidden = !(u && ORGANISERS.includes(u.email));
  render();
});

// ---------- Real-time data (Firestore) ----------
onSnapshot(query(collection(db, "events"), orderBy("date")), snap => {
  events = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  render();
});
onSnapshot(collection(db, "registrations"), snap => {
  regs = snap.docs.map(d => d.data());
  render();
});

// ---------- Organiser: add event ----------
$("addBtn").onclick = async () => {
  const title = $("evTitle").value.trim(), date = $("evDate").value,
        venue = $("evVenue").value.trim(), seats = Number($("evSeats").value);
  if (!title || !date || !venue || !seats) return alert("Fill all fields");
  await addDoc(collection(db, "events"), { title, date, venue, seats });
  ["evTitle", "evDate", "evVenue", "evSeats"].forEach(i => $(i).value = "");
};

// ---------- Register / Cancel ----------
async function register(ev) {
  await setDoc(doc(db, "registrations", `${ev.id}_${user.uid}`), {
    eventId: ev.id, uid: user.uid, name: user.displayName, email: user.email
  });
}
async function cancel(ev) {
  await deleteDoc(doc(db, "registrations", `${ev.id}_${user.uid}`));
}

// ---------- UI ----------
function render() {
  const box = $("events");
  box.innerHTML = "";
  if (!events.length) { box.textContent = "No events yet."; return; }
  events.forEach(ev => {
    const list = regs.filter(r => r.eventId === ev.id);
    const mine = user && list.some(r => r.uid === user.uid);
    const full = list.length >= ev.seats;
    const card = document.createElement("div");
    card.className = "card";
    const info = document.createElement("div");
    info.innerHTML = `<h3></h3><div class="meta"></div>
      <div>Registered: <span class="count">${list.length} / ${ev.seats}</span></div>`;
    info.querySelector("h3").textContent = ev.title;
    info.querySelector(".meta").textContent = `📅 ${ev.date}  📍 ${ev.venue}`;
    card.appendChild(info);

    const btn = document.createElement("button");
    if (!user) { btn.textContent = "Sign in to register"; btn.disabled = true; }
    else if (mine) { btn.textContent = "Cancel"; btn.className = "secondary"; btn.onclick = () => cancel(ev); }
    else if (full) { btn.textContent = "Full"; btn.disabled = true; }
    else { btn.textContent = "Register"; btn.onclick = () => register(ev); }
    card.appendChild(btn);

    // Organiser sees participant names
    if (user && ORGANISERS.includes(user.email) && list.length) {
      const p = document.createElement("div");
      p.className = "meta";
      p.style.width = "100%";
      p.textContent = "Participants: " + list.map(r => r.name).join(", ");
      card.appendChild(p);
    }
    box.appendChild(card);
  });
}
