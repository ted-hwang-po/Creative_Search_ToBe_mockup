// Key-message interest results page (ingredient/composition focused creatives).
// This module registers itself to window.__APP.pages.creativeSearchKeyMessage

(function registerCreativeSearchKeyMessagePage() {
  const { Pill, SectionHeader, Tabs, PageShell, KpiStrip, AccordionSection, BackToTopButton, MiniBarRow } = window.__APP.ui;

  // ---------- Mock Data (independent) ----------
  const QUERY_LABEL = "성분이나 제품 구성을 강조한 소재들은 보통 어떻게 생겼어?";

  const BRANDS = [
    { id: "oliveyoung", name: "올리브영", isOwn: true, thumbUrl: "./assets/thumbs/oliveyoung.svg" },
    { id: "innisfree", name: "이니스프리", thumbUrl: "./assets/thumbs/innisfree.svg" },
    { id: "roundlab", name: "라운드랩", thumbUrl: "./assets/thumbs/roundlab.svg" },
    { id: "hera", name: "헤라", thumbUrl: "./assets/thumbs/hera.svg" },
    { id: "labiotte", name: "라비오뜨", thumbUrl: "./assets/thumbs/labiotte.svg" },
    { id: "beplain", name: "비플레인" },
    { id: "drg", name: "닥터지" },
    { id: "mediheal", name: "메디힐" },
  ];

  const IMAGE_LAYOUT_LIBRARY = {
    "hero-product-left": { name: "제품 히어로(좌) + 성분/포인트(우)" },
    "hero-model-center": { name: "모델 중심 + 하단 CTA" },
    "grid-3-benefits": { name: "3분할 정보 그리드" },
    "ugc-caption-heavy": { name: "UGC 텍스트 비중↑" },
    "before-after-split": { name: "전/후 비교 스플릿" },
  };

  const VIDEO_LAYOUT_LIBRARY = {
    plot: { name: "플롯형(스토리/상황)" },
    composition: { name: "구성형(컷편집/구성 강조)" },
    "hook-3s": { name: "초수 훅(3초)형" },
    demo: { name: "데모/텍스처 클로즈업형" },
  };

  // ---------- Helpers ----------
  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function hashStringToInt(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function seededRand01(seedStr) {
    let x = hashStringToInt(seedStr) || 1;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 1000000) / 1000000;
  }

  function pickWeighted(items, weights, r01) {
    const total = weights.reduce((s, w) => s + w, 0) || 1;
    let t = r01 * total;
    for (let i = 0; i < items.length; i++) {
      t -= weights[i];
      if (t <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  function badgeHighEfficiency(creative) {
    return creative.runDays >= 7;
  }

  function getBrand(brandId) {
    return BRANDS.find((b) => b.id === brandId);
  }

  function distribution(items, keyFn) {
    const total = items.length || 1;
    const counts = items.reduce((acc, x) => {
      const k = keyFn(x) || "-";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([k, v]) => ({ k, v, pct: (v / total) * 100 }))
      .sort((a, b) => b.v - a.v);
  }

  function labelForLayoutClass(layoutClass) {
    return IMAGE_LAYOUT_LIBRARY[layoutClass]?.name || VIDEO_LAYOUT_LIBRARY[layoutClass]?.name || layoutClass;
  }

  function buildCreativeThumbDataUrl({ seedStr, brandName, mediaType, focus, layoutClass, token }) {
    const palettes = {
      ingredient: [
        ["#0ea5e9", "#2563eb", "#e0f2fe"],
        ["#22c55e", "#16a34a", "#dcfce7"],
        ["#14b8a6", "#0f766e", "#ccfbf1"],
        ["#8b5cf6", "#6d28d9", "#ede9fe"],
      ],
      composition: [
        ["#f59e0b", "#d97706", "#fffbeb"],
        ["#ef4444", "#be123c", "#fff1f2"],
        ["#f97316", "#c2410c", "#fff7ed"],
        ["#a855f7", "#7e22ce", "#faf5ff"],
      ],
    };
    const list = palettes[focus] || palettes.ingredient;
    const pal = list[Math.floor(seededRand01(`${seedStr}:pal`) * list.length)];
    const [c1, c2, bg] = pal;

    const safeBrand = (brandName || "BR").replace(/[<>&]/g, "").slice(0, 6);
    const brandMark = safeBrand.replace(/\s+/g, "").slice(0, 2);
    const tkn = (token || "").replace(/[<>&]/g, "").slice(0, 6);
    const isVideo = mediaType === "video";

    const r = (k) => seededRand01(`${seedStr}:${k}`);
    const noise1 = Math.floor(r("n1") * 12);
    const noise2 = Math.floor(r("n2") * 10);

    let blocks = "";
    const stroke = "rgba(0,0,0,0.08)";
    const chipBg = "rgba(255,255,255,0.85)";
    const text = "#0f172a";

    const addCTA = () => `
      <rect x="38" y="50" width="20" height="9" rx="4.5" fill="${chipBg}" stroke="${stroke}"/>
      <text x="48" y="56.7" text-anchor="middle" font-size="6.2" font-weight="700"
        font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="${text}">CTA</text>
    `;

    const addBrand = () => `
      <rect x="6" y="6" width="16" height="10" rx="5" fill="${chipBg}" stroke="${stroke}"/>
      <text x="14" y="13.2" text-anchor="middle" font-size="6.2" font-weight="800"
        font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="${text}">${brandMark}</text>
    `;

    const addVideoBadge = () =>
      isVideo
        ? `
      <rect x="44" y="6" width="14" height="10" rx="5" fill="rgba(15,23,42,0.72)"/>
      <text x="51" y="13.2" text-anchor="middle" font-size="6.2" font-weight="800"
        font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="#fff">VID</text>
      <circle cx="50.5" cy="33" r="9" fill="rgba(15,23,42,0.38)"/>
      <path d="M48 28.5 L56 33 L48 37.5 Z" fill="#fff"/>
    `
        : "";

    const addToken = () =>
      tkn
        ? `
      <text x="32" y="19" text-anchor="middle" font-size="7" font-weight="700"
        font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="${text}" opacity="0.92">${tkn}</text>
    `
        : "";

    if (!isVideo) {
      if (layoutClass === "hero-product-left") {
        blocks = `
          <rect x="6" y="18" width="26" height="40" rx="8" fill="rgba(255,255,255,0.8)" stroke="${stroke}"/>
          <rect x="14" y="24" width="10" height="22" rx="5" fill="rgba(15,23,42,0.18)"/>
          <rect x="35" y="26" width="23" height="6" rx="3" fill="rgba(15,23,42,0.16)"/>
          <rect x="35" y="35" width="19" height="5" rx="2.5" fill="rgba(15,23,42,0.12)"/>
          <rect x="35" y="43" width="21" height="5" rx="2.5" fill="rgba(15,23,42,0.12)"/>
          ${addCTA()}
        `;
      } else if (layoutClass === "grid-3-benefits") {
        blocks = `
          <rect x="6" y="18" width="16" height="16" rx="6" fill="rgba(255,255,255,0.8)" stroke="${stroke}"/>
          <rect x="24" y="18" width="16" height="16" rx="6" fill="rgba(255,255,255,0.8)" stroke="${stroke}"/>
          <rect x="42" y="18" width="16" height="16" rx="6" fill="rgba(255,255,255,0.8)" stroke="${stroke}"/>
          <rect x="8" y="39" width="24" height="19" rx="8" fill="rgba(15,23,42,0.16)"/>
          <rect x="36" y="39" width="22" height="7" rx="3.5" fill="rgba(255,255,255,0.75)" stroke="${stroke}"/>
          <rect x="36" y="49" width="22" height="9" rx="4.5" fill="${chipBg}" stroke="${stroke}"/>
          <text x="47" y="55.6" text-anchor="middle" font-size="6.2" font-weight="800"
            font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="${text}">혜택</text>
        `;
      } else if (layoutClass === "ugc-caption-heavy") {
        blocks = `
          <rect x="6" y="18" width="52" height="16" rx="8" fill="rgba(255,255,255,0.82)" stroke="${stroke}"/>
          <rect x="6" y="37" width="52" height="8" rx="4" fill="rgba(255,255,255,0.7)" stroke="${stroke}"/>
          <rect x="6" y="47.5" width="44" height="8" rx="4" fill="rgba(255,255,255,0.7)" stroke="${stroke}"/>
          <circle cx="14" cy="26" r="5" fill="rgba(15,23,42,0.18)"/>
          ${addCTA()}
        `;
      } else if (layoutClass === "before-after-split") {
        blocks = `
          <rect x="6" y="18" width="25" height="34" rx="8" fill="rgba(255,255,255,0.78)" stroke="${stroke}"/>
          <rect x="33" y="18" width="25" height="34" rx="8" fill="rgba(15,23,42,0.16)" />
          <rect x="31.5" y="18" width="1" height="34" fill="rgba(255,255,255,0.7)"/>
          <rect x="6" y="54" width="24" height="6" rx="3" fill="rgba(255,255,255,0.75)" stroke="${stroke}"/>
          <rect x="33" y="54" width="25" height="6" rx="3" fill="rgba(255,255,255,0.75)" stroke="${stroke}"/>
        `;
      } else {
        blocks = `
          <rect x="18" y="18" width="28" height="34" rx="14" fill="rgba(255,255,255,0.78)" stroke="${stroke}"/>
          <rect x="20" y="48" width="24" height="4.5" rx="2.25" fill="rgba(15,23,42,0.12)"/>
          ${addCTA()}
        `;
      }
    } else {
      if (layoutClass === "hook-3s") {
        blocks = `
          <rect x="6" y="18" width="52" height="34" rx="10" fill="rgba(255,255,255,0.75)" stroke="${stroke}"/>
          <text x="32" y="40" text-anchor="middle" font-size="18" font-weight="900"
            font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="rgba(15,23,42,0.78)">3s</text>
          <rect x="10" y="54" width="44" height="6" rx="3" fill="rgba(15,23,42,0.12)"/>
        `;
      } else if (layoutClass === "composition") {
        blocks = `
          <rect x="6" y="18" width="52" height="30" rx="10" fill="rgba(255,255,255,0.72)" stroke="${stroke}"/>
          <rect x="10" y="22" width="18" height="22" rx="7" fill="rgba(15,23,42,0.14)"/>
          <rect x="30" y="22" width="12" height="10" rx="5" fill="rgba(15,23,42,0.10)"/>
          <rect x="44" y="22" width="10" height="10" rx="5" fill="rgba(15,23,42,0.10)"/>
          <rect x="30" y="34" width="24" height="10" rx="5" fill="rgba(15,23,42,0.08)"/>
          <rect x="10" y="52" width="48" height="6" rx="3" fill="rgba(15,23,42,0.14)"/>
          <rect x="${10 + noise1}" y="52" width="${14 + noise2}" height="6" rx="3" fill="rgba(255,255,255,0.78)"/>
        `;
      } else if (layoutClass === "demo") {
        blocks = `
          <rect x="6" y="18" width="52" height="34" rx="10" fill="rgba(255,255,255,0.72)" stroke="${stroke}"/>
          <circle cx="32" cy="34" r="12" fill="rgba(15,23,42,0.12)"/>
          <path d="M32 25 C27 33, 28 39, 32 44 C36 39, 37 33, 32 25 Z" fill="rgba(15,23,42,0.18)"/>
          ${addCTA()}
        `;
      } else {
        blocks = `
          <rect x="6" y="18" width="52" height="34" rx="10" fill="rgba(255,255,255,0.72)" stroke="${stroke}"/>
          <rect x="10" y="22" width="14" height="12" rx="5" fill="rgba(15,23,42,0.12)"/>
          <rect x="26" y="22" width="14" height="12" rx="5" fill="rgba(15,23,42,0.10)"/>
          <rect x="42" y="22" width="12" height="12" rx="5" fill="rgba(15,23,42,0.08)"/>
          <rect x="10" y="38" width="44" height="10" rx="5" fill="rgba(15,23,42,0.08)"/>
          ${addCTA()}
        `;
      }
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="1" stop-color="rgba(255,255,255,0.92)"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect x="1" y="1" width="62" height="62" rx="14" fill="url(#bg)"/>
  <path d="M-5 42 C 10 36, 22 48, 36 44 C 46 41, 54 32, 72 38 L 72 72 L -5 72 Z" fill="url(#accent)" opacity="0.55"/>
  <rect x="1" y="1" width="62" height="62" rx="14" fill="none" stroke="rgba(0,0,0,0.08)"/>
  ${addBrand()}
  ${addVideoBadge()}
  ${addToken()}
  ${blocks}
</svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  // ---------- Mock generator (200+; image:video ~ 4:6) ----------
  function buildMockResults({ total = 240, seed = "ingredient-composition:v1" } = {}) {
    const ingredientTokens = ["나이아신아마이드", "레티놀", "비타민C", "세라마이드", "판테놀", "시카", "히알루론산", "AHA/BHA", "펩타이드"];
    const compositionTokens = ["3종 세트", "구성 비교", "라인업", "키트 구성", "패키지 구성", "조합 추천", "세트 혜택", "구성 한눈에"];

    const imageLayouts = Object.keys(IMAGE_LAYOUT_LIBRARY);
    const videoLayouts = Object.keys(VIDEO_LAYOUT_LIBRARY);

    const items = [];
    for (let i = 0; i < total; i++) {
      const rBase = seededRand01(`${seed}:row:${i}`);
      const brand = BRANDS[Math.floor(seededRand01(`${seed}:brand:${i}`) * BRANDS.length)];

      const mediaType = rBase < 0.6 ? "video" : "image"; // ~6:4
      const focus = pickWeighted(["ingredient", "composition"], [0.54, 0.46], seededRand01(`${seed}:focus:${i}`));

      const layoutClass =
        mediaType === "image"
          ? pickWeighted(
              imageLayouts,
              focus === "ingredient" ? [0.34, 0.12, 0.28, 0.16, 0.1] : [0.26, 0.14, 0.32, 0.12, 0.16],
              seededRand01(`${seed}:layout:${i}`)
            )
          : pickWeighted(
              videoLayouts,
              focus === "ingredient" ? [0.18, 0.22, 0.26, 0.34] : [0.26, 0.38, 0.18, 0.18],
              seededRand01(`${seed}:vlayout:${i}`)
            );

      const token =
        focus === "ingredient"
          ? ingredientTokens[Math.floor(seededRand01(`${seed}:tokI:${i}`) * ingredientTokens.length)]
          : compositionTokens[Math.floor(seededRand01(`${seed}:tokC:${i}`) * compositionTokens.length)];

      const runDays = 3 + Math.floor(seededRand01(`${seed}:run:${i}`) * 12); // 3~14
      const predictedScore = clamp(0.55 + Math.pow(seededRand01(`${seed}:score:${i}`), 0.55) * 0.4, 0.55, 0.95);

      const title = focus === "ingredient" ? `${token} 포인트 | 성분 근거형` : `${token} | 제품 구성 강조`;

      const caption =
        focus === "ingredient"
          ? `핵심 성분(${token})을 전면에 배치하고, 효능/근거를 짧은 불릿으로 정리한 소재.`
          : `제품 구성(${token})을 한눈에 보여주고, 선택 기준/혜택을 간단히 안내하는 소재.`;

      items.push({
        id: `km_${i.toString().padStart(4, "0")}`,
        brandId: brand.id,
        brandName: brand.name,
        mediaType,
        focus,
        layoutClass,
        token,
        title,
        caption,
        runDays,
        predictedScore,
        thumbUrl: buildCreativeThumbDataUrl({
          seedStr: `${seed}:creativeThumb:${i}:${brand.id}`,
          brandName: brand.name,
          mediaType,
          focus,
          layoutClass,
          token,
        }),
      });
    }
    return items;
  }

  function CreativeResultCard({ item }) {
    const brand = getBrand(item.brandId);
    const focusTone = item.focus === "ingredient" ? "blue" : "amber";
    const mediaTone = item.mediaType === "video" ? "purple" : "zinc";
    return (
      <div className="w-full rounded-2xl border bg-white p-4 text-left text-zinc-900">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-0 truncate font-semibold">
                {item.title} <span className="text-zinc-500">· {brand?.name || item.brandId}</span>
              </div>
              <Pill tone={focusTone}>{item.focus === "ingredient" ? "성분 강조" : "제품 구성 강조"}</Pill>
              <Pill tone={mediaTone}>{item.mediaType === "video" ? "영상" : "이미지"}</Pill>
              {badgeHighEfficiency(item) && <Pill tone="green">고효율 예상</Pill>}
            </div>
            <div className="mt-2 text-sm text-zinc-700 line-clamp-2">{item.caption}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill>레이아웃 클래스: {labelForLayoutClass(item.layoutClass)}</Pill>
              <Pill>run {item.runDays}d</Pill>
              <Pill>score {Math.round(item.predictedScore * 100)}</Pill>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <img
              src={item.thumbUrl}
              alt={`${brand?.name || ""} thumbnail`}
              className="h-14 w-14 rounded-xl border bg-white object-cover"
              loading="lazy"
              draggable="false"
            />
          </div>
        </div>
      </div>
    );
  }

  function ChatPanel({ open, onOpenChange }) {
    const [draft, setDraft] = useState("");
    const [messages, setMessages] = useState([]);
    const bottomRef = useRef(null);

    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages.length, open]);

    const replyText =
      "제품 개발이 완료되면 요약된 정보 외 궁금하신 점을 자유롭게 물어보실 수 있습니다. 프로토타입에서는 지원하지 않습니다.";

    const send = () => {
      const text = draft.trim();
      if (!text) return;
      setDraft("");
      setMessages((prev) => [...prev, { role: "user", text }, { role: "assistant", text: replyText }]);
    };

    return (
      <>
        {/* Docked side panel (desktop) */}
        <div
          className={`fixed bottom-6 right-6 z-40 hidden w-[360px] flex-col overflow-hidden rounded-2xl border bg-white shadow-lg md:flex ${
            open ? "" : "pointer-events-none opacity-0"
          }`}
          style={{ height: "calc(100vh - 9rem)" }}
        >
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="text-sm font-semibold text-zinc-900">AI Chat</div>
            <button
              type="button"
              onClick={() => onOpenChange?.(false)}
              className="rounded-lg border bg-white px-2 py-1 text-xs text-zinc-900 hover:bg-zinc-50"
            >
              닫기
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto bg-zinc-50 p-3">
            {messages.length === 0 && (
              <div className="rounded-xl border bg-white p-3 text-sm text-zinc-600">검색결과에 대해 더 궁금한 것을 물어보세요.</div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[90%] rounded-2xl border px-3 py-2 text-sm ${
                  m.role === "user" ? "ml-auto bg-white text-zinc-900" : "mr-auto border-emerald-200 bg-emerald-50 text-emerald-900"
                }`}
              >
                {m.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="border-t bg-white p-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder="검색결과에 대해 더 궁금한 것을 물어보세요."
              className="w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-[11px] text-zinc-500">Enter: 전송 · Shift+Enter: 줄바꿈</div>
              <button
                type="button"
                onClick={send}
                className="rounded-xl border bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
              >
                보내기
              </button>
            </div>
          </div>
        </div>

        {/* Re-open button (desktop) */}
        {!open && (
          <button
            type="button"
            onClick={() => onOpenChange?.(true)}
            className="fixed bottom-20 right-6 z-40 hidden items-center gap-2 rounded-full border bg-white/90 px-4 py-3 text-sm font-semibold text-zinc-900 shadow-lg backdrop-blur hover:bg-white md:inline-flex"
            aria-label="AI Chat 열기"
            title="AI Chat"
          >
            <span className="text-base leading-none">💬</span>
            <span>AI Chat</span>
          </button>
        )}
      </>
    );
  }

  function CreativeSearchKeyMessagePage() {
    const ds = (window.__APP && window.__APP.dataset && window.__APP.dataset.creativeSearchV2) || null;
    const results = useMemo(() => buildMockResults({ total: 240, seed: "km-query:v1" }), []);
    const ingredientInsights = useMemo(() => ds?.ingredientInsights || [], [ds?.version]);
    const dsIngredients = useMemo(() => ds?.ingredients || [], [ds?.version]);
    const dsAssets = useMemo(() => ds?.creativeAssets || [], [ds?.version]);
    const assetById = useMemo(() => {
      const m = new Map();
      (dsAssets || []).forEach((a) => m.set(a.id, a));
      return m;
    }, [dsAssets]);

    const searchTimeMs = useMemo(() => {
      const base = 140 + results.length * 0.62;
      const jitter = hashStringToInt(`${QUERY_LABEL}:${results.length}`) % 160;
      return Math.round(clamp(base + jitter, 90, 720));
    }, [results.length]);

    const [activeTab, setActiveTab] = useState("summary"); // summary | breakdown | library | ingredientInsights
    const [summaryCollapsed, setSummaryCollapsed] = useState(true);
    const [brandShareCollapsed, setBrandShareCollapsed] = useState(true);
    const [listLimit, setListLimit] = useState(36);
    const [chatOpen, setChatOpen] = useState(false);
    const [selectedIngredientId, setSelectedIngredientId] = useState(null);

    useEffect(() => {
      if (selectedIngredientId) return;
      const first = ingredientInsights[0]?.ingredientId || null;
      if (first) setSelectedIngredientId(first);
    }, [ingredientInsights, selectedIngredientId]);

    const ingredient = useMemo(() => results.filter((x) => x.focus === "ingredient"), [results]);
    const composition = useMemo(() => results.filter((x) => x.focus === "composition"), [results]);

    const ratio = useMemo(() => {
      const total = results.length || 1;
      const image = results.filter((x) => x.mediaType === "image").length;
      const video = results.filter((x) => x.mediaType === "video").length;
      return { total, image, video, imagePct: (image / total) * 100, videoPct: (video / total) * 100 };
    }, [results]);

    const topLayoutIngredient = useMemo(() => distribution(ingredient, (x) => x.layoutClass)[0], [ingredient]);
    const topLayoutComposition = useMemo(() => distribution(composition, (x) => x.layoutClass)[0], [composition]);

    const insightLines = useMemo(() => {
      const a = topLayoutIngredient ? `${labelForLayoutClass(topLayoutIngredient.k)} 중심` : "레이아웃 패턴이 분산";
      const b = topLayoutComposition ? `${labelForLayoutClass(topLayoutComposition.k)} 중심` : "레이아웃 패턴이 분산";
      const line1 = `성분 강조 소재는 ${a}으로, 핵심 성분을 전면에 두고 근거/효능을 짧게 정리하는 형태가 많습니다.`;
      const line2 = `제품 구성 강조 소재는 ${b}으로, 구성(세트/라인업)을 한눈에 보여주고 선택 기준을 빠르게 안내하는 경향입니다.`;
      return { line1, line2 };
    }, [topLayoutIngredient, topLayoutComposition]);

    const ingredientLayoutDist = useMemo(() => distribution(ingredient, (x) => x.layoutClass).slice(0, 8), [ingredient]);
    const compositionLayoutDist = useMemo(() => distribution(composition, (x) => x.layoutClass).slice(0, 8), [composition]);

    const ingredientBrandDist = useMemo(() => distribution(ingredient, (x) => x.brandId).slice(0, 8), [ingredient]);
    const compositionBrandDist = useMemo(() => distribution(composition, (x) => x.brandId).slice(0, 8), [composition]);

    const topList = useMemo(() => [...results].sort((a, b) => b.predictedScore - a.predictedScore).slice(0, listLimit), [results, listLimit]);

    const ingredientTopCards = useMemo(() => [...ingredient].sort((a, b) => b.predictedScore - a.predictedScore).slice(0, 4), [ingredient]);
    const compositionTopCards = useMemo(() => [...composition].sort((a, b) => b.predictedScore - a.predictedScore).slice(0, 4), [composition]);

    const currentIngredient = useMemo(() => {
      if (!selectedIngredientId) return null;
      return dsIngredients.find((x) => x.id === selectedIngredientId) || null;
    }, [dsIngredients, selectedIngredientId]);

    const currentInsight = useMemo(() => {
      if (!selectedIngredientId) return null;
      return ingredientInsights.find((x) => x.ingredientId === selectedIngredientId) || null;
    }, [ingredientInsights, selectedIngredientId]);

    return (
      <PageShell
        title="소재 검색 결과 (키 메시지 관심사)"
        subtitle="‘성분 강조’ vs ‘제품 구성 강조’를 비교해, 어떤 형태의 소재를 만들지 빠르게 결정합니다."
        right={
          <>
            <Tabs
              value={activeTab}
              onChange={setActiveTab}
              items={[
                { value: "summary", label: "요약" },
                { value: "ingredientInsights", label: "성분별 인사이트" },
                { value: "breakdown", label: "분석" },
                { value: "library", label: "검색결과" },
              ]}
            />
            <KpiStrip
              items={[
                { key: "q", label: "검색어", value: QUERY_LABEL, tone: "blue" },
                { key: "t", label: "총", value: `${ratio.total}건` },
                { key: "ms", label: "검색 시간", value: `${searchTimeMs}ms`, tone: "amber" },
              ]}
            />
          </>
        }
      >
        {activeTab === "summary" && (
          <>
            <div className="rounded-2xl border bg-white p-4">
              <SectionHeader title="결론 요약" subtitle="2줄 요약 + 대표 예시" />
              <div className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">
                <div>{insightLines.line1}</div>
                <div className="mt-1">{insightLines.line2}</div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">성분 강조</div>
                    <Pill tone="blue">{ingredient.length}건</Pill>
                  </div>
                  <div className="mt-2 text-sm text-zinc-700">
                    Top 레이아웃: {labelForLayoutClass(topLayoutIngredient?.k || "-")} ({(topLayoutIngredient?.pct || 0).toFixed(0)}%)
                  </div>
                  <div className="mt-3 grid gap-2">
                    {ingredientTopCards.map((x) => (
                      <CreativeResultCard key={x.id} item={x} />
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">제품 구성 강조</div>
                    <Pill tone="amber">{composition.length}건</Pill>
                  </div>
                  <div className="mt-2 text-sm text-zinc-700">
                    Top 레이아웃: {labelForLayoutClass(topLayoutComposition?.k || "-")} ({(topLayoutComposition?.pct || 0).toFixed(0)}%)
                  </div>
                  <div className="mt-3 grid gap-2">
                    {compositionTopCards.map((x) => (
                      <CreativeResultCard key={x.id} item={x} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "ingredientInsights" && (
          <>
            <div className="rounded-2xl border bg-white p-4">
              <SectionHeader
                title="성분별 소재 특징"
                subtitle="성분별로 ‘자주 쓰는 레이아웃/카피/CTA’와 시각적 특징(Do/Don’t)을 요약합니다."
                right={ds ? <Pill tone="green">v2 데이터</Pill> : <Pill tone="neutral">v2 데이터 없음</Pill>}
              />

              {!ds || ingredientInsights.length === 0 ? (
                <div className="rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-600">
                  표시할 성분 인사이트가 없습니다. (v2 데이터셋 로드/생성 후 확인)
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm text-zinc-600">성분 선택</div>
                    {(ingredientInsights || []).slice(0, 8).map((it) => {
                      const ing = dsIngredients.find((x) => x.id === it.ingredientId);
                      const active = it.ingredientId === selectedIngredientId;
                      return (
                        <button
                          key={it.ingredientId}
                          type="button"
                          onClick={() => setSelectedIngredientId(it.ingredientId)}
                          className={`rounded-full border px-3 py-1.5 text-sm ${
                            active ? "bg-zinc-900 text-white" : "bg-white text-zinc-900 hover:bg-zinc-50"
                          }`}
                        >
                          {ing?.name || it.ingredientId}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border bg-white p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold">{currentIngredient?.name || selectedIngredientId}</div>
                        {currentIngredient?.category && <Pill tone="blue">{currentIngredient.category}</Pill>}
                        {(currentIngredient?.claims || []).slice(0, 2).map((c) => (
                          <Pill key={c}>{c}</Pill>
                        ))}
                      </div>
                      <div className="mt-3 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700">{currentInsight?.summary}</div>

                      <div className="mt-4 grid gap-3">
                        <div className="rounded-xl border bg-white p-3">
                          <div className="text-sm font-semibold">자주 쓰는 레이아웃</div>
                          <div className="mt-2 space-y-2">
                            {(currentInsight?.commonLayouts || []).slice(0, 5).map((x) => (
                              <MiniBarRow key={`l-${x.layoutKey}`} label={x.label || x.layoutKey} valuePct={x.pct || 0} tone="emerald" />
                            ))}
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border bg-white p-3">
                            <div className="text-sm font-semibold">카피(Top)</div>
                            <div className="mt-2 space-y-2">
                              {(currentInsight?.commonCopyTypes || []).slice(0, 4).map((x) => (
                                <MiniBarRow key={`c-${x.copyType}`} label={x.copyType} valuePct={x.pct || 0} tone="amber" />
                              ))}
                            </div>
                          </div>
                          <div className="rounded-xl border bg-white p-3">
                            <div className="text-sm font-semibold">CTA(Top)</div>
                            <div className="mt-2 space-y-2">
                              {(currentInsight?.commonCTAs || []).slice(0, 4).map((x) => (
                                <MiniBarRow key={`cta-${x.ctaType}`} label={x.ctaType} valuePct={x.pct || 0} tone="blue" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-white p-4">
                      <div className="text-sm font-semibold">시각적 특징(Do/Don’t)</div>
                      <div className="mt-3 space-y-2 text-sm text-zinc-700">
                        {(currentInsight?.visualTraits || []).slice(0, 6).map((t, i) => (
                          <div key={`vt-${i}`} className="flex gap-2">
                            <div className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                            <div className="min-w-0">{t}</div>
                          </div>
                        ))}
                        {(currentInsight?.visualTraits || []).length === 0 && <div className="text-sm text-zinc-600">표시할 특징이 없습니다.</div>}
                      </div>

                      <div className="mt-4 rounded-xl border bg-white p-3">
                        <div className="text-sm font-semibold">Do / Don’t</div>
                        <div className="mt-2 space-y-2">
                          {(currentInsight?.doDonts || []).map((x, i) => (
                            <div key={`dd-${i}`} className="flex items-start gap-2 text-sm">
                              <Pill tone={x.kind === "do" ? "green" : "red"}>{x.kind.toUpperCase()}</Pill>
                              <div className="text-zinc-700">{x.text}</div>
                            </div>
                          ))}
                          {(currentInsight?.doDonts || []).length === 0 && <div className="text-sm text-zinc-600">표시할 항목이 없습니다.</div>}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold">예시 소재</div>
                          <div className="text-xs text-zinc-500">상위 {Math.min(8, (currentInsight?.exampleAssetIds || []).length)}개</div>
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {(currentInsight?.exampleAssetIds || []).slice(0, 8).map((id) => {
                            const a = assetById.get(id);
                            return (
                              <div key={id} className="rounded-xl border bg-white p-1.5">
                                <img
                                  src={a?.thumbnailUrl}
                                  alt={a?.title || id}
                                  className="h-16 w-16 rounded-lg bg-white object-cover"
                                  loading="lazy"
                                  draggable="false"
                                />
                                <div className="mt-1 text-[10px] text-zinc-500 line-clamp-2">{a?.title || id}</div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-2 text-xs text-zinc-500">
                          * 프로토타입에서는 실제 소재 대신 data URL SVG 썸네일을 사용합니다.
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {activeTab === "breakdown" && (
          <>
            <AccordionSection
              title="검색 결과 요약(분포)"
              subtitle="수량/레이아웃 분포"
              collapsed={summaryCollapsed}
              onToggle={() => setSummaryCollapsed((v) => !v)}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">성분 강조 · 레이아웃 클래스 비중</div>
                    <Pill tone="blue">{ingredient.length}건</Pill>
                  </div>
                  <div className="mt-3 space-y-2">
                    {ingredientLayoutDist.map((d) => (
                      <MiniBarRow key={`ing-layout-${d.k}`} label={labelForLayoutClass(d.k)} valuePct={d.pct} tone="emerald" />
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">제품 구성 강조 · 레이아웃 클래스 비중</div>
                    <Pill tone="amber">{composition.length}건</Pill>
                  </div>
                  <div className="mt-3 space-y-2">
                    {compositionLayoutDist.map((d) => (
                      <MiniBarRow key={`comp-layout-${d.k}`} label={labelForLayoutClass(d.k)} valuePct={d.pct} tone="purple" />
                    ))}
                  </div>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection
              title="브랜드별 비중"
              subtitle="성분 강조 vs 제품 구성 강조"
              collapsed={brandShareCollapsed}
              onToggle={() => setBrandShareCollapsed((v) => !v)}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">브랜드별 비중 · 성분 강조</div>
                    <Pill tone="blue">{ingredient.length}건</Pill>
                  </div>
                  <div className="mt-3 space-y-2">
                    {ingredientBrandDist.map((d) => (
                      <MiniBarRow key={`ing-brand-${d.k}`} label={`${getBrand(d.k)?.name || d.k}`} valuePct={d.pct} tone="blue" />
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">브랜드별 비중 · 제품 구성 강조</div>
                    <Pill tone="amber">{composition.length}건</Pill>
                  </div>
                  <div className="mt-3 space-y-2">
                    {compositionBrandDist.map((d) => (
                      <MiniBarRow key={`comp-brand-${d.k}`} label={`${getBrand(d.k)?.name || d.k}`} valuePct={d.pct} tone="amber" />
                    ))}
                  </div>
                </div>
              </div>
            </AccordionSection>
          </>
        )}

        {activeTab === "library" && (
          <>
            <div className="rounded-2xl border bg-white p-4">
              <SectionHeader
                title="예시 카드 리스트"
                subtitle="고효율 예상 뱃지(runDays ≥ 7) 포함"
                right={
                  <Pill>
                    {Math.min(listLimit, results.length)} / {results.length} 결과 노출
                  </Pill>
                }
              />
              <div className="grid gap-3 md:grid-cols-2">
                {topList.map((x) => (
                  <CreativeResultCard key={x.id} item={x} />
                ))}
              </div>

              {results.length > listLimit && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setListLimit((prev) => prev + 36)}
                    className="rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50 inline-flex items-center gap-1"
                  >
                    <span>더 보기 (+36)</span>
                    <span className="text-base leading-none">▼</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setListLimit(results.length)}
                    className="rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
                  >
                    전체 보기
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <BackToTopButton />
        <ChatPanel open={chatOpen} onOpenChange={setChatOpen} />
      </PageShell>
    );
  }

  window.__APP.pages.creativeSearchKeyMessage = CreativeSearchKeyMessagePage;
})();

