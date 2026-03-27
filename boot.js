/* global React, ReactDOM, Babel */

async function boot() {
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("#root not found");

  // Load multiple JSX sources (no build step) and run them via Babel.
  // NOTE: Load order matters (shared first, then pages, then entry App).
  const FILES = [
    "./src/registry.jsx",
    "./src/shared/ui.jsx",
    "./src/shared/helpers.jsx",
    "./src/shared/url-state.jsx",
    "./src/shared/high-efficiency.jsx",
    "./src/shared/patterns.jsx",
    "./src/shared/chat-panel.jsx",
    "./src/mock/creative-search-dataset-v2.jsx",
    // creative-search sub-components (must load before index)
    "./src/pages/creative-search/creative-card.jsx",
    "./src/pages/creative-search/insights-summary.jsx",
    "./src/pages/creative-search/brand-breakdown.jsx",
    "./src/pages/creative-search/promo-panel.jsx",
    "./src/pages/creative-search/partnership-panel.jsx",
    "./src/pages/creative-search/ab-section.jsx",
    "./src/pages/creative-search/result-list.jsx",
    "./src/pages/creative-search/index.jsx",
    "./src/pages/creative-search-key-message.jsx",
    "./src/pages/creative-search-influencer.jsx",
    "./src/pages/creative-search-emphasis-trend.jsx",
    "./src/pages/creative-search-monthly-trend.jsx",
    "./app.jsx",
  ];

  const sources = await Promise.all(
    FILES.map(async (path) => {
      const r = await fetch(path, { cache: "no-store" });
      if (!r.ok) throw new Error(`Failed to load ${path} (${r.status})`);
      return `\n\n/* ===== ${path} ===== */\n\n` + (await r.text());
    })
  );

  const src = sources.join("\n");

  // Remove import lines (prototype file has one React import at the top)
  const withoutImports = src.replace(/^\s*import[^\n]*\n/gm, "");

  // Convert `export default function App(...)` to plain function
  const withoutExportDefault = withoutImports.replace(
    /export\s+default\s+function\s+App\s*\(/g,
    "function App("
  );

  const wrapped = [
    "const { useMemo, useState, useEffect, useRef, useCallback } = React;",
    withoutExportDefault,
    "",
    "const __root = ReactDOM.createRoot(document.getElementById('root'));",
    "if (typeof App !== 'function') { throw new Error('App component not found after transform'); }",
    "__root.render(React.createElement(App));",
  ].join("\n");

  const out = Babel.transform(wrapped, { presets: ["react"] }).code;
  // eslint-disable-next-line no-eval
  (0, eval)(out);
}

boot().catch((err) => {
  console.error(err);
  const rootEl = document.getElementById("root");
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="max-width:900px;margin:24px auto;padding:16px;border:1px solid #e5e7eb;border-radius:16px;background:#fff;font-family:ui-sans-serif,system-ui;">
        <div style="font-weight:700;color:#b91c1c;margin-bottom:8px;">앱을 로드하지 못했어요</div>
        <div style="color:#334155;font-size:14px;margin-bottom:12px;">DevTools Console 에러를 복사해서 보내주시면 바로 고칠게요.</div>
        <pre style="white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:12px;border:1px solid #e5e7eb;font-size:12px;color:#0f172a;">${String(
          err && (err.stack || err.message || err)
        )}</pre>
      </div>
    `;
  }
});
