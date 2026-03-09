const JSON_HEADERS = {
  "content-type": "application/json; charset=UTF-8"
};

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normaliseType(value = "") {
  const allowed = new Set(["guide", "service", "city", "industry"]);
  return allowed.has(value) ? value : "guide";
}

function defaultPathForType(pageType, slug) {
  if (pageType === "service") return `/services/${slug}.html`;
  if (pageType === "city") return `/cities/${slug}.html`;
  if (pageType === "industry") return `/industries/${slug}.html`;
  return `/guides/${slug}.html`;
}

function defaultEyebrow(pageType) {
  if (pageType === "service") return "Digital Marketing Services";
  if (pageType === "city") return "City Page";
  if (pageType === "industry") return "Industry Page";
  return "SEO Guide";
}

function defaultHeroImage(pageType) {
  if (pageType === "service") {
    return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80";
  }
  if (pageType === "city") {
    return "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=80";
  }
  if (pageType === "industry") {
    return "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80";
  }
  return "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80";
}

function defaultHeroAlt(pageType, topic) {
  if (pageType === "service") return `${topic} dashboard and digital marketing performance`;
  if (pageType === "city") return `${topic} local business growth and SEO visibility`;
  if (pageType === "industry") return `${topic} industry marketing strategy and business planning`;
  return `${topic} SEO strategy and business planning`;
}

function defaultRelated(pageType) {
  if (pageType === "service") {
    return [
      "/guides/google-ads-vs-seo-for-small-business.html",
      "/guides/how-much-does-seo-cost-south-africa.html",
      "/industries/digital-marketing-for-lawyers.html"
    ];
  }

  return [
    "/guides/google-ads-vs-seo-for-small-business.html",
    "/guides/how-much-does-seo-cost-south-africa.html",
    "/cities/seo-services-johannesburg.html"
  ];
}

function extractJson(text = "") {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("Model did not return a JSON object.");
  }
  return text.slice(first, last + 1);
}

function ensureArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function coerceDraft(draft, input) {
  const pageType = normaliseType(input.pageType);
  const topic = input.topic || input.primaryKeyword || "Untitled page";
  const slugBase = slugify(input.slug || input.primaryKeyword || input.topic || "new-page");
  const pagePath = defaultPathForType(pageType, slugBase);
  const heroImage = draft.heroImage || defaultHeroImage(pageType);
  const heroAlt = draft.heroAlt || defaultHeroAlt(pageType, topic);
  const related = ensureArray(draft.related, defaultRelated(pageType));

  if (pageType === "service") {
    return {
      type: "service",
      path: pagePath,
      title: draft.title || topic,
      metaDescription: draft.metaDescription || `Explore ${topic} and how it can support visibility, enquiries, and long-term business growth.`,
      eyebrow: draft.eyebrow || defaultEyebrow(pageType),
      heroTitle: draft.heroTitle || draft.title || topic,
      heroText:
        draft.heroText ||
        `Learn how ${topic} can improve visibility, strengthen trust, and support lead generation.`,
      heroButtonLabel: input.ctaLabel || "Contact Us",
      heroButtonUrl: input.ctaUrl || "https://marketingspecialists.co.za/contact",
      heroImage,
      heroAlt,
      whyChooseTitle: draft.whyChooseTitle || "Why this page matters",
      whyChooseItems: ensureArray(draft.whyChooseItems, []).slice(0, 4),
      servicesTitle: draft.servicesTitle || "What this page should highlight",
      services: ensureArray(draft.services, []).slice(0, 4),
      ctaPanel: {
        headline: draft.ctaPanel?.headline || `Need help with ${topic}?`,
        text:
          draft.ctaPanel?.text ||
          `Turn stronger visibility and clearer positioning into better-quality enquiries.`,
        buttonLabel: input.ctaLabel || draft.ctaPanel?.buttonLabel || "Contact Us",
        buttonUrl: input.ctaUrl || draft.ctaPanel?.buttonUrl || "https://marketingspecialists.co.za/contact"
      },
      insightsTitle: draft.insightsTitle || "Related Insights",
      related,
      faqTitle: draft.faqTitle || `${topic} FAQs`,
      faqs: ensureArray(draft.faqs, []).slice(0, 4)
    };
  }

  return {
    type: pageType,
    path: pagePath,
    title: draft.title || topic,
    metaDescription: draft.metaDescription || `Learn about ${topic} and how it supports visibility, search intent, and business growth.`,
    eyebrow: draft.eyebrow || defaultEyebrow(pageType),
    heroImage,
    heroAlt,
    intro:
      draft.intro ||
      `Learn about ${topic}, why it matters, and how a stronger page structure can support visibility and enquiries.`,
    sections: ensureArray(draft.sections, []).slice(0, 6),
    faqTitle: draft.faqTitle || `${topic} FAQs`,
    faqs: ensureArray(draft.faqs, []).slice(0, 4),
    cta: {
      headline: draft.cta?.headline || `Need help with ${topic}?`,
      text:
        draft.cta?.text ||
        `Build a smarter page strategy that supports visibility, trust, and stronger enquiries.`,
      buttonLabel: input.ctaLabel || draft.cta?.buttonLabel || "Contact Us",
      buttonUrl: input.ctaUrl || draft.cta?.buttonUrl || "https://marketingspecialists.co.za/contact"
    },
    related
  };
}

function buildPrompt(input) {
  const pageType = normaliseType(input.pageType);
  const topic = input.topic || "";
  const primaryKeyword = input.primaryKeyword || "";
  const secondaryKeywords = input.secondaryKeywords || "";
  const searchIntent = input.searchIntent || "";
  const audience = input.audience || "";
  const city = input.city || "";
  const industry = input.industry || "";
  const extraInstructions = input.extraInstructions || "";

  const baseRules = `
You are creating page data for The Marketing Specialists.

Follow these rules strictly:
- Use UK English.
- No emojis.
- No markdown.
- No filler.
- No hype promises like "guaranteed #1 rankings".
- Make the content sound human, commercially aware, and useful.
- Write content that is rich enough to become a serious first draft, not thin placeholder copy.
- Match search intent properly.
- Use the primary keyword naturally, not awkwardly.
- Make section headings specific and useful.
- Meta descriptions should be concise and click-worthy.
- FAQs should reflect genuine search behaviour.
- Return valid JSON only.
`;

  const guideShape = `
Return exactly this JSON shape:
{
  "title": "string",
  "metaDescription": "string",
  "eyebrow": "SEO Guide",
  "heroImage": "string",
  "heroAlt": "string",
  "intro": "string",
  "sections": [
    { "heading": "string", "body": "string" },
    { "heading": "string", "body": "string" },
    { "heading": "string", "body": "string" },
    { "heading": "string", "body": "string" },
    { "heading": "string", "body": "string" },
    { "heading": "string", "body": "string" }
  ],
  "faqTitle": "string",
  "faqs": [
    { "question": "string", "answer": "string" },
    { "question": "string", "answer": "string" },
    { "question": "string", "answer": "string" },
    { "question": "string", "answer": "string" }
  ],
  "cta": {
    "headline": "string",
    "text": "string",
    "buttonLabel": "string",
    "buttonUrl": "string"
  },
  "related": ["string", "string", "string"]
}
`;

  const serviceShape = `
Return exactly this JSON shape:
{
  "title": "string",
  "metaDescription": "string",
  "eyebrow": "Digital Marketing Services",
  "heroTitle": "string",
  "heroText": "string",
  "heroImage": "string",
  "heroAlt": "string",
  "whyChooseTitle": "string",
  "whyChooseItems": [
    { "title": "string", "text": "string" },
    { "title": "string", "text": "string" },
    { "title": "string", "text": "string" },
    { "title": "string", "text": "string" }
  ],
  "servicesTitle": "string",
  "services": [
    { "title": "string", "text": "string" },
    { "title": "string", "text": "string" },
    { "title": "string", "text": "string" },
    { "title": "string", "text": "string" }
  ],
  "ctaPanel": {
    "headline": "string",
    "text": "string",
    "buttonLabel": "string",
    "buttonUrl": "string"
  },
  "insightsTitle": "string",
  "related": ["string", "string", "string"],
  "faqTitle": "string",
  "faqs": [
    { "question": "string", "answer": "string" },
    { "question": "string", "answer": "string" },
    { "question": "string", "answer": "string" },
    { "question": "string", "answer": "string" }
  ]
}
`;

  const shape = pageType === "service" ? serviceShape : guideShape;

  return `
${baseRules}

Page type: ${pageType}
Topic: ${topic}
Primary keyword: ${primaryKeyword}
Secondary keywords: ${secondaryKeywords}
Search intent: ${searchIntent}
Audience: ${audience}
City: ${city}
Industry: ${industry}
CTA label: ${input.ctaLabel || "Contact Us"}
CTA URL: ${input.ctaUrl || "https://marketingspecialists.co.za/contact"}
Extra instructions: ${extraInstructions}

Use the user's page context to create a high-quality structured draft.
If the page type is city, make the content location-aware.
If the page type is industry, make the content sector-aware.
If the page type is service, make the content conversion-aware.
If the page type is guide, make the content educational but still commercially useful.

${shape}
`;
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      ...JSON_HEADERS,
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}

export async function onRequestPost(context) {
  try {
    if (!context.env.AI) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Workers AI binding not found. Add a binding named AI in Cloudflare Pages settings."
        }),
        { status: 500, headers: JSON_HEADERS }
      );
    }

    const input = await context.request.json();
    const pageType = normaliseType(input.pageType);
    const topic = (input.topic || "").trim();

    if (!topic) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Topic is required."
        }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const prompt = buildPrompt({
      ...input,
      pageType
    });

    const result = await context.env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        {
          role: "system",
          content:
            "You are an elite SEO content strategist for The Marketing Specialists. Return JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3500,
      temperature: 0.35
    });

    const rawText = result?.response || "";
    const jsonText = extractJson(rawText);
    const parsed = JSON.parse(jsonText);
    const draft = coerceDraft(parsed, {
      ...input,
      pageType
    });

    return new Response(
      JSON.stringify(
        {
          ok: true,
          draft
        },
        null,
        2
      ),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message || "Generation failed."
      }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
