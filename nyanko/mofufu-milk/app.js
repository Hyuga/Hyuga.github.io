/* もふふミルク LP — ふわふわインタラクション */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- きらきらを散りばめる ---- */
  function scatterSparkles() {
    const field = document.getElementById("sparkleField");
    if (!field) return;
    const colors = ["#FFD166", "#FFB3C6", "#D5B8FF", "#B5EAD7", "#ffffff"];
    const count = window.innerWidth < 600 ? 22 : 42;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "sparkle";
      const size = 8 + Math.random() * 16;
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.setProperty("--s", size + "px");
      s.style.setProperty("--color", colors[(Math.random() * colors.length) | 0]);
      s.style.setProperty("--dur", (3 + Math.random() * 4).toFixed(2) + "s");
      s.style.setProperty("--delay", (Math.random() * 5).toFixed(2) + "s");
      frag.appendChild(s);
    }
    field.appendChild(frag);
  }

  /* ---- スクロールでふわっと表示 ---- */
  function revealOnScroll() {
    const items = document.querySelectorAll("[data-reveal]");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            // 同時に入った要素は少しずつ遅らせる
            setTimeout(() => e.target.classList.add("is-visible"), i * 90);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---- 図鑑カードを呼吸させる（傾き・ホバーはCSS側に残す） ----
     カード本体の transform は CSS の rotate / hover に任せ、
     浮遊は内側の <img> に適用して競合を避ける。 */
  function floatCards() {
    if (reduceMotion) return;
    document.querySelectorAll("[data-float]").forEach((el, idx) => {
      const dur = parseFloat(el.getAttribute("data-float")) || 7;
      const img = el.querySelector("img");
      if (!img) return;
      img.animate(
        [
          { transform: "translateY(0px)" },
          { transform: "translateY(-13px)" },
          { transform: "translateY(0px)" },
        ],
        { duration: dur * 1000, iterations: Infinity, delay: idx * 400, easing: "ease-in-out" }
      );
    });
  }

  /* ---- ヒーローのやわらかパララックス ---- */
  function parallax() {
    if (reduceMotion) return;
    const nodes = Array.from(document.querySelectorAll("[data-parallax]"));
    if (!nodes.length) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

    function onMove(e) {
      const w = window.innerWidth, h = window.innerHeight;
      tx = (e.clientX / w - 0.5) * 2;
      ty = (e.clientY / h - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function loop() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      nodes.forEach((n) => {
        const f = parseFloat(n.getAttribute("data-parallax")) || 0;
        n.style.setProperty("--px", (cx * f * 60).toFixed(2) + "px");
        n.style.setProperty("--py", (cy * f * 60).toFixed(2) + "px");
        n.style.transform = `translate(var(--px), var(--py))`;
      });
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }
    window.addEventListener("mousemove", onMove, { passive: true });
  }

  /* ---- init ---- */
  function init() {
    scatterSparkles();
    revealOnScroll();
    floatCards();
    parallax();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
