/* /assets/js/main.js */

/* -------------------------------
   Site-wide navigation structure
   (edit URLs/labels as you migrate)
---------------------------------*/
const NAV = [
  { label: "Home", href: "/" },

  { label: "Code", href: "/code/", children: [
    { label: "ICT 8", href: "/code/ict8/", children: [
      { label: "Unit 1", href: "/code/ict8/units/u1_essential_skills/", children: [
        { label: "Lesson 1.1", href: "/code/ict8/units/u1_essential_skills/lesson_1_1.html" },
        { label: "Lesson 1.2", href: "/code/ict8/units/u1_essential_skills/lesson_1_2.html" },
        { label: "Lesson 1.3", href: "/code/ict8/units/u1_essential_skills/lesson_1_3.html" },
      ]},
      { label: "Unit 2", href: "/code/ict8/units/u2_word_excel/", children: [ /* add lessons */ ]},
      { label: "Unit 3", href: "/code/ict8/units/u3_game_dev/", children: [] },
      { label: "Unit 4", href: "/code/ict8/units/u4_web_dev/", children: [] },
    ]},
  ]},

  { label: "Math", href: "/math/" },
  { label: "Bike", href: "/bike/" },
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

function buildSidebar() {
  const container = document.getElementById("sidebar");
  if (!container) return; // no sidebar on this page

  // Title
  if (!container.querySelector(".unit-title")) {
    const h2 = document.createElement("h2");
    h2.className = "unit-title";
    h2.textContent = "Navigation";
    container.appendChild(h2);
  }

  // Tree
  const ul = document.createElement("ul");
  ul.className = "navlist";
  NAV.forEach(node => ul.appendChild(renderItem(node)));
  container.appendChild(ul);

  // Activate current link + open ancestors
  const currentPath = window.location.pathname.toLowerCase();
  const links = container.querySelectorAll("a[href]");
  let best = null, bestLen = -1;

  links.forEach(a => {
    const href = a.getAttribute("href");
    const len = longestPrefixMatch(currentPath, href);
    if (len > bestLen) { bestLen = len; best = a; }
  });

  if (best) {
    best.classList.add("active");
    best.setAttribute("aria-current", "page");
    let el = best.parentElement;
    while (el && el !== container) {
      if (el.tagName.toLowerCase() === "details") el.open = true;
      el = el.parentElement;
    }
    container.querySelectorAll("details[data-href]").forEach(d => {
      const len = longestPrefixMatch(currentPath, d.dataset.href || "");
      if (len > 0) d.open = true;
    });
  }
}

/* -------------------------------
   Hook up other small enhancers here
   (no-ops when not applicable)
---------------------------------*/
function init() {
  buildSidebar();
  // add future initializers here (e.g., anchor copying, code copy buttons, etc.)
}

document.addEventListener("DOMContentLoaded", init);
