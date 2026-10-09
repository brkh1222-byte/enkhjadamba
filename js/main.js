// ============================================
// Shared scripts for every page
// ============================================

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Home: fun facts ----------
const FACTS = [
  "111,111,111 × 111,111,111 = 12,345,678,987,654,321.",
  "Zero is even: 0 ÷ 2 = 0 with no remainder.",
  "A 'googol' is 1 followed by 100 zeros.",
  "Any number made of the same digit three times (like 777) is divisible by 37.",
  "The word 'set' has more meanings than almost any other English word.",
  "'Rhythm' is one of the longest English words with no a, e, i, o or u.",
  "π has been calculated to trillions of digits, and it never repeats.",
  "The sentence 'The quick brown fox jumps over the lazy dog' uses every letter of the alphabet.",
  "Sponge cake rises because heat makes tiny air bubbles in the batter grow.",
  "If you fold a piece of paper in half 7 times, it is 2⁷ = 128 layers thick."
];
const factText = document.getElementById("fact-text");
const factBtn = document.getElementById("fact-btn");
if (factText && factBtn) {
  let i = Math.floor(Math.random() * FACTS.length);
  const show = () => { factText.textContent = FACTS[i]; };
  show();
  factBtn.addEventListener("click", () => { i = (i + 1) % FACTS.length; show(); });
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
      b.className = "btn small";
      b.textContent = text;
      b.addEventListener("click", () => {
        if (wrap.dataset.done) return;
        wrap.dataset.done = "1";
        answered++;
        if (k === item.a) correct++;
        else b.classList.add("wrong");
        opts.children[item.a].classList.add("right");
        scoreEl.textContent = `score = ${correct} / ${answered}` +
          (answered === QUIZ.length ? (correct === QUIZ.length ? "  🎉 perfect!" : "  ✓ done!") : "");
      });
      opts.appendChild(b);
    });
    wrap.append(p, opts);
    quizBox.appendChild(wrap);
  });
}

// ---------- Bakery: gallery + lightbox ----------
const gallery = document.getElementById("gallery");
if (gallery && typeof CAKES !== "undefined") {
  const filters = document.getElementById("filters");
  const categories = ["all", ...new Set(CAKES.map(c => c.category))];
  let active = "all";

  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const lbTitle = document.getElementById("lightbox-title");
  const lbText = document.getElementById("lightbox-text");
  const closeBtn = document.getElementById("lightbox-close");

  const openLightbox = cake => {
    lbImg.src = cake.image;
    lbImg.alt = cake.title;
    lbTitle.textContent = cake.title;
    lbText.textContent = cake.text;
    lightbox.classList.add("open");
    closeBtn.focus();
  };
  const closeLightbox = () => lightbox.classList.remove("open");
  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

  const render = () => {
    gallery.innerHTML = "";
    CAKES.filter(c => active === "all" || c.category === active).forEach(cake => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "card cake-card";
      const img = document.createElement("img");
      img.className = "photo";
      img.src = cake.image;
      img.alt = cake.title;
      img.loading = "lazy";
      const info = document.createElement("div");
      info.className = "info";
      const h = document.createElement("h3");
      h.textContent = cake.title;
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `#${cake.category} · ${cake.date}`;
      info.append(h, meta);
      card.append(img, info);
      card.addEventListener("click", () => openLightbox(cake));
      gallery.appendChild(card);
    });
  };

  categories.forEach(cat => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn small" + (cat === active ? " active" : "");
    b.textContent = cat;
    b.addEventListener("click", () => {
      active = cat;
      [...filters.children].forEach(x => x.classList.toggle("active", x === b));
      render();
    });
    filters.appendChild(b);
  });
  render();
}

// ---------- Bakery: recipe scaler ----------
const scaleEl = document.getElementById("scale");
if (scaleEl) {
  let scale = 1;
  const rows = document.querySelectorAll("#ingredients tr[data-amount]");
  const fmt = n => (Number.isInteger(n) ? n : n.toFixed(1).replace(/\.0$/, ""));
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
