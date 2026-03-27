// InsightsSummary component
// Registers to window.__APP.pages.creativeSearchComponents.InsightsSummary

(function () {
  window.__APP = window.__APP || {};
  window.__APP.pages = window.__APP.pages || {};
  window.__APP.pages.creativeSearchComponents = window.__APP.pages.creativeSearchComponents || {};

  var Pill = window.__APP.ui.Pill;
  var StackedBar = window.__APP.ui.StackedBar;
  var MiniBarRow = window.__APP.ui.MiniBarRow;

  var LAYOUT_LIBRARY = window.__APP.pages.creativeSearchComponents.LAYOUT_LIBRARY;
  var getBrand = window.__APP.pages.creativeSearchComponents.getBrand;

  function InsightsSummary(_ref) {
    var results = _ref.results;
    var brandSummaries = _ref.brandSummaries;
    var recommendedClusters = _ref.recommendedClusters;
    var abSuggestionForCluster = _ref.abSuggestionForCluster;
    var defaultCollapsed = _ref.defaultCollapsed != null ? _ref.defaultCollapsed : true;

    var collapsed = useState(defaultCollapsed);
    var isCollapsed = collapsed[0];
    var setCollapsed = collapsed[1];

    var totals = useMemo(function () {
      var total = results.length || 1;
      var image = results.filter(function (x) { return x.mediaType === "image"; }).length;
      var video = results.filter(function (x) { return x.mediaType === "video"; }).length;
      var normal = results.filter(function (x) { return x.adType === "normal"; }).length;
      var partnership = results.filter(function (x) { return x.adType === "partnership"; }).length;
      return {
        total: total,
        image: image,
        video: video,
        normal: normal,
        partnership: partnership,
        imagePct: (image / total) * 100,
        videoPct: (video / total) * 100,
        normalPct: (normal / total) * 100,
        partnershipPct: (partnership / total) * 100,
      };
    }, [results]);

    var prominent = useMemo(function () {
      var total = results.length || 1;
      var countBy = function (keyFn) {
        return results.reduce(function (acc, x) {
          var k = keyFn(x);
          if (!k) return acc;
          acc[k] = (acc[k] || 0) + 1;
          return acc;
        }, {});
      };

      var top = function (counts) {
        return Object.entries(counts)
          .sort(function (a, b) { return b[1] - a[1]; })
          .map(function (_ref) { return { k: _ref[0], v: _ref[1], pct: (_ref[1] / total) * 100 }; })[0];
      };

      var topLayoutKey = top(countBy(function (c) { return c.layout || c.layoutKey; }));
      var topCopyType = top(countBy(function (c) { return c.copyType; }));
      var topCTA = top(countBy(function (c) { return c.ctaType; }));
      return { topLayoutKey: topLayoutKey, topCopyType: topCopyType, topCTA: topCTA };
    }, [results]);

    var brandKeyMessages = useMemo(function () {
      return (brandSummaries || [])
        .slice(0, 4)
        .map(function (bs) {
          var brand = getBrand(bs.brandId);
          var km = bs.repeating && bs.repeating.keyMessage && bs.repeating.keyMessage[0];
          var label = (km && km.k) || "-";
          var pct = km && km.displayPct != null ? km.displayPct : (km && km.ratio != null ? km.ratio * 100 : 0);
          return {
            brandId: bs.brandId,
            brandName: (brand && brand.name) || bs.brandId,
            keyMessage: label,
            pct: pct,
            total: bs.total,
          };
        })
        .filter(function (x) { return x.keyMessage && x.keyMessage !== "-"; });
    }, [brandSummaries]);

    var abSummary = useMemo(function () {
      if (!recommendedClusters || !recommendedClusters.length) return null;
      var topCluster = recommendedClusters[0];
      var ab = abSuggestionForCluster(topCluster);
      if (!ab) return null;
      return {
        count: recommendedClusters.length,
        budget: ab.budget,
        period: ab.period,
        objective: ab.objective,
        creativesPerGroup: ab.creativesPerGroup,
        groupA: { layoutKey: ab.groups && ab.groups[0] && ab.groups[0].layoutKey, keyMessage: ab.groups && ab.groups[0] && ab.groups[0].keyMessage },
        groupB: { layoutKey: ab.groups && ab.groups[1] && ab.groups[1].layoutKey, keyMessage: ab.groups && ab.groups[1] && ab.groups[1].keyMessage },
      };
    }, [recommendedClusters, abSuggestionForCluster]);

    var insightLines = useMemo(function () {
      var topLayoutName =
        prominent.topLayoutKey && ((LAYOUT_LIBRARY[prominent.topLayoutKey.k] && LAYOUT_LIBRARY[prominent.topLayoutKey.k].name) || prominent.topLayoutKey.k);
      var topCopy = prominent.topCopyType && prominent.topCopyType.k;
      var topCTA = prominent.topCTA && prominent.topCTA.k;

      var prominentParts = [
        topLayoutName ? "\uB808\uC774\uC544\uC6C3\uC740 '" + topLayoutName + "' \uACBD\uD5A5\uC785\uB2C8\uB2E4" : null,
        topCopy ? "\uCE74\uD53C\uB294 '" + topCopy + "' \uC911\uC2EC\uC785\uB2C8\uB2E4" : null,
        topCTA ? "CTA\uB294 '" + topCTA + "'\uAC00 \uB450\uB4DC\uB7EC\uC9D1\uB2C8\uB2E4" : null,
      ].filter(Boolean);

      var prominentLine =
        prominentParts.length > 0 ? prominentParts.join(" \u00B7 ") + "." : "\uB450\uB4DC\uB7EC\uC9C0\uB294 \uC18C\uC7AC \uD2B9\uC9D5\uC744 \uC694\uC57D\uD560 \uB370\uC774\uD130\uAC00 \uBD80\uC871\uD569\uB2C8\uB2E4.";

      var ratioLine = "\uC774\uBBF8\uC9C0 " + totals.imagePct.toFixed(0) + "% / \uC601\uC0C1 " + totals.videoPct.toFixed(0) + "%, \uD30C\uD2B8\uB108\uC2ED " + totals.partnershipPct.toFixed(0) + "%\uB85C \uAD6C\uC131\uB429\uB2C8\uB2E4.";

      var topBrands = brandKeyMessages.slice(0, 2);
      var brandLine =
        topBrands.length > 0
          ? "\uBE0C\uB79C\uB4DC\uBCC4\uB85C " + topBrands.map(function (x) { return x.brandName + "\uC740(\uB294) '" + x.keyMessage + "'"; }).join(", ") + " \uBA54\uC2DC\uC9C0\uB97C \uC8FC\uB85C \uC0AC\uC6A9\uD569\uB2C8\uB2E4."
          : "\uBE0C\uB79C\uB4DC\uBCC4 \uD0A4 \uBA54\uC2DC\uC9C0 \uD328\uD134\uC744 \uC694\uC57D\uD560 \uB370\uC774\uD130\uAC00 \uBD80\uC871\uD569\uB2C8\uB2E4.";

      var abLine = abSummary
        ? "\uCD94\uCC9C \uC18C\uC7AC \uC720\uD615 \uAE30\uC900 " + abSummary.period + " A/B\uB97C \uAD8C\uC7A5\uD569\uB2C8\uB2E4. A\uB294 '" +
          ((LAYOUT_LIBRARY[abSummary.groupA.layoutKey] && LAYOUT_LIBRARY[abSummary.groupA.layoutKey].name) || abSummary.groupA.layoutKey || "-") +
          "', B\uB294 '" +
          ((LAYOUT_LIBRARY[abSummary.groupB.layoutKey] && LAYOUT_LIBRARY[abSummary.groupB.layoutKey].name) || abSummary.groupB.layoutKey || "-") +
          "' \uCEE8\uC149\uC785\uB2C8\uB2E4."
        : "\uD604\uC7AC \uC870\uAC74\uC5D0\uC11C\uB294 A/B \uD14C\uC2A4\uD2B8 \uCD94\uCC9C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.";

      return { prominentLine: prominentLine, ratioLine: ratioLine, brandLine: brandLine, abLine: abLine };
    }, [abSummary, brandKeyMessages, prominent, totals]);

    return (
      <div className="rounded-2xl border bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-zinc-900">{"\uAC80\uC0C9\uACB0\uACFC \uC778\uC0AC\uC774\uD2B8 \uC694\uC57D"}</div>
          <button
            type="button"
            onClick={function () { setCollapsed(function (v) { return !v; }); }}
            className="rounded-lg border bg-white px-2 py-1 text-xs text-zinc-900 hover:bg-zinc-50 inline-flex items-center gap-1"
            aria-label={isCollapsed ? "\uD3BC\uCE58\uAE30" : "\uC811\uAE30"}
          >
            <span>{isCollapsed ? "\uD3BC\uCE58\uAE30" : "\uC811\uAE30"}</span>
            <span className="text-sm leading-none">{isCollapsed ? "\u25BC" : "\u25B2"}</span>
          </button>
        </div>

        {isCollapsed ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {prominent.topLayoutKey && (
              <Pill tone="green">{"\uD2B9\uC9D5: "}{(LAYOUT_LIBRARY[prominent.topLayoutKey.k] && LAYOUT_LIBRARY[prominent.topLayoutKey.k].name) || prominent.topLayoutKey.k}</Pill>
            )}
            <Pill>
              {"\uC774\uBBF8\uC9C0 "}{totals.imagePct.toFixed(0)}{"% \u00B7 \uC601\uC0C1 "}{totals.videoPct.toFixed(0)}{"%"}
            </Pill>
            <Pill tone="purple">{"\uD30C\uD2B8\uB108\uC2ED "}{totals.partnershipPct.toFixed(0)}{"%"}</Pill>
            <Pill tone={abSummary ? "amber" : "neutral"}>{"A/B "}{abSummary ? "\uCD94\uCC9C" : "\uC5C6\uC74C"}</Pill>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-zinc-50 p-2.5">
              <div className="text-xs font-semibold text-zinc-600">{"\uB450\uB4DC\uB7EC\uC9C0\uB294 \uD2B9\uC9D5"}</div>
              <div className="mt-1 text-xs text-zinc-600">{insightLines.prominentLine}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {prominent.topLayoutKey && (
                  <Pill tone="green">
                    {"\uB808\uC774\uC544\uC6C3 "}{Math.round(prominent.topLayoutKey.pct)}{"%"}{" \u00B7 "}
                    {(LAYOUT_LIBRARY[prominent.topLayoutKey.k] && LAYOUT_LIBRARY[prominent.topLayoutKey.k].name) || prominent.topLayoutKey.k}
                  </Pill>
                )}
                {prominent.topCopyType && (
                  <Pill tone="amber">
                    {"\uCE74\uD53C "}{Math.round(prominent.topCopyType.pct)}{"%"}{" \u00B7 "}{prominent.topCopyType.k}
                  </Pill>
                )}
                {prominent.topCTA && (
                  <Pill tone="blue">
                    {"CTA "}{Math.round(prominent.topCTA.pct)}{"%"}{" \u00B7 "}{prominent.topCTA.k}
                  </Pill>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-zinc-50 p-2.5">
              <div className="text-xs font-semibold text-zinc-600">{"\uBE44\uC911"}</div>
              <div className="mt-1 text-xs text-zinc-600">{insightLines.ratioLine}</div>
              <div className="mt-2 space-y-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-600">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    {"\uC774\uBBF8\uC9C0"}
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    {"\uC601\uC0C1"}
                  </div>
                </div>
                <StackedBar
                  parts={[
                    { key: "img", label: "\uC774\uBBF8\uC9C0 " + totals.image, valuePct: totals.imagePct, className: "bg-blue-500" },
                    { key: "vid", label: "\uC601\uC0C1 " + totals.video, valuePct: totals.videoPct, className: "bg-violet-500" },
                  ]}
                />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-zinc-600">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-700" />
                    {"\uC77C\uBC18"}
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {"\uD30C\uD2B8\uB108\uC2ED"}
                  </div>
                </div>
                <StackedBar
                  parts={[
                    { key: "normal", label: "\uC77C\uBC18 " + totals.normal, valuePct: totals.normalPct, className: "bg-zinc-700" },
                    { key: "part", label: "\uD30C\uD2B8\uB108\uC2ED " + totals.partnership, valuePct: totals.partnershipPct, className: "bg-emerald-500" },
                  ]}
                />
              </div>
            </div>

            <div className="rounded-xl bg-zinc-50 p-2.5">
              <div className="text-xs font-semibold text-zinc-600">{"\uBE0C\uB79C\uB4DC\uBCC4 \uD0A4 \uBA54\uC2DC\uC9C0(Top)"}</div>
              <div className="mt-1 text-xs text-zinc-600">{insightLines.brandLine}</div>
              <div className="mt-2 space-y-1.5">
                {brandKeyMessages.slice(0, 3).map(function (x) {
                  return (
                    <MiniBarRow
                      key={x.brandId + ":" + x.keyMessage}
                      label={x.brandName + ": " + x.keyMessage}
                      valuePct={x.pct}
                      tone="zinc"
                    />
                  );
                })}
                {brandKeyMessages.length === 0 && (
                  <div className="rounded-xl border bg-zinc-50 p-4 text-center">
                    <div className="text-sm text-zinc-600">{"\uD45C\uC2DC\uD560 \uD575\uC2EC \uBA54\uC2DC\uC9C0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-zinc-50 p-2.5">
              <div className="text-xs font-semibold text-zinc-600">{"A/B \uD14C\uC2A4\uD2B8"}</div>
              {abSummary ? (
                <div className="mt-2 space-y-2">
                  <div className="text-xs text-zinc-600">{insightLines.abLine}</div>
                  <div className="flex flex-wrap gap-2">
                    <Pill tone="amber">{"\uCD94\uCC9C "}{abSummary.count}{"\uAC1C"}</Pill>
                    <Pill>{"\uAE30\uAC04 "}{abSummary.period}</Pill>
                    <Pill>{"\uC608\uC0B0 "}{abSummary.budget}</Pill>
                    <Pill tone="blue">{"\uBAA9\uC801 "}{abSummary.objective}</Pill>
                    <Pill>{"\uADF8\uB8F9\uB2F9 \uC18C\uC7AC "}{abSummary.creativesPerGroup}{"\uAC1C"}</Pill>
                  </div>

                  <div className="grid gap-2 text-[11px] leading-4 text-zinc-700">
                    <div className="rounded-lg border bg-white px-2 py-1.5">
                      <span className="font-semibold">A</span>{" "}
                      <span className="text-zinc-500">
                        {(LAYOUT_LIBRARY[abSummary.groupA.layoutKey] && LAYOUT_LIBRARY[abSummary.groupA.layoutKey].name) || abSummary.groupA.layoutKey || "-"}
                      </span>
                      <span className="text-zinc-400">{" \u00B7 "}</span>
                      <span className="truncate">{abSummary.groupA.keyMessage || "-"}</span>
                    </div>
                    <div className="rounded-lg border bg-white px-2 py-1.5">
                      <span className="font-semibold">B</span>{" "}
                      <span className="text-zinc-500">
                        {(LAYOUT_LIBRARY[abSummary.groupB.layoutKey] && LAYOUT_LIBRARY[abSummary.groupB.layoutKey].name) || abSummary.groupB.layoutKey || "-"}
                      </span>
                      <span className="text-zinc-400">{" \u00B7 "}</span>
                      <span className="truncate">{abSummary.groupB.keyMessage || "-"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-zinc-600">{"\uCD94\uCC9C \uC5C6\uC74C"}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  window.__APP.pages.creativeSearchComponents.InsightsSummary = InsightsSummary;
})();
