/* /assets/js/main.js */

/* -------------------------------
   Site-wide navigation structure
   (edit URLs/labels as you migrate)
---------------------------------*/
const NAV = [
  { label: "Home", href: "/" },

  { label: "Code", href: "/code/", children: [
    { label: "ICT 8", href: "/code/ict8/", children: [
      { label: "U1 Essential Skills", href: "/code/ict8/units/u1_essential_skills/", children: [
        { label: "1.1 Welcome to ICT 8", href: "/code/ict8/units/u1_essential_skills/lesson_1_1.html" },
        { label: "1.2 Typing & File Management", href: "/code/ict8/units/u1_essential_skills/lesson_1_2.html" },
        { label: "1.3 Parts of a Computer", href: "/code/ict8/units/u1_essential_skills/lesson_1_3.html" }
      ]},
      { label: "U2 Digital Media", href: "/code/ict8/units/u2_digital_media/", children: [] },
      { label: "U3 Game Development", href: "/code/ict8/units/u3_game_dev/", children: [] },
      { label: "U4 Web Development", href: "/code/ict8/units/u4_web_dev/", children: [] }
    ]},

    { label: "ICT 9", href: "/code/ict9/", children: [
      { label: "U1 Intro & Digital Citizenship", href: "/code/ict9/units/u1_intro_n_digital_citizenship/", children: [
        // Add lessons here, e.g.:
        // { label: "1.1 Course Outline & Expectations", href: "/code/ict9/units/u1_intro_n_digital_citizenship/lesson_1_1.html" },
        // { label: "1.2 20 Questions & Canva Poster", href: "/code/ict9/units/u1_intro_n_digital_citizenship/lesson_1_2.html" },
      ]},
      { label: "U2 Game Development", href: "/code/ict9/units/u2_game_development/", children: [] },
      { label: "U3 Game Promotion", href: "/code/ict9/units/u3_game_promotion/", children: [] },
      { label: "U4 Web Development", href: "/code/ict9/units/u4_web_development/", children: [] },
    ]},
    
  ]},

  { label: "Math", href: "/math/" },
  { label: "Bike", href: "/bike/" }
];

/* -------------------------------
   Utilities
---------------------------------*/
const ensureTrailingSlash = p =>
  p.endsWith("/") || /\.[a-z0-9]+$/i.test(p) ? p : p + "/";

function longestPrefixMatch(target, href) {
  href = href.toLowerCase();
  const H = ensureTrailingSlash(href);
  const T = ensureTrailingSlash(target);
  return T.startsWith(H) ? H.length : (T === href ? href.length : -1);
}

/* -------------------------------
   Sidebar builder
---------------------------------*/
function renderItem(node) {
  if (node.children && node.children.length) {
    const details = document.createElement("details");
    details.dataset.href = node.href;

    const summary = document.createElement("summary");
    const link = document.createElement("a");
    link.href = node.href;
    link.textContent = node.label;
    summary.appendChild(link);

    const ul = document.createElement("ul");
    ul.className = "navlist";
    node.children.forEach(child => ul.appendChild(renderItem(child)));

    details.appendChild(summary);
    details.appendChild(ul);
    return details;
  } else {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = node.href;
    a.textContent = node.label;
    li.appendChild(a);
    return li;
  }
}

function renderTopLevelCard(node){
  const card = document.createElement("div");
  card.className = "nav-card";
  card.dataset.href = node.href || "/";

  // top link (the card header)
  const top = document.createElement("a");
  top.className = "toplink";
  top.href = node.href || "/";
  top.textContent = node.label;
  card.appendChild(top);

  // children (if any)
  if (node.children && node.children.length){
    const ul = document.createElement("ul");
    ul.className = "navlist";
    node.children.forEach(child => ul.appendChild(renderItem(child)));
    card.appendChild(ul);
  }
  return card;
}

function buildSidebar(){
  const container = document.getElementById("sidebar");
  if (!container) return;

  // clear and add title
  container.innerHTML = "";
  const h2 = document.createElement("h2");
  h2.className = "unit-title";
  h2.textContent = "Navigation";
  container.appendChild(h2);

  // render each top-level NAV item as its own card
  NAV.forEach(node => container.appendChild(renderTopLevelCard(node)));

  // activate current link and open the right card
  const currentPath = window.location.pathname.toLowerCase();
  const links = container.querySelectorAll("a[href]");
  let best = null, bestLen = -1;

  links.forEach(a => {
    const href = a.getAttribute("href");
    const len = longestPrefixMatch(currentPath, href);
    if (len > bestLen){ bestLen = len; best = a; }
  });

  if (best){
    best.classList.add("active");
    best.setAttribute("aria-current", "page");

    // open the matching top-level card
    const card = best.closest(".nav-card");
    if (card) card.classList.add("open");

    // open any nested <details> (Units/Lessons) so the path is visible
    let el = best.parentElement;
    while (el && el !== container){
      if (el.tagName.toLowerCase() === "details") el.open = true;
      el = el.parentElement;
    }
  }
}

function highlightRightRail() {
  const rr = document.getElementById("sidebar-right");
  if (!rr) return;
  const here = window.location.pathname.toLowerCase();
  rr.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    // resolve relative href against current page
    const url = new URL(href, window.location.origin + here).pathname.toLowerCase();
    if (url === here) a.classList.add('active');
  });
}

/* ---------- Auto title + H1 + breadcrumb from NAV ---------- */
const SITE_TITLE_SUFFIX = " · codemathbike";  // shown in the browser tab

function flattenNav(nav, parent = null, out = []) {
  for (const node of nav) {
    const copy = { ...node, parent };
    out.push(copy);
    if (node.children && node.children.length) flattenNav(node.children, copy, out);
  }
  return out;
}
function findBestNavMatch(pathname) {
  const nodes = flattenNav(NAV);
  const p = pathname.toLowerCase();
  let best = null, bestLen = -1;
  for (const n of nodes) {
    const href = n.href || "";
    const len = longestPrefixMatch(p, href);
    if (len > bestLen) { bestLen = len; best = n; }
  }
  return best;
}
function chainToRoot(node) {
  const chain = [];
  let cur = node;
  while (cur) { chain.unshift(cur); cur = cur.parent || null; }
  return chain;
}
function ensurePageTitleElement() {
  // Prefer an existing .page-title; otherwise create one at top of #content
  let h1 = document.querySelector(".page-title") || document.querySelector("h1");
  if (!h1) {
    const content = document.getElementById("content") || document.body;
    h1 = document.createElement("h1");
    h1.className = "page-title";
    content.prepend(h1);
  }
  return h1;
}
function renderBreadcrumb(chain) {
  // Prefer the header’s title wrap; create one if missing
  let target =
    document.querySelector(".site-header .page-title-wrap") ||
    document.querySelector(".site-header");

  if (!target) {
    // build a minimal header so crumbs never land in #content
    const hdr = document.createElement("header");
    hdr.className = "site-header";
    const wrap = document.createElement("div");
    wrap.className = "page-title-wrap";
    hdr.appendChild(wrap);
    document.body.prepend(hdr);
    target = wrap;
  }

  // remove any old breadcrumb (e.g., ones previously injected in #content)
  document.querySelectorAll("#breadcrumb").forEach(el => el.remove());

  // build breadcrumb
  const bc = document.createElement("p");
  bc.id = "breadcrumb";
  bc.className = "small";

  chain.forEach((n, i) => {
    if (i) bc.append(" › ");
    if (i < chain.length - 1) {
      const a = document.createElement("a");
      a.href = n.href;
      a.textContent = n.label;
      bc.append(a);
    } else {
      const strong = document.createElement("strong");
      strong.textContent = n.label;
      bc.append(strong);
    }
  });

  // Put crumbs ABOVE the H1 in the header
  target.prepend(bc);
}

function autoTitleFromNav() {
  if (document.body?.dataset?.autoTitle === "off") return;

  const best = findBestNavMatch(window.location.pathname);
  if (!best) return;

  const chain = chainToRoot(best);

  const chainText = chain.map(n => n.label).join(" · ");
  document.title = chainText + SITE_TITLE_SUFFIX;

  const h1 = ensurePageTitleElement();
  if (h1 && h1.dataset.lock !== "true") h1.textContent = best.label;

  // Always render breadcrumb — now in the header
  renderBreadcrumb(chain);
}

/* -------------------------------
   Init (single, merged)
---------------------------------*/
// keep exactly one init():
function init() {
  buildSidebar();
  autoTitleFromNav();   // sets <title>, ensures/updates the H1, renders breadcrumb
  highlightRightRail(); // optional: highlights active right-rail links
}
document.addEventListener("DOMContentLoaded", init);

