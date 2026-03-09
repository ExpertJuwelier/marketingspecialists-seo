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
                <img src="${escapeHtml(related.heroImage || data.site.logoUrl)}" alt="${escapeHtml(
              related.heroAlt || related.title
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

function renderToolFields(fields = []) {
  if (!fields.length) return "";

  return `
    <div class="tool-form-grid">
      ${fields
        .map(
          (field) => `
            <label class="tool-field">
              <span>${escapeHtml(field)}</span>
              <input type="text" placeholder="${escapeHtml(field)}">
            </label>
          `
        )
        .join("")}
    </div>
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

  if (page.type === "tool") {
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: page.title,
      description: page.metaDescription,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: pathToUrl(page.path),
      publisher: {
        "@type": "Organization",
        name: site.name
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
    <section class="service-hero">
      <div class="service-hero-inner">
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
      </div>
    </section>

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

function renderGenericToolPage(page, site) {
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
    <section class="tool-hero">
      <div class="tool-hero-inner">
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
      </div>
    </section>

    <section class="tool-shell">
      <div class="tool-shell-header">
        <h2>${escapeHtml(page.toolTitle || page.title)}</h2>
        <p>${escapeHtml(page.toolIntro || "")}</p>
      </div>

      ${renderToolFields(page.toolFields)}

      <div class="tool-output">
        <h3>Generated output</h3>
        <p>This area is reserved for the live AI-assisted output. Later, your Cloudflare Worker with AI binding can populate this section dynamically.</p>
      </div>
    </section>

    ${renderInfoGrid(page.supportTitle, page.supportItems)}
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

function renderAiGeneratorToolPage(page, site) {
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
    <section class="tool-hero">
      <div class="tool-hero-inner">
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
      </div>
    </section>

    <section class="tool-shell ai-generator-shell">
      <div class="tool-shell-header">
        <h2>${escapeHtml(page.toolTitle || page.title)}</h2>
        <p>${escapeHtml(page.toolIntro || "")}</p>
      </div>

      <form id="ai-page-generator-form" class="generator-form">
        <div class="generator-grid">
          <label class="generator-field">
            <span>Page type</span>
            <select name="pageType">
              <option value="guide">Guide</option>
              <option value="service">Service</option>
              <option value="city">City</option>
              <option value="industry">Industry</option>
            </select>
          </label>

          <label class="generator-field">
            <span>Topic</span>
            <input type="text" name="topic" placeholder="Example: SEO for dentists in Cape Town" required>
          </label>

          <label class="generator-field">
            <span>Primary keyword</span>
            <input type="text" name="primaryKeyword" placeholder="Example: SEO for dentists Cape Town">
          </label>

          <label class="generator-field">
            <span>Search intent</span>
            <input type="text" name="searchIntent" placeholder="Example: Commercial investigation">
          </label>

          <label class="generator-field">
            <span>Audience</span>
            <input type="text" name="audience" placeholder="Example: Small business owners">
          </label>

          <label class="generator-field">
            <span>City</span>
            <input type="text" name="city" placeholder="Example: Johannesburg">
          </label>

          <label class="generator-field">
            <span>Industry</span>
            <input type="text" name="industry" placeholder="Example: Legal services">
          </label>

          <label class="generator-field">
            <span>CTA label</span>
            <input type="text" name="ctaLabel" placeholder="Example: Contact Us">
          </label>

          <label class="generator-field generator-field--full">
            <span>Secondary keywords</span>
            <textarea name="secondaryKeywords" rows="4" placeholder="Enter secondary keywords separated by commas or line breaks"></textarea>
          </label>

          <label class="generator-field generator-field--full">
            <span>Extra instructions</span>
            <textarea name="extraInstructions" rows="5" placeholder="Add any extra direction for tone, structure, angles, local context, conversion goals, or internal linking ideas"></textarea>
          </label>

          <label class="generator-field generator-field--full">
            <span>CTA URL</span>
            <input type="text" name="ctaUrl" placeholder="https://marketingspecialists.co.za/contact">
          </label>
        </div>

        <div class="generator-actions">
          <button type="submit" class="cta-button" id="ai-generator-submit">Generate JSON Draft</button>
          <button type="button" class="secondary-button" id="ai-generator-copy">Copy Output</button>
        </div>

        <p class="generator-note">This creates structured draft data for your Cloudflare content system. It does not commit into Git automatically yet.</p>

        <label class="generator-output-wrap">
          <span>Generated JSON draft</span>
          <textarea id="ai-generator-output" rows="22" placeholder="Your generated page data will appear here..."></textarea>
        </label>
      </form>
    </section>

    ${renderInfoGrid(page.supportTitle, page.supportItems)}
    ${renderCta(page.ctaPanel)}
    ${renderRelated(page)}
    ${renderFaqs(page)}

    <script>
      (() => {
        const form = document.getElementById("ai-page-generator-form");
        const output = document.getElementById("ai-generator-output");
        const submitButton = document.getElementById("ai-generator-submit");
        const copyButton = document.getElementById("ai-generator-copy");

        if (!form || !output || !submitButton || !copyButton) return;

        form.addEventListener("submit", async (event) => {
          event.preventDefault();

          const formData = new FormData(form);
          const payload = {
            pageType: formData.get("pageType") || "guide",
            topic: formData.get("topic") || "",
            primaryKeyword: formData.get("primaryKeyword") || "",
            secondaryKeywords: formData.get("secondaryKeywords") || "",
            searchIntent: formData.get("searchIntent") || "",
            audience: formData.get("audience") || "",
            city: formData.get("city") || "",
            industry: formData.get("industry") || "",
            ctaLabel: formData.get("ctaLabel") || "",
            ctaUrl: formData.get("ctaUrl") || "",
            extraInstructions: formData.get("extraInstructions") || ""
          };

          output.value = "Generating draft...";
          submitButton.disabled = true;
          submitButton.textContent = "Generating...";

          try {
            const response = await fetch("/api/generate-page", {
              method: "POST",
              headers: {
                "content-type": "application/json"
              },
              body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok || !result.ok) {
              throw new Error(result.error || "Generation failed.");
            }

            output.value = JSON.stringify(result.draft, null, 2);
          } catch (error) {
            output.value = "Error: " + (error.message || "Generation failed.");
          } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Generate JSON Draft";
          }
        });

        copyButton.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(output.value || "");
            copyButton.textContent = "Copied";
            setTimeout(() => {
              copyButton.textContent = "Copy Output";
            }, 1200);
          } catch {
            copyButton.textContent = "Copy failed";
            setTimeout(() => {
              copyButton.textContent = "Copy Output";
            }, 1200);
          }
        });
      })();
    </script>
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

function renderToolPage(page, site) {
  if (page.generatorMode === "seo-page-generator") {
    return renderAiGeneratorToolPage(page, site);
  }

  return renderGenericToolPage(page, site);
}

function renderPage(page, site) {
  if (page.type === "service") {
    return renderServicePage(page, site);
  }

  if (page.type === "tool") {
    return renderToolPage(page, site);
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
