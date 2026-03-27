// Shared UI patterns used across pages to keep hierarchy consistent.
// Loaded after ./src/shared/ui.jsx by boot.js

(function registerSharedPatterns() {
  const ui = (window.__APP && window.__APP.ui) || (window.__APP.ui = {});

  function Tabs({ value, onChange, items, className = "" }) {
    return (
      <div className={`inline-flex rounded-xl border bg-white p-1 ${className}`}>
        {items.map((it) => {
          const active = it.value === value;
          return (
            <button
              key={it.value}
              type="button"
              onClick={() => onChange?.(it.value)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                active ? "bg-zinc-900 text-white" : "bg-white text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              {it.label}
            </button>
          );
        })}
      </div>
    );
  }

  function PageShell({ title, subtitle, right, children }) {
    return (
      <div className="min-h-screen bg-zinc-50 p-6 text-zinc-900">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <div className="text-xl font-semibold">{title}</div>
                {subtitle ? <div className="text-sm text-zinc-600">{subtitle}</div> : null}
              </div>
              {right ? <div className="flex flex-wrap items-center gap-2">{right}</div> : null}
            </div>
          </div>
          {children}
        </div>
      </div>
    );
  }

  function KpiStrip({ items }) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {(items || []).map((x, i) => (
          <ui.Pill key={x.key || i} tone={x.tone || "neutral"}>
            {x.label}: {x.value}
          </ui.Pill>
        ))}
      </div>
    );
  }

  function AccordionSection({
    title,
    subtitle,
    right,
    collapsed,
    onToggle,
    children,
    className = "",
    contentClassName = "",
  }) {
    return (
      <div className={`rounded-2xl border bg-white p-4 ${className}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">{title}</div>
            {subtitle ? <div className="text-sm text-zinc-600">{subtitle}</div> : null}
          </div>
          <div className="flex items-center gap-2">
            {right}
            <button
              type="button"
              onClick={onToggle}
              className="rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50 inline-flex items-center gap-1"
              aria-label={collapsed ? "펼치기" : "접기"}
            >
              <span>{collapsed ? "펼치기" : "접기"}</span>
              <span className="text-base leading-none">{collapsed ? "▼" : "▲"}</span>
            </button>
          </div>
        </div>
        {collapsed ? null : <div className={`mt-4 ${contentClassName}`}>{children}</div>}
      </div>
    );
  }

  function Drawer({ open, title, onClose, children, width = "w-[min(520px,calc(100%-2rem))]" }) {
    if (!open) return null;

    React.useEffect(() => {
      const onKeyDown = (e) => {
        if (e.key === "Escape") onClose?.();
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    return (
      <div
        className="fixed inset-0 z-[70] bg-black/30"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div className={`absolute right-0 top-0 h-full ${width} bg-white shadow-xl`}>
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="min-w-0 truncate text-base font-semibold">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border bg-white px-2 py-1 text-sm text-zinc-900 hover:bg-zinc-50"
            >
              닫기
            </button>
          </div>
          <div className="h-[calc(100%-3.25rem)] overflow-y-auto p-4">{children}</div>
        </div>
      </div>
    );
  }

  function TypeGroupModal({ open, group, brandName, onClose, onJumpToExamples }) {
    const [showReason, setShowReason] = useState(false);

    useEffect(() => {
      setShowReason(false);
    }, [group?.id, open]);

    if (!open) return null;

    const title = group ? `소재 유형 · ${brandName ? `${brandName} / ` : ""}${group.name}` : "소재 유형";
    const score = group?.predictedGroupScore != null ? Math.round(group.predictedGroupScore * 100) : null;

    return (
      <ui.Modal open={open} title={title} onClose={onClose} width="max-w-5xl">
        {group ? (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Left: description + rationale */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {score != null && <ui.Pill tone="green">score {score}</ui.Pill>}
                <ui.Pill tone="amber">유형</ui.Pill>
              </div>

              <div className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700">{group.description}</div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReason((v) => !v)}
                  className="rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
                >
                  {showReason ? "근거 접기" : "근거 보기"}
                </button>
                {onJumpToExamples && (
                  <button
                    type="button"
                    onClick={onJumpToExamples}
                    className="rounded-xl border bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                  >
                    예시로 이동
                  </button>
                )}
              </div>

              {showReason && (
                <div className="space-y-3 rounded-2xl border bg-white p-3">
                  <div className="text-sm font-semibold">추천 근거</div>

                  <div className="space-y-1.5 text-sm text-zinc-700">
                    {(group.rationale?.drivers || []).slice(0, 5).map((x, idx) => (
                      <div key={`drv-${idx}`} className="flex gap-2">
                        <div className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                        <div className="min-w-0">{x}</div>
                      </div>
                    ))}
                    {(group.rationale?.drivers || []).length === 0 && <div className="text-sm text-zinc-600">표시할 근거가 없습니다.</div>}
                  </div>

                  <div>
                    <div className="text-sm font-semibold">대표 예시(상위)</div>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {(group.heroThumbnailUrls || []).slice(0, 8).map((url, i) => (
                        <img
                          key={`thumb-${i}`}
                          src={url}
                          alt={`type group example ${i + 1}`}
                          className="h-16 w-16 rounded-xl border bg-white object-cover"
                          loading="lazy"
                          draggable="false"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: thumbnails grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">이 유형에 속한 소재</div>
                <div className="text-xs text-zinc-500">{(group.heroThumbnailUrls || []).length}개 미리보기</div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {(group.heroThumbnailUrls || []).slice(0, 12).map((url, i) => (
                  <img
                    key={`grid-${i}`}
                    src={url}
                    alt={`type group asset ${i + 1}`}
                    className="h-20 w-20 rounded-xl border bg-white object-cover"
                    loading="lazy"
                    draggable="false"
                  />
                ))}
                {(group.heroThumbnailUrls || []).length === 0 && (
                  <div className="col-span-4 rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-600">표시할 썸네일이 없습니다.</div>
                )}
              </div>
              <div className="text-xs text-zinc-500">
                * 프로토타입에서는 실제 소재 파일 대신 data URL SVG 썸네일을 사용합니다.
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-zinc-600">표시할 유형 정보가 없습니다.</div>
        )}
      </ui.Modal>
    );
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function MiniBarRow({ label, valuePct, tone = "zinc" }) {
    const tones = {
      zinc: "bg-zinc-900",
      blue: "bg-blue-600",
      emerald: "bg-emerald-600",
      purple: "bg-violet-600",
      amber: "bg-amber-500",
      rose: "bg-rose-600",
      red: "bg-rose-600",
      green: "bg-emerald-600",
      neutral: "bg-zinc-900",
    };
    const w = clamp(valuePct, 0, 100);
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2 text-[11px] leading-4 text-zinc-600">
          <div className="min-w-0 truncate">{label}</div>
          <div className="shrink-0 tabular-nums">{w.toFixed(1)}%</div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-zinc-200">
          <div className={`h-1.5 rounded-full ${tones[tone] || tones.zinc}`} style={{ width: `${w}%` }} />
        </div>
      </div>
    );
  }

  function BarRow({ label, valuePct, tone = "zinc" }) {
    const tones = {
      zinc: "bg-zinc-900",
      blue: "bg-blue-600",
      emerald: "bg-emerald-600",
      purple: "bg-violet-600",
      amber: "bg-amber-500",
      rose: "bg-rose-600",
      red: "bg-rose-600",
      green: "bg-emerald-600",
      neutral: "bg-zinc-900",
    };
    const w = clamp(valuePct, 0, 100);
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-zinc-600">
          <div className="truncate">{label}</div>
          <div className="shrink-0">{w.toFixed(1)}%</div>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-200">
          <div className={`h-2 rounded-full ${tones[tone] || tones.zinc}`} style={{ width: `${w}%` }} />
        </div>
      </div>
    );
  }

  function StackedBar({ parts }) {
    return (
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-200">
        {(parts || [])
          .filter((p) => p.valuePct > 0)
          .map((p) => (
            <div
              key={p.key}
              className={p.className}
              style={{ width: `${clamp(p.valuePct, 0, 100)}%` }}
              title={`${p.label} ${clamp(p.valuePct, 0, 100).toFixed(1)}%`}
            />
          ))}
      </div>
    );
  }

  function BackToTopButton({ threshold = 360 }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      const onScroll = () => setVisible(window.scrollY > threshold);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }, [threshold]);

    if (!visible) return null;

    return (
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border bg-white/90 px-4 py-3 text-sm font-semibold text-zinc-900 shadow-lg backdrop-blur hover:bg-white"
        aria-label="최상단으로 이동"
        title="최상단으로"
      >
        <span className="text-base leading-none">↑</span>
        <span>최상단</span>
      </button>
    );
  }

  function FilterDropdown({ value, onChange, options, label, placeholder = "전체" }) {
    return (
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50 cursor-pointer"
        aria-label={label}
      >
        {(options || []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  function ActiveFilterIndicator({ filters }) {
    if (!filters) return null;

    const activeCount = Object.values(filters).filter((v) => v !== "all" && v !== "").length;
    if (activeCount === 0) return null;

    const Pill = ui.Pill;
    return <Pill tone="blue">{activeCount}개 필터 적용됨</Pill>;
  }

  function ContextualEmptyState({ context, suggestion }) {
    const messages = {
      typeGroups: "아직 소재 유형이 분류되지 않았습니다.",
      results: "검색 결과가 없습니다.",
      highEfficiency: "고효율 예상 소재가 없습니다.",
      examples: "표시할 예시가 없습니다.",
      keyMessages: "표시할 핵심 메시지가 없습니다.",
      comparison: "비교할 데이터가 없습니다.",
      clusters: "표시할 클러스터가 없습니다.",
      influencers: "표시할 인플루언서가 없습니다.",
      trends: "표시할 트렌드가 없습니다.",
      generic: "표시할 데이터가 없습니다.",
    };

    const suggestionMessages = {
      results: "검색어를 변경해 보세요.",
      highEfficiency: "필터를 조정해 보세요.",
    };

    const message = messages[context] || messages.generic;
    const suggestedText = suggestion || suggestionMessages[context];

    return (
      <div className="rounded-xl border bg-zinc-50 p-4 text-center">
        <div className="text-sm text-zinc-600">{message}</div>
        {suggestedText && <div className="mt-2 text-xs text-zinc-500">{suggestedText}</div>}
      </div>
    );
  }

  function LoadingState({ message = "로딩 중..." }) {
    return (
      <div className="rounded-xl border bg-zinc-50 p-4 text-center" role="status" aria-live="polite" aria-busy="true">
        <div className="text-sm text-zinc-600">{message}</div>
      </div>
    );
  }

  function TruncatedText({ text, maxLength = 50, className = "" }) {
    if (!text) return null;

    const isTruncated = text.length > maxLength;
    const displayText = isTruncated ? text.slice(0, maxLength) + "..." : text;

    return (
      <span className={className} title={isTruncated ? text : undefined}>
        {displayText}
      </span>
    );
  }

  function BrandLogo({ brandId, size = "md" }) {
    const sizes = {
      sm: "h-6 w-6 text-xs",
      md: "h-8 w-8 text-sm",
      lg: "h-12 w-12 text-base",
    };

    // For now, use first character as placeholder
    const logoPlaceholder = brandId ? brandId.charAt(0).toUpperCase() : "?";

    return (
      <div
        className={`${sizes[size]} rounded-lg bg-zinc-100 flex items-center justify-center font-semibold text-zinc-700`}
        title={brandId}
        aria-label={`${brandId} 로고`}
      >
        {logoPlaceholder}
      </div>
    );
  }

  ui.Tabs = Tabs;
  ui.PageShell = PageShell;
  ui.KpiStrip = KpiStrip;
  ui.AccordionSection = AccordionSection;
  ui.Drawer = Drawer;
  ui.TypeGroupModal = TypeGroupModal;
  ui.MiniBarRow = MiniBarRow;
  ui.BarRow = BarRow;
  ui.StackedBar = StackedBar;
  ui.BackToTopButton = BackToTopButton;
  ui.FilterDropdown = FilterDropdown;
  ui.ActiveFilterIndicator = ActiveFilterIndicator;
  ui.ContextualEmptyState = ContextualEmptyState;
  ui.LoadingState = LoadingState;
  ui.TruncatedText = TruncatedText;
  ui.BrandLogo = BrandLogo;
})();

