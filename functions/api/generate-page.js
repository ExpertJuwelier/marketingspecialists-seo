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
      }
    ];
  }

  return [
    {
      anchor: "Google Ads vs SEO for small business",
      path: "/guides/google-ads-vs-seo-for-small-business.html"
    },
    {
      anchor: "SEO services Johannesburg",
      path: "/cities/seo-services-johannesburg.html"
    }
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

function isLikelyUrl(value = "") {
  return /^https?:\/\//i.test(String(value).trim());
}

function isInternalHtmlPath(value = "") {
  return /^\/[a-z0-9\-\/]+\.html$/i.test(String(value).trim());
}

function sanitiseHeroImage(value, pageType) {
  const cleaned = cleanString(value);
  return isLikelyUrl(cleaned) ? cleaned : defaultHeroImage(pageType);
}

function sanitiseRelated(value, pageType) {
  const cleaned = ensureArray(value, [])
    .map((item) => cleanString(item))
    .filter((item) => isInternalHtmlPath(item));

  return cleaned.length ? cleaned.slice(0, 3) : defaultRelated(pageType);
}

function sanitiseInternalLinks(value, pageType) {
  const cleaned = ensureArray(value, [])
    .map((item) => ({
      anchor: cleanString(item?.anchor || ""),
      path: cleanString(item?.path || "")
    }))
    .filter((item) => item.anchor && isInternalHtmlPath(item.path));

  return cleaned.length ? cleaned.slice(0, 6) : defaultInternalLinks(pageType);
}

function sanitiseExternalLinks(value) {
  return ensureArray(value, [])
    .map((item) => ({
      anchor: cleanString(item?.anchor || ""),
      url: cleanString(item?.url || "")
    }))
    .filter((item) => item.anchor && isLikelyUrl(item.url))
    .slice(0, 6);
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

function coerceSections(value, count = 8) {
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

function fallbackGuideSections(input, pageType) {
  const topic = cleanString(input.topic || input.primaryKeyword || "this topic");
  const geo = cleanString(input.city || "");
  const sector = cleanString(input.industry || "");
  const pageAngle =
    pageType === "city"
      ? `for businesses in ${geo || "this city"}`
      : pageType === "industry"
      ? `for ${sector || "this sector"}`
      : "for businesses that want stronger search visibility";

  return [
    {
      heading: `Why ${topic} matters`,
      body: `${topic} matters because search visibility is rarely just about showing up. It is about showing up for the right search at the right stage of decision-making. A stronger page strategy helps businesses reach better-aligned visitors, reduce wasted traffic, and create a clearer path from search to enquiry. That is especially important ${pageAngle}, where broad pages often fail to answer specific questions properly.`
    },
    {
      heading: `What searchers usually want to know about ${topic}`,
      body: `Most people searching around ${topic} are not looking for vague theory. They want clarity, options, and confidence. They are usually trying to compare solutions, understand what affects results, avoid bad decisions, or find a provider that seems credible. A strong page draft should therefore answer real concerns instead of repeating generic SEO advice.`
    },
    {
      heading: `What often goes wrong`,
      body: `A common mistake is creating pages that mention the keyword but do not genuinely satisfy the search intent behind it. That leads to thin copy, weak engagement, and poor commercial performance. Another problem is overusing generic headings that could apply to almost any topic. A high-quality page should feel tailored, relevant, and informed by how actual buyers think.`
    },
    {
      heading: `How to make the page more useful`,
      body: `The strongest pages give readers a clear framework. They explain what influences outcomes, what trade-offs matter, what buyers should compare, and what next step makes sense. They also avoid bloated intros and get to the point quickly. For ${topic}, that means using plain language, helpful structure, and content that can be understood without specialist knowledge.`
    },
    {
      heading: `Where commercial value comes in`,
      body: `Useful pages do not need to sound overly salesy to support commercial value. They simply need to reduce confusion and move readers closer to action. If the page helps someone understand the problem better, compare options more intelligently, or recognise what quality looks like, it naturally becomes more valuable. That is the bridge between search intent and lead generation.`
    },
    {
      heading: `How internal links should support the page`,
      body: `Internal links matter because they connect informational content with higher-intent pages. A guide like this should point readers toward relevant service pages, supporting guides, local pages, or tools that continue the journey. That not only helps users navigate the site more easily, but also strengthens topical relationships across the content system.`
    },
    {
      heading: `What makes this topic competitive`,
      body: `When a keyword is competitive, the difference is rarely keyword usage alone. It is usually depth, structure, relevance, and clarity. Pages that rank well tend to feel complete. They answer the search properly, stay focused, and give people a reason to continue reading. A competitive page therefore needs more than optimisation. It needs better judgment.`
    },
    {
      heading: `What a strong next step looks like`,
      body: `A strong next step should feel logical, not forced. Once readers understand ${topic}, the page should point them toward an action that matches their stage of awareness. That could be contacting a specialist, comparing services, exploring local options, or reading another strategic guide. The point is to create momentum, not pressure.`
    }
  ];
}

function fallbackServiceWhyChoose(input) {
  const topic = cleanString(input.topic || input.primaryKeyword || "this service");
  return [
    {
      title: "Commercially focused planning",
      text: `A strong ${topic} page should not just describe a service. It should help qualified prospects understand why the service matters, what affects performance, and what outcome they should realistically expect.`
    },
    {
      title: "Clearer buyer guidance",
      text: "Good service pages reduce uncertainty. They explain what should be compared, where common mistakes happen, and how a stronger strategy leads to better-quality enquiries rather than more noise."
    },
    {
      title: "Better search alignment",
      text: "Service pages perform better when they are built around real buyer intent. That means speaking to the search itself instead of forcing blog-style information into a decision-stage page."
    },
    {
      title: "Stronger conversion support",
      text: "A useful service page helps build trust before the reader ever gets in touch. It should feel informative, credible, and commercially aware from the first section to the final CTA."
    }
  ];
}

function fallbackServiceItems(input) {
  const topic = cleanString(input.topic || input.primaryKeyword || "this service");
  return [
    {
      title: "Strategic page positioning",
      text: `The page should explain where ${topic} fits into a wider growth strategy and why that matters for businesses looking for more than surface-level visibility.`
    },
    {
      title: "Intent-driven messaging",
      text: "Service content should match decision-stage searches properly, using language that helps buyers compare options and understand value."
    },
    {
      title: "Trust-building content structure",
      text: "The strongest service pages reduce confusion, answer practical questions, and make the next step feel easier rather than more uncertain."
    },
    {
      title: "Conversion-aware calls to action",
      text: "CTAs should feel relevant to the page, the topic, and the reader’s stage of readiness instead of sounding generic or disconnected."
    }
  ];
}

function coerceDraft(draft, input) {
  const pageType = normaliseType(input.pageType);
  const topic = cleanString(input.topic || input.primaryKeyword || "Untitled page");
  const slugBase = slugify(input.slug || input.primaryKeyword || input.topic || "new-page");
  const pagePath = defaultPathForType(pageType, slugBase);
  const heroImage = sanitiseHeroImage(draft.heroImage, pageType);
  const heroAlt = cleanString(draft.heroAlt || defaultHeroAlt(pageType, topic));
  const related = sanitiseRelated(draft.related, pageType);
  const internalLinks = sanitiseInternalLinks(draft.internalLinks, pageType);
  const externalLinks = sanitiseExternalLinks(draft.externalLinks);

  if (pageType === "service") {
    const whyChooseItems = coerceInfoItems(draft.whyChooseItems, 4);
    const services = coerceInfoItems(draft.services, 4);
    const faqs = coerceFaqs(draft.faqs, 4);

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
      whyChooseItems: whyChooseItems.length ? whyChooseItems : fallbackServiceWhyChoose(input),
      servicesTitle: cleanString(draft.servicesTitle || "What this page should highlight"),
      services: services.length ? services : fallbackServiceItems(input),
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
      faqs:
        faqs.length
          ? faqs
          : [
              {
                question: `What should businesses compare before choosing ${topic}?`,
                answer:
                  "They should look beyond price alone and compare strategy, relevance, credibility, expected scope of work, and whether the page or service genuinely matches their business goals."
              },
              {
                question: `Can ${topic} improve lead quality?`,
                answer:
                  "It can when the page and offer are properly aligned with the right audience, stronger intent targeting, and clearer commercial positioning."
              },
              {
                question: `How long does it take to see movement from ${topic}?`,
                answer:
                  "That depends on the competition, the quality of the current setup, and how much strategic work still needs to be done, but stronger structure and clearer targeting often improve performance over time."
              },
              {
                question: `Is a generic approach enough for ${topic}?`,
                answer:
                  "Usually not. Stronger results tend to come from pages and strategies that reflect the real market, real buyer concerns, and the actual commercial context of the service."
              }
            ],
      internalLinks,
      externalLinks
    };
  }

  const sections = coerceSections(draft.sections, 8);
  const faqs = coerceFaqs(draft.faqs, 5);

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
    sections: sections.length ? sections : fallbackGuideSections(input, pageType),
    faqTitle: cleanString(draft.faqTitle || `${topic} FAQs`),
    faqs:
      faqs.length
        ? faqs
        : [
            {
              question: `What should businesses understand first about ${topic}?`,
              answer:
                "They should start by understanding the search intent behind the topic, because a page that matches the query properly is more useful than one that simply repeats keywords."
            },
            {
              question: `Why does page structure matter for ${topic}?`,
              answer:
                "Because stronger structure helps readers find answers faster, makes the page easier to understand, and improves the chances of turning attention into action."
            },
            {
              question: `Can a guide about ${topic} still support commercial goals?`,
              answer:
                "Yes. A useful guide can educate readers, build trust, reduce confusion, and create a natural bridge toward relevant services or next-step pages."
            },
            {
              question: `How can businesses make ${topic} more useful for readers?`,
              answer:
                "They should focus on answering real questions clearly, using better headings, stronger explanations, and content that feels relevant to the reader’s actual situation."
            },
            {
              question: `What usually weakens pages about ${topic}?`,
              answer:
                "Thin copy, vague headings, generic advice, weak intent matching, and content that sounds like it could apply to any keyword rather than this one."
            }
          ],
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
    related,
    internalLinks,
    externalLinks
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

  const coreMasterPrompt = `
Imagine you are the best SEO content writer in the world. We have to write pages that can compete for page-one visibility on Google. The content must be high quality, original, commercially intelligent, and fully aligned with search intent. Make sure the reader finds what they are searching for and understands it clearly.

Use strong original thinking and synthesis. Do not merely echo generic website copy. Make the content teach readers something genuinely useful. It should be original, high-value, factual, and well structured.

Writing rules:
- Use UK English only.
- Use short paragraphs.
- No emojis.
- No fluff.
- No plagiarism.
- No copied phrasing.
- No robotic phrasing.
- No vague filler.
- No grammar mistakes.
- The writing must feel human, natural, and readable.
- Use burstiness, variation, rhythm, and clear flow.
- Use the focus keyword naturally.
- Use subheadings that genuinely help the page rank and help the reader understand.
- Write with readability in mind so the content can be understood easily by ordinary readers.
- Do not hallucinate facts.
- Do not invent awards, statistics, or credentials.
- Do not output markdown.
- Do not write commentary outside the JSON.
`;

  const strategyRules = `
SEO and commercial rules:
- Match the stated search intent properly.
- Make the title strong, clear, and publishable.
- Make the meta description concise and attractive.
- Make the page commercially useful without sounding pushy.
- If the page is local, reflect the local context naturally.
- If the page is industry-specific, reflect the industry's buying logic naturally.
- If the page is service-based, make it feel like a genuine landing page rather than a blog post.
- FAQs must feel realistic and based on what searchers would genuinely ask.
- Internal links should be relevant and use sensible anchor ideas.
- External links should be authoritative and credible if included.
`;

  const inputContext = `
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
    { "heading": "string", "body": "string" },
    { "heading": "string", "body": "string" },
    { "heading": "string", "body": "string" }
  ],
  "faqTitle": "string",
  "faqs": [
    { "question": "string", "answer": "string" },
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
  "related": ["string", "string", "string"],
  "internalLinks": [
    { "anchor": "string", "path": "string" },
    { "anchor": "string", "path": "string" }
  ],
  "externalLinks": [
    { "anchor": "string", "url": "string" },
    { "anchor": "string", "url": "string" }
  ]
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
  ],
  "internalLinks": [
    { "anchor": "string", "path": "string" },
    { "anchor": "string", "path": "string" }
  ],
  "externalLinks": [
    { "anchor": "string", "url": "string" },
    { "anchor": "string", "url": "string" }
  ]
}
`;

  const serviceInstructions = `
Service-page instructions:
- This is not a blog article.
- It must feel like a serious commercial landing page.
- The title must align with the service angle.
- The hero text must be concise, clear, and persuasive.
- whyChooseItems must sound like real buying reasons, not empty marketing buzzwords.
- services must describe useful strategic components, not generic filler.
- The copy should speak to a business owner or buyer with commercial intent.
- FAQs should sound like pre-enquiry questions.
- Do not drift into generic educational article territory.
`;

  const nonServiceInstructions = `
Guide-like page instructions:
- This page should be informative, but commercially aware.
- Use stronger depth and clearer logic than generic SEO articles.
- Every section should add something new.
- Avoid repeating the same point in different words.
- The content should feel like it could genuinely outrank thin competing pages if refined properly.
- For city pages, weave the location in naturally without stuffing it.
- For industry pages, reflect the sector context clearly.
`;

  const wordDiscipline =
    pageType === "service"
      ? `
Length and depth guidance:
- Make the service-page draft substantial.
- whyChooseItems text should each be around 45 to 80 words.
- services text should each be around 45 to 90 words.
- FAQ answers should each be around 55 to 110 words.
`
      : `
Length and depth guidance:
- Write a substantial long-form draft.
- The intro should be around 120 to 180 words.
- Each section body should usually be around 120 to 220 words.
- FAQ answers should each be around 50 to 110 words.
- The total draft should feel like a serious long-form SEO piece, not a skimpy outline.
`;

  return `
${coreMasterPrompt}

${strategyRules}

${inputContext}

${wordDiscipline}

${pageType === "service" ? serviceInstructions : nonServiceInstructions}

Additional hard rules:
- If page type is "service", do not return guide-style article logic.
- If page type is "service", do not use "type": "guide".
- Related must be internal HTML paths only.
- internalLinks must use internal HTML paths only.
- externalLinks must use full https URLs only.
- heroImage must be a full https URL.
- Return JSON only.

${pageType === "service" ? serviceShape : guideShape}
`;
}

function validateDraft(draft, input) {
  const pageType = normaliseType(input.pageType);

  if (!draft || typeof draft !== "object") {
    throw new Error("Draft is not an object.");
  }

  if (pageType === "service") {
    if (!Array.isArray(draft.whyChooseItems) || draft.whyChooseItems.length < 3) {
      throw new Error("Service draft is missing strong whyChooseItems.");
    }
    if (!Array.isArray(draft.services) || draft.services.length < 3) {
      throw new Error("Service draft is missing service content blocks.");
    }
    return;
  }

  if (!Array.isArray(draft.sections) || draft.sections.length < 6) {
    throw new Error("Guide-style draft is missing enough sections.");
  }
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
            "You are an elite SEO strategist, commercial content architect, and long-form writer for The Marketing Specialists. Return valid JSON only. No markdown. No notes. No explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.15
    });

    const rawText = result?.response || "";
    const jsonText = extractJson(rawText);
    const parsed = JSON.parse(jsonText);

    validateDraft(parsed, {
      ...input,
      pageType
    });

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
