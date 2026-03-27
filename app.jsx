// Entry App: responsible for global navigation, search, and routing between pages.
// Loaded last by boot.js (after ./src/shared/* and ./src/pages/*).

export default function App() {
  const { parseHash, buildHash } = window.__APP.urlState;

  const PAGE_MAP = {
    "creative-search": "creativeSearch",
    "creative-search-key-message": "creativeSearchKeyMessage",
    "creative-search-influencer": "creativeSearchInfluencer",
    "creative-search-emphasis-trend": "creativeSearchEmphasisTrend",
    "creative-search-monthly-trend": "creativeSearchMonthlyTrend",
  };

  const routes = [
    { key: "creative-search", label: "프로모션 분석" },
    { key: "creative-search-key-message", label: "키메시지 분석" },
    { key: "creative-search-influencer", label: "인플루언서 분석" },
    { key: "creative-search-emphasis-trend", label: "트렌드 분석" },
    { key: "creative-search-monthly-trend", label: "월간 트렌드" },
  ];

  // --- keyword → route mapping ---
  const KEYWORD_ROUTES = [
    { keywords: ["인플루언서", "influencer", "협찬"], route: "creative-search-influencer" },
    { keywords: ["트렌드", "성분", "제형", "효과"], route: "creative-search-emphasis-trend" },
    { keywords: ["월간", "주차", "시즌", "밈"], route: "creative-search-monthly-trend" },
    { keywords: ["키메시지", "성분 강조", "구성"], route: "creative-search-key-message" },
  ];

  const EXAMPLE_QUERIES = [
    "인플루언서 협찬 소재 성과 분석",
    "성분 트렌드 분석해줘",
    "이번 달 월간 트렌드 요약",
    "키메시지 구성 분석",
    "프로모션 소재 성과 비교",
  ];

  // --- state ---
  const initial = parseHash().route || routes[0].key;
  const [routeKey, setRouteKey] = useState(initial);
  const [searchText, setSearchText] = useState("");

  // Sync hash → state
  useEffect(() => {
    const onHash = () => {
      const { route } = parseHash();
      setRouteKey(route || routes[0].key);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Sync state → hash (preserve existing params)
  useEffect(() => {
    const { route, params } = parseHash();
    if (route !== routeKey) {
      window.location.hash = buildHash(routeKey, params);
    }
  }, [routeKey]);

  // --- helpers ---
  function routeFromQuery(query) {
    const q = query.toLowerCase();
    for (const group of KEYWORD_ROUTES) {
      for (const kw of group.keywords) {
        if (q.includes(kw.toLowerCase())) return group.route;
      }
    }
    return "creative-search";
  }

  function handleSearch(query) {
    const trimmed = (query || "").trim();
    if (!trimmed) return;
    window.__APP.searchQuery = trimmed;
    const target = routeFromQuery(trimmed);
    setRouteKey(target);
    // Also push to hash so pages pick it up
    const { params } = parseHash();
    window.location.hash = buildHash(target, { ...params, q: trimmed });
  }

  function handleTabClick(key) {
    setRouteKey(key);
  }

  // --- resolve page component ---
  const pageKey = PAGE_MAP[routeKey] || PAGE_MAP["creative-search"];
  const Page = window.__APP.pages?.[pageKey];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ===== Global Top Navigation Bar ===== */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-2 sm:px-6">
          {/* Title */}
          <h1 className="shrink-0 text-lg font-bold text-zinc-900 sm:text-xl">
            Creative Search
          </h1>

          {/* Tab pills */}
          <nav className="flex flex-wrap items-center gap-1.5">
            {routes.map((r) => {
              const isActive = r.key === routeKey;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => handleTabClick(r.key)}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                    isActive
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900",
                  ].join(" ")}
                >
                  {r.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ===== Search Bar ===== */}
        <div className="border-t bg-zinc-50/80 px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch(searchText);
                  }}
                  placeholder="소재에 대해 궁금한 것을 물어보세요..."
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 pr-10 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                />
                {/* Search icon button inside input */}
                <button
                  type="button"
                  onClick={() => handleSearch(searchText)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                  aria-label="검색"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Example query chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EXAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setSearchText(q);
                    handleSearch(q);
                  }}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ===== Page Content ===== */}
      <main>
        {typeof Page === "function" ? (
          <Page />
        ) : (
          <div className="mx-auto max-w-3xl p-6">
            <div className="rounded-2xl border bg-white p-4 text-sm text-zinc-700">
              페이지를 찾을 수 없습니다: <span className="font-semibold">{pageKey}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
