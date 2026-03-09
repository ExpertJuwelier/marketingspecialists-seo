function html() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Traffic Engine Admin | The Marketing Specialists</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <style>
    :root {
      --bg: #efefef;
      --card: #ffffff;
      --navy: #0f2460;
      --cyan: #dff7f7;
      --text: #111827;
      --muted: #5b6475;
      --border: #d8dce6;
      --success: #0f8a4b;
      --danger: #b42318;
      --shadow: 0 10px 30px rgba(15, 36, 96, 0.08);
      --radius: 18px;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: var(--bg);
      color: var(--text);
    }

    a {
      color: var(--navy);
      text-decoration: none;
    }

    img {
      max-width: 100%;
      display: block;
    }

    header {
      max-width: 1180px;
      margin: 0 auto;
      padding: 28px 24px 18px;
      background: #fff;
    }

    .site-logo {
      display: inline-block;
      width: 220px;
      margin-bottom: 18px;
    }

    nav {
      display: flex;
      flex-wrap: wrap;
      gap: 18px;
      font-size: 13px;
      font-weight: 600;
    }

    nav a {
      color: #111827;
    }

    main {
      max-width: 1180px;
      margin: 0 auto;
      padding: 18px 24px 48px;
    }

    .hero {
      background: var(--cyan);
      border-radius: 22px;
      padding: 44px 28px;
      margin-bottom: 24px;
      text-align: center;
      box-shadow: var(--shadow);
    }

    .eyebrow {
      margin: 0 0 10px;
      color: #3558ff;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .hero h1 {
      margin: 0 0 12px;
      font-size: 42px;
      line-height: 1.12;
      color: var(--navy);
    }

    .hero p {
      max-width: 820px;
      margin: 0 auto;
      color: var(--muted);
      font-size: 17px;
      line-height: 1.6;
    }

    .card {
      background: var(--card);
      border-radius: var(--radius);
      padding: 28px;
      box-shadow: var(--shadow);
      margin-bottom: 24px;
    }

    .card h2 {
      margin: 0 0 10px;
      font-size: 26px;
      color: var(--navy);
    }

    .card p.lead {
      margin: 0 0 24px;
      color: var(--muted);
      line-height: 1.6;
    }

    .grid {
      display: grid;
      gap: 18px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field.full {
      grid-column: 1 / -1;
    }

    .field label {
      font-size: 13px;
      font-weight: 700;
      color: var(--navy);
    }

    input,
    select,
    textarea,
    button {
      font: inherit;
    }

    input,
    select,
    textarea {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 13px 14px;
      background: #fff;
      color: var(--text);
    }

    textarea {
      min-height: 120px;
      resize: vertical;
      line-height: 1.5;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 22px;
    }

    .btn {
      appearance: none;
      border: 0;
      border-radius: 999px;
      padding: 14px 18px;
      background: var(--navy);
      color: #fff;
      font-weight: 700;
      cursor: pointer;
    }

    .btn.secondary {
      background: #eef2ff;
      color: var(--navy);
      border: 1px solid #c7d2fe;
    }

    .status {
      margin-top: 18px;
      padding: 14px 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      display: none;
    }

    .status.show {
      display: block;
    }

    .status.success {
      background: #e8fff0;
      color: var(--success);
      border: 1px solid #b7ebc6;
    }

    .status.error {
      background: #fff1f3;
      color: var(--danger);
      border: 1px solid #f7c3cc;
    }

    .result-box {
      margin-top: 24px;
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      background: #f8fafc;
    }

    .result-head {
      padding: 14px 16px;
      background: #eef6ff;
      border-bottom: 1px solid var(--border);
      font-weight: 700;
      color: var(--navy);
    }

    pre {
      margin: 0;
      padding: 16px;
      overflow: auto;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .links {
      margin-top: 20px;
      display: grid;
      gap: 12px;
    }

    .link-card {
      border: 1px solid var(--border);
      border-radius: 14px;
      background: #fff;
      padding: 14px 16px;
    }

    .link-card strong {
      display: block;
      margin-bottom: 6px;
      color: var(--navy);
    }

    .small-note {
      margin-top: 14px;
      font-size: 13px;
      color: var(--muted);
      line-height: 1.6;
    }

    footer {
      max-width: 1180px;
      margin: 0 auto;
      padding: 24px;
      text-align: center;
      color: #fff;
      background: var(--navy);
      font-size: 13px;
    }

    @media (max-width: 900px) {
      .grid {
        grid-template-columns: 1fr;
      }

      .hero h1 {
        font-size: 32px;
      }

      header,
      main,
      footer {
        padding-left: 16px;
        padding-right: 16px;
      }
    }
  </style>
</head>
<body>
  <header>
    <a class="site-logo" href="https://marketingspecialists.co.za/digital-marketing-agency-in-south-africa">
      <img src="https://marketingspecialists.co.za/wp-content/uploads/2022/06/marketing-specialists-logo-image.jpg" alt="The Marketing Specialists">
    </a>

    <nav>
      <a href="https://marketingspecialists.co.za/">Home</a>
      <a href="https://marketingspecialists.co.za/about-us/">About</a>
      <a href="https://marketingspecialists.co.za/digital-marketing-services/">Services</a>
      <a href="https://marketingspecialists.co.za/insights/">Insights</a>
      <a href="https://marketingspecialists.co.za/marketing-tools/">Marketing Tools</a>
      <a href="https://marketingspecialists.co.za/contact/">Contact</a>
    </nav>
  </header>

  <main>
    <section class="hero">
      <p class="eyebrow">Private Admin</p>
      <h1>Traffic Engine Control Panel</h1>
      <p>
        Generate keyword-led SEO article batches without touching the browser console.
        This page sends your request to the Cloudflare traffic engine, commits content
        into GitHub, and lets Cloudflare rebuild the site automatically.
      </p>
    </section>

    <section class="card">
      <h2>Generate a traffic batch</h2>
      <p class="lead">
        Fill in the topic once, click generate, and the engine will create a content batch
        for your Cloudflare publishing system.
      </p>

      <form id="traffic-form">
        <div class="grid">
          <div class="field full">
            <label for="engineKey">Traffic engine key</label>
            <input id="engineKey" name="engineKey" type="password" placeholder="Enter your private engine key" required>
          </div>

          <div class="field">
            <label for="seedTopic">Seed topic</label>
            <input id="seedTopic" name="seedTopic" type="text" placeholder="Example: Hair extensions in South Africa" required>
          </div>

          <div class="field">
            <label for="articlesToGenerate">Articles to generate</label>
            <select id="articlesToGenerate" name="articlesToGenerate">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3" selected>3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          <div class="field">
            <label for="audience">Audience</label>
            <input id="audience" name="audience" type="text" placeholder="Example: Women shopping for premium hair">
          </div>

          <div class="field">
            <label for="country">Country</label>
            <input id="country" name="country" type="text" placeholder="Example: South Africa">
          </div>

          <div class="field">
            <label for="city">City</label>
            <input id="city" name="city" type="text" placeholder="Example: Johannesburg">
          </div>

          <div class="field">
            <label for="industry">Industry</label>
            <input id="industry" name="industry" type="text" placeholder="Example: Hair and beauty">
          </div>

          <div class="field">
            <label for="ctaLabel">CTA label</label>
            <input id="ctaLabel" name="ctaLabel" type="text" placeholder="Example: Shop Now">
          </div>

          <div class="field">
            <label for="ctaUrl">CTA URL</label>
            <input id="ctaUrl" name="ctaUrl" type="url" placeholder="https://yourdomain.com/product-page">
          </div>

          <div class="field full">
            <label for="extraInstructions">Extra instructions</label>
            <textarea id="extraInstructions" name="extraInstructions" placeholder="Add anything important about tone, monetisation angle, buyer intent, internal linking, or product focus"></textarea>
          </div>
        </div>

        <div class="actions">
          <button type="submit" class="btn" id="runButton">Generate traffic batch</button>
          <button type="button" class="btn secondary" id="saveDefaults">Save fields in browser</button>
          <button type="button" class="btn secondary" id="clearDefaults">Clear saved fields</button>
        </div>

        <div id="statusBox" class="status"></div>
      </form>

      <div class="result-box">
        <div class="result-head">Raw response</div>
        <pre id="resultOutput">No request has been run yet.</pre>
      </div>

      <div id="pageLinks" class="links"></div>

      <p class="small-note">
        This page is just the internal runner. It does not publish content by itself.
        It sends your request to the traffic engine, which writes a batch file into GitHub.
        Once that happens, Cloudflare Pages rebuilds the site from the repo.
      </p>
    </section>
  </main>

  <footer>
    © The Marketing Specialists
  </footer>

  <script>
    const STORAGE_KEY = "tms-traffic-admin-defaults";

    const form = document.getElementById("traffic-form");
    const statusBox = document.getElementById("statusBox");
    const resultOutput = document.getElementById("resultOutput");
    const pageLinks = document.getElementById("pageLinks");
    const saveDefaultsButton = document.getElementById("saveDefaults");
    const clearDefaultsButton = document.getElementById("clearDefaults");
    const runButton = document.getElementById("runButton");

    const fieldsToPersist = [
      "seedTopic",
      "articlesToGenerate",
      "audience",
      "country",
      "city",
      "industry",
      "ctaLabel",
      "ctaUrl",
      "extraInstructions"
    ];

    function showStatus(message, type) {
      statusBox.textContent = message;
      statusBox.className = "status show " + type;
    }

    function clearStatus() {
      statusBox.textContent = "";
      statusBox.className = "status";
    }

    function saveDefaults() {
      const saved = {};
      for (const name of fieldsToPersist) {
        saved[name] = form.elements[name]?.value || "";
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      showStatus("Fields saved in this browser.", "success");
    }

    function loadDefaults() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      try {
        const saved = JSON.parse(raw);
        for (const name of fieldsToPersist) {
          if (form.elements[name] && saved[name] !== undefined) {
            form.elements[name].value = saved[name];
          }
        }
      } catch {}
    }

    function clearDefaults() {
      localStorage.removeItem(STORAGE_KEY);
      for (const name of fieldsToPersist) {
        if (form.elements[name]) form.elements[name].value = "";
      }
      form.elements.articlesToGenerate.value = "3";
      showStatus("Saved browser fields cleared.", "success");
    }

    function renderLinks(data) {
      pageLinks.innerHTML = "";

      if (!data || !Array.isArray(data.pageUrls) || !data.pageUrls.length) return;

      for (const item of data.pageUrls) {
        const wrap = document.createElement("div");
        wrap.className = "link-card";

        const title = document.createElement("strong");
        title.textContent = item.title || item.path || "Generated page";

        const link = document.createElement("a");
        link.href = item.path || "#";
        link.textContent = item.path || "#";
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        wrap.appendChild(title);
        wrap.appendChild(link);
        pageLinks.appendChild(wrap);
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearStatus();
      pageLinks.innerHTML = "";
      resultOutput.textContent = "Running traffic engine...";

      runButton.disabled = true;
      runButton.textContent = "Generating...";

      const payload = {
        seedTopic: form.elements.seedTopic.value,
        audience: form.elements.audience.value,
        country: form.elements.country.value,
        city: form.elements.city.value,
        industry: form.elements.industry.value,
        articlesToGenerate: Number(form.elements.articlesToGenerate.value || 1),
        ctaLabel: form.elements.ctaLabel.value,
        ctaUrl: form.elements.ctaUrl.value,
        extraInstructions: form.elements.extraInstructions.value
      };

      const engineKey = form.elements.engineKey.value;

      try {
        const res = await fetch("/api/run-traffic-engine", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-engine-key": engineKey
          },
          body: JSON.stringify(payload)
        });

        const text = await res.text();
        resultOutput.textContent = text;

        let data = null;
        try {
          data = JSON.parse(text);
        } catch {}

        if (!res.ok) {
          showStatus("Traffic engine failed. Check the raw response below.", "error");
        } else {
          showStatus("Traffic batch generated successfully.", "success");
          renderLinks(data);
          saveDefaults();
        }
      } catch (error) {
        resultOutput.textContent = String(error);
        showStatus("Request failed before the server could return a response.", "error");
      } finally {
        runButton.disabled = false;
        runButton.textContent = "Generate traffic batch";
      }
    });

    saveDefaultsButton.addEventListener("click", saveDefaults);
    clearDefaultsButton.addEventListener("click", clearDefaults);

    loadDefaults();
  </script>
</body>
</html>`;
}

export async function onRequestGet() {
  return new Response(html(), {
    headers: {
      "content-type": "text/html; charset=UTF-8"
    }
  });
}
