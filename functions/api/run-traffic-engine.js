const JSON_HEADERS = {
  "content-type": "application/json; charset=UTF-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type, x-engine-key"
};

const DEFAULT_MONETISATION_LINKS = [
  {
    title: "Digital Marketing Services",
    url: "https://marketingspecialists.co.za/digital-marketing-services",
    text: "Explore the core services page for SEO, PPC, social media, content, and strategy support.",
    tags: ["seo", "marketing", "traffic", "google", "ads", "content"]
  },
  {
    title: "Free Marketing Strategy",
    url: "https://marketingspecialists.co.za/free-marketing-strategy",
    text: "Send readers to your lead-generation offer instead of leaving traffic unmonetised.",
    tags: ["strategy", "growth", "business", "marketing", "plan"]
  },
  {
    title: "Digital Marketing Package Prices",
    url: "https://marketingspecialists.co.za/digital-marketing-package-prices",
    text: "Use a pricing page as a commercial bridge for readers moving closer to enquiry stage.",
    tags: ["price", "pricing", "cost", "packages", "budget", "seo"]
  },
  {
    title: "Contact The Marketing Specialists",
    url: "https://marketingspecialists.co.za/contact",
    text: "Capture higher-intent traffic with a direct enquiry route.",
    tags: ["contact", "agency", "help", "services"]
  }
];

function cleanString(value = "") {
  return String(value || "").trim();
}

function ensureArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function toBase64Utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function defaultGuideHeroImage() {
  return "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80";
}

function defaultGuideHeroAlt(topic = "") {
  return `${topic} SEO strategy and planning`;
}

function defaultRelated() {
  return [
    "/guides/how-much-does-seo-cost-south-africa.html",
    "/guides/how-seo-pages-bring-leads.html",
    "/services/digital-marketing-services.html"
  ];
}

function defaultInternalLinks() {
  return [
    {
      anchor: "digital marketing services",
      path: "/services/digital-marketing-services.html"
    },
    {
      anchor: "how much SEO costs in South Africa",
      path: "/guides/how-much-does-seo-cost-south-africa.html"
    },
    {
      anchor: "how SEO pages bring leads",
      path: "/guides/how-seo-pages-bring-leads.html"
    }
  ];
}

function sanitiseExternalLinks(value) {
  return ensureArray(value, [])
    .map((item) => ({
      anchor: cleanString(item?.anchor || ""),
      url: cleanString(item?.url || "")
    }))
    .filter((item) => item.anchor && /^https?:\/\//i.test(item.url))
    .slice(0, 6);
}

function scoreLinkAgainstKeyword(link, keyword) {
  const keywordTokens = new Set(
    cleanString(keyword)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
  );

  let score = 0;
  for (const tag of ensureArray(link.tags, [])) {
    if (keywordTokens.has(cleanString(tag).toLowerCase())) score += 3;
  }

  return score;
}

function pickMonetisationLinks(keyword, overrideLinks) {
  const links = ensureArray(overrideLinks, []).length
    ? overrideLinks
    : DEFAULT_MONETISATION_LINKS;

  return [...links]
    .map((link) => ({
      title: cleanString(link.title),
      url: cleanString(link.url),
      text: cleanString(link.text),
      score: scoreLinkAgainstKeyword(link, keyword)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ title, url, text }) => ({
      title,
      url,
      text,
      buttonLabel: "View Offer"
    }));
}

function keywordSchema(batchCount) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      keywords: {
        type: "array",
        minItems: batchCount,
        maxItems: batchCount,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            keyword: { type: "string" },
            slug: { type: "string" },
            searchIntent: { type: "string" },
            titleHint: { type: "string" }
          },
          required: ["keyword", "slug", "searchIntent", "titleHint"]
        }
      }
    },
    required: ["keywords"]
  };
}

function outlineSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      metaDescription: { type: "string" },
      intro: { type: "string" },
      sectionHeadings: {
        type: "array",
        minItems: 8,
        maxItems: 8,
        items: { type: "string" }
      },
      faqTitle: { type: "string" },
      faqQuestions: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        items: { type: "string" }
      },
      ctaHeadline: { type: "string" },
      ctaText: { type: "string" },
      externalLinks: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            anchor: { type: "string" },
            url: { type: "string" }
          },
          required: ["anchor", "url"]
        }
      }
    },
    required: [
      "title",
      "metaDescription",
      "intro",
      "sectionHeadings",
      "faqTitle",
      "faqQuestions",
      "ctaHeadline",
      "ctaText",
      "externalLinks"
    ]
  };
}

function bodySchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      sections: {
        type: "array",
        minItems: 8,
        maxItems: 8,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            heading: { type: "string" },
            body: { type: "string" }
          },
          required: ["heading", "body"]
        }
      },
      faqs: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            question: { type: "string" },
            answer: { type: "string" }
          },
          required: ["question", "answer"]
        }
      }
    },
    required: ["sections", "faqs"]
  };
}

async function runJsonMode(ai, prompt, schema, temperature = 0.15, maxTokens = 4000) {
  const result = await ai.run("@cf/meta/llama-3.1-8b-instruct-fast", {
    messages: [
      {
        role: "system",
        content:
          "You are an elite SEO strategist and long-form commercial content architect. Return only the JSON object defined by the schema."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: schema
    },
    temperature,
    max_tokens: maxTokens
  });

  if (result && typeof result.response === "object") {
    return result.response;
  }

  if (result && typeof result.response === "string") {
    return JSON.parse(result.response);
  }

  throw new Error("Workers AI did not return a JSON response.");
}

function buildKeywordPrompt(input, batchCount) {
  return `
You are planning SEO traffic articles for a website.

Goal:
Generate ${batchCount} keyword opportunities that can become strong traffic pages.

Rules:
- Use UK English.
- Focus on realistic search behaviour.
- Mix buyer, comparison, problem-solution, and how-to keywords.
- Avoid vague junk keywords.
- Avoid made-up brand names.
- Avoid duplicated intent.
- Prefer keywords that can support useful content and commercial value.
- These will become content pages, not product pages.

Context:
Seed topic: ${cleanString(input.seedTopic)}
Audience: ${cleanString(input.audience)}
Country or market: ${cleanString(input.country)}
City context: ${cleanString(input.city)}
Industry context: ${cleanString(input.industry)}
Extra instructions: ${cleanString(input.extraInstructions)}

Return keyword ideas that are genuinely worth turning into pages.
`;
}

function buildOutlinePrompt(input, keywordRow) {
  return `
Imagine you are the best SEO content writer in the world. We need a page that can compete for page-one visibility in Google.

You are only creating the STRATEGIC ARTICLE OUTLINE, not the full bodies yet.

Rules:
- Use UK English.
- No emojis.
- No fluff.
- No generic filler.
- No robotic phrasing.
- No markdown.
- Make the title publishable.
- Make the meta description click-worthy.
- Start the intro with a hook that makes readers care.
- Section headings must be specific and valuable.
- FAQ questions must feel realistic.
- Suggest only authoritative external links.
- Do not invent statistics or fake sources.

Context:
Topic: ${cleanString(keywordRow.keyword)}
Title hint: ${cleanString(keywordRow.titleHint)}
Focus keyword: ${cleanString(keywordRow.keyword)}
Search intent: ${cleanString(keywordRow.searchIntent)}
Audience: ${cleanString(input.audience)}
Country: ${cleanString(input.country)}
City: ${cleanString(input.city)}
Industry: ${cleanString(input.industry)}
CTA label: ${cleanString(input.ctaLabel || "Get Free Strategy")}
Extra instructions: ${cleanString(input.extraInstructions)}

Length guidance:
- This page should become a serious long-form draft.
- The final full article should feel substantial, not thin.
- This outline should be built for depth, clarity, and commercial usefulness.
`;
}

function buildBodyPrompt(input, keywordRow, outline) {
  return `
Now write the FULL BODIES for the article outline below.

Rules:
- Use UK English.
- No emojis.
- No fluff.
- No vague filler.
- Keep paragraphs readable.
- Do not repeat the same point.
- Make every section commercially useful and search-intent aligned.
- Write like a strong human SEO writer.
- Do not output markdown.
- Do not include commentary.

Context:
Topic: ${cleanString(keywordRow.keyword)}
Focus keyword: ${cleanString(keywordRow.keyword)}
Search intent: ${cleanString(keywordRow.searchIntent)}
Audience: ${cleanString(input.audience)}
Country: ${cleanString(input.country)}
City: ${cleanString(input.city)}
Industry: ${cleanString(input.industry)}

Section headings:
${ensureArray(outline.sectionHeadings, [])
  .map((heading, index) => `${index + 1}. ${cleanString(heading)}`)
  .join("\n")}

FAQ questions:
${ensureArray(outline.faqQuestions, [])
  .map((question, index) => `${index + 1}. ${cleanString(question)}`)
  .join("\n")}

Length guidance:
- Each section body should usually be around 140 to 220 words.
- FAQ answers should usually be around 50 to 110 words.
- The writing should feel like a real long-form article, not an outline in disguise.
`;
}

function buildArticlePage(input, keywordRow, outline, bodyContent, monetisationLinks) {
  const slug = slugify(keywordRow.slug || keywordRow.keyword);
  const keyword = cleanString(keywordRow.keyword);
  const title = cleanString(outline.title || keywordRow.titleHint || keyword);
  const path = `/guides/${slug}.html`;

  return {
    type: "guide",
    path,
    title,
    metaDescription: cleanString(outline.metaDescription),
    eyebrow: "SEO Guide",
    heroImage: defaultGuideHeroImage(),
    heroAlt: defaultGuideHeroAlt(title),
    intro: cleanString(outline.intro),
    sections: ensureArray(bodyContent.sections, []).map((section) => ({
      heading: cleanString(section.heading),
      body: cleanString(section.body)
    })),
    faqTitle: cleanString(outline.faqTitle || `${keyword} FAQs`),
    faqs: ensureArray(bodyContent.faqs, []).map((faq) => ({
      question: cleanString(faq.question),
      answer: cleanString(faq.answer)
    })),
    cta: {
      headline: cleanString(outline.ctaHeadline || "Need a Smarter Growth Strategy?"),
      text: cleanString(
        outline.ctaText ||
          "Use stronger content and clearer strategy to turn traffic into real business value."
      ),
      buttonLabel: cleanString(input.ctaLabel || "Get Free Strategy"),
      buttonUrl: cleanString(
        input.ctaUrl || "https://marketingspecialists.co.za/free-marketing-strategy"
      )
    },
    related: defaultRelated(),
    internalLinks: defaultInternalLinks(),
    externalLinks: sanitiseExternalLinks(outline.externalLinks),
    monetisationTitle: "Recommended Offers",
    monetisationLinks
  };
}

async function createBatchFileInGitHub({
  owner,
  repo,
  branch,
  token,
  filePath,
  commitMessage,
  contentString
}) {
  const encodedPath = filePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;

  const getRes = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  let sha = null;
  if (getRes.ok) {
    const existing = await getRes.json();
    sha = existing.sha;
  }

  const putRes = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: commitMessage,
      content: toBase64Utf8(contentString),
      branch,
      ...(sha ? { sha } : {})
    })
  });

  if (!putRes.ok) {
    const errorText = await putRes.text();
    throw new Error(`GitHub commit failed: ${putRes.status} ${errorText}`);
  }

  return putRes.json();
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: JSON_HEADERS
  });
}

export async function onRequestPost(context) {
  try {
    if (!context.env.AI) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Workers AI binding not found. Add a binding named AI."
        }),
        { status: 500, headers: JSON_HEADERS }
      );
    }

    const body = await context.request.json();
    const headerKey = cleanString(context.request.headers.get("x-engine-key"));
    const requestKey = cleanString(body.engineKey);
    const engineKey = headerKey || requestKey;

    if (cleanString(context.env.TRAFFIC_ENGINE_KEY) && engineKey !== cleanString(context.env.TRAFFIC_ENGINE_KEY)) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Invalid engine key."
        }),
        { status: 401, headers: JSON_HEADERS }
      );
    }

    const seedTopic = cleanString(body.seedTopic);
    if (!seedTopic) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "seedTopic is required."
        }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const requestedCount = Number(body.articlesToGenerate || 3);
    const batchCount = Math.max(1, Math.min(requestedCount, 5));

    const githubToken = cleanString(context.env.GITHUB_TOKEN);
    const githubOwner = cleanString(context.env.GITHUB_OWNER);
    const githubRepo = cleanString(context.env.GITHUB_REPO);
    const githubBranch = cleanString(context.env.GITHUB_BRANCH || "main");

    if (!githubToken || !githubOwner || !githubRepo) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing GitHub environment variables. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO."
        }),
        { status: 500, headers: JSON_HEADERS }
      );
    }

    const monetisationLinks = ensureArray(body.monetisationLinks, []).length
      ? body.monetisationLinks
      : DEFAULT_MONETISATION_LINKS;

    const keywordData = await runJsonMode(
      context.env.AI,
      buildKeywordPrompt(body, batchCount),
      keywordSchema(batchCount),
      0.2,
      2500
    );

    const keywordRows = ensureArray(keywordData.keywords, []).slice(0, batchCount);

    const pages = [];
    for (const keywordRow of keywordRows) {
      const outline = await runJsonMode(
        context.env.AI,
        buildOutlinePrompt(body, keywordRow),
        outlineSchema(),
        0.15,
        3000
      );

      const bodyContent = await runJsonMode(
        context.env.AI,
        buildBodyPrompt(body, keywordRow, outline),
        bodySchema(),
        0.15,
        4500
      );

      const articlePage = buildArticlePage(
        body,
        keywordRow,
        outline,
        bodyContent,
        pickMonetisationLinks(keywordRow.keyword, monetisationLinks)
      );

      pages.push(articlePage);
    }

    for (let i = 0; i < pages.length; i += 1) {
      const others = pages.filter((_, index) => index !== i).map((page) => page.path);
      pages[i].related = [...others.slice(0, 2), "/services/digital-marketing-services.html"];
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const batchSlug = slugify(seedTopic).slice(0, 50) || "traffic-batch";
    const batchFileName = `batch-${timestamp}-${batchSlug}.json`;
    const batchFilePath = `content/${batchFileName}`;

    const batchPayload = JSON.stringify({ pages }, null, 2);

    await createBatchFileInGitHub({
      owner: githubOwner,
      repo: githubRepo,
      branch: githubBranch,
      token: githubToken,
      filePath: batchFilePath,
      commitMessage: `Add SEO traffic batch for ${seedTopic} (${pages.length} pages)`,
      contentString: batchPayload
    });

    return new Response(
      JSON.stringify(
        {
          ok: true,
          seedTopic,
          batchFilePath,
          pagesCreated: pages.length,
          keywords: keywordRows,
          pageUrls: pages.map((page) => ({
            title: page.title,
            path: page.path
          })),
          note: "GitHub was updated. Cloudflare Pages will rebuild automatically from the new content batch."
        },
        null,
        2
      ),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (error) {
    return new Response(
      JSON.stringify(
        {
          ok: false,
          error: error.message || "Traffic engine failed."
        },
        null,
        2
      ),
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
