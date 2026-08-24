/**
 * Top AI Tools — Pro Theme & Readability Script (2026)
 */

// ---------------------------------------------------------------------------
// 1. Utilities & Formatters
// ---------------------------------------------------------------------------
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(0) + "K";
  return num.toString();
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getPostById(id) {
  return typeof POSTS !== "undefined" ? POSTS.find((p) => p.id === id) : null;
}

// ---------------------------------------------------------------------------
// 2. Toast Notifications
// ---------------------------------------------------------------------------
function showToast(message, icon = "⚡") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span aria-hidden="true">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
    if (container.children.length === 0) container.remove();
  }, 3000);
}

// ---------------------------------------------------------------------------
// 3. Theme Toggle (Dark / Light Mode)
// ---------------------------------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme || (systemPrefersDark ? "dark" : "light");

  document.documentElement.setAttribute("data-theme", theme);
  updateThemeToggleIcons(theme);

  // Listen to system changes if user hasn't explicitly set preference
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      const newTheme = e.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      updateThemeToggleIcons(newTheme);
    }
  });

  // Attach click listener to all theme toggles
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      updateThemeToggleIcons(newTheme);
      showToast(newTheme === "dark" ? "Dark mode enabled" : "Light mode enabled", newTheme === "dark" ? "🌙" : "☀️");
    });
  });
}

function updateThemeToggleIcons(theme) {
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.innerHTML = theme === "dark" ? "☀️" : "🌙";
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    btn.setAttribute("title", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  });
}

// ---------------------------------------------------------------------------
// 4. Card Renderers
// ---------------------------------------------------------------------------
function renderPostCard(post) {
  return `
    <article class="post-card" data-category="${post.category}">
      <div class="post-card-image">${post.icon}</div>
      <div class="post-card-body">
        <div class="post-meta">
          <span class="post-category">${post.category}</span>
        </div>
        <h3><a href="post.html?id=${post.id}">${post.title}</a></h3>
        <p>${post.excerpt}</p>
        <div class="post-stats">
          <span class="post-stats-item">🔥 <strong>${formatNumber(post.searches)}</strong> monthly searches</span>
          <span class="post-stats-item">⏱️ ${post.readTime}</span>
        </div>
      </div>
    </article>
  `;
}

function renderFeaturedPost(post) {
  return `
    <article class="featured-post">
      <div class="featured-post-image">
        <span class="featured-badge">⭐ Featured Guide</span>
        ${post.icon}
      </div>
      <div class="featured-post-content">
        <div class="post-meta">
          <span class="post-category">${post.category}</span>
        </div>
        <h2><a href="post.html?id=${post.id}">${post.title}</a></h2>
        <p>${post.excerpt}</p>
        <div class="post-stats" style="border:none;padding:0;margin-bottom:1.5rem">
          <span class="post-stats-item">🔥 <strong>${formatNumber(post.searches)}</strong> monthly searches</span>
          <span class="post-stats-item">⏱️ ${post.readTime} read</span>
        </div>
        <a href="post.html?id=${post.id}" class="btn btn-primary">Read In-Depth Guide →</a>
      </div>
    </article>
  `;
}

// ---------------------------------------------------------------------------
// 5. Home Page Logic
// ---------------------------------------------------------------------------
function initHomePage() {
  if (typeof POSTS === "undefined") return;

  const featured = POSTS.find((p) => p.featured) || POSTS[0];
  const featuredEl = document.getElementById("featured-post");
  if (featuredEl) featuredEl.innerHTML = renderFeaturedPost(featured);

  const recentPosts = POSTS.filter((p) => !p.featured).slice(0, 6);
  const gridEl = document.getElementById("recent-posts");
  if (gridEl) gridEl.innerHTML = recentPosts.map(renderPostCard).join("");

  const categoryEl = document.getElementById("category-grid");
  if (categoryEl && typeof CATEGORIES !== "undefined") {
    categoryEl.innerHTML = CATEGORIES.filter((c) => c.name !== "All")
      .map(
        (c) => `
        <a href="blog.html?category=${encodeURIComponent(c.name)}" class="category-card">
          <div class="category-icon">${c.icon}</div>
          <h3>${c.name}</h3>
          <span>${c.count} article${c.count !== 1 ? "s" : ""}</span>
        </a>
      `
      )
      .join("");
  }

  initSearch("hero-search-input");
}

// ---------------------------------------------------------------------------
// 6. Blog Listing Page Logic (Filters, Search, Sorting)
// ---------------------------------------------------------------------------
function initBlogPage() {
  if (typeof POSTS === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const activeCategory = params.get("category") || "All";
  const searchQuery = params.get("q") || "";
  const activeSort = params.get("sort") || "searches";

  const searchInput = document.getElementById("blog-search");
  if (searchInput && searchQuery) searchInput.value = searchQuery;

  renderFilters(activeCategory);
  filterAndSortPosts(activeCategory, searchQuery, activeSort);
  initSearch("blog-search");

  // Sorting listener
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.value = activeSort;
    sortSelect.addEventListener("change", () => {
      const cat = document.querySelector(".filter-btn.active")?.dataset.category || "All";
      const q = document.getElementById("blog-search")?.value || "";
      filterAndSortPosts(cat, q, sortSelect.value);
    });
  }
}

function renderFilters(activeCategory) {
  const filtersEl = document.getElementById("filters");
  if (!filtersEl || typeof CATEGORIES === "undefined") return;

  filtersEl.innerHTML = CATEGORIES.map(
    (c) => `
    <button class="filter-btn ${c.name === activeCategory ? "active" : ""}" data-category="${c.name}">
      <span>${c.icon}</span> ${c.name} <small style="opacity:0.7">(${c.count})</small>
    </button>
  `
  ).join("");

  filtersEl.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.category;
      const q = document.getElementById("blog-search")?.value || "";
      const sort = document.getElementById("sort-select")?.value || "searches";
      renderFilters(cat);
      filterAndSortPosts(cat, q, sort);
      history.replaceState(null, "", cat === "All" ? "blog.html" : `blog.html?category=${encodeURIComponent(cat)}`);
    });
  });
}

function filterAndSortPosts(category, query, sort = "searches") {
  const gridEl = document.getElementById("all-posts");
  const countEl = document.getElementById("results-count");
  if (!gridEl) return;

  let filtered = [...POSTS];

  if (category && category !== "All") {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (query) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.keywords && p.keywords.some((k) => k.toLowerCase().includes(q)))
    );
  }

  // Sort logic
  if (sort === "searches") {
    filtered.sort((a, b) => (b.searches || 0) - (a.searches || 0));
  } else if (sort === "title") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === "readtime") {
    filtered.sort((a, b) => parseInt(a.readTime) - parseInt(b.readTime));
  }

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} article${filtered.length !== 1 ? "s" : ""}`;
  }

  if (filtered.length === 0) {
    gridEl.innerHTML = `
      <div class="no-results">
        <h3>No articles found</h3>
        <p style="color:var(--text-muted);margin:0.5rem 0 1rem">We couldn't find any guides matching "${query || category}".</p>
        <button class="btn btn-outline btn-sm" onclick="clearBlogFilters()">Reset Filters</button>
      </div>
    `;
  } else {
    gridEl.innerHTML = filtered.map(renderPostCard).join("");
  }
}

window.clearBlogFilters = function() {
  const input = document.getElementById("blog-search");
  if (input) input.value = "";
  renderFilters("All");
  filterAndSortPosts("All", "", "searches");
  history.replaceState(null, "", "blog.html");
};

// ---------------------------------------------------------------------------
// 7. Article Detail Page & Super-Readable Experience (post.html)
// ---------------------------------------------------------------------------
function initPostPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const post = getPostById(id);

  const container = document.getElementById("article-container");
  if (!container) return;

  if (!post) {
    container.innerHTML = `
      <div class="no-results" style="margin-top:2rem">
        <h2>Article Not Found</h2>
        <p style="color:var(--text-muted);margin:1rem 0 1.5rem">The guide you are looking for does not exist or has been moved.</p>
        <a href="blog.html" class="btn btn-primary">Browse All AI Guides →</a>
      </div>
    `;
    document.title = "Article Not Found | Top AI Tools Blog";
    return;
  }

  // SEO Handling
  const pageTitle = `${post.title} | Top AI Tools Blog`;
  const pageUrl = `/post.html?id=${post.id}`;
  const keywords = post.keywords ? post.keywords.join(", ") : "";

  if (typeof applyPageSEO === "function") {
    applyPageSEO({
      title: pageTitle,
      description: post.excerpt,
      path: pageUrl,
      type: "article",
      keywords,
    });
  } else {
    document.title = pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = post.excerpt;
  }

  if (typeof injectArticleSchema === "function") injectArticleSchema(post);
  if (typeof injectBreadcrumbSchema === "function") {
    injectBreadcrumbSchema([
      { name: "Home", url: `${typeof SITE !== "undefined" ? SITE.url : ""}/` },
      { name: "Blog", url: `${typeof SITE !== "undefined" ? SITE.url : ""}/blog.html` },
      { name: post.title, url: `${typeof SITE !== "undefined" ? SITE.url : ""}${pageUrl}` },
    ]);
  }

  // Calculate word count
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = post.content;
  const wordCount = tempDiv.innerText.trim().split(/\s+/).length;

  // Render complete readable article layout
  container.innerHTML = `
    <!-- Top Breadcrumb -->
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a> <span aria-hidden="true">›</span>
      <a href="blog.html">Blog</a> <span aria-hidden="true">›</span>
      <a href="blog.html?category=${encodeURIComponent(post.category)}">${post.category}</a> <span aria-hidden="true">›</span>
      <span style="color:var(--text);font-weight:600">${post.title.length > 35 ? post.title.substring(0, 35) + '...' : post.title}</span>
    </nav>

    <div class="article-page-layout">
      <!-- Sticky Desktop Table of Contents Sidebar -->
      <aside class="article-toc-sidebar" aria-label="Table of Contents">
        <div class="toc-header">
          <span aria-hidden="true">📑</span> Contents
        </div>
        <ul class="toc-list" id="desktop-toc"></ul>
      </aside>

      <!-- Main Article Column -->
      <div class="article-main">
        <header class="article-header">
          <div class="post-meta">
            <span class="post-category">${post.category}</span>
            <span class="post-date">⏱️ ${post.readTime} read</span>
            <span class="post-date">📝 ${wordCount.toLocaleString()} words</span>
          </div>

          <h1>${post.title}</h1>

          <!-- Reading Toolbar -->
          <div class="reading-toolbar">
            <div class="reading-stats-group">
              <span>🔥 <strong>${formatNumber(post.searches)}</strong> monthly searches</span>
              <span>🛡️ <strong>Verified Free Tier</strong></span>
            </div>
            <div class="reading-tools-group">
              <div class="font-size-adjuster" title="Adjust font size">
                <button class="font-btn" id="font-decrease" aria-label="Decrease font size">A-</button>
                <button class="font-btn" id="font-reset" aria-label="Reset font size">A</button>
                <button class="font-btn" id="font-increase" aria-label="Increase font size">A+</button>
              </div>
              <button class="tool-action-btn" id="share-btn" title="Share article">
                <span>🔗</span> Copy Link
              </button>
            </div>
          </div>
        </header>

        <!-- Mobile Collapsible Table of Contents -->
        <div class="toc-mobile-box">
          <div class="toc-mobile-header" id="mobile-toc-toggle">
            <span>📑 Quick Table of Contents</span>
            <span id="mobile-toc-chevron">▾</span>
          </div>
          <div class="toc-mobile-content" id="mobile-toc-content">
            <ul class="toc-list" id="mobile-toc"></ul>
          </div>
        </div>

        <!-- Article Content -->
        <div class="article-content" id="post-body">
          ${post.content}
        </div>

        <!-- Keyword Tags -->
        ${post.keywords && post.keywords.length ? `
          <div class="keyword-cloud">
            <h3>🔍 Related Search Topics</h3>
            <div>
              ${post.keywords.map((k) => `
                <a href="blog.html?q=${encodeURIComponent(k)}" class="keyword-tag">
                  #${k}
                </a>
              `).join("")}
            </div>
          </div>
        ` : ""}

        <!-- Helpful Feedback Widget -->
        <div class="article-feedback">
          <h3>Was this AI guide helpful?</h3>
          <p>Your feedback helps us keep our free AI recommendations accurate and up to date.</p>
          <div class="feedback-buttons">
            <button class="feedback-btn" onclick="handleArticleFeedback(true)">👍 Yes, very helpful!</button>
            <button class="feedback-btn" onclick="handleArticleFeedback(false)">👎 Needs more details</button>
          </div>
        </div>

        <!-- Next / Prev Post Navigation -->
        <div class="post-navigation" id="post-navigation"></div>
      </div>
    </div>
  `;

  // Build Dynamic TOC
  buildTableOfContents();

  // Initialize Reading Progress Bar
  initReadingProgressBar();

  // Initialize Font Adjusters
  initFontAdjuster();

  // Initialize Share Link
  initShareButton(post);

  // Initialize Next/Prev Post Navigation
  initPostNavigation(post);

  // Wrap tables for responsive scrolling
  enhanceTables();

  // Render Related Posts
  const related = POSTS.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);
  const relatedEl = document.getElementById("related-posts");
  if (relatedEl && related.length) {
    relatedEl.innerHTML = related.map(renderPostCard).join("");
  }
}

// ---------------------------------------------------------------------------
// 8. Dynamic Table of Contents (TOC) & ScrollSpy
// ---------------------------------------------------------------------------
function buildTableOfContents() {
  const contentEl = document.getElementById("post-body");
  const desktopToc = document.getElementById("desktop-toc");
  const mobileToc = document.getElementById("mobile-toc");
  const mobileToggle = document.getElementById("mobile-toc-toggle");
  const mobileContent = document.getElementById("mobile-toc-content");
  const mobileChevron = document.getElementById("mobile-toc-chevron");

  if (!contentEl || !desktopToc) return;

  const headings = contentEl.querySelectorAll("h2, h3");
  if (headings.length === 0) {
    document.querySelector(".article-toc-sidebar")?.remove();
    document.querySelector(".toc-mobile-box")?.remove();
    return;
  }

  let tocHtml = "";
  headings.forEach((heading, idx) => {
    let id = heading.id;
    if (!id) {
      id = "section-" + (idx + 1) + "-" + heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      heading.id = id;
    }

    const isH3 = heading.tagName.toLowerCase() === "h3";
    tocHtml += `
      <li class="toc-item ${isH3 ? 'toc-sub' : ''}">
        <a href="#${id}" class="toc-link" data-target="${id}">
          ${heading.textContent}
        </a>
      </li>
    `;
  });

  desktopToc.innerHTML = tocHtml;
  if (mobileToc) mobileToc.innerHTML = tocHtml;

  // Mobile Toggle Behavior
  if (mobileToggle && mobileContent) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = mobileContent.classList.toggle("open");
      if (mobileChevron) mobileChevron.textContent = isOpen ? "▴" : "▾";
    });
  }

  // Smooth TOC Click Handling
  document.querySelectorAll(".toc-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("data-target");
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const headerOffset = 90;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        if (mobileContent && mobileContent.classList.contains("open")) {
          mobileContent.classList.remove("open");
          if (mobileChevron) mobileChevron.textContent = "▾";
        }
      }
    });
  });

  // ScrollSpy with IntersectionObserver / scroll listener
  initScrollSpy(headings);
}

function initScrollSpy(headings) {
  const tocLinks = document.querySelectorAll(".toc-link");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocLinks.forEach((link) => {
            if (link.getAttribute("data-target") === id) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });
        }
      });
    },
    { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
  );

  headings.forEach((h) => observer.observe(h));
}

// ---------------------------------------------------------------------------
// 9. Reading Progress Bar
// ---------------------------------------------------------------------------
function initReadingProgressBar() {
  let progressContainer = document.querySelector(".reading-progress-container");
  if (!progressContainer) {
    progressContainer = document.createElement("div");
    progressContainer.className = "reading-progress-container";
    progressContainer.innerHTML = '<div class="reading-progress-bar" id="reading-progress-bar"></div>';
    document.body.prepend(progressContainer);
  }

  const progressBar = document.getElementById("reading-progress-bar");
  if (!progressBar) return;

  window.addEventListener("scroll", () => {
    const contentEl = document.getElementById("post-body") || document.body;
    const contentRect = contentEl.getBoundingClientRect();
    const contentTop = window.pageYOffset + contentRect.top;
    const contentHeight = contentEl.offsetHeight;
    const scrollPos = window.pageYOffset;
    const windowHeight = window.innerHeight;

    let progress = ((scrollPos - contentTop) / (contentHeight - windowHeight)) * 100;
    progress = Math.max(0, Math.min(100, progress));
    progressBar.style.width = progress + "%";
  });
}

// ---------------------------------------------------------------------------
// 10. Font Sizing Adjuster & Table Styling
// ---------------------------------------------------------------------------
function initFontAdjuster() {
  const body = document.getElementById("post-body");
  if (!body) return;

  const fontSizes = ["1rem", "1.125rem", "1.25rem", "1.375rem"];
  let currentIndex = 1; // Default is 1.125rem

  const decreaseBtn = document.getElementById("font-decrease");
  const resetBtn = document.getElementById("font-reset");
  const increaseBtn = document.getElementById("font-increase");

  if (decreaseBtn) {
    decreaseBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        body.style.fontSize = fontSizes[currentIndex];
        showToast(`Text size: ${currentIndex === 0 ? "Compact" : "Normal"}`, "🔤");
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      currentIndex = 1;
      body.style.fontSize = fontSizes[currentIndex];
      showToast("Text size: Default", "🔤");
    });
  }

  if (increaseBtn) {
    increaseBtn.addEventListener("click", () => {
      if (currentIndex < fontSizes.length - 1) {
        currentIndex++;
        body.style.fontSize = fontSizes[currentIndex];
        showToast(`Text size: ${currentIndex === 2 ? "Large" : "Extra Large"}`, "🔤");
      }
    });
  }
}

function enhanceTables() {
  document.querySelectorAll(".article-content table").forEach((table) => {
    if (!table.parentElement.classList.contains("table-container")) {
      const wrapper = document.createElement("div");
      wrapper.className = "table-container";
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  });
}

// ---------------------------------------------------------------------------
// 11. Sharing & Feedback
// ---------------------------------------------------------------------------
function initShareButton(post) {
  const shareBtn = document.getElementById("share-btn");
  if (!shareBtn) return;

  shareBtn.addEventListener("click", () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast("Article link copied to clipboard!", "📋");
      });
    } else {
      prompt("Copy article link:", url);
    }
  });
}

window.handleArticleFeedback = function(isPositive) {
  const feedbackWidget = document.querySelector(".article-feedback");
  if (feedbackWidget) {
    feedbackWidget.innerHTML = `
      <div style="padding:1rem 0">
        <span style="font-size:2rem">${isPositive ? "🎉" : "🙏"}</span>
        <h3 style="margin:0.5rem 0">Thank You for Your Feedback!</h3>
        <p style="color:var(--text-muted)">We continuously update our guides based on community insights.</p>
      </div>
    `;
  }
  showToast("Feedback submitted. Thank you!", "✨");
};

// ---------------------------------------------------------------------------
// 12. Next & Previous Navigation
// ---------------------------------------------------------------------------
function initPostNavigation(currentPost) {
  const navContainer = document.getElementById("post-navigation");
  if (!navContainer || typeof POSTS === "undefined") return;

  const currentIndex = POSTS.findIndex((p) => p.id === currentPost.id);
  const prevPost = currentIndex > 0 ? POSTS[currentIndex - 1] : null;
  const nextPost = currentIndex < POSTS.length - 1 ? POSTS[currentIndex + 1] : null;

  let html = "";
  if (prevPost) {
    html += `
      <a href="post.html?id=${prevPost.id}" class="post-nav-card">
        <span class="post-nav-label">← Previous Guide</span>
        <span class="post-nav-title">${prevPost.title}</span>
      </a>
    `;
  } else {
    html += `<div></div>`;
  }

  if (nextPost) {
    html += `
      <a href="post.html?id=${nextPost.id}" class="post-nav-card" style="text-align:right">
        <span class="post-nav-label">Next Guide →</span>
        <span class="post-nav-title">${nextPost.title}</span>
      </a>
    `;
  }

  navContainer.innerHTML = html;
}

// ---------------------------------------------------------------------------
// 13. Global Search & Keyboard Shortcuts
// ---------------------------------------------------------------------------
function initSearch(inputId = "hero-search-input") {
  const input = document.getElementById(inputId);
  if (!input) return;

  const form = input.closest("form") || input.parentElement;
  const handler = (e) => {
    if (e) e.preventDefault();
    const q = input.value.trim();
    if (window.location.pathname.includes("blog.html")) {
      const cat = document.querySelector(".filter-btn.active")?.dataset.category || "All";
      const sort = document.getElementById("sort-select")?.value || "searches";
      filterAndSortPosts(cat, q, sort);
    } else if (q) {
      window.location.href = `blog.html?q=${encodeURIComponent(q)}`;
    }
  };

  if (form?.tagName === "FORM") {
    form.addEventListener("submit", handler);
  }
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handler(e);
  });

  // Debounced live search on blog page
  if (window.location.pathname.includes("blog.html")) {
    let timeout;
    input.addEventListener("input", () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const cat = document.querySelector(".filter-btn.active")?.dataset.category || "All";
        const sort = document.getElementById("sort-select")?.value || "searches";
        filterAndSortPosts(cat, input.value.trim(), sort);
      }, 250);
    });
  }
}

function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Pressing '/' focuses search input if not currently in an input
    if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      const searchInput = document.getElementById("hero-search-input") || document.getElementById("blog-search");
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
        showToast("Search activated", "🔍");
      }
    }
  });
}

// ---------------------------------------------------------------------------
// 14. Mobile Navigation & Back to Top
// ---------------------------------------------------------------------------
function initMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen);
      toggle.innerHTML = isOpen ? "✕" : "☰";
    });
  }
}

function initBackToTop() {
  let btn = document.querySelector(".back-to-top");
  if (!btn) {
    btn = document.createElement("button");
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = "↑";
    document.body.appendChild(btn);
  }

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 350) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initNewsletter() {
  const form = document.querySelector(".newsletter-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = form.querySelector("input")?.value;
    if (email) {
      form.innerHTML = `
        <div style="background:rgba(255,255,255,0.2);padding:0.85rem 1.5rem;border-radius:999px;font-weight:700">
          ✅ Subscribed! You will receive the weekly free AI tools report.
        </div>
      `;
      showToast("Thank you for subscribing!", "🎉");
    }
  });
}

// ---------------------------------------------------------------------------
// 15. DOM Content Loaded Initialization
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMobileMenu();
  initBackToTop();
  initKeyboardShortcuts();
  initNewsletter();

  const page = document.body.dataset.page;
  if (page === "home") {
    initHomePage();
    if (typeof injectWebSiteSchema === "function") injectWebSiteSchema();
    if (typeof injectOrganizationSchema === "function") injectOrganizationSchema();
  } else if (page === "blog") {
    initBlogPage();
  } else if (page === "post") {
    initPostPage();
  }
});
