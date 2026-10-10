// ============================================
// Shared scripts for every page
// ============================================

const MN = document.documentElement.lang === "mn";

// Language switch keeps you on the same topic
document.querySelectorAll(".lang").forEach(a => {
  a.addEventListener("click", () => { if (location.hash) a.href = a.href.split("#")[0] + location.hash; });
});

// Footer year
const yearEl = document.getElementById("yr");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Home: draggable triangle in a circle ----------
const tri = document.getElementById("tri");
if (tri) {
  const NS = "http://www.w3.org/2000/svg";
  const C = { x: 200, y: 180 }, R = 150;
  const names = ["A", "B", "C"];
  const cls = ["a", "b", "c"];
  let angles = [-100, 25, 145].map(d => d * Math.PI / 180); // positions on the circle

  // faint grid
  const grid = tri.querySelector(".grid");
  for (let x = 20; x <= 380; x += 40) grid.insertAdjacentHTML("beforeend", `<line x1="${x}" y1="0" x2="${x}" y2="360"/>`);
  for (let y = 20; y <= 340; y += 40) grid.insertAdjacentHTML("beforeend", `<line x1="0" y1="${y}" x2="400" y2="${y}"/>`);

  const shape = tri.querySelector(".shape");
  const arcs = tri.querySelector(".arcs");
  const handlesG = tri.querySelector(".handles");
  const readout = document.querySelector(".readout");

  const handles = names.map((name, i) => {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "handle");
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "slider");
    g.setAttribute("aria-label", MN
      ? `${name} орой. Сумтай товчоор тойргийн дагуу хөдөлгөнө.`
      : `Corner ${name}. Use arrow keys to move it around the circle.`);
    g.innerHTML = `<circle class="hit" r="22"/><circle class="ring" r="9"/><text text-anchor="middle" dominant-baseline="central">${name}</text>`;
    handlesG.appendChild(g);
    return g;
  });

  const pt = a => ({ x: C.x + R * Math.cos(a), y: C.y + R * Math.sin(a) });

  // Round three angles so they still add to exactly 180 (largest remainder)
  const roundTo180 = vals => {
    const fl = vals.map(Math.floor);
    let left = 180 - fl.reduce((s, v) => s + v, 0);
    vals.map((v, i) => [v - fl[i], i]).sort((p, q) => q[0] - p[0]).forEach(([, i]) => { if (left-- > 0) fl[i]++; });
    return fl;
  };

  function render() {
    const P = angles.map(pt);
    shape.setAttribute("points", P.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "));

    arcs.innerHTML = "";
    const deg = P.map((p, i) => {
      const q = P[(i + 1) % 3], r = P[(i + 2) % 3];
      const u = { x: q.x - p.x, y: q.y - p.y }, v = { x: r.x - p.x, y: r.y - p.y };
      const lu = Math.hypot(u.x, u.y), lv = Math.hypot(v.x, v.y);
      const ang = Math.acos(Math.max(-1, Math.min(1, (u.x * v.x + u.y * v.y) / (lu * lv))));
      const rad = Math.min(30, lu * 0.3, lv * 0.3);
      const s = { x: p.x + u.x / lu * rad, y: p.y + u.y / lu * rad };
      const e = { x: p.x + v.x / lv * rad, y: p.y + v.y / lv * rad };
      const sweep = (u.x * v.y - u.y * v.x) > 0 ? 1 : 0;
      const path = document.createElementNS(NS, "path");
      path.setAttribute("class", `arc ${cls[i]}`);
      path.setAttribute("d", `M${p.x} ${p.y} L${s.x} ${s.y} A${rad} ${rad} 0 0 ${sweep} ${e.x} ${e.y} Z`);
      arcs.appendChild(path);
      return ang * 180 / Math.PI;
    });

    const shown = roundTo180(deg);
    P.forEach((p, i) => {
      const out = { x: (p.x - C.x) / R, y: (p.y - C.y) / R };
      handles[i].setAttribute("transform", `translate(${p.x} ${p.y})`);
      handles[i].querySelector("text").setAttribute("x", (out.x * 26).toFixed(1));
      handles[i].querySelector("text").setAttribute("y", (out.y * 26).toFixed(1));
      handles[i].setAttribute("aria-valuetext", MN ? `${names[i]} өнцөг ${shown[i]} градус` : `angle ${names[i]} is ${shown[i]} degrees`);
    });
    readout.innerHTML = shown.map((d, i) => `<span class="t ${cls[i]}">∠${names[i]} = ${d}°</span>`).join("<span>+</span>") +
      `<span class="sum">= 180°</span>`;
  }

  // Keep corners from landing on top of each other
  const tooClose = (a, i) => angles.some((b, j) => {
    if (j === i) return false;
    const d = Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
    return d < 0.25;
  });

  const toSvg = e => {
    const p = tri.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(tri.getScreenCTM().inverse());
  };

  handles.forEach((h, i) => {
    h.addEventListener("pointerdown", e => {
      h.setPointerCapture(e.pointerId);
      h.classList.add("dragging");
    });
    h.addEventListener("pointermove", e => {
      if (!h.classList.contains("dragging")) return;
      const p = toSvg(e);
      const a = Math.atan2(p.y - C.y, p.x - C.x);
      if (!tooClose(a, i)) { angles[i] = a; render(); }
    });
    const stop = () => h.classList.remove("dragging");
    h.addEventListener("pointerup", stop);
    h.addEventListener("pointercancel", stop);
    h.addEventListener("keydown", e => {
      const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const a = angles[i] + step * 3 * Math.PI / 180;
      if (!tooClose(a, i)) { angles[i] = a; render(); }
    });
  });

  render();
}

// ---------- Home: problem of the day ----------
const POTD_EN = [
  { t: "Parity", q: "Can you pick 5 odd numbers that add up to 50?", a: "No. Five odd numbers always add up to an odd number, and 50 is even." },
  { t: "Divisibility", q: "Find the digit A so that 4A72 is divisible by 9.", a: "4 + A + 7 + 2 = 13 + A must be a multiple of 9, so A = 5. Check: 4572 = 9 × 508." },
  { t: "LCM", q: "Bus A leaves every 12 minutes, bus B every 18 minutes. Both leave at 8:00. When do they next leave together?", a: "LCM(12, 18) = 36, so at 8:36." },
  { t: "Remainders", q: "What is the remainder when 2¹⁰⁰ is divided by 3?", a: "2 ≡ −1 (mod 3), so 2¹⁰⁰ ≡ (−1)¹⁰⁰ = 1. The remainder is 1." },
  { t: "Last digits", q: "What is the last digit of 7²⁰²⁶?", a: "Last digits of powers of 7 cycle 7, 9, 3, 1. 2026 leaves remainder 2 when divided by 4, so the last digit is 9." },
  { t: "Pigeonhole", q: "A dark drawer has red, blue and green socks. How many must you take to be sure of a matching pair?", a: "4. Three socks could be one of each colour; the fourth must match one of them." },
  { t: "Counting", q: "How many 3-digit numbers have only odd digits?", a: "Each digit has 5 choices (1, 3, 5, 7, 9): 5 × 5 × 5 = 125." },
  { t: "Counting", q: "10 friends each shake hands with every other friend once. How many handshakes?", a: "10 × 9 ÷ 2 = 45." },
  { t: "Clever sums", q: "Find 1 + 3 + 5 + … + 99.", a: "That's the first 50 odd numbers, and their sum is 50² = 2500." },
  { t: "Working backwards", q: "I think of a number, double it, add 6, then divide by 4. I get 5. What was my number?", a: "5 × 4 = 20, 20 − 6 = 14, 14 ÷ 2 = 7." },
  { t: "Angles", q: "The angles of a triangle are in the ratio 2 : 3 : 4. What is the largest angle?", a: "9 parts = 180°, so one part is 20°. The largest is 4 × 20° = 80°." }
];
const POTD_MN = [
  { t: "Тэгш ба сондгой", q: "50 гэсэн нийлбэртэй 5 сондгой тоо сонгож болох уу?", a: "Үгүй. Таван сондгой тооны нийлбэр үргэлж сондгой гардаг, харин 50 тэгш тоо." },
  { t: "Хуваагдах шинж", q: "4A72 тоо 9-д хуваагдахын тулд A цифр ямар байх вэ?", a: "4 + A + 7 + 2 = 13 + A нь 9-д хуваагдах ёстой тул A = 5. Шалгалт: 4572 = 9 × 508." },
  { t: "ХБЕХ", q: "А автобус 12 минут тутам, Б автобус 18 минут тутам хөдөлдөг. Хоёулаа 8:00-д хөдөлсөн бол дараа нь хэдэн цагт хамт хөдлөх вэ?", a: "ХБЕХ(12, 18) = 36 тул 8:36-д." },
  { t: "Үлдэгдэл", q: "2¹⁰⁰-г 3-т хуваахад ямар үлдэгдэл гарах вэ?", a: "2 ≡ −1 (mod 3) тул 2¹⁰⁰ ≡ (−1)¹⁰⁰ = 1. Үлдэгдэл нь 1." },
  { t: "Сүүлийн цифр", q: "7²⁰²⁶-ийн сүүлийн цифр хэд вэ?", a: "7-гийн зэргүүдийн сүүлийн цифр 7, 9, 3, 1 гэж давтагдана. 2026-г 4-т хуваахад 2 үлдэх тул сүүлийн цифр нь 9." },
  { t: "Дирихлегийн зарчим", q: "Харанхуй шүүгээнд улаан, цэнхэр, ногоон оймс байна. Ижил өнгийн хос гаргаж авна гэдэгтээ итгэлтэй байхын тулд хамгийн багадаа хэдэн оймс авах вэ?", a: "4. Гурван оймс өнгө бүрээс нэг нэг таарч болно; дөрөв дэх нь тэдгээрийн аль нэгтэй заавал ижил өнгөтэй." },
  { t: "Тоолох", q: "Бүх цифр нь сондгой гурван оронтой тоо хэд байх вэ?", a: "Цифр бүр 5 сонголттой (1, 3, 5, 7, 9): 5 × 5 × 5 = 125." },
  { t: "Тоолох", q: "10 найз бие биетэйгээ нэг нэг удаа гар барьсан. Нийт хэдэн удаа гар барьсан бэ?", a: "10 × 9 ÷ 2 = 45." },
  { t: "Ухаалаг нийлбэр", q: "1 + 3 + 5 + … + 99-ийг ол.", a: "Энэ бол эхний 50 сондгой тоо, тэдгээрийн нийлбэр 50² = 2500." },
  { t: "Ухрааж бодох", q: "Би нэг тоо бодоод, түүнийгээ 2 дахин ихэсгэж, 6-г нэмээд, 4-т хуваахад 5 гарлаа. Би ямар тоо бодсон бэ?", a: "5 × 4 = 20, 20 − 6 = 14, 14 ÷ 2 = 7." },
  { t: "Өнцөг", q: "Гурвалжны өнцгүүд 2 : 3 : 4 харьцаатай. Хамгийн их өнцөг хэдэн градус вэ?", a: "9 хэсэг = 180° тул нэг хэсэг нь 20°. Хамгийн их өнцөг 4 × 20° = 80°." }
];
const POTD = MN ? POTD_MN : POTD_EN;
const potdQ = document.getElementById("potd-q");
if (potdQ) {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const p = POTD[dayOfYear % POTD.length];
  document.getElementById("potd-day").textContent = now.getDate();
  document.getElementById("potd-month").textContent = MN
    ? `${now.getMonth() + 1}-р сар`
    : now.toLocaleString("en", { month: "short" }).toUpperCase();
  document.getElementById("potd-topic").textContent = p.t;
  potdQ.textContent = p.q;
  document.getElementById("potd-a").textContent = p.a;
}

// ---------- Notes pages: highlight current topic in sidebar ----------
const sideLinks = [...document.querySelectorAll(".side a[href^='#']")];
if (sideLinks.length && "IntersectionObserver" in window) {
  const byId = new Map(sideLinks.map(a => [a.getAttribute("href").slice(1), a]));
  const visible = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
    const first = [...byId.keys()].find(id => visible.has(id));
    if (first) sideLinks.forEach(a => a.classList.toggle("active", a === byId.get(first)));
  }, { rootMargin: "-90px 0px -55% 0px" });
  byId.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
}

// ---------- Math: random problem ----------
const randomBtn = document.getElementById("random-problem");
if (randomBtn) {
  const lessons = [...document.querySelectorAll(".lesson")].filter(l => l.querySelector(".problem"));
  randomBtn.addEventListener("click", () => {
    const pick = lessons[Math.floor(Math.random() * lessons.length)];
    location.hash = pick.id;
  });
}

// ---------- English: quiz ----------
const QUIZ = [
  { q: "She ___ cakes every Sunday.", opts: ["bake", "bakes", "baking"], a: 1 },
  { q: "I want ___ apple.", opts: ["a", "an", "the"], a: 1 },
  { q: "My birthday is ___ June.", opts: ["in", "on", "at"], a: 0 },
  { q: "___ going to the park.", opts: ["Their", "There", "They're"], a: 2 },
  { q: "This problem is ___ than the last one.", opts: ["more easy", "easier", "easiest"], a: 1 },
  { q: "The dog wagged ___ tail.", opts: ["its", "it's"], a: 0 },
  { q: "I ___ my homework yesterday.", opts: ["finish", "have finished", "finished"], a: 2 },
  { q: "Math and English ___ my favourite subjects.", opts: ["is", "are"], a: 1 }
];
const quizBox = document.getElementById("quiz-box");
if (quizBox) {
  const scoreEl = document.getElementById("quiz-score");
  let answered = 0, correct = 0;
  QUIZ.forEach((item, n) => {
    const wrap = document.createElement("div");
    wrap.className = "quiz-q";
    const p = document.createElement("p");
    p.textContent = `${n + 1}. ${item.q}`;
    const opts = document.createElement("div");
    opts.className = "opts";
    item.opts.forEach((text, k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = text;
      b.addEventListener("click", () => {
        if (wrap.dataset.done) return;
        wrap.dataset.done = "1";
        answered++;
        if (k === item.a) correct++;
        else b.classList.add("wrong");
        opts.children[item.a].classList.add("right");
        const done = answered === QUIZ.length, perfect = correct === QUIZ.length;
        scoreEl.textContent = MN
          ? `оноо = ${correct} / ${answered}` + (done ? (perfect ? " · гайхалтай!" : " · дууслаа!") : "")
          : `score = ${correct} / ${answered}` + (done ? (perfect ? " · perfect!" : " · done!") : "");
      });
      opts.appendChild(b);
    });
    wrap.append(p, opts);
    quizBox.appendChild(wrap);
  });
}

// ---------- Bakery: recipe scaler ----------
const scaleEl = document.getElementById("scale");
if (scaleEl) {
  let scale = 1;
  const rows = document.querySelectorAll("#ingredients tr[data-amount]");
  // Mongolian writes decimals with a comma: 1,5
  const fmt = n => {
    const t = Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");
    return MN ? t.replace(".", ",") : t;
  };
  const update = () => {
    scaleEl.textContent = fmt(scale);
    rows.forEach(r => {
      r.lastElementChild.textContent = fmt(parseFloat(r.dataset.amount) * scale) + r.dataset.unit;
    });
  };
  document.querySelectorAll("[data-step]").forEach(b => {
    b.addEventListener("click", () => {
      scale = Math.min(5, Math.max(0.5, scale + parseFloat(b.dataset.step)));
      update();
    });
  });
  update();
}
