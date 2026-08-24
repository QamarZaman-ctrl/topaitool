const SITE = {
  name: "Top AI Tools Blog",
  url: "https://topaitools.com",
  description: "Expert guides and reviews on the best free AI tools — image generators, chatbots, art tools, open source AI, and more. Data-driven content based on real search trends.",
  email: "official.digitalzonepk@gmail.com",
  locale: "en_US",
};

function setMetaTag(attr, key, value) {
  if (!value) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = url;
}

function injectJsonLd(data) {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function applyPageSEO({ title, description, path, type = "website", keywords = "" }) {
  const url = `${SITE.url}${path || ""}`;
  document.title = title;

  setMetaTag("name", "description", description);
  setMetaTag("name", "robots", "index, follow, max-image-preview:large");
  setMetaTag("name", "author", SITE.name);
  if (keywords) setMetaTag("name", "keywords", keywords);

  setMetaTag("property", "og:title", title);
  setMetaTag("property", "og:description", description);
  setMetaTag("property", "og:type", type);
  setMetaTag("property", "og:url", url);
  setMetaTag("property", "og:site_name", SITE.name);
  setMetaTag("property", "og:locale", SITE.locale);

  setMetaTag("name", "twitter:card", "summary_large_image");
  setMetaTag("name", "twitter:title", title);
  setMetaTag("name", "twitter:description", description);

  setCanonical(url);
}

function injectOrganizationSchema() {
  injectJsonLd({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    description: SITE.description,
  });
}

function injectWebSiteSchema() {
  injectJsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/blog.html?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  });
}

function injectArticleSchema(post) {
  injectJsonLd({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date || "2026-08-15",
    dateModified: post.date || "2026-08-15",
    author: { "@type": "Organization", name: SITE.name },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    mainEntityOfPage: `${SITE.url}/post.html?id=${post.id}`,
    keywords: post.keywords ? post.keywords.join(", ") : "",
    articleSection: post.category,
  });
}

function injectBreadcrumbSchema(items) {
  injectJsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

function injectContactPageSchema() {
  injectJsonLd({
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Us — Top AI Tools Blog",
    url: `${SITE.url}/contact.html`,
    description: "Get in touch with the Top AI Tools Blog team for questions, feedback, and partnership inquiries.",
  });
}
