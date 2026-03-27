// ResultList component - bottom grid of creative cards with filters and "more" button
// Registers to window.__APP.pages.creativeSearchComponents.ResultList

(function () {
  window.__APP = window.__APP || {};
  window.__APP.pages = window.__APP.pages || {};
  window.__APP.pages.creativeSearchComponents = window.__APP.pages.creativeSearchComponents || {};

  var Pill = window.__APP.ui.Pill;
  var SectionHeader = window.__APP.ui.SectionHeader;

  var CreativeCard = window.__APP.pages.creativeSearchComponents.CreativeCard;

  function ResultList(_ref) {
    var filteredResults = _ref.filteredResults || [];
    var libraryFilters = _ref.libraryFilters;
    var onSetLibraryFilters = _ref.onSetLibraryFilters;
    var libraryResultLimit = _ref.libraryResultLimit;
    var onSetLibraryResultLimit = _ref.onSetLibraryResultLimit;
    var onPickCreative = _ref.onPickCreative;
    var brands = _ref.brands || [];

    return (
      <div className="rounded-2xl border bg-white p-4">
        <SectionHeader
          title={"\uC608\uC2DC \uCE74\uB4DC (\uD544\uD130)"}
          subtitle={"\uD544\uD130\uB85C \uBC94\uC704\uB97C \uC881\uD788\uACE0, \uCE74\uB4DC\uB97C \uD074\uB9AD\uD574 \uC0C1\uC138\uB97C \uD655\uC778\uD558\uC138\uC694."}
          right={
            <Pill>
              {Math.min(libraryResultLimit, filteredResults.length)}{" / "}{filteredResults.length}{"\uAC1C \uB178\uCD9C"}
            </Pill>
          }
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm text-zinc-600">{"\uD544\uD130:"}</div>
          <label className="text-sm text-zinc-600">
            {"\uBE0C\uB79C\uB4DC "}
            <select
              className="ml-1 rounded-lg border bg-white px-2 py-1 text-sm"
              value={libraryFilters.brandId}
              onChange={function (e) { onSetLibraryFilters(function (p) { return Object.assign({}, p, { brandId: e.target.value }); }); }}
            >
              <option value="all">{"\uC804\uCCB4"}</option>
              {brands.map(function (b) {
                return <option key={b.id} value={b.id}>{b.name}</option>;
              })}
            </select>
          </label>
          <label className="text-sm text-zinc-600">
            {"\uBBF8\uB514\uC5B4 "}
            <select
              className="ml-1 rounded-lg border bg-white px-2 py-1 text-sm"
              value={libraryFilters.mediaType}
              onChange={function (e) { onSetLibraryFilters(function (p) { return Object.assign({}, p, { mediaType: e.target.value }); }); }}
            >
              <option value="all">{"\uC804\uCCB4"}</option>
              <option value="image">{"\uC774\uBBF8\uC9C0"}</option>
              <option value="video">{"\uC601\uC0C1"}</option>
            </select>
          </label>
          <label className="text-sm text-zinc-600">
            {"\uC720\uD615 "}
            <select
              className="ml-1 rounded-lg border bg-white px-2 py-1 text-sm"
              value={libraryFilters.adType}
              onChange={function (e) { onSetLibraryFilters(function (p) { return Object.assign({}, p, { adType: e.target.value }); }); }}
            >
              <option value="all">{"\uC804\uCCB4"}</option>
              <option value="normal">{"\uC77C\uBC18"}</option>
              <option value="partnership">{"\uD30C\uD2B8\uB108\uC2ED"}</option>
            </select>
          </label>
          {(function () {
            var activeCount = Object.values(libraryFilters).filter(function (v) { return v !== "all" && v !== ""; }).length;
            return activeCount > 0 ? <Pill tone="blue">{activeCount}{"\uAC1C \uD544\uD130 \uC801\uC6A9\uB428"}</Pill> : null;
          })()}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {filteredResults.slice(0, libraryResultLimit).map(function (c) {
            return (
              <CreativeCard key={c.id} creative={c} onClick={function () { onPickCreative(c); }} />
            );
          })}
        </div>

        {filteredResults.length > libraryResultLimit && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={function () { onSetLibraryResultLimit(function (prev) { return prev + 36; }); }}
              className="rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50 inline-flex items-center gap-1"
            >
              <span>{"\uB354 \uBCF4\uAE30 (+36)"}</span>
              <span className="text-base leading-none">{"\u25BC"}</span>
            </button>
            <button
              type="button"
              onClick={function () { onSetLibraryResultLimit(filteredResults.length); }}
              className="rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
            >
              {"\uC804\uCCB4 \uBCF4\uAE30"}
            </button>
          </div>
        )}
      </div>
    );
  }

  window.__APP.pages.creativeSearchComponents.ResultList = ResultList;
})();
