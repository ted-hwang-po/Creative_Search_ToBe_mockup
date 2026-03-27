// CreativeCard, LayoutSilhouette, StatCard components
// Registers to window.__APP.pages.creativeSearchComponents

(function () {
  window.__APP = window.__APP || {};
  window.__APP.pages = window.__APP.pages || {};
  window.__APP.pages.creativeSearchComponents = window.__APP.pages.creativeSearchComponents || {};

  var Pill = window.__APP.ui.Pill;
  var badgeHighEfficiency = window.__APP.ui.badgeHighEfficiency;

  // ---------- Layout library (shared reference for silhouettes) ----------
  var LAYOUT_LIBRARY = {
    "hero-product-left": {
      name: "\uC81C\uD488 \uD788\uC5B4\uB85C(\uC88C) + \uD14D\uC2A4\uD2B8(\uC6B0)",
      img: "./assets/silhouettes/hero-product-left.svg",
      silhouette:
        "\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502 \u2588\u2588\u2588\u2588      \u2591\u2591\u2591 \u2502\n\u2502 \u2588\u2588\u2588\u2588      \u2591\u2591\u2591 \u2502\n\u2502 \u2588\u2588\u2588\u2588      \u2591\u2591\u2591 \u2502\n\u2502            CTA \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518",
    },
    "hero-model-center": {
      name: "\uBAA8\uB378 \uC911\uC2EC + \uD558\uB2E8 CTA",
      img: "./assets/silhouettes/hero-model-center.svg",
      silhouette:
        "\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502     \u2588\u2588\u2588\u2588\u2588     \u2502\n\u2502     \u2588\u2588\u2588\u2588\u2588     \u2502\n\u2502     \u2588\u2588\u2588\u2588\u2588     \u2502\n\u2502  \u2591\u2591\u2591\u2591\u2591  CTA    \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518",
    },
    "grid-3-benefits": {
      name: "3\uBD84\uD560 \uBCA0\uB124\uD54F \uADF8\uB9AC\uB4DC",
      img: "./assets/silhouettes/grid-3-benefits.svg",
      silhouette:
        "\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502 \u2591\u2591\u2591 \u2591\u2591\u2591 \u2591\u2591\u2591   \u2502\n\u2502 \u2591\u2591\u2591 \u2591\u2591\u2591 \u2591\u2591\u2591   \u2502\n\u2502     \u2588\u2588\u2588\u2588      \u2502\n\u2502  CTA      \u2591\u2591\u2591  \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518",
    },
    "ugc-caption-heavy": {
      name: "UGC(\uCEA1\uC158 \uD14D\uC2A4\uD2B8 \uBE44\uC911\u2191)",
      img: "./assets/silhouettes/ugc-caption-heavy.svg",
      silhouette:
        "\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588  \u2502\n\u2502 \u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591  \u2502\n\u2502 \u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591  \u2502\n\u2502 CTA           \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518",
    },
    "before-after-split": {
      name: "\uC804/\uD6C4 \uBE44\uAD50 \uC2A4\uD50C\uB9BF",
      img: "./assets/silhouettes/before-after-split.svg",
      silhouette:
        "\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502 \u2588\u2588\u2588\u2588\u2502\u2588\u2588\u2588\u2588     \u2502\n\u2502 \u2588\u2588\u2588\u2588\u2502\u2588\u2588\u2588\u2588     \u2502\n\u2502 \u2591\u2591\u2591\u2591\u2502\u2591\u2591\u2591\u2591     \u2502\n\u2502    CTA        \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518",
    },
  };

  // Expose LAYOUT_LIBRARY for other sub-components to use
  window.__APP.pages.creativeSearchComponents.LAYOUT_LIBRARY = LAYOUT_LIBRARY;

  // ---------- Helper ----------
  function formatPct(n, digits) {
    digits = digits || 0;
    var v = Math.round(n * Math.pow(10, digits)) / Math.pow(10, digits);
    return v + "%";
  }

  function getBrand(brandId) {
    var ds = window.__APP.dataset && window.__APP.dataset.creativeSearchV2;
    if (ds && ds.brands) {
      return ds.brands.find(function (b) { return b.id === brandId; });
    }
    // v1 fallback
    var BRANDS = [
      { id: "oliveyoung", name: "\uC62C\uB9AC\uBE0C\uC601", isOwn: true },
      { id: "innisfree", name: "\uC774\uB2C8\uC2A4\uD504\uB9AC" },
      { id: "labiotte", name: "\uB77C\uBE44\uC624\uB728" },
      { id: "roundlab", name: "\uB77C\uC6B4\uB4DC\uB7A9" },
      { id: "hera", name: "\uD5E4\uB77C" },
    ];
    return BRANDS.find(function (b) { return b.id === brandId; });
  }

  // Expose getBrand for other sub-components
  window.__APP.pages.creativeSearchComponents.getBrand = getBrand;
  window.__APP.pages.creativeSearchComponents.formatPct = formatPct;

  // ---------- badgeHighEfficiency fallback ----------
  // Use shared badge if available, otherwise use local v1 logic
  var isHighEfficiency = badgeHighEfficiency || function (creative) {
    return creative.runDays >= 5 && creative.predictedScore >= 0.75;
  };

  // ---------- CreativeCard ----------
  function CreativeCard(_ref) {
    var creative = _ref.creative;
    var onClick = _ref.onClick;
    var variant = _ref.variant || "default";

    var brand = getBrand(creative.brandId);
    var compact = variant === "compact";
    var thumbUrl = creative.thumbnailUrl || creative.thumbUrl;
    var layoutKey = creative.layoutKey || creative.layout;
    return (
      <button
        onClick={onClick}
        className={"w-full rounded-2xl border bg-white text-left text-zinc-900 hover:bg-zinc-50 " +
          (compact ? "p-3" : "p-4")}
      >
        <div className={"flex items-start justify-between " + (compact ? "gap-2" : "gap-3")}>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-semibold">
                {creative.title} <span className="text-zinc-500">{"\u00B7"} {brand && brand.name}</span>
              </div>
              {creative.adType === "partnership" && <Pill tone="purple">{"\uD30C\uD2B8\uB108\uC2ED"}</Pill>}
              {creative.mediaType === "video" ? <Pill tone="blue">{"\uC601\uC0C1"}</Pill> : <Pill>{"\uC774\uBBF8\uC9C0"}</Pill>}
              {isHighEfficiency(creative) && <Pill tone="green">{"\uACE0\uD6A8\uC728 \uC608\uC0C1"}</Pill>}
            </div>
            <div className={"mt-2 " + (compact ? "text-xs" : "text-sm") + " text-zinc-700 line-clamp-2"}>
              {creative.caption}
            </div>

            {!compact ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill>{"\uB808\uC774\uC544\uC6C3: "}{(LAYOUT_LIBRARY[layoutKey] && LAYOUT_LIBRARY[layoutKey].name) || layoutKey}</Pill>
                <Pill>
                  {"CTA: "}{creative.ctaType}
                  {creative.ctaSize ? " (" + creative.ctaSize + ")" : ""}
                </Pill>
                <Pill>{"\uD14D\uC2A4\uD2B8 \uBE44\uC911: "}{formatPct(creative.textRatio * 100)}</Pill>
                <Pill>{"\uCE74\uD53C \uC720\uD615: "}{creative.copyType}</Pill>
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill>{"\uB808\uC774\uC544\uC6C3: "}{(LAYOUT_LIBRARY[layoutKey] && LAYOUT_LIBRARY[layoutKey].name) || layoutKey}</Pill>
                <Pill>{"CTA: "}{creative.ctaType}</Pill>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            {thumbUrl ? (
              <img
                src={thumbUrl}
                alt={(brand && brand.name || "") + " thumbnail"}
                className={(compact ? "h-12 w-12" : "h-14 w-14") + " rounded-xl border bg-white object-cover"}
                loading="lazy"
                draggable="false"
              />
            ) : (
              <div className="text-3xl">{creative.thumb}</div>
            )}
            <div className={(compact ? "text-[11px]" : "text-xs") + " text-zinc-500"}>
              run {creative.runDays}d {"\u00B7"} score {Math.round(creative.predictedScore * 100)}
            </div>
          </div>
        </div>
      </button>
    );
  }

  // ---------- LayoutSilhouette ----------
  function LayoutSilhouette(_ref) {
    var layoutKey = _ref.layoutKey;
    var className = _ref.className || "";
    var layout = LAYOUT_LIBRARY[layoutKey];
    if (!layout) return null;
    var alt = "\uB808\uC774\uC544\uC6C3 \uC2E4\uB8E8\uC5FF: " + layout.name;

    if (layout.img) {
      return (
        <img
          src={layout.img}
          alt={alt}
          className={"w-full max-w-[280px] select-none " + className}
          draggable="false"
          loading="lazy"
        />
      );
    }

    return (
      <div className={"whitespace-pre font-mono text-xs leading-4 text-zinc-700 " + className}>
        {layout.silhouette}
      </div>
    );
  }

  // ---------- StatCard ----------
  function StatCard(_ref) {
    var label = _ref.label;
    var value = _ref.value;
    var children = _ref.children;
    return (
      <div className="rounded-xl border bg-white p-3">
        <div className="text-xs text-zinc-500">{label}</div>
        {value != null && <div className="mt-1 text-sm font-semibold text-zinc-900">{value}</div>}
        {children}
      </div>
    );
  }

  // ---------- Register ----------
  window.__APP.pages.creativeSearchComponents.CreativeCard = CreativeCard;
  window.__APP.pages.creativeSearchComponents.LayoutSilhouette = LayoutSilhouette;
  window.__APP.pages.creativeSearchComponents.StatCard = StatCard;
})();
