// PartnershipPanel component - partnership tab content
// Registers to window.__APP.pages.creativeSearchComponents.PartnershipPanel

(function () {
  window.__APP = window.__APP || {};
  window.__APP.pages = window.__APP.pages || {};
  window.__APP.pages.creativeSearchComponents = window.__APP.pages.creativeSearchComponents || {};

  var SectionHeader = window.__APP.ui.SectionHeader;

  var LAYOUT_LIBRARY = window.__APP.pages.creativeSearchComponents.LAYOUT_LIBRARY;
  var getBrand = window.__APP.pages.creativeSearchComponents.getBrand;
  var CreativeCard = window.__APP.pages.creativeSearchComponents.CreativeCard;

  function PartnershipPanel(_ref) {
    var partnershipInsights = _ref.partnershipInsights;
    var onPickCreative = _ref.onPickCreative;
    var variant = _ref.variant || "standalone";

    return (
      <div className={variant === "embedded" ? "rounded-2xl bg-zinc-50 p-4" : "rounded-2xl border bg-white p-4"}>
        <SectionHeader title={"\uD30C\uD2B8\uB108\uC2ED \uC778\uC0AC\uC774\uD2B8"} subtitle={"\uBE0C\uB79C\uB4DC\uBCC4 \uC790\uC8FC \uB178\uCD9C\uB418\uB294 \uC778\uD50C\uB8E8\uC5B8\uC11C + \uACF5\uD1B5 \uD2B9\uC9D5"} />
        <div className="space-y-4">
          {partnershipInsights.length === 0 && (
            <div className="rounded-xl border bg-zinc-50 p-4 text-sm text-zinc-600">{"\uAC80\uC0C9 \uACB0\uACFC \uB0B4 \uD30C\uD2B8\uB108\uC2ED \uAD11\uACE0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."}</div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {partnershipInsights.map(function (card) {
              var brand = getBrand(card.brandId);
              var topLayoutName = (LAYOUT_LIBRARY[card.topLayout] && LAYOUT_LIBRARY[card.topLayout].name) || card.topLayout;
              return (
                <div key={card.brandId} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{brand && brand.name}</div>
                      <div className="text-sm text-zinc-600">{"\uD30C\uD2B8\uB108\uC2ED \uC18C\uC7AC "}{card.total}{"\uAC1C"}</div>
                    </div>
                    <div className="text-right text-xs text-zinc-600">
                      <div>{"\uBE48\uCD9C \uCE74\uD53C: "}{card.topCopyType || "-"}</div>
                      <div>{"\uBE48\uCD9C \uB808\uC774\uC544\uC6C3: "}{topLayoutName || "-"}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm font-semibold">{"\uC790\uC8FC \uB4F1\uC7A5\uD558\uB294 \uC778\uD50C\uB8E8\uC5B8\uC11C"}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {card.topInfluencers.map(function (x) {
                        return (
                          <div key={x.influencer && x.influencer.id} className="rounded-xl bg-zinc-50 px-3 py-2 text-sm">
                            <div className="font-semibold">
                              {x.influencer && x.influencer.avatar}{" "}{x.influencer && x.influencer.name}{" "}
                              <span className="text-zinc-500">{x.influencer && x.influencer.handle}</span>
                            </div>
                            <div className="text-xs text-zinc-600">
                              {x.influencer && x.influencer.niche}{" \u00B7 "}{x.influencer && x.influencer.followers}{" \u00B7 "}{x.count}{"\uD68C"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-semibold">{"\uC608\uC2DC \uC18C\uC7AC"}</div>
                    <div className="mt-2 space-y-2">
                      {card.examples.map(function (c) {
                        return (
                          <CreativeCard key={c.id} creative={c} onClick={function () { onPickCreative(c); }} />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  window.__APP.pages.creativeSearchComponents.PartnershipPanel = PartnershipPanel;
})();
