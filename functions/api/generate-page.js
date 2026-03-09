const JSON_HEADERS = {
  "content-type": "application/json; charset=UTF-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type"
};

function cleanString(value = "") {
  return String(value || "").trim();
}

function ensureArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function normaliseType(value = "") {
  const allowed = new Set(["guide", "service", "city", "industry"]);
  return allowed.has(value) ? value : "guide";
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

function defaultHeroAlt(pageType, topic, city, industry) {
  if (pageType === "service") return `${topic} digital marketing and business growth`;
  if (pageType === "city") return `${topic} in ${city || "this city"} and local business growth`;
  if (pageType === "industry") return `${topic} for ${industry || "this industry"} and marketing strategy`;
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

  if (pageType === "city") {
    return [
      "/guides/google-ads-vs-seo-for-small-business.html",
      "/guides/how-much-does-seo-cost-south-africa.html",
      "/services/digital-marketing-services.html"
    ];
  }

  if (pageType === "industry") {
    return [
      "/guides/how-seo-pages-bring-leads.html",
      "/guides/google-ads-vs-seo-for-small-business.html",
      "/services/digital-marketing-services.html"
    ];
  }

  return [
    "/guides/how-much-does-seo-cost-south-africa.html",
    "/guides/how-seo-pages-bring-leads.html",
    "/services/digital-marketing-services.html"
  ];
}

function defaultInternalLinks(pageType) {
  if (pageType === "service") {
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
        anchor: "Google Ads vs SEO for small business",
        path: "/guides/google-ads-vs-seo-for-small-business.html"
      }
    ];
  }

  if (pageType === "city") {
    return [
      {
        anchor: "digital marketing services",
        path: "/services/digital-marketing-services.html"
      },
      {
        anchor: "SEO services Johannesburg",
        path: "/cities/seo-services-johannesburg.html"
      },
      {
        anchor: "how SEO pages bring leads",
        path: "/guides/how-seo-pages-bring-leads.html"
      }
    ];
  }

  if (pageType === "industry") {
    return [
      {
        anchor: "digital marketing services",
        path: "/services/digital-marketing-services.html"
      },
      {
        anchor: "how SEO pages bring leads",
        path: "/guides/how-seo-pages-bring-leads.html"
      },
      {
        anchor: "Google Ads vs SEO for small business",
        path: "/guides/google-ads-vs-seo-for-small-business.html"
      }
    ];
  }

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
      anchor: "Google Ads vs SEO for small business",
      path: "/guides/google-ads-vs-seo-for-small-business.html"
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

function coerceSections(value, minCount = 6, maxCount = 8) {
  return ensureArray(value, [])
    .map((item) => ({
      heading: cleanString(item?.heading || ""),
      body: cleanString(item?.body || "")
    }))
    .filter((item) => item.heading && item.body)
    .slice(0, maxCount);
}

function coerceFaqs(value, minCount = 4, maxCount = 5) {
  return ensureArray(value, [])
    .map((item) => ({
      question: cleanString(item?.question || ""),
      answer: cleanString(item?.answer || "")
    }))
    .filter((item) => item.question && item.answer)
    .slice(0, maxCount);
}

function coerceInfoItems(value, maxCount = 4) {
  return ensureArray(value, [])
    .map((item) => ({
      title: cleanString(item?.title || ""),
      text: cleanString(item?.text || "")
    }))
    .filter((item) => item.title && item.text)
    .slice(0, maxCount);
}

function fallbackGuideSections(input) {
  const topic = cleanString(input.topic || input.primaryKeyword || "this topic");
  const pageType = normaliseType(input.pageType);
  const city = cleanString(input.city || "");
  const industry = cleanString(input.industry || "");
  const intent = cleanString(input.searchIntent || "informational or commercial");
  const locationLine = pageType === "city" && city ? ` in ${city}` : "";
  const industryLine = pageType === "industry" && industry ? ` for ${industry}` : "";

  return [
    {
      heading: `Why ${topic} matters${locationLine}${industryLine}`,
      body: `${topic} matters because search visibility is rarely about getting any traffic at all. It is about attracting the right visitors, answering the right question, and giving readers a reason to keep moving through the buying journey. When a page matches intent properly, it becomes more useful, more credible, and more commercially valuable than pages that only repeat keywords.`
    },
    {
      heading: `What searchers usually want when they look for ${topic}`,
      body: `Most searchers looking for ${topic} want clarity more than hype. They are usually trying to compare options, understand what affects results, avoid bad decisions, or figure out which next step makes the most sense. That means a stronger page needs to do more than define the term. It needs to reduce confusion and make the topic easier to act on.`
    },
    {
      heading: `What often weakens pages targeting ${topic}`,
      body: `Pages about ${topic} often underperform because they stay generic. They mention the keyword, but they do not really satisfy the intent behind the search. Weak pages tend to rely on vague headings, repetitive advice, and thin copy that could apply to almost any subject. Stronger pages feel specific, deliberate, and grounded in how real readers think.`
    },
    {
      heading: `How to make the page more useful`,
      body: `A more useful page explains what matters, what should be compared, what mistakes to avoid, and what a good outcome actually looks like. It should help readers move from curiosity to clarity. For ${topic}, that means structuring the page in a way that feels practical, readable, and aligned with ${intent} intent rather than sounding like a generic SEO template.`
    },
    {
      heading: `Where commercial value fits in`,
      body: `Useful content can still support commercial goals without becoming aggressive. In fact, the strongest commercial pages are often the ones that help readers understand the subject more clearly. When a page genuinely improves understanding, it builds trust. That trust makes the eventual CTA more natural because the reader feels guided rather than pushed.`
    },
    {
      heading: `Why structure and internal linking matter`,
      body: `A page about ${topic} should not exist in isolation. It should support service pages, city pages, tools, and other guides through sensible internal linking. That helps search engines understand the site structure and helps readers discover the next relevant page. In practice, better internal linking often improves both usability and strategic relevance.`
    },
    {
      heading: `What makes a page about ${topic} more competitive`,
      body: `Competitive pages tend to do several things well at once. They match the keyword naturally, answer the search properly, organise the information clearly, and avoid thin repetition. They also feel like they were written by someone who understands what readers actually need. That level of relevance is often what separates a page that ranks from one that stays invisible.`
    },
    {
      heading: `What a strong next step looks like`,
      body: `A strong next step should feel like a logical continuation of the page, not an interruption. Once the reader understands ${topic}, the page should direct them toward a relevant service, supporting guide, local page, or conversion step. That is how content starts functioning as part of a real lead-generation system rather than sitting on the site as passive copy.`
    }
  ];
}

function fallbackServiceWhyChoose(input) {
  const topic = cleanString(input.topic || input.primaryKeyword || "this service");

  return [
    {
      title: "Commercially aligned positioning",
      text: `A strong ${topic} page should help the right buyer understand not only what the service is, but why it matters commercially. That means clearer positioning, more relevant messaging, and less generic noise.`
    },
    {
      title: "Better intent matching",
      text: `Service pages perform better when they speak directly to commercial search intent. The page should feel built for decision-stage readers rather than sounding like a broad educational article that never reaches a point.`
    },
    {
      title: "Stronger trust signals",
      text: `Buyers are more likely to enquire when the page feels clear, credible, and useful. A stronger service page reduces confusion, answers practical questions, and makes the offer easier to understand.`
    },
    {
      title: "Clearer conversion path",
      text: `A service page should not rely on design alone to convert. The copy itself needs to build confidence, show relevance, and create a sensible next step that matches the reader’s level of readiness.`
    }
  ];
}

function fallbackServiceItems(input) {
  const topic = cleanString(input.topic || input.primaryKeyword || "this service");

  return [
    {
      title: "Strategy and page planning",
      text: `The page should explain how ${topic} supports visibility, positioning, and business growth in a way that feels relevant to buyers who are comparing options seriously.`
    },
    {
      title: "Clearer buyer communication",
      text: "Strong service pages help buyers understand what is being offered, why it matters, and what a better outcome could look like without drowning them in generic marketing language."
    },
    {
      title: "Search and conversion alignment",
      text: "The strongest service pages balance search relevance with commercial intent, so they can support both visibility and enquiry quality rather than focusing on one at the expense of the other."
    },
    {
      title: "Longer-term growth value",
      text: "A better service page should not only help drive short-term interest. It should also become a stronger long-term asset that supports trust, internal linking, and broader digital performance."
    }
  ];
}

function buildGuideSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      metaDescription: { type: "string" },
      intro: { type: "string" },
      sections: {
        type: "array",
        minItems: 6,
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
      faqTitle: { type: "string" },
      faqs: {
        type: "array",
        minItems: 4,
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
      },
      cta: {
        type: "object",
        additionalProperties: false,
        properties: {
          headline: { type: "string" },
          text: { type: "string" }
        },
        required: ["headline", "text"]
      },
      externalLinks: {
        type: "array",
        maxItems: 6,
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
    required: ["title", "metaDescription", "intro", "sections", "faqTitle", "faqs", "cta"]
  };
}

function buildServiceSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      metaDescription: { type: "string" },
      heroTitle: { type: "string" },
      heroText: { type: "string" },
      whyChooseTitle: { type: "string" },
      whyChooseItems: {
        type: "array",
        minItems: 4,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            text: { type: "string" }
          },
          required: ["title", "text"]
        }
      },
      servicesTitle: { type: "string" },
      services: {
        type: "array",
        minItems: 4,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            text: { type: "string" }
          },
          required: ["title", "text"]
        }
      },
      ctaPanel: {
        type: "object",
        additionalProperties: false,
        properties: {
          headline: { type: "string" },
          text: { type: "string" }
        },
        required: ["headline", "text"]
      },
      faqTitle: { type: "string" },
      faqs: {
        type: "array",
        minItems: 4,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            question: { type: "string" },
            answer: { type: "string" }
          },
          required: ["question", "answer"]
        }
      },
      externalLinks: {
        type: "array",
        maxItems: 6,
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
      "heroTitle",
      "heroText",
      "whyChooseTitle",
      "whyChooseItems",
      "servicesTitle",
      "services",
      "ctaPanel",
      "faqTitle",
      "faqs"
    ]
  };
}

function buildPromptForType(input) {
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

  const sharedContext = `
You are writing for The Marketing Specialists.

Use these rules like a bible:
- Use UK English only.
- No emojis.
- No fluff.
- No plagiarism.
- No robotic phrasing.
- No generic filler.
- No markdown.
- No commentary outside JSON.
- Write like a high-level human SEO content strategist.
- Make the content commercially intelligent and useful.
- Match search intent properly.
- Use the focus keyword naturally.
- Keep paragraphs short and readable.
- Make headings specific and valuable.
- Make FAQs realistic.
- Do not invent statistics, awards, or credentials.
- Do not hallucinate facts.

Target audience: ${audience}
Focus keyword: ${primaryKeyword}
Topic: ${topic}
Search intent: ${searchIntent}
Secondary keywords: ${secondaryKeywords}
City: ${city}
Industry: ${industry}
CTA label: ${ctaLabel}
CTA URL: ${ctaUrl}
Extra instructions: ${extraInstructions}
`;

  if (pageType === "service") {
    return `
${sharedContext}

This is a SERVICE PAGE draft.
You are NOT allowed to choose the page type, path, eyebrow, hero image, hero alt, related links, or internal links. Those are controlled by the system.
You are only writing the service-page content fields.

Service page rules:
- Make it feel like a serious landing page, not a blog post.
- Hero text should be concise, persuasive, and commercially relevant.
- whyChooseItems must sound like real buying reasons, not vague claims.
- services must describe useful strategic components, not empty wording.
- FAQs should sound like genuine pre-enquiry questions.
- The copy should help a business owner make a better decision.
- Avoid sounding salesy for the sake of it.
- The content must feel publishable.
`;
  }

  const typeSpecific =
    pageType === "city"
      ? `
This is a CITY PAGE draft.
Make it feel location-aware without stuffing the city unnaturally.
The page should reflect how buyers in that city might search and compare options.
`
      : pageType === "industry"
      ? `
This is an INDUSTRY PAGE draft.
Make it feel sector-aware and grounded in how that industry thinks about buying, trust, and visibility.
`
      : `
This is a GUIDE PAGE draft.
Make it informative, strategically useful, and commercially aware without sounding like a sales page.
`;

  return `
${sharedContext}

${typeSpecific}

You are NOT allowed to choose the page type, path, eyebrow, hero image, hero alt, related links, or internal links. Those are controlled by the system.
You are only writing the content fields.

Guide-like page rules:
- Start with a strong, useful intro.
- Use 6 to 8 meaningful sections.
- Each section must add something new.
- Do not repeat yourself.
- Make the page feel like a strong long-form SEO draft.
- FAQs should feel realistic.
- The CTA should feel contextually relevant.
`;
}

function buildFinalDraft(parsed, input) {
  const pageType = normaliseType(input.pageType);
  const topic = cleanString(input.topic || input.primaryKeyword || "Untitled page");
  const slug = slugify(input.slug || input.primaryKeyword || input.topic || "new-page");
  const path = defaultPathForType(pageType, slug);
  const heroImage = defaultHeroImage(pageType);
  const heroAlt = defaultHeroAlt(pageType, topic, input.city, input.industry);
  const related = defaultRelated(pageType);
  const internalLinks = defaultInternalLinks(pageType);
  const externalLinks = sanitiseExternalLinks(parsed.externalLinks);

  if (pageType === "service") {
    const whyChooseItems = coerceInfoItems(parsed.whyChooseItems, 4);
    const services = coerceInfoItems(parsed.services, 4);
    const faqs = coerceFaqs(parsed.faqs, 4, 4);

    return {
      type: "service",
      path,
      title: cleanString(parsed.title || topic),
      metaDescription: cleanString(
        parsed.metaDescription ||
          `Explore ${topic} and how it can support visibility, enquiries, and business growth.`
      ),
      eyebrow: defaultEyebrow(pageType),
      heroTitle: cleanString(parsed.heroTitle || parsed.title || topic),
      heroText: cleanString(
        parsed.heroText ||
          `Learn how ${topic} can improve visibility, strengthen trust, and support lead generation.`
      ),
      heroButtonLabel: cleanString(input.ctaLabel || "Contact Us"),
      heroButtonUrl: cleanString(input.ctaUrl || "https://marketingspecialists.co.za/contact"),
      heroImage,
      heroAlt,
      whyChooseTitle: cleanString(parsed.whyChooseTitle || "Why this page matters"),
      whyChooseItems: whyChooseItems.length ? whyChooseItems : fallbackServiceWhyChoose(input),
      servicesTitle: cleanString(parsed.servicesTitle || "What this page should highlight"),
      services: services.length ? services : fallbackServiceItems(input),
      ctaPanel: {
        headline: cleanString(parsed.ctaPanel?.headline || `Need help with ${topic}?`),
        text: cleanString(
          parsed.ctaPanel?.text ||
            `Turn stronger visibility and clearer positioning into better-quality enquiries.`
        ),
        buttonLabel: cleanString(input.ctaLabel || "Contact Us"),
        buttonUrl: cleanString(input.ctaUrl || "https://marketingspecialists.co.za/contact")
      },
      insightsTitle: "Related Insights",
      related,
      faqTitle: cleanString(parsed.faqTitle || `${topic} FAQs`),
      faqs: faqs.length
        ? faqs
        : [
            {
              question: `What should businesses compare before choosing ${topic}?`,
              answer:
                "They should compare relevance, strategy, commercial fit, expected scope, and whether the service genuinely matches the business problem they are trying to solve."
            },
            {
              question: `Can ${topic} improve lead quality?`,
              answer:
                "It can when the page, message, and offer are aligned with the right audience, stronger intent targeting, and a clearer commercial position."
            },
            {
              question: `How long does it take to see movement from ${topic}?`,
              answer:
                "That depends on competition, the current quality of the setup, and how much strategic work is still needed, but better structure and clearer targeting usually improve performance over time."
            },
            {
              question: `Is a generic approach enough for ${topic}?`,
              answer:
                "Usually not. Better results tend to come from pages and strategies that reflect real buyer concerns, real market conditions, and the actual commercial context of the service."
            }
          ],
      internalLinks,
      externalLinks
    };
  }

  const sections = coerceSections(parsed.sections, 6, 8);
  const faqs = coerceFaqs(parsed.faqs, 4, 5);

  return {
    type: pageType,
    path,
    title: cleanString(parsed.title || topic),
    metaDescription: cleanString(
      parsed.metaDescription ||
        `Learn about ${topic} and how it supports visibility, search intent, and business growth.`
    ),
    eyebrow: defaultEyebrow(pageType),
    heroImage,
    heroAlt,
    intro: cleanString(
      parsed.intro ||
        `Learn about ${topic}, why it matters, and how a stronger page structure can support visibility and enquiries.`
    ),
    sections: sections.length ? sections : fallbackGuideSections(input),
    faqTitle: cleanString(parsed.faqTitle || `${topic} FAQs`),
    faqs: faqs.length
      ? faqs
      : [
          {
            question: `What should businesses understand first about ${topic}?`,
            answer:
              "They should first understand the search intent behind the topic, because a page that matches the query properly is far more useful than one that simply repeats keywords."
          },
          {
            question: `Why does page structure matter for ${topic}?`,
            answer:
              "Because stronger structure helps readers find answers faster, makes the page easier to understand, and improves the chances of turning attention into action."
          },
          {
            question: `Can a page about ${topic} still support commercial goals?`,
            answer:
              "Yes. Useful content can educate readers, build trust, reduce confusion, and create a natural path toward relevant services or supporting pages."
          },
          {
            question: `How can businesses make ${topic} more useful for readers?`,
            answer:
              "They should focus on answering real questions clearly, using better headings, stronger explanations, and content that feels relevant to the reader’s actual situation."
          },
          {
            question: `What usually weakens pages about ${topic}?`,
            answer:
              "Thin copy, vague headings, generic advice, weak intent matching, and content that sounds like it could apply to almost any keyword rather than this specific one."
          }
        ],
    cta: {
      headline: cleanString(parsed.cta?.headline || `Need help with ${topic}?`),
      text: cleanString(
        parsed.cta?.text ||
          `Build a smarter page strategy that supports visibility, trust, and stronger enquiries.`
      ),
      buttonLabel: cleanString(input.ctaLabel || "Contact Us"),
      buttonUrl: cleanString(input.ctaUrl || "https://marketingspecialists.co.za/contact")
    },
    related,
    internalLinks,
    externalLinks
  };
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

    const prompt = buildPromptForType({
      ...input,
      pageType
    });

    const schema = pageType === "service" ? buildServiceSchema() : buildGuideSchema();

    const result = await context.env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        {
          role: "system",
          content:
            "You are an elite SEO strategist and commercial content architect. Return only the JSON object defined by the schema."
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
      max_tokens: 4000,
      temperature: 0.12
    });

    const parsed =
      result && typeof result.response === "object"
        ? result.response
        : JSON.parse(typeof result.response === "string" ? result.response : "{}");

    const draft = buildFinalDraft(parsed, {
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
