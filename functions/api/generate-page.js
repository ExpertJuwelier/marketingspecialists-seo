const JSON_HEADERS = {
  "content-type": "application/json; charset=UTF-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type"
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
  if (pageType === "service") return `${topic} digital marketing and business growth`;
  if (pageType === "city") return `${topic} local SEO and business growth`;
  if (pageType === "industry") return `${topic} industry marketing strategy`;
  return `${topic} SEO strategy and planning`;
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

function cleanString(value = "") {
  return String(value).trim();
}

function coerceFaqs(value, count = 4) {
  return ensureArray(value, [])
    .map((item) => ({
      question: cleanString(item?.question || ""),
      answer: cleanString(item?.answer || "")
    }))
    .filter((item) => item.question && item.answer)
    .slice(0, count);
}

function coerceSections(value, count = 6) {
  return ensureArray(value, [])
    .map((item) => ({
      heading: cleanString(item?.heading || ""),
      body: cleanString(item?.body || "")
    }))
    .filter((item) => item.heading && item.body)
    .slice(0, count);
}

function coerceInfoItems(value, count = 4) {
  return ensureArray(value, [])
    .map((item) => ({
      title: cleanString(item?.title || ""),
      text: cleanString(item?.text || "")
    }))
    .filter((item) => item.title && item.text)
    .slice(0, count);
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
      title: cleanString(draft.title || topic),
      metaDescription: cleanString(
        draft.metaDescription ||
          `Explore ${topic} and how it can support visibility, enquiries, and business growth.`
      ),
      eyebrow: cleanString(draft.eyebrow || defaultEyebrow(pageType)),
      heroTitle: cleanString(draft.heroTitle || draft.title || topic),
      heroText: cleanString(
        draft.heroText ||
          `Learn how ${topic} can improve visibility, strengthen trust, and support lead generation.`
      ),
      heroButtonLabel: cleanString(input.ctaLabel || "Contact Us"),
      heroButtonUrl: cleanString(input.ctaUrl || "https://marketingspecialists.co.za/contact"),
      heroImage,
      heroAlt,
      whyChooseTitle: cleanString(draft.whyChooseTitle || "Why this page matters"),
      whyChooseItems: coerceInfoItems(draft.whyChooseItems, 4),
      servicesTitle: cleanString(draft.servicesTitle || "What this page should highlight"),
      services: coerceInfoItems(draft.services, 4),
      ctaPanel: {
        headline: cleanString(
          draft.ctaPanel?.headline || `Need help with ${topic}?`
        ),
        text: cleanString(
          draft.ctaPanel?.text ||
            `Turn stronger visibility and clearer positioning into better-quality enquiries.`
        ),
        buttonLabel: cleanString(
          input.ctaLabel || draft.ctaPanel?.buttonLabel || "Contact Us"
        ),
        buttonUrl: cleanString(
          input.ctaUrl || draft.ctaPanel?.buttonUrl || "https://marketingspecialists.co.za/contact"
        )
      },
      insightsTitle: cleanString(draft.insightsTitle || "Related Insights"),
      related,
      faqTitle: cleanString(draft.faqTitle || `${topic} FAQs`),
      faqs: coerceFaqs(draft.faqs, 4)
    };
  }

  return {
    type: pageType,
    path: pagePath,
    title: cleanString(draft.title || topic),
    metaDescription: cleanString(
      draft.metaDescription ||
        `Learn about ${topic} and how it supports visibility, search intent, and business growth.`
    ),
    eyebrow: cleanString(draft.eyebrow || defaultEyebrow(pageType)),
    heroImage,
    heroAlt,
    intro: cleanString(
      draft.intro ||
        `Learn about ${topic}, why it matters, and how a stronger page structure can support visibility and enquiries.`
    ),
    sections: coerceSections(draft.sections, 6),
    faqTitle: cleanString(draft.faqTitle || `${topic} FAQs`),
    faqs: coerceFaqs(draft.faqs, 4),
    cta: {
      headline: cleanString(
        draft.cta?.headline || `Need help with ${topic}?`
      ),
      text: cleanString(
        draft.cta?.text ||
          `Build a smarter page strategy that supports visibility, trust, and stronger enquiries.`
      ),
      buttonLabel: cleanString(
        input.ctaLabel || draft.cta?.buttonLabel || "Contact Us"
      ),
      buttonUrl: cleanString(
        input.ctaUrl || draft.cta?.buttonUrl || "https://marketingspecialists.co.za/contact"
      )
    },
    related
  };
}

function buildMasterPrompt(input) {
  const pageType = normaliseType(input.pageType);
  const topic = cleanString(input.topic || "");
  const primaryKeyword = cleanString(input.primaryKeyword || "");
  const secondaryKeywords = cleanString(input.secondaryKeywords || "");
  const searchIntent = cleanString(input.searchIntent || "");
  const audience = cleanString(input.audience || "");
  const city = cleanString(input.city || "");
  const industry = cleanString(input.industry || "");
  const extraInstructions = cleanString(input.extraInstructions || "");
  const ctaLabel = cleanString(input.ctaLabel || "Contact Us");
  const ctaUrl = cleanString(input.ctaUrl || "https://marketingspecialists.co.za/contact");

  const universalRules = `
You are creating structured SEO page drafts for The Marketing Specialists.

Non-negotiable writing rules:
- Use UK English only.
- No emojis.
- No markdown.
- No placeholders.
- No filler phrases.
- No generic SEO clichés.
- No exaggerated claims.
- Do not write like a chatbot.
- Do not produce thin copy.
- Make the content commercially intelligent and useful.
- Make it clear, human, and conversion-aware.
- Keep the primary keyword natural.
- Match the stated search intent properly.
- Write for real users first, but keep the content search-aware.
- FAQs must reflect plausible search behaviour.
- Titles must sound publishable.
- Meta descriptions must be concise and compelling.
- Section headings must be specific and meaningful.
- Output valid JSON only.
`;

  const commercialLogic = `
Commercial logic:
- A guide page should educate while quietly supporting commercial intent.
- A service page should convert while still being useful and credible.
- A city page should feel location-aware, relevant, and not stuffed.
- An industry page should feel sector-aware, specific, and grounded in how buyers think.
- Avoid empty buzzwords.
- Prefer specificity over vagueness.
- Make the CTA text sound relevant to the page.
`;

  const authorityLogic = `
Authority logic:
- Where appropriate, imply that the content should support trust, credibility, and informed decision-making.
- Do not fabricate statistics, awards, or achievements.
- Do not mention external sources unless truly necessary to the meaning of the draft.
- Do not include citations in the JSON.
`;

  const inputBlock = `
Page type: ${pageType}
Topic: ${topic}
Primary keyword: ${primaryKeyword}
Secondary keywords: ${secondaryKeywords}
Search intent: ${searchIntent}
Audience: ${audience}
City: ${city}
Industry: ${industry}
CTA label: ${ctaLabel}
CTA URL: ${ctaUrl}
Extra instructions: ${extraInstructions}
`;

  const guideShape = `
Return exactly this JSON shape:
{
  "title": "string",
  "metaDescription": "string",
  "eyebrow": "string",
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
  "eyebrow": "string",
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

  const typeInstructions =
    pageType === "service"
      ? `
Service-page specific instructions:
- Make the page feel like a serious landing page, not a blog post.
- The title should sound commercially relevant and publishable.
- The hero text should be concise but persuasive.
- "whyChooseItems" should sound like meaningful buying reasons, not empty selling points.
- "services" should describe what is actually being delivered or supported.
- The CTA should feel contextually relevant.
- Avoid sounding overblown or aggressive.
`
      : `
Guide-page specific instructions:
- Make the page educational, useful, and strategically commercial.
- The intro should feel relevant to the topic and search intent.
- The sections should move logically.
- Do not repeat the same point in different words.
- The CTA should connect naturally to the topic.
`;

  return `
${universalRules}

${commercialLogic}

${authorityLogic}

${inputBlock}

${typeInstructions}

${pageType === "service" ? serviceShape : guideShape}
`;
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
          error: "Workers AI binding not found. Add a binding named AI in Cloudflare Pages settings."
        }),
        { status: 500, headers: JSON_HEADERS }
      );
    }

    const input = await context.request.json();
    const pageType = normaliseType(input.pageType);
    const topic = cleanString(input.topic || "");

    if (!topic) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Topic is required."
        }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const prompt = buildMasterPrompt({
      ...input,
      pageType
    });

    const result = await context.env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        {
          role: "system",
          content:
            "You are an elite SEO strategist and conversion-focused content architect for The Marketing Specialists. Return valid JSON only. Do not include markdown, notes, or commentary."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3500,
      temperature: 0.2
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
