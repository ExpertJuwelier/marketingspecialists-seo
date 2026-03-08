import { readFile, writeFile, mkdir, rm, cp, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const CONTENT_DIR = path.join(ROOT, "content");
const ASSETS_SRC = path.join(ROOT, "assets");
const SITE_URL = process.env.SITE_URL || "https://marketingspecialists-seo.pages.dev";

async function loadContent() {
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true });

  let site = null;
  const pages = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;

    const fullPath = path.join(CONTENT_DIR, entry.name);
    const raw = await readFile(fullPath, "utf8");
    const json = JSON.parse(raw);

    if (entry.name === "pages.json") {
      if (json.site) site = json.site;
      if (Array.isArray(json.pages)) pages.push(...json.pages);
      continue;
    }

    if (json.site && !site) site = json.site;

    if (Array.isArray(json.pages)) {
      pages.push(...json.pages);
    } else if (json.path) {
      pages.push(json);
    }
  }

  if (!site) {
    throw new Error("No site configuration found in content/pages.json");
  }

  return { site, pages };
}

const data = await loadContent();
const pagesByPath = new Map(data.pages.map((page) => [page.path, page]));

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

try {
  await cp(ASSETS_SRC, path.join(DIST, "assets"), { recursive: true });
} catch {}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pathToUrl(pagePath) {
  if (pagePath === "/") return SITE_URL + "/";
  return SITE_URL + pagePath;
}

function truncate(text = "", length = 140) {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "...";
}

function renderNav(site) {
  return site.nav
    .map(
      (item) =>
        `<a href="${escapeHtml(item.url)}">${escapeHtml(item.label)}</a>`
    )
    .join("");
}

function renderFooterLinks(site) {
  return site.footerLinks
    .map(
      (item) =>
        `<a href="${escapeHtml(item.url)}">${escapeHtml(item.label)}</a>`
    )
    .join("");
}

function renderSections(page) {
  return (page.sections || [])
    .map((section, index) => {
      const adBlock =
        index === 1
          ? `<div class="ad-space">Google Ad Space</div>`
          : "";

      return `
        <h2>${escapeHtml(section.heading)}</h2>
        <p>${escapeHtml(section.body)}</p>
        ${adBlock}
      `;
    })
    .join("");
}

function renderFaqs(page) {
  if (!page.faqs?.length) return "";

  return `
    <section class="faq-section">
      <h2>${escapeHtml(page.faqTitle || "FAQs")}</h2>
      ${page.faqs
        .map(
          (faq) => `
            <details class="faq-item">
              <summary>${escapeHtml(faq.question)}</summary>
              <p>${escapeHtml(faq.answer)}</p>
            </details>
          `
        )
        .join("")}
    </section>
  `;
}

function renderRelated(page) {
  const relatedPages = (page.related || [])
    .map((relatedPath) => pagesByPath.get(relatedPath))
    .filter(Boolean);

  if (!relatedPages.length) return "";

  return `
    <section class="related-posts">
      <h2>${escapeHtml(page.insightsTitle || "Read More Insights")}</h2>
      <div class="card-grid">
        ${relatedPages
          .map(
            (related) => `
              <article class="mini-card">
                <img src="${escapeHtml(related.heroImage)}" alt="${escapeHtml(
              related.heroAlt
            )}">
                <h3>${escapeHtml(related.title)}</h3>
                <p>${escapeHtml(truncate(related.metaDescription, 110))}</p>
                <a href="${escapeHtml(related.path)}">Read More</a>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderCta(cta) {
  if (!cta) return "";

  return `
    <section class="cta-strip">
      <div>
        <h2>${escapeHtml(cta.headline)}</h2>
        <p>${escapeHtml(cta.text)}</p>
      </div>
      <a class="cta-button" href="${escapeHtml(cta.buttonUrl)}">${escapeHtml(
    cta.buttonLabel
  )}</a>
    </section>
  `;
}

function renderInfoGrid(title, items = []) {
  if (!items.length) return "";

  return `
    <section class="related-posts">
      <h2>${escapeHtml(title)}</h2>
      <div class="card-grid">
        ${items
          .map(
            (item) => `
              <article class="mini-card">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function buildPrimarySchema(page, site) {
  if (page.type === "hub") {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: page.title,
      headline: page.title,
      description: page.metaDescription,
      url: pathToUrl(page.path),
      publisher: {
        "@type": "Organization",
        name: site.name,
        logo: {
          "@type": "ImageObject",
          url: site.logoUrl
        }
      },
      hasPart: (page.related || []).map((relatedPath) => ({
        "@type": "WebPage",
        url: pathToUrl(relatedPath)
      }))
    };
  }

  if (page.type === "guide") {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.title,
      description: page.metaDescription,
      image: [page.heroImage],
      author: {
        "@type": "Organization",
        name: site.name
      },
      publisher: {
        "@type": "Organization",
        name: site.name,
        logo: {
          "@type": "ImageObject",
          url: site.logoUrl
        }
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": pathToUrl(page.path)
      }
    };
  }

  if (page.type === "industry" || page.type === "city" || page.type === "service") {
    return {
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.title,
      description: page.metaDescription,
      provider: {
        "@type": "Organization",
        name: site.name,
        url: "https://marketingspecialists.co.za"
      },
      serviceType: page.title,
      areaServed:
        page.type === "city"
          ? {
              "@type": "Place",
              name: page.title
            }
          : {
              "@type": "Country",
              name: "South Africa"
            }
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.metaDescription,
    url: pathToUrl(page.path)
  };
}

function buildFaqSchema(page) {
  if (!page.faqs?.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

function renderSchemaScripts(page, site) {
  const schemas = [buildPrimarySchema(page, site), buildFaqSchema(page)].filter(
    Boolean
  );

  return schemas
    .map(
      (schema) => `
        <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
        </script>
      `
    )
    .join("");
}

function renderGenericPage(page, site) {
  const isHub = page.type === "hub";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.metaDescription)}">
  <link rel="stylesheet" href="/assets/styles/main.css">
  ${renderSchemaScripts(page, site)}
</head>
<body>
  <header>
    <a class="site-logo" href="https://marketingspecialists.co.za/digital-marketing-agency-in-south-africa">
      <img src="${escapeHtml(site.logoUrl)}" alt="${escapeHtml(site.name)}">
    </a>

    <nav>
      ${renderNav(site)}
    </nav>
  </header>

  <main>
    <article class="article-card">
      <img class="hero-image" src="${escapeHtml(page.heroImage)}" alt="${escapeHtml(
    page.heroAlt
  )}">

      <section class="article-content">
        <p class="eyebrow">${escapeHtml(page.eyebrow || "")}</p>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="intro">${escapeHtml(page.intro || "")}</p>

        ${renderSections(page)}

        ${
          isHub
            ? ""
            : `
        <p class="back-link">
          <a href="/">← Back to hub</a>
        </p>
        `
        }
      </section>
    </article>

    ${renderRelated(page)}
    ${renderFaqs(page)}
    ${renderCta(page.cta)}
  </main>

  <footer>
    <div class="footer-links">
      ${renderFooterLinks(site)}
    </div>
    <p>© ${escapeHtml(site.name)}</p>
  </footer>
</body>
</html>`;
}

function renderServicePage(page, site) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.metaDescription)}">
  <link rel="stylesheet" href="/assets/styles/main.css">
  ${renderSchemaScripts(page, site)}
</head>
<body>
  <header>
    <a class="site-logo" href="https://marketingspecialists.co.za/digital-marketing-agency-in-south-africa">
      <img src="${escapeHtml(site.logoUrl)}" alt="${escapeHtml(site.name)}">
    </a>

    <nav>
      ${renderNav(site)}
    </nav>
  </header>

  <main>
    <article class="article-card">
      <img class="hero-image" src="${escapeHtml(page.heroImage)}" alt="${escapeHtml(
    page.heroAlt
  )}">

      <section class="article-content">
        <p class="eyebrow">${escapeHtml(page.eyebrow || "")}</p>
        <h1>${escapeHtml(page.heroTitle || page.title)}</h1>
        <p class="intro">${escapeHtml(page.heroText || "")}</p>
        ${
          page.heroButtonLabel && page.heroButtonUrl
            ? `<p><a class="cta-button" href="${escapeHtml(
                page.heroButtonUrl
              )}">${escapeHtml(page.heroButtonLabel)}</a></p>`
            : ""
        }
      </section>
    </article>

    ${renderInfoGrid(page.whyChooseTitle, page.whyChooseItems)}
    ${renderInfoGrid(page.servicesTitle, page.services)}
    ${renderCta(page.ctaPanel)}
    ${renderRelated(page)}
    ${renderFaqs(page)}
  </main>

  <footer>
    <div class="footer-links">
      ${renderFooterLinks(site)}
    </div>
    <p>© ${escapeHtml(site.name)}</p>
  </footer>
</body>
</html>`;
}

function renderPage(page, site) {
  if (page.type === "service") {
    return renderServicePage(page, site);
  }

  return renderGenericPage(page, site);
}

for (const page of data.pages) {
  const html = renderPage(page, data.site);
  const outFile =
    page.path === "/"
      ? path.join(DIST, "index.html")
      : path.join(DIST, page.path.replace(/^\//, ""));

  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, html, "utf8");
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${data.pages
  .map(
    (page) => `  <url>
    <loc>${pathToUrl(page.path)}</loc>
  </url>`
  )
  .join("\n")}
</urlset>
`;

await writeFile(path.join(DIST, "sitemap.xml"), sitemap, "utf8");
await writeFile(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n`, "utf8");

console.log(`Generated ${data.pages.length} pages into dist/`);
