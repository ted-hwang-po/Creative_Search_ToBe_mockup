// PromoPanel component - promo tab content with KPIs, top creatives, competitor cards
// Registers to window.__APP.pages.creativeSearchComponents.PromoPanel

(function () {
  window.__APP = window.__APP || {};
  window.__APP.pages = window.__APP.pages || {};
  window.__APP.pages.creativeSearchComponents = window.__APP.pages.creativeSearchComponents || {};

  var Pill = window.__APP.ui.Pill;
  var SectionHeader = window.__APP.ui.SectionHeader;

  var getBrand = window.__APP.pages.creativeSearchComponents.getBrand;
  var CreativeCard = window.__APP.pages.creativeSearchComponents.CreativeCard;

  function PromoPanel(_ref) {
    var promoInsights = _ref.promoInsights;
    var onPickCreative = _ref.onPickCreative;
    var variant = _ref.variant || "standalone";
    var promo = _ref.promo;

    // Use provided promo or fall back to default
    var promoDisplay = promo || { key: "\uC62C\uC601 \uC138\uC77C", start: "2026-02-28", end: "2026-03-06" };

    return (
      <div className={variant === "embedded" ? "rounded-2xl bg-zinc-50 p-4" : "rounded-2xl border bg-white p-4"}>
        <SectionHeader title={"\uD504\uB85C\uBAA8\uC158 \uC778\uC0AC\uC774\uD2B8"} subtitle={promoDisplay.key + " \u00B7 " + promoDisplay.start + "~" + promoDisplay.end} />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{"\uC790\uC0AC("}{getBrand(promoInsights.ownBrandId) && getBrand(promoInsights.ownBrandId).name}{")"}{" \u00B7 \uAE30\uAC04 \uD3C9\uADE0 \uC131\uACFC"}</div>
              <Pill tone="blue">{"\uAE30\uAC04 \uC9D1\uACC4"}</Pill>
            </div>

            <div className="mt-3 space-y-2">
              {/* Row 1: big money metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-zinc-50 p-3">
                  <div className="text-xs text-zinc-500">{"\uB9E4\uCD9C"}</div>
                  <div className="mt-1 text-right text-base font-semibold tabular-nums text-zinc-900">
                    {promoInsights.revenue.toLocaleString()}{"\uC6D0"}
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3">
                  <div className="text-xs text-zinc-500">{"\uACF5\uD5CC\uC774\uC775"}</div>
                  <div className="mt-1 text-right text-base font-semibold tabular-nums text-zinc-900">
                    {promoInsights.contributionProfit.toLocaleString()}{"\uC6D0"}
                  </div>
                </div>
              </div>

              {/* Row 2: rate metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-zinc-50 p-3">
                  <div className="text-xs text-zinc-500">CTR</div>
                  <div className="mt-1 text-right text-base font-semibold tabular-nums text-zinc-900">
                    {promoInsights.ownAvg.ctr.toFixed(2)}{"%"}
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3">
                  <div className="text-xs text-zinc-500">CVR</div>
                  <div className="mt-1 text-right text-base font-semibold tabular-nums text-zinc-900">
                    {promoInsights.ownAvg.cvr.toFixed(2)}{"%"}
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3">
                  <div className="text-xs text-zinc-500">ROAS</div>
                  <div className="mt-1 text-right text-base font-semibold tabular-nums text-zinc-900">
                    {Math.round(promoInsights.ownAvg.roas)}{"%"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="font-semibold">{"\uC6B0\uC218 \uC18C\uC7AC \uB9AC\uC2A4\uD2B8 (Top 5)"}</div>
              <div className="mt-2 space-y-2">
                {promoInsights.bestOwn.map(function (c) {
                  return (
                    <CreativeCard key={c.id} creative={c} onClick={function () { onPickCreative(c); }} />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{"\uB3D9\uC77C \uAE30\uAC04 \uACBD\uC7C1 \uBE0C\uB79C\uB4DC \uC18C\uC7AC"}</div>
              <Pill tone="green">{"\uACE0\uD6A8\uC728 \uBC43\uC9C0 \uD3EC\uD568"}</Pill>
            </div>

            <div className="mt-3 space-y-4">
              {promoInsights.compCards.map(function (card) {
                return (
                  <div key={card.brandId} className="rounded-2xl border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{getBrand(card.brandId) && getBrand(card.brandId).name}</div>
                      <div className="text-xs text-zinc-500">{card.total}{"\uAC1C"}</div>
                    </div>
                    <div className="mt-2 space-y-2">
                      {card.top.map(function (c) {
                        return (
                          <CreativeCard key={c.id} creative={c} onClick={function () { onPickCreative(c); }} />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 text-xs text-zinc-500">
              {"* \uC2E4\uC81C \uC81C\uD488\uC5D0\uC11C\uB294 \"\uAE30\uAC04 \uB0B4 \uC6B4\uC601 \uC18C\uC7AC\"\uB97C \uAD11\uACE0 \uC9D1\uD589 \uB85C\uADF8/\uBA54\uD0C0 \uB77C\uC774\uBE0C\uB7EC\uB9AC \uC2A4\uB0C5\uC0F7\uC73C\uB85C \uD655\uC815\uD558\uACE0, \uC131\uACFC\uB294 \uC790\uC0AC \uACC4\uC815 \uB370\uC774\uD130\uB85C \uC9D1\uACC4\uD55C\uB2E4\uACE0 \uAC00\uC815"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  window.__APP.pages.creativeSearchComponents.PromoPanel = PromoPanel;
})();
