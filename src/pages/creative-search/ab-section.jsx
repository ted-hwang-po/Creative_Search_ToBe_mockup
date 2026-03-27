// ABSection component - recommended clusters + A/B test suggestion cards + modal
// Registers to window.__APP.pages.creativeSearchComponents.ABSection

(function () {
  window.__APP = window.__APP || {};
  window.__APP.pages = window.__APP.pages || {};
  window.__APP.pages.creativeSearchComponents = window.__APP.pages.creativeSearchComponents || {};

  var Pill = window.__APP.ui.Pill;
  var SectionHeader = window.__APP.ui.SectionHeader;
  var Modal = window.__APP.ui.Modal;

  var getBrand = window.__APP.pages.creativeSearchComponents.getBrand;

  // ---------- ABTestModal ----------
  function ABTestModal(_ref) {
    var abTest = _ref.abTest;
    var open = _ref.open;
    var onClose = _ref.onClose;

    if (!open) return null;

    if (!abTest) {
      return (
        <Modal open={open} onClose={onClose} title={"\uD14C\uC2A4\uD2B8 Modal"}>
          <div className="p-4">
            <div className="text-lg">abTest {"\uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."}</div>
            <div className="mt-2 text-sm text-zinc-600">{"\uBC84\uD2BC \uD074\uB9AD\uC774 \uC815\uC0C1 \uC791\uB3D9\uD558\uB294\uC9C0 \uD655\uC778\uD558\uB294 \uD14C\uC2A4\uD2B8\uC785\uB2C8\uB2E4."}</div>
          </div>
        </Modal>
      );
    }

    var objective = abTest.objective || "A/B \uD14C\uC2A4\uD2B8";
    var periodDays = abTest.periodDays || 7;
    var creativesPerGroup = abTest.creativesPerGroup || 2;
    var budgetPerDay = abTest.budgetPerDay || 0;
    var placements = abTest.placements || [];
    var groups = abTest.groups || [];
    var evidence = abTest.evidence;

    return (
      <Modal open={open} onClose={onClose} title={"A/B \uD14C\uC2A4\uD2B8 \uC81C\uC548 \u00B7 " + objective}>
        <div className="max-h-[80vh] space-y-4 overflow-y-auto">
          {/* basic info */}
          <div className="rounded-xl bg-zinc-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="amber">
                {periodDays}{"\uC77C \u00B7 "}{creativesPerGroup}{"\uAC1C/\uADF8\uB8F9"}
              </Pill>
              <Pill>{"\uC608\uC0B0 "}{budgetPerDay.toLocaleString()}{"\uC6D0/\uC77C"}</Pill>
            </div>
            {placements.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {placements.map(function (p, idx) {
                  return <Pill key={abTest.id + ":place:" + idx} tone="blue">{p}</Pill>;
                })}
              </div>
            )}
          </div>

          {/* A/B group creative plans */}
          {groups.length > 0 && (
            <div>
              <div className="font-semibold">{"\uD06C\uB9AC\uC5D0\uC774\uD2F0\uBE0C \uD50C\uB79C"}</div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {groups.map(function (g) {
                  var groupKey = g.key || "A";
                  var conceptName = g.conceptName || "\uCEE8\uC149";
                  var hypothesis = g.hypothesis || "";
                  var creativePlan = g.creativePlan || [];

                  return (
                    <div key={abTest.id + ":" + groupKey} className="rounded-xl border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold">{groupKey}{"\uC548"}</div>
                        <Pill tone={groupKey === "A" ? "blue" : "amber"}>{conceptName}</Pill>
                      </div>
                      {hypothesis && (
                        <div className="mt-2 text-sm text-zinc-700">{hypothesis}</div>
                      )}

                      {creativePlan.length > 0 && (
                        <div className="mt-3 space-y-3">
                          {creativePlan.map(function (p, pIdx) {
                            var typeKey = p.typeKey || "type";
                            var typeLabel = p.typeLabel || typeKey;
                            var keyMessage = p.keyMessage || "";
                            var assetExamples = p.assetExamples || [];
                            var requiredElements = p.requiredElements || [];

                            return (
                              <div key={abTest.id + ":" + groupKey + ":" + typeKey + ":" + pIdx} className="rounded-xl bg-zinc-50 p-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="text-sm font-semibold">{typeLabel}</div>
                                  {keyMessage && <Pill>{"\uBA54\uC2DC\uC9C0: "}{keyMessage}</Pill>}
                                </div>
                                {assetExamples.length > 0 && (
                                  <div className="mt-2 grid grid-cols-3 gap-2">
                                    {assetExamples.slice(0, 3).map(function (ex, exIdx) {
                                      return (
                                        <img
                                          key={ex.id || "ex-" + exIdx}
                                          src={ex.thumbnailUrl}
                                          alt={typeLabel + " example"}
                                          className="h-20 w-20 rounded-xl border bg-white object-cover"
                                          loading="lazy"
                                          draggable="false"
                                        />
                                      );
                                    })}
                                  </div>
                                )}
                                {requiredElements.length > 0 && (
                                  <div className="mt-2 text-[11px] text-zinc-600">
                                    {requiredElements.slice(0, 3).join(" \u00B7 ")}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* evidence */}
          {evidence && (
            <div className="rounded-xl border bg-white p-3">
              <div className="text-sm font-semibold">{"\uCD94\uCC9C \uADFC\uAC70"}</div>
              {evidence.summary && (
                <div className="mt-2 text-sm text-zinc-700">{evidence.summary}</div>
              )}
              {evidence.drivers && evidence.drivers.length > 0 && (
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {evidence.drivers.slice(0, 4).map(function (d, i) {
                    return (
                      <div key={abTest.id + ":drv:" + i} className="rounded-xl bg-zinc-50 p-2.5 text-sm text-zinc-700">
                        <div className="font-semibold">{d.label || "\uD56D\uBAA9"}</div>
                        <div className="mt-1">{d.value || "-"}</div>
                        {d.pct != null && <div className="mt-1 text-xs text-zinc-500">{d.pct.toFixed(0)}{"%"}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
              {evidence.supportingStats && (
                <div className="mt-3 text-xs text-zinc-500">
                  {"\uD45C\uBCF8 "}{evidence.supportingStats.sampleSize || 0}{" \u00B7 top10 \uD3C9\uADE0 score "}
                  {evidence.supportingStats.avgScoreTop10 != null ? evidence.supportingStats.avgScoreTop10 : "-"}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    );
  }

  // ---------- ABSection ----------
  function ABSection(_ref) {
    var recommendedTypeGroups = _ref.recommendedTypeGroups || [];
    var abTestSuggestions = _ref.abTestSuggestions || [];
    var onOpenTypeGroup = _ref.onOpenTypeGroup;
    var abTestModalOpen = _ref.abTestModalOpen;
    var onSetAbTestModalOpen = _ref.onSetAbTestModalOpen;

    return (
      <div className="rounded-2xl border bg-white p-4">
        <SectionHeader
          title={"\uCD94\uCC9C \uC18C\uC7AC \uC720\uD615(Top 2) + A/B \uD14C\uC2A4\uD2B8 \uC81C\uC548"}
          subtitle={"\uCD94\uCC9C\uC740 \uC694\uC57D\uB9CC \uBA3C\uC800 \uBCF4\uC5EC\uC8FC\uACE0, \uADFC\uAC70/\uC608\uC2DC\uB294 \uD074\uB9AD \uC2DC \uD3BC\uCCD0\uC11C \uD655\uC778\uD569\uB2C8\uB2E4."}
        />

        <div className="grid gap-4 md:grid-cols-2">
          {recommendedTypeGroups.map(function (g) {
            var brand = getBrand(g.brandId);
            return (
              <div key={g.id} className="rounded-2xl border p-4">
                <div className="flex flex-col gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold">
                        {brand && brand.name}{" \u00B7 "}{g.name}
                      </div>
                      <Pill tone="green">{"score "}{Math.round((g.predictedGroupScore || 0) * 100)}</Pill>
                    </div>
                    <div className="text-sm text-zinc-700">{g.description}</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={function () { onOpenTypeGroup && onOpenTypeGroup(g.id); }}
                        className="rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
                      >
                        {"\uC720\uD615 \uC0C1\uC138 \uBCF4\uAE30 \u2192"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-zinc-50 p-3">
                    <div className="text-sm font-semibold text-zinc-900">{"\uB300\uD45C \uC608\uC2DC"}</div>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {(g.heroThumbnailUrls || []).slice(0, 4).map(function (url, i) {
                        return (
                          <img
                            key={"gthumb-" + g.id + "-" + i}
                            src={url}
                            alt={g.name + " example " + (i + 1)}
                            className="h-16 w-16 rounded-xl border bg-white object-cover"
                            loading="lazy"
                            draggable="false"
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* A/B test suggestions */}
        {abTestSuggestions.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="font-semibold">{"A/B \uD14C\uC2A4\uD2B8 \uC81C\uC548"}</div>
            <div className="grid gap-4 md:grid-cols-2">
              {abTestSuggestions.slice(0, 2).map(function (ab) {
                return (
                  <div key={ab.id} className="rounded-2xl border p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="font-semibold text-zinc-900">
                          {"\uB3D9\uC77C \uC0C1\uD488/\uD504\uB85C\uBAA8\uC158 \uAE30\uC900 A/B \u00B7 "}{ab.objective}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Pill tone="amber">
                            {ab.periodDays}{"\uC77C \u00B7 "}{ab.creativesPerGroup}{"\uAC1C/\uADF8\uB8F9"}
                          </Pill>
                          <Pill>{"\uC608\uC0B0 "}{ab.budgetPerDay.toLocaleString()}{"\uC6D0/\uC77C"}</Pill>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(ab.placements || []).slice(0, 3).map(function (p) {
                          return <Pill key={ab.id + ":" + p} tone="blue">{p}</Pill>;
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={function () { onSetAbTestModalOpen && onSetAbTestModalOpen(ab.id); }}
                        className="rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
                      >
                        {"\uC81C\uC548 \uC0C1\uC138 \uBCF4\uAE30 \u2192"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* A/B Test Modal */}
        <ABTestModal
          abTest={abTestSuggestions.find(function (a) { return a.id === abTestModalOpen; })}
          open={!!abTestModalOpen}
          onClose={function () { onSetAbTestModalOpen && onSetAbTestModalOpen(null); }}
        />
      </div>
    );
  }

  window.__APP.pages.creativeSearchComponents.ABSection = ABSection;
  window.__APP.pages.creativeSearchComponents.ABTestModal = ABTestModal;
})();
