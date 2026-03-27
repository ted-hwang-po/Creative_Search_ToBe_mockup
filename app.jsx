// Entry App: responsible only for routing between independently maintained pages.
// Loaded last by boot.js (after ./src/shared/* and ./src/pages/*).

export default function App() {
  const { Pill } = window.__APP.ui;

  const routes = [
    { key: "creative-search", label: "기존 페이지", pageKey: "creativeSearch" },
    { key: "creative-search-key-message", label: "키메시지(성분/구성)", pageKey: "creativeSearchKeyMessage" },
    { key: "creative-search-influencer", label: "인플루언서 소재", pageKey: "creativeSearchInfluencer" },
    {
      key: "creative-search-emphasis-trend",
      label: "성분·제형·효과 트렌드(브랜드 분석)",
      pageKey: "creativeSearchEmphasisTrend",
    },
    { key: "creative-search-monthly-trend", label: "월간 트렌드(주차/시즌)", pageKey: "creativeSearchMonthlyTrend" },
  ];

  const normalizeHash = (h) => (h || "").replace(/^#\/?/, "").trim();
  const initial = normalizeHash(window.location.hash) || routes[0].key;

  const [routeKey, setRouteKey] = useState(initial);
  const [pageSwitcherOpen, setPageSwitcherOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setRouteKey(normalizeHash(window.location.hash) || routes[0].key);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const current = normalizeHash(window.location.hash);
    if (current !== routeKey) window.location.hash = `#${routeKey}`;
  }, [routeKey]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setPageSwitcherOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const active = routes.find((r) => r.key === routeKey) || routes[0];
  const Page = window.__APP.pages?.[active.pageKey];

  return (
    <div>
      {/* Lightweight page switcher (kept out of the top area) */}
      <div className="fixed bottom-4 right-4 z-[70]">
        <div className="relative">
          {/* Collapsible panel */}
          <div
            id="page-switcher-panel"
            hidden={!pageSwitcherOpen}
            className="absolute bottom-12 right-0 w-[min(980px,calc(100vw-2rem))]"
          >
            <div className="max-h-[70vh] overflow-auto rounded-2xl border bg-white/90 p-2 shadow-lg backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="blue">페이지</Pill>
                  {routes.map((r) => {
                    const active = r.key === routeKey;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => {
                          setRouteKey(r.key);
                          setPageSwitcherOpen(false);
                        }}
                        className={`rounded-xl border px-3 py-1.5 text-sm ${
                          active
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "bg-white text-zinc-900 hover:bg-zinc-50"
                        }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>hash: #{routeKey}</Pill>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle handle (small, bottom-right) */}
          <button
            type="button"
            onClick={() => setPageSwitcherOpen((v) => !v)}
            translate="no"
            className="notranslate flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 shadow-lg backdrop-blur hover:bg-white"
            aria-expanded={pageSwitcherOpen}
            aria-controls="page-switcher-panel"
            aria-label={pageSwitcherOpen ? "페이지 전환 닫기" : "페이지 전환 열기"}
            title={pageSwitcherOpen ? "닫기" : "페이지 전환"}
          >
            <span aria-hidden="true" className="select-none text-lg leading-none text-zinc-900">
              {pageSwitcherOpen ? "×" : "≡"}
            </span>
          </button>
        </div>
      </div>

      {typeof Page === "function" ? (
        <Page />
      ) : (
        <div className="mx-auto max-w-3xl p-6">
          <div className="rounded-2xl border bg-white p-4 text-sm text-zinc-700">
            페이지를 찾을 수 없습니다: <span className="font-semibold">{active.pageKey}</span>
          </div>
        </div>
      )}
    </div>
  );
}

