// BrandBreakdown component - brand summary cards with media/ad type distribution,
// repeating traits, and type groups
// Registers to window.__APP.pages.creativeSearchComponents.BrandBreakdown

(function () {
  window.__APP = window.__APP || {};
  window.__APP.pages = window.__APP.pages || {};
  window.__APP.pages.creativeSearchComponents = window.__APP.pages.creativeSearchComponents || {};

  var Pill = window.__APP.ui.Pill;
  var SectionHeader = window.__APP.ui.SectionHeader;
  var StackedBar = window.__APP.ui.StackedBar;
  var BarRow = window.__APP.ui.BarRow;
  var MiniBarRow = window.__APP.ui.MiniBarRow;

  var LAYOUT_LIBRARY = window.__APP.pages.creativeSearchComponents.LAYOUT_LIBRARY;
  var getBrand = window.__APP.pages.creativeSearchComponents.getBrand;
  var CreativeCard = window.__APP.pages.creativeSearchComponents.CreativeCard;

  // BrandSummaryCard: renders a single brand's breakdown
  function BrandSummaryCard(_ref) {
    var brandSummary = _ref.brandSummary;
    var highlighted = _ref.highlighted || false;
    var expandedTypeGroupBrands = _ref.expandedTypeGroupBrands || {};
    var onToggleTypeGroupExpand = _ref.onToggleTypeGroupExpand;
    var onOpenTypeGroup = _ref.onOpenTypeGroup;
    var resultsByBrand = _ref.resultsByBrand || {};
    var onPickCreative = _ref.onPickCreative;

    var bs = brandSummary;
    var brand = getBrand(bs.brandId);
    var b = bs.breakdown;

    var containerClassName = highlighted
      ? "rounded-2xl border-2 border-blue-500 bg-blue-50 p-4 shadow-md"
      : "rounded-2xl border p-4";

    return (
      <div className={containerClassName}>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div
                className="h-8 w-8 text-sm rounded-lg bg-zinc-100 flex items-center justify-center font-semibold text-zinc-700"
                title={bs.brandId}
                aria-label={bs.brandId + " \uB85C\uACE0"}
              >
                {bs.brandId ? bs.brandId.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="text-base font-semibold">{brand && brand.name}</div>
              {brand && brand.isOwn && <Pill tone="blue">{"\uC790\uC0AC"}</Pill>}
              <Pill>{"\uAC80\uC0C9 \uACB0\uACFC "}{bs.total}{"\uAC1C"}</Pill>
            </div>

            <div className="grid gap-2 text-sm text-zinc-700 md:grid-cols-2">
              <div className="rounded-xl bg-zinc-50 p-3">
                <div className="font-semibold">{"\uC18C\uC7AC \uC720\uD615 \uBE44\uC911"}</div>
                <div className="mt-3 space-y-3">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-zinc-600">{"\uBBF8\uB514\uC5B4"}</div>
                    <StackedBar
                      parts={[
                        { key: "img", label: "\uC774\uBBF8\uC9C0 " + b.image, valuePct: b.imageRatio * 100, className: "bg-blue-500" },
                        { key: "vid", label: "\uC601\uC0C1 " + b.video, valuePct: b.videoRatio * 100, className: "bg-violet-500" },
                      ]}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <BarRow label={"\uC774\uBBF8\uC9C0 (" + b.image + ")"} valuePct={b.imageRatio * 100} tone="blue" />
                      <BarRow label={"\uC601\uC0C1 (" + b.video + ")"} valuePct={b.videoRatio * 100} tone="purple" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-zinc-600">{"\uAD11\uACE0 \uC720\uD615"}</div>
                    <StackedBar
                      parts={[
                        { key: "normal", label: "\uC77C\uBC18 " + b.normal, valuePct: b.normalRatio * 100, className: "bg-zinc-700" },
                        { key: "part", label: "\uD30C\uD2B8\uB108\uC2ED " + b.partnership, valuePct: b.partnershipRatio * 100, className: "bg-emerald-500" },
                      ]}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <BarRow label={"\uC77C\uBC18 (" + b.normal + ")"} valuePct={b.normalRatio * 100} tone="zinc" />
                      <BarRow label={"\uD30C\uD2B8\uB108\uC2ED (" + b.partnership + ")"} valuePct={b.partnershipRatio * 100} tone="emerald" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-zinc-50 p-3">
                <div className="font-semibold">{"\uC720\uC758\uBBF8\uD558\uAC8C \uBC18\uBCF5\uB418\uB294 \uD2B9\uC9D5"}</div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-zinc-600">{"\uB808\uC774\uC544\uC6C3"}</div>
                    {(bs.repeating.layout || []).slice(0, 2).map(function (t) {
                      return (
                        <MiniBarRow key={"layout-" + t.k} label={t.label} valuePct={t.displayPct != null ? t.displayPct : t.ratio * 100} tone="emerald" />
                      );
                    })}
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-zinc-600">{"\uCE74\uD53C"}</div>
                    {(bs.repeating.copyType || []).slice(0, 2).map(function (t) {
                      return (
                        <MiniBarRow key={"copy-" + t.k} label={t.k} valuePct={t.displayPct != null ? t.displayPct : t.ratio * 100} tone="amber" />
                      );
                    })}
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-zinc-600">CTA</div>
                    {(bs.repeating.ctaType || []).slice(0, 2).map(function (t) {
                      return (
                        <MiniBarRow key={"cta-" + t.k} label={t.k} valuePct={t.displayPct != null ? t.displayPct : t.ratio * 100} tone="blue" />
                      );
                    })}
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-zinc-600">{"\uD14D\uC2A4\uD2B8 \uBE44\uC911"}</div>
                    {(bs.repeating.textBucket || []).slice(0, 2).map(function (t) {
                      return (
                        <MiniBarRow key={"text-" + t.k} label={t.k} valuePct={t.displayPct != null ? t.displayPct : t.ratio * 100} tone="zinc" />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full shrink-0 space-y-2 md:w-[320px] lg:w-[340px]">
            <div className="font-semibold">{"\uC18C\uC7AC \uC720\uD615 (\uCD5C\uB300 5\uAC1C)"}</div>
            <div className="space-y-2">
              {bs.typeGroups.length === 0 && (
                <div className="rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-600">
                  {"\uC544\uC9C1 \uC18C\uC7AC \uC720\uD615\uC774 \uBD84\uB958\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."}
                </div>
              )}
              {(expandedTypeGroupBrands[bs.brandId] ? bs.typeGroups : bs.typeGroups.slice(0, 2)).map(function (g) {
                return (
                  <button
                    key={g.id}
                    onClick={function () { onOpenTypeGroup && onOpenTypeGroup(g.id); }}
                    className="w-full rounded-xl border bg-white p-2.5 text-left hover:bg-zinc-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold">{g.name}</div>
                      <div className="text-xs text-zinc-500">score {Math.round((g.predictedGroupScore || 0) * 100)}</div>
                    </div>
                    <div className="mt-2 text-xs text-zinc-600 line-clamp-2">{g.description}</div>
                  </button>
                );
              })}

              {bs.typeGroups.length > 2 && (
                <button
                  type="button"
                  onClick={function () { onToggleTypeGroupExpand && onToggleTypeGroupExpand(bs.brandId); }}
                  className="w-full rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50 inline-flex items-center justify-center gap-1"
                  aria-label={expandedTypeGroupBrands[bs.brandId] ? "\uC811\uAE30" : "\uB354 \uBCF4\uAE30"}
                >
                  <span>{expandedTypeGroupBrands[bs.brandId] ? "\uC811\uAE30" : "\uB354 \uBCF4\uAE30 (+" + (bs.typeGroups.length - 2) + ")"}</span>
                  <span className="text-base leading-none">{expandedTypeGroupBrands[bs.brandId] ? "\u25B2" : "\u25BC"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* brand creatives list */}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(resultsByBrand[bs.brandId] || []).slice(0, 4).map(function (c) {
            return (
              <CreativeCard key={c.id} creative={c} variant="compact" onClick={function () { onPickCreative && onPickCreative(c); }} />
            );
          })}
        </div>
      </div>
    );
  }

  // CompetitorBrandList: renders the collapsible list of competitor brands
  function CompetitorBrandList(_ref) {
    var competitorBrandSummaries = _ref.competitorBrandSummaries;
    var expandedBrands = _ref.expandedBrands || {};
    var onToggleBrand = _ref.onToggleBrand;
    var expandedTypeGroupBrands = _ref.expandedTypeGroupBrands || {};
    var onToggleTypeGroupExpand = _ref.onToggleTypeGroupExpand;
    var onOpenTypeGroup = _ref.onOpenTypeGroup;
    var resultsByBrand = _ref.resultsByBrand || {};
    var onPickCreative = _ref.onPickCreative;
    var onBrandSearch = _ref.onBrandSearch;

    return (
      <div className="rounded-2xl border bg-white p-4">
        <SectionHeader title={"\uACBD\uC7C1 \uBE0C\uB79C\uB4DC \uC694\uC57D"} subtitle={"\uAD00\uC2EC\uC788\uB294 \uACBD\uC7C1 \uBE0C\uB79C\uB4DC\uB97C \uD3BC\uCCD0\uC11C \uC0C1\uC138\uD788 \uD655\uC778\uD558\uC138\uC694."} />

        <div className="space-y-2">
          {competitorBrandSummaries.length === 0 && (
            <div className="rounded-xl border bg-zinc-50 p-4 text-center">
              <div className="text-sm text-zinc-600">{"\uACBD\uC7C1 \uBE0C\uB79C\uB4DC \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."}</div>
            </div>
          )}
          {competitorBrandSummaries.map(function (bs) {
            var brand = getBrand(bs.brandId);
            var isExpanded = expandedBrands[bs.brandId];

            return (
              <div key={bs.brandId} className="rounded-xl border">
                {/* header */}
                <button
                  onClick={function () { onToggleBrand && onToggleBrand(bs.brandId); }}
                  className="w-full p-3 text-left hover:bg-zinc-50 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{brand && brand.name}</div>
                    <Pill>{"\uAC80\uC0C9 \uACB0\uACFC "}{bs.total}{"\uAC1C"}</Pill>
                  </div>
                  <span className="text-base leading-none">{isExpanded ? "\u25B2" : "\u25BC"}</span>
                </button>

                {/* body */}
                {isExpanded && (
                  <div className="border-t p-3">
                    <BrandSummaryCard
                      brandSummary={bs}
                      expandedTypeGroupBrands={expandedTypeGroupBrands}
                      onToggleTypeGroupExpand={onToggleTypeGroupExpand}
                      onOpenTypeGroup={onOpenTypeGroup}
                      resultsByBrand={resultsByBrand}
                      onPickCreative={onPickCreative}
                    />

                    <button
                      onClick={function () { onBrandSearch && onBrandSearch(bs.brandId); }}
                      className="mt-3 rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
                    >
                      {"\uC774 \uBE0C\uB79C\uB4DC \uAC80\uC0C9 \u2192"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  window.__APP.pages.creativeSearchComponents.BrandSummaryCard = BrandSummaryCard;
  window.__APP.pages.creativeSearchComponents.CompetitorBrandList = CompetitorBrandList;
  window.__APP.pages.creativeSearchComponents.BrandBreakdown = { BrandSummaryCard: BrandSummaryCard, CompetitorBrandList: CompetitorBrandList };
})();
