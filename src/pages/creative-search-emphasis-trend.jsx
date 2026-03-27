// Emphasis trend results page (ingredient/formula/effect emphasized creatives).
// This module registers itself to window.__APP.pages.creativeSearchEmphasisTrend

(function registerCreativeSearchEmphasisTrendPage() {
  const { Pill, SectionHeader, Drawer, Tabs, PageShell, KpiStrip, AccordionSection, BackToTopButton, MiniBarRow } = window.__APP.ui;

  // ---------- Constants ----------
  const QUERY_LABEL = "성분/제형/효과 강조 트렌드 알려줘";

  const DIMENSIONS = {
    ingredient: { key: "ingredient", label: "성분" },
    formula: { key: "formula", label: "제형" },
    effect: { key: "effect", label: "효과" },
  };

  const CATEGORIES = {
    skincare: { key: "skincare", label: "스킨케어" },
    color: { key: "color", label: "색조" },
    device: { key: "device", label: "뷰티 디바이스" },
  };

  const BRANDS = [
    { id: "oliveyoung", name: "올리브영", isOwn: true, thumbUrl: "./assets/thumbs/oliveyoung.svg" },
    { id: "innisfree", name: "이니스프리", thumbUrl: "./assets/thumbs/innisfree.svg" },
    { id: "roundlab", name: "라운드랩", thumbUrl: "./assets/thumbs/roundlab.svg" },
    { id: "hera", name: "헤라", thumbUrl: "./assets/thumbs/hera.svg" },
    { id: "labiotte", name: "라비오뜨", thumbUrl: "./assets/thumbs/labiotte.svg" },
    { id: "mediheal", name: "메디힐" },
    { id: "drg", name: "닥터지" },
    { id: "beplain", name: "비플레인" },
    { id: "romand", name: "롬앤" },
    { id: "etude", name: "에뛰드" },
    { id: "laneige", name: "라네즈" },
    { id: "cosrx", name: "코스알엑스" },
  ];

  const IMAGE_LAYOUT_LIBRARY = {
    "hero-product-left": { name: "제품 히어로(좌) + 포인트(우)" },
    "hero-model-center": { name: "모델 중심 + 하단 CTA" },
    "grid-3-benefits": { name: "3분할 정보 그리드" },
    "ugc-caption-heavy": { name: "UGC 텍스트 비중↑" },
    "before-after-split": { name: "전/후 비교 스플릿" },
  };

  const VIDEO_LAYOUT_LIBRARY = {
    plot: { name: "플롯형(스토리/상황)" },
    "hook-3s": { name: "초수 훅(3초)형" },
    demo: { name: "데모/클로즈업형" },
    "spec-overlay": { name: "스펙 오버레이형" },
  };

  const KEY_MESSAGE_TYPES = [
    { key: "근거형", tone: "blue" },
    { key: "사용감형", tone: "amber" },
    { key: "비교/전후형", tone: "green" },
    { key: "루틴제안형", tone: "purple" },
    { key: "기술스펙형", tone: "zinc" },
    { key: "혜택형", tone: "red" },
  ];

  const TOKENS = {
    ingredient: {
      skincare: ["나이아신아마이드", "레티놀", "비타민C", "세라마이드", "판테놀", "시카", "히알루론산", "AHA/BHA", "펩타이드", "콜라겐"],
      color: ["마이카", "실리카", "티타늄디옥사이드", "아이언옥사이드", "카나우바왁스", "폴리부텐", "보론나이트라이드", "세리사이트", "폴리머필름", "세팅파우더"],
      device: ["LED(630nm)", "RF", "EMS", "초음파", "마이크로커런트", "온열", "쿨링", "진동", "이온", "광테라피"],
    },
    formula: {
      skincare: ["젤 크림", "앰플", "세럼", "토너패드", "미스트", "크림", "마스크", "스틱밤", "로션", "에센스"],
      color: ["쿠션", "스틱", "틴트", "파우더", "리퀴드", "펜슬", "팔레트", "프라이머", "픽서", "글로스"],
      device: ["핸디형", "마스크형", "스틱형", "롤러형", "거치형", "헤드교체형", "무선형", "방수형", "미니형", "홈케어형"],
    },
    effect: {
      skincare: ["미백", "주름개선", "진정", "보습", "탄력", "모공", "각질", "장벽", "피부결", "톤개선"],
      color: ["롱래스팅", "발색", "픽싱", "커버", "광택", "블러", "톤업", "밀착", "지속력", "번짐방지"],
      device: ["리프팅", "탄력케어", "붓기케어", "흡수보조", "클렌징", "모공케어", "진정케어", "각질케어", "피부온도케어", "피부결케어"],
    },
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

  function getBrand(brandId) {
    return BRANDS.find((b) => b.id === brandId);
  }

  function labelForLayoutClass(layoutClass) {
    return IMAGE_LAYOUT_LIBRARY[layoutClass]?.name || VIDEO_LAYOUT_LIBRARY[layoutClass]?.name || layoutClass;
  }

  function badgeHighEfficiency(creative) {
    return creative.runDays >= 7;
  }

  function dimensionToken(creative, dimensionKey) {
    if (dimensionKey === "formula") return creative.formulaToken;
    if (dimensionKey === "effect") return creative.effectToken;
    return creative.ingredientToken;
  }

  function clusterKeyFor(creative, dimensionKey) {
    const token = dimensionToken(creative, dimensionKey);
    return `${dimensionKey}:${token}:${creative.keyMessageType}:${creative.layoutClass}`;
  }

  function keyMessageTone(key) {
    return KEY_MESSAGE_TYPES.find((x) => x.key === key)?.tone || "neutral";
  }

  function buildCreativeThumbDataUrl({ seedStr, brandName, mediaType, categoryKey, dimensionKey, token, keyMessageType, layoutClass }) {
    const palettes = {
      skincare: ["#0ea5e9", "#2563eb", "#e0f2fe"],
      color: ["#f43f5e", "#db2777", "#fff1f2"],
      device: ["#22c55e", "#16a34a", "#dcfce7"],
    };
    const [c1, c2, bg] = palettes[categoryKey] || palettes.skincare;

    const safeBrand = (brandName || "BR").replace(/[<>&]/g, "").slice(0, 6);
    const brandMark = safeBrand.replace(/\s+/g, "").slice(0, 2);
    const tkn = (token || "").replace(/[<>&]/g, "").slice(0, 8);
    const km = (keyMessageType || "").replace(/[<>&]/g, "").slice(0, 6);
    const dimLabel = DIMENSIONS[dimensionKey]?.label || "축";
    const isVideo = mediaType === "video";

    const r = (k) => seededRand01(`${seedStr}:${k}`);
    const noise1 = Math.floor(r("n1") * 12);
    const noise2 = Math.floor(r("n2") * 10);

    const stroke = "rgba(0,0,0,0.08)";
    const chipBg = "rgba(255,255,255,0.88)";
    const text = "#0f172a";

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
      <circle cx="50.5" cy="35" r="8.5" fill="rgba(15,23,42,0.30)"/>
      <path d="M48 31.5 L55.5 35 L48 38.5 Z" fill="#fff"/>
    `
        : "";

    const addTopChips = () => `
      <rect x="6" y="18" width="22" height="8" rx="4" fill="${chipBg}" stroke="${stroke}"/>
      <text x="17" y="24.1" text-anchor="middle" font-size="5.8" font-weight="800"
        font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="${text}">${dimLabel}</text>
      <rect x="30" y="18" width="28" height="8" rx="4" fill="${chipBg}" stroke="${stroke}"/>
      <text x="44" y="24.1" text-anchor="middle" font-size="5.8" font-weight="800"
        font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="${text}">${km}</text>
    `;

    const addToken = () =>
      tkn
        ? `
      <text x="32" y="33" text-anchor="middle" font-size="7" font-weight="800"
        font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="${text}" opacity="0.92">${tkn}</text>
    `
        : "";

    const addBlocks = () => {
      if (!isVideo) {
        if (layoutClass === "grid-3-benefits") {
          return `
            <rect x="6" y="38" width="16" height="16" rx="6" fill="rgba(255,255,255,0.82)" stroke="${stroke}"/>
            <rect x="24" y="38" width="16" height="16" rx="6" fill="rgba(255,255,255,0.82)" stroke="${stroke}"/>
            <rect x="42" y="38" width="16" height="16" rx="6" fill="rgba(255,255,255,0.82)" stroke="${stroke}"/>
          `;
        }
        if (layoutClass === "before-after-split") {
          return `
            <rect x="6" y="38" width="25" height="20" rx="8" fill="rgba(255,255,255,0.78)" stroke="${stroke}"/>
            <rect x="33" y="38" width="25" height="20" rx="8" fill="rgba(15,23,42,0.14)"/>
            <rect x="31.5" y="38" width="1" height="20" fill="rgba(255,255,255,0.7)"/>
          `;
        }
        if (layoutClass === "ugc-caption-heavy") {
          return `
            <rect x="6" y="38" width="52" height="8" rx="4" fill="rgba(255,255,255,0.82)" stroke="${stroke}"/>
            <rect x="6" y="48.5" width="46" height="7" rx="3.5" fill="rgba(255,255,255,0.70)" stroke="${stroke}"/>
          `;
        }
        if (layoutClass === "hero-model-center") {
          return `
            <rect x="20" y="36" width="24" height="24" rx="12" fill="rgba(255,255,255,0.78)" stroke="${stroke}"/>
          `;
        }
        return `
          <rect x="6" y="38" width="26" height="22" rx="8" fill="rgba(255,255,255,0.8)" stroke="${stroke}"/>
          <rect x="35" y="42" width="23" height="6" rx="3" fill="rgba(15,23,42,0.12)"/>
          <rect x="35" y="51" width="${19 + noise2}" height="5" rx="2.5" fill="rgba(15,23,42,0.10)"/>
        `;
      }
      if (layoutClass === "hook-3s") {
        return `
          <rect x="6" y="38" width="52" height="22" rx="10" fill="rgba(255,255,255,0.76)" stroke="${stroke}"/>
          <text x="32" y="55" text-anchor="middle" font-size="16" font-weight="900"
            font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="rgba(15,23,42,0.70)">3s</text>
        `;
      }
      if (layoutClass === "spec-overlay") {
        return `
          <rect x="6" y="38" width="52" height="22" rx="10" fill="rgba(255,255,255,0.70)" stroke="${stroke}"/>
          <rect x="10" y="42" width="44" height="6" rx="3" fill="rgba(15,23,42,0.10)"/>
          <rect x="${10 + noise1}" y="50.5" width="${18 + noise2}" height="6" rx="3" fill="rgba(255,255,255,0.82)" stroke="${stroke}"/>
        `;
      }
      return `
        <rect x="6" y="38" width="52" height="22" rx="10" fill="rgba(255,255,255,0.72)" stroke="${stroke}"/>
        <circle cx="32" cy="49" r="8" fill="rgba(15,23,42,0.12)"/>
      `;
    };

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
  <path d="M-5 44 C 12 35, 26 49, 38 45 C 50 41, 54 31, 72 39 L 72 72 L -5 72 Z" fill="url(#accent)" opacity="0.55"/>
  <rect x="1" y="1" width="62" height="62" rx="14" fill="none" stroke="rgba(0,0,0,0.08)"/>
  ${addBrand()}
  ${addVideoBadge()}
  ${addTopChips()}
  ${addToken()}
  ${addBlocks()}
</svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function buildKeyMessageText({ dimensionKey, categoryKey, token, keyMessageType }) {
    const dim = DIMENSIONS[dimensionKey]?.label || dimensionKey;
    const cat = CATEGORIES[categoryKey]?.label || categoryKey;
    const t = token || "-";
    const km = keyMessageType || "-";
    if (km === "비교/전후형") return `${cat} 기준 전/후로 ${dim}(${t}) 변화를 증거처럼 보여주는 톤.`;
    if (km === "근거형") return `${dim}(${t}) 근거를 3포인트로 요약해 신뢰를 강화하는 톤.`;
    if (km === "사용감형") return `${dim}(${t}) 체감 포인트를 짧은 후기 문장으로 강조하는 톤.`;
    if (km === "루틴제안형") return `${dim}(${t})을(를) 중심으로 아침/저녁 루틴 조합을 제안하는 톤.`;
    if (km === "기술스펙형") return `${dim}(${t}) 스펙/수치/구조를 오버레이로 빠르게 전달하는 톤.`;
    if (km === "혜택형") return `${dim}(${t})과 함께 쿠폰/증정 등 혜택을 묶어 CTA를 강화하는 톤.`;
    return `${dim}(${t}) 중심 메시지 톤.`;
  }

  // ---------- Mock generator (1000+) ----------
  function buildMockResults({ total = 1200, seed = "emphasis-trend:v1" } = {}) {
    const imageLayouts = Object.keys(IMAGE_LAYOUT_LIBRARY);
    const videoLayouts = Object.keys(VIDEO_LAYOUT_LIBRARY);
    const categoryKeys = Object.keys(CATEGORIES);
    const keyMessageKeys = KEY_MESSAGE_TYPES.map((x) => x.key);

    const items = [];
    for (let i = 0; i < total; i++) {
      const brand = BRANDS[Math.floor(seededRand01(`${seed}:brand:${i}`) * BRANDS.length)];
      const categoryKey = categoryKeys[Math.floor(seededRand01(`${seed}:cat:${i}`) * categoryKeys.length)];

      const mediaType = seededRand01(`${seed}:media:${i}`) < 0.58 ? "video" : "image";
      const layoutClass =
        mediaType === "image"
          ? pickWeighted(imageLayouts, [0.28, 0.16, 0.24, 0.18, 0.14], seededRand01(`${seed}:il:${i}`))
          : pickWeighted(videoLayouts, [0.18, 0.28, 0.28, 0.26], seededRand01(`${seed}:vl:${i}`));

      const ingredientToken =
        TOKENS.ingredient[categoryKey][Math.floor(seededRand01(`${seed}:tokI:${categoryKey}:${i}`) * TOKENS.ingredient[categoryKey].length)];
      const formulaToken =
        TOKENS.formula[categoryKey][Math.floor(seededRand01(`${seed}:tokF:${categoryKey}:${i}`) * TOKENS.formula[categoryKey].length)];
      const effectToken =
        TOKENS.effect[categoryKey][Math.floor(seededRand01(`${seed}:tokE:${categoryKey}:${i}`) * TOKENS.effect[categoryKey].length)];

      const keyMessageType = pickWeighted(
        keyMessageKeys,
        categoryKey === "device" ? [0.16, 0.12, 0.12, 0.12, 0.34, 0.14] : [0.26, 0.16, 0.16, 0.14, 0.12, 0.16],
        seededRand01(`${seed}:km:${categoryKey}:${i}`)
      );

      const runDays = 3 + Math.floor(seededRand01(`${seed}:run:${i}`) * 15); // 3~17
      const predictedScore = clamp(0.52 + Math.pow(seededRand01(`${seed}:score:${i}`), 0.58) * 0.43, 0.52, 0.95);

      // Title uses ingredient by default; view switches show current-axis token separately in UI.
      const title = `${CATEGORIES[categoryKey].label} | ${brand.name} 핵심 포인트 요약`;

      items.push({
        id: `et_${i.toString().padStart(5, "0")}`,
        brandId: brand.id,
        brandName: brand.name,
        categoryKey,
        mediaType,
        layoutClass,
        ingredientToken,
        formulaToken,
        effectToken,
        keyMessageType,
        keyMessageText: buildKeyMessageText({
          dimensionKey: "ingredient",
          categoryKey,
          token: ingredientToken,
          keyMessageType,
        }),
        runDays,
        predictedScore,
        thumbUrl: buildCreativeThumbDataUrl({
          seedStr: `${seed}:thumb:${i}:${brand.id}`,
          brandName: brand.name,
          mediaType,
          categoryKey,
          dimensionKey: "ingredient",
          token: ingredientToken,
          keyMessageType,
          layoutClass,
        }),
      });
    }
    return items;
  }

  // ---------- UI pieces ----------
  function CreativeResultCard({ item, dimensionKey, onOpenCluster }) {
    const brand = getBrand(item.brandId);
    const dimLabel = DIMENSIONS[dimensionKey]?.label || dimensionKey;
    const token = dimensionToken(item, dimensionKey);
    const clusterKey = clusterKeyFor(item, dimensionKey);

    const mediaTone = item.mediaType === "video" ? "purple" : "neutral";
    const dimTone = dimensionKey === "ingredient" ? "blue" : dimensionKey === "formula" ? "amber" : "green";

    return (
      <div className="w-full rounded-2xl border bg-white p-4 text-left text-zinc-900">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-0 truncate font-semibold">
                {item.title} <span className="text-zinc-500">· {brand?.name || item.brandId}</span>
              </div>
              <Pill tone={dimTone}>
                {dimLabel}: {token}
              </Pill>
              <Pill tone={keyMessageTone(item.keyMessageType)}>{item.keyMessageType}</Pill>
              <Pill tone={mediaTone}>{item.mediaType === "video" ? "영상" : "이미지"}</Pill>
              <Pill>{CATEGORIES[item.categoryKey]?.label || item.categoryKey}</Pill>
              {badgeHighEfficiency(item) && <Pill tone="green">고효율 예상</Pill>}
            </div>

            <div className="mt-2 text-sm text-zinc-700 line-clamp-2">
              {buildKeyMessageText({ dimensionKey, categoryKey: item.categoryKey, token, keyMessageType: item.keyMessageType })}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Pill>레이아웃: {labelForLayoutClass(item.layoutClass)}</Pill>
              <Pill>run {item.runDays}d</Pill>
              <Pill>score {Math.round(item.predictedScore * 100)}</Pill>
              <button
                type="button"
                onClick={() => onOpenCluster?.({ dimensionKey, clusterKey })}
                className="rounded-full border bg-white px-2 py-0.5 text-xs text-zinc-800 hover:bg-zinc-50"
                title="클러스터 보기"
              >
                클러스터 보기
              </button>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <img
              src={buildCreativeThumbDataUrl({
                seedStr: `thumb:${item.id}:${dimensionKey}`,
                brandName: brand?.name || item.brandId,
                mediaType: item.mediaType,
                categoryKey: item.categoryKey,
                dimensionKey,
                token,
                keyMessageType: item.keyMessageType,
                layoutClass: item.layoutClass,
              })}
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

  function BrandInsightCard({ brandId, creatives, dimensionKey, collapsed, onToggle, onOpenCluster }) {
    const brand = getBrand(brandId);
    const dimLabel = DIMENSIONS[dimensionKey]?.label || dimensionKey;

    const topTokens = useMemo(() => distribution(creatives, (x) => dimensionToken(x, dimensionKey)).slice(0, 3), [creatives, dimensionKey]);
    const topKeyMessages = useMemo(() => distribution(creatives, (x) => x.keyMessageType).slice(0, 2), [creatives]);

    const dimTone = dimensionKey === "ingredient" ? "blue" : dimensionKey === "formula" ? "amber" : "green";

    const examples = useMemo(() => {
      const sorted = [...creatives].sort((a, b) => b.predictedScore - a.predictedScore);
      return collapsed ? sorted.slice(0, 2) : sorted.slice(0, 4);
    }, [creatives, collapsed]);

    return (
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-semibold">{brand?.name || brandId}</div>
              {brand?.isOwn && <Pill tone="blue">자사</Pill>}
              <Pill>소재 {creatives.length}개</Pill>
              <button
                type="button"
                onClick={onToggle}
                className="rounded-xl border bg-white px-3 py-1.5 text-xs text-zinc-900 hover:bg-zinc-50"
              >
                {collapsed ? "펼치기" : "접기"}
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <Pill tone={dimTone}>
                {dimLabel} Top: {topTokens[0]?.k || "-"}
              </Pill>
              {(topTokens || []).slice(0, collapsed ? 2 : 3).map((t) => (
                <Pill key={`${brandId}:tok:${t.k}`} tone={dimTone}>
                  {t.k}
                </Pill>
              ))}
              {(topKeyMessages || []).slice(0, collapsed ? 1 : 2).map((t) => (
                <Pill key={`${brandId}:km:${t.k}`} tone={keyMessageTone(t.k)}>
                  {t.k}
                </Pill>
              ))}
            </div>
          </div>

          {brand?.thumbUrl ? (
            <img
              src={brand.thumbUrl}
              alt={`${brand.name} logo`}
              className="h-10 w-10 rounded-xl border bg-white object-cover"
              loading="lazy"
              draggable="false"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white text-xs font-semibold text-zinc-700">
              {(brand?.name || brandId).slice(0, 2)}
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {examples.map((x) => (
              <CreativeResultCard
                key={x.id}
                item={x}
                dimensionKey={dimensionKey}
                onOpenCluster={({ dimensionKey, clusterKey }) => onOpenCluster?.({ dimensionKey, clusterKey })}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  function ChatPanel({ open, onOpenChange, dimensionKey, onDimensionChange }) {
    const [draft, setDraft] = useState("");
    const [messages, setMessages] = useState([]);
    const bottomRef = useRef(null);

    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages.length, open]);

    useEffect(() => {
      if (!open) return;
      // On open, show the required prompt once (if empty).
      setMessages((prev) => {
        if (prev.length > 0) return prev;
        return [{ role: "assistant", text: "성분 외에도 제형, 효과 강조 트렌드가 궁금하신가요?" }];
      });
    }, [open]);

    const helpText = "프로토타입에서는 ‘제형’ 또는 ‘효과’를 입력하면 페이지가 해당 축으로 전환됩니다.";

    const send = () => {
      const text = draft.trim();
      if (!text) return;
      setDraft("");

      const normalized = text.replace(/\s+/g, "");
      const nextDimension = normalized === "제형" ? "formula" : normalized === "효과" ? "effect" : normalized === "성분" ? "ingredient" : null;

      if (nextDimension) {
        onDimensionChange?.(nextDimension);
        setMessages((prev) => [
          ...prev,
          { role: "user", text },
          { role: "assistant", text: `확인했어요. 이제 ‘${DIMENSIONS[nextDimension].label}’ 강조 트렌드로 업데이트했어요.` },
          { role: "assistant", text: "다른 축이 궁금하면 ‘성분/제형/효과’ 중 하나를 입력해보세요." },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: "user", text }, { role: "assistant", text: helpText }]);
    };

    const quick = (k) => {
      onDimensionChange?.(k);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `‘${DIMENSIONS[k].label}’ 축으로 전환했어요. 상단 요약/브랜드 카드/리스트가 모두 업데이트됩니다.` },
      ]);
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

          <div className="border-b bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="blue">현재: {DIMENSIONS[dimensionKey]?.label}</Pill>
              <button
                type="button"
                onClick={() => quick("ingredient")}
                className="rounded-full border bg-white px-2 py-1 text-xs text-zinc-800 hover:bg-zinc-50"
              >
                성분
              </button>
              <button
                type="button"
                onClick={() => quick("formula")}
                className="rounded-full border bg-white px-2 py-1 text-xs text-zinc-800 hover:bg-zinc-50"
              >
                제형
              </button>
              <button
                type="button"
                onClick={() => quick("effect")}
                className="rounded-full border bg-white px-2 py-1 text-xs text-zinc-800 hover:bg-zinc-50"
              >
                효과
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto bg-zinc-50 p-3">
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
              placeholder="예: 제형 / 효과"
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

  function CreativeSearchEmphasisTrendPage() {
    // Dataset is created once; dimension switching recomputes derived views.
    const results = useMemo(() => buildMockResults({ total: 1200, seed: "emphasis-trend:v1" }), []);

    const [dimensionKey, setDimensionKey] = useState("ingredient");
    const [activeTab, setActiveTab] = useState("summary"); // summary | breakdown | library
    const [chatOpen, setChatOpen] = useState(false);

    const [distCollapsed, setDistCollapsed] = useState(true);
    const [highEffCollapsed, setHighEffCollapsed] = useState(true);
    const [brandExpandAll, setBrandExpandAll] = useState(false);
    const [brandExpanded, setBrandExpanded] = useState({});

    const [clusterModal, setClusterModal] = useState({ open: false, dimensionKey: "ingredient", clusterKey: null });

    const searchTimeMs = useMemo(() => {
      const base = 160 + results.length * 0.42;
      const jitter = hashStringToInt(`${QUERY_LABEL}:${results.length}`) % 210;
      return Math.round(clamp(base + jitter, 120, 920));
    }, [results.length]);

    const dimLabel = DIMENSIONS[dimensionKey]?.label || dimensionKey;

    const totals = useMemo(() => {
      const total = results.length || 1;
      const image = results.filter((x) => x.mediaType === "image").length;
      const video = results.filter((x) => x.mediaType === "video").length;
      const highEff = results.filter((x) => badgeHighEfficiency(x)).length;
      return { total, image, video, highEff, imagePct: (image / total) * 100, videoPct: (video / total) * 100, highEffPct: (highEff / total) * 100 };
    }, [results]);

    const tokenDist = useMemo(() => distribution(results, (x) => dimensionToken(x, dimensionKey)).slice(0, 6), [results, dimensionKey]);
    const kmDist = useMemo(() => distribution(results, (x) => x.keyMessageType).slice(0, 5), [results]);
    const layoutDist = useMemo(() => distribution(results, (x) => x.layoutClass).slice(0, 5), [results]);

    const byBrand = useMemo(() => {
      const acc = {};
      results.forEach((x) => {
        acc[x.brandId] = acc[x.brandId] || [];
        acc[x.brandId].push(x);
      });
      const ordered = [...BRANDS]
        .filter((b) => acc[b.id]?.length)
        .sort((a, b) => {
          if (a.isOwn && !b.isOwn) return -1;
          if (!a.isOwn && b.isOwn) return 1;
          return (acc[b.id]?.length || 0) - (acc[a.id]?.length || 0);
        })
        .map((b) => ({ brandId: b.id, items: acc[b.id] || [] }));
      return ordered;
    }, [results]);

    const insightLines = useMemo(() => {
      const topToken = tokenDist[0]?.k;
      const topKm = kmDist[0]?.k;
      const topLayout = layoutDist[0]?.k;

      const line1 = `이번 검색결과에서는 ‘${dimLabel}(${topToken || "-"})’가 가장 많이 강조되었고, 메시지는 ‘${topKm || "-"}’ 유형이 두드러집니다.`;
      const line2 = `레이아웃은 ‘${labelForLayoutClass(topLayout || "-")}’ 패턴이 많이 관측되며, 전체 중 ${Math.round(totals.highEffPct)}%가 ‘고효율 예상(runDays≥7)’으로 분류됩니다.`;

      const brandMentions = byBrand.slice(0, 4).map(({ brandId, items }) => {
        const brand = getBrand(brandId);
        const bt = distribution(items, (x) => dimensionToken(x, dimensionKey))[0]?.k;
        const km = distribution(items, (x) => x.keyMessageType)[0]?.k;
        return `${brand?.name || brandId}은(는) ‘${bt || "-"}’ + ‘${km || "-"}’ 조합이 반복됩니다.`;
      });
      return { line1, line2, brandMentions };
    }, [byBrand, dimLabel, dimensionKey, kmDist, layoutDist, tokenDist, totals.highEffPct]);

    const commonSummary = useMemo(() => {
      const commonKm = kmDist.slice(0, 3).map((x) => x.k);
      const commonLayout = layoutDist.slice(0, 2).map((x) => labelForLayoutClass(x.k));
      const commonTokens = tokenDist.slice(0, 3).map((x) => x.k);
      return { commonKm, commonLayout, commonTokens };
    }, [kmDist, layoutDist, tokenDist]);

    const highEffByBrand = useMemo(() => {
      return byBrand.map(({ brandId, items }) => {
        const pick = items.filter((x) => badgeHighEfficiency(x)).sort((a, b) => b.predictedScore - a.predictedScore);
        return { brandId, total: pick.length, top: pick.slice(0, 5) };
      });
    }, [byBrand]);

    const topClusters = useMemo(() => {
      const dist = distribution(results, (x) => clusterKeyFor(x, dimensionKey)).slice(0, 5);
      return dist.map((d) => {
        // parse: dimension:token:keyMessageType:layout
        const [, token, keyMessageType, layoutClass] = (d.k || "").split(":");
        return { clusterKey: d.k, token, keyMessageType, layoutClass, pct: d.pct, count: d.v };
      });
    }, [results, dimensionKey]);

    const clusterDetails = useMemo(() => {
      if (!clusterModal.open || !clusterModal.clusterKey) return null;
      const dKey = clusterModal.dimensionKey;
      const clusterKey = clusterModal.clusterKey;
      const items = results.filter((x) => clusterKeyFor(x, dKey) === clusterKey).sort((a, b) => b.predictedScore - a.predictedScore);
      const parts = clusterKey.split(":");
      const token = parts[1] || "-";
      const keyMessageType = parts[2] || "-";
      const layoutClass = parts[3] || "-";
      return { dimensionKey: dKey, clusterKey, token, keyMessageType, layoutClass, items };
    }, [clusterModal, results]);

    const listPageSize = 36;
    const [listLimit, setListLimit] = useState(listPageSize);

    useEffect(() => {
      // When dimension changes, reset list limit so the page remains snappy.
      setListLimit(listPageSize);
    }, [dimensionKey]);

    const sortedList = useMemo(() => {
      // Sort by predicted score; add tiny deterministic tie-break.
      return [...results].sort((a, b) => b.predictedScore - a.predictedScore || hashStringToInt(a.id) - hashStringToInt(b.id));
    }, [results]);

    const visibleList = useMemo(() => sortedList.slice(0, listLimit), [sortedList, listLimit]);

    return (
      <PageShell
        title="소재 검색 결과 (성분/제형/효과 강조 트렌드)"
        subtitle={`검색 결과에서 어떤 ${dimLabel}이(가) 강조되는지 요약하고, 다음 소재 기획(Top 클러스터)을 빠르게 결정합니다.`}
        right={
          <>
            <Tabs
              value={activeTab}
              onChange={setActiveTab}
              items={[
                { value: "summary", label: "요약" },
                { value: "breakdown", label: "분석" },
                { value: "library", label: "검색결과" },
              ]}
            />
            <KpiStrip
              items={[
                { key: "q", label: "검색어", value: QUERY_LABEL, tone: "blue" },
                { key: "d", label: "축", value: dimLabel, tone: dimensionKey === "ingredient" ? "blue" : dimensionKey === "formula" ? "amber" : "green" },
                { key: "t", label: "총", value: `${totals.total}건` },
                { key: "ms", label: "검색 시간", value: `${searchTimeMs}ms`, tone: "amber" },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setDimensionKey("ingredient")}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  dimensionKey === "ingredient" ? "border-zinc-900 bg-zinc-900 text-white" : "bg-white text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                성분
              </button>
              <button
                type="button"
                onClick={() => setDimensionKey("formula")}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  dimensionKey === "formula" ? "border-zinc-900 bg-zinc-900 text-white" : "bg-white text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                제형
              </button>
              <button
                type="button"
                onClick={() => setDimensionKey("effect")}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  dimensionKey === "effect" ? "border-zinc-900 bg-zinc-900 text-white" : "bg-white text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                효과
              </button>
            </div>
          </>
        }
      >

          {/* 1. Natural language summary + brand mentions */}
          {activeTab === "summary" && (
            <div className="rounded-2xl border bg-white p-4">
              <SectionHeader title="검색결과 인사이트" subtitle="자연어 요약 + 브랜드별 특징 요약" />
              <div className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">
                <div>{insightLines.line1}</div>
                <div className="mt-1">{insightLines.line2}</div>
                <div className="mt-3 space-y-1">
                  {insightLines.brandMentions.map((t, i) => (
                    <div key={i}>{t}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. What is emphasized (fold) */}
          {activeTab === "breakdown" && (
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">어떤 {dimLabel} / 메시지가 많이 강조되었나요?</div>
                <div className="text-sm text-zinc-600">상위 분포(Top)를 확인합니다.</div>
              </div>
              <button
                type="button"
                onClick={() => setDistCollapsed((v) => !v)}
                className="rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
              >
                {distCollapsed ? "펼치기" : "접기"}
              </button>
            </div>

            {distCollapsed ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill tone="green">고효율 예상 {totals.highEff}건</Pill>
                <Pill>
                  이미지 {totals.imagePct.toFixed(0)}% · 영상 {totals.videoPct.toFixed(0)}%
                </Pill>
                <Pill tone="blue">Top {dimLabel}: {tokenDist[0]?.k || "-"}</Pill>
                <Pill tone={keyMessageTone(kmDist[0]?.k)}>Top 메시지: {kmDist[0]?.k || "-"}</Pill>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{dimLabel} Top</div>
                    <Pill tone={dimensionKey === "ingredient" ? "blue" : dimensionKey === "formula" ? "amber" : "green"}>Top 6</Pill>
                  </div>
                  <div className="mt-3 space-y-2">
                    {tokenDist.map((d) => (
                      <MiniBarRow key={`tok-${d.k}`} label={d.k} valuePct={d.pct} tone={dimensionKey === "ingredient" ? "blue" : dimensionKey === "formula" ? "amber" : "emerald"} />
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">키 메시지 타입</div>
                    <Pill>Top 5</Pill>
                  </div>
                  <div className="mt-3 space-y-2">
                    {kmDist.map((d) => (
                      <MiniBarRow key={`km-${d.k}`} label={d.k} valuePct={d.pct} tone={keyMessageTone(d.k)} />
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">레이아웃 패턴</div>
                    <Pill>Top 5</Pill>
                  </div>
                  <div className="mt-3 space-y-2">
                    {layoutDist.map((d) => (
                      <MiniBarRow key={`layout-${d.k}`} label={labelForLayoutClass(d.k)} valuePct={d.pct} tone="zinc" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* 3. High efficiency by brand (fold) */}
          {activeTab === "breakdown" && (
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">브랜드별 고효율 예상 소재 리스트</div>
                <div className="text-sm text-zinc-600">runDays ≥ 7인 소재를 고효율 예상으로 표시합니다.</div>
              </div>
              <button
                type="button"
                onClick={() => setHighEffCollapsed((v) => !v)}
                className="rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
              >
                {highEffCollapsed ? "펼치기" : "접기"}
              </button>
            </div>

            {highEffCollapsed ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill tone="green">고효율 예상 {totals.highEff}건</Pill>
                <Pill>브랜드 {byBrand.length}개</Pill>
                <Pill>브랜드당 Top 5 요약</Pill>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {highEffByBrand.map((b) => {
                  const brand = getBrand(b.brandId);
                  return (
                    <div key={`he-${b.brandId}`} className="rounded-2xl border bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-semibold">{brand?.name || b.brandId}</div>
                          {brand?.isOwn && <Pill tone="blue">자사</Pill>}
                          <Pill tone="green">고효율 예상 {b.total}건</Pill>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {b.top.map((x) => (
                          <CreativeResultCard
                            key={x.id}
                            item={x}
                            dimensionKey={dimensionKey}
                            onOpenCluster={({ dimensionKey, clusterKey }) => setClusterModal({ open: true, dimensionKey, clusterKey })}
                          />
                        ))}
                        {b.top.length === 0 && <div className="text-sm text-zinc-600">표시할 고효율 예상 소재가 없습니다.</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {/* 4. Common vs unique features */}
          {activeTab === "breakdown" && (
          <div className="rounded-2xl border bg-white p-4">
            <SectionHeader title="브랜드별 공통/차별 특징" subtitle="공통 특징은 상위 분포 기준, 차별 특징은 각 브랜드 Top 조합 기준" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border bg-white p-4">
                <div className="font-semibold">공통 특징</div>
                <div className="mt-3 space-y-2 text-sm text-zinc-700">
                  <div>
                    <span className="font-semibold">{dimLabel} 공통 Top</span>: {commonSummary.commonTokens.join(", ") || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">키 메시지 타입 공통 Top</span>: {commonSummary.commonKm.join(", ") || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">레이아웃 공통 Top</span>: {commonSummary.commonLayout.join(", ") || "-"}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border bg-white p-4">
                <div className="font-semibold">차별 특징(브랜드 Top 조합)</div>
                <div className="mt-3 space-y-2 text-sm text-zinc-700">
                  {byBrand.slice(0, 6).map(({ brandId, items }) => {
                    const brand = getBrand(brandId);
                    const bt = distribution(items, (x) => dimensionToken(x, dimensionKey))[0]?.k;
                    const km = distribution(items, (x) => x.keyMessageType)[0]?.k;
                    const layout = distribution(items, (x) => x.layoutClass)[0]?.k;
                    return (
                      <div key={`diff-${brandId}`}>
                        <span className="font-semibold">{brand?.name || brandId}</span>: {dimLabel} ‘{bt || "-"}’ + ‘{km || "-"}’ · 레이아웃 ‘
                        {labelForLayoutClass(layout || "-")}’
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* 5. Material planning suggestions (clusters) */}
          {activeTab === "summary" && (
          <div className="rounded-2xl border bg-white p-4">
            <SectionHeader title="소재 기획 제안" subtitle="검색 결과에서 자주 등장하는 ‘클러스터(메시지×레이아웃×토큰)’를 기반으로 제안합니다." />
            <div className="grid gap-3 md:grid-cols-3">
              {topClusters.slice(0, 5).map((c) => (
                <button
                  key={c.clusterKey}
                  type="button"
                  onClick={() => setClusterModal({ open: true, dimensionKey, clusterKey: c.clusterKey })}
                  className="rounded-2xl border bg-white p-4 text-left hover:bg-zinc-50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={dimensionKey === "ingredient" ? "blue" : dimensionKey === "formula" ? "amber" : "green"}>
                      {dimLabel}: {c.token || "-"}
                    </Pill>
                    <Pill tone={keyMessageTone(c.keyMessageType)}>{c.keyMessageType || "-"}</Pill>
                    <Pill>레이아웃: {labelForLayoutClass(c.layoutClass || "-")}</Pill>
                  </div>
                  <div className="mt-2 text-sm text-zinc-700">
                    상위 클러스터로, ‘{dimLabel}({c.token || "-"})’ 포인트를 ‘{c.keyMessageType || "-"}’ 톤으로 전달하고 ‘
                    {labelForLayoutClass(c.layoutClass || "-")}’ 구성으로 제작을 제안합니다.
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Pill>비중 {c.pct.toFixed(1)}%</Pill>
                    <Pill>표본 {c.count}개</Pill>
                  </div>
                </button>
              ))}
            </div>
          </div>
          )}

          {/* 6. Brand cards (fold per brand) */}
          {activeTab === "breakdown" && (
          <div className="rounded-2xl border bg-white p-4">
            <SectionHeader
              title="브랜드별 강조 포인트 분석"
              subtitle="강조 토큰과 키 메시지 타입을 pill 형태로 보여주며, 펼치면 대표 소재 예시를 제공합니다."
              right={
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>브랜드 {byBrand.length}개</Pill>
                  <button
                    type="button"
                    onClick={() => {
                      setBrandExpandAll((v) => !v);
                      setBrandExpanded({});
                    }}
                    className="rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
                  >
                    {brandExpandAll ? "전체 접기" : "전체 펼치기"}
                  </button>
                </div>
              }
            />

            <div className="space-y-3">
              {byBrand.map(({ brandId, items }) => {
                const collapsed = brandExpandAll ? false : !(brandExpanded[brandId] || false);
                return (
                  <BrandInsightCard
                    key={`brand-${brandId}`}
                    brandId={brandId}
                    creatives={items}
                    dimensionKey={dimensionKey}
                    collapsed={collapsed}
                    onToggle={() => {
                      if (brandExpandAll) setBrandExpandAll(false);
                      setBrandExpanded((prev) => ({
                        ...prev,
                        [brandId]: !(prev[brandId] || false),
                      }));
                    }}
                    onOpenCluster={({ dimensionKey, clusterKey }) => setClusterModal({ open: true, dimensionKey, clusterKey })}
                  />
                );
              })}
            </div>
          </div>
          )}

          {/* 7. Search results list */}
          {activeTab === "library" && (
          <div className="rounded-2xl border bg-white p-4">
            <SectionHeader
              title="검색 결과 리스트"
              subtitle="클러스터 보기 버튼을 클릭하면 모달로 상세를 확인할 수 있습니다."
              right={
                <Pill>
                  노출 {Math.min(listLimit, totals.total)} / {totals.total}
                </Pill>
              }
            />
            <div className="grid gap-3 md:grid-cols-2">
              {visibleList.map((x) => (
                <CreativeResultCard
                  key={x.id}
                  item={x}
                  dimensionKey={dimensionKey}
                  onOpenCluster={({ dimensionKey, clusterKey }) => setClusterModal({ open: true, dimensionKey, clusterKey })}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-zinc-500">
                * 데이터셋은 {totals.total}건(1000+). 성능을 위해 기본은 일부만 렌더링하며, ‘더 보기’로 전체를 확인할 수 있습니다.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setListLimit((v) => Math.min(totals.total, v + listPageSize))}
                  disabled={listLimit >= totals.total}
                  className="rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center gap-1"
                  aria-label="더 보기"
                >
                  <span>더 보기 (+{listPageSize})</span>
                  <span className="text-base leading-none">▼</span>
                </button>
                <button
                  type="button"
                  onClick={() => setListLimit(totals.total)}
                  disabled={listLimit >= totals.total}
                  className="rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  전체 보기
                </button>
              </div>
            </div>
          </div>
          )}

        {/* Cluster drawer */}
        <Drawer
          open={clusterModal.open}
          title={
            clusterDetails
              ? `클러스터 · ${DIMENSIONS[clusterDetails.dimensionKey]?.label} / ${clusterDetails.token} / ${clusterDetails.keyMessageType}`
              : "클러스터"
          }
          onClose={() => setClusterModal({ open: false, dimensionKey, clusterKey: null })}
          width="w-[min(760px,calc(100%-2rem))]"
        >
          {clusterDetails && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-700">
                해당 메시지와 레이아웃을 기준으로 소재를 만들어볼까요?
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={clusterDetails.dimensionKey === "ingredient" ? "blue" : clusterDetails.dimensionKey === "formula" ? "amber" : "green"}>
                  {DIMENSIONS[clusterDetails.dimensionKey]?.label}: {clusterDetails.token}
                </Pill>
                <Pill tone={keyMessageTone(clusterDetails.keyMessageType)}>{clusterDetails.keyMessageType}</Pill>
                <Pill>레이아웃: {labelForLayoutClass(clusterDetails.layoutClass)}</Pill>
                <Pill tone="green">고효율 예상 {clusterDetails.items.filter((x) => badgeHighEfficiency(x)).length}개</Pill>
              </div>

              <div className="rounded-xl border p-3">
                <div className="font-semibold">클러스터 요약</div>
                <div className="mt-2 text-sm text-zinc-700">
                  ‘{DIMENSIONS[clusterDetails.dimensionKey]?.label}({clusterDetails.token})’ 포인트를 ‘{clusterDetails.keyMessageType}’ 톤으로 전달하며, ‘
                  {labelForLayoutClass(clusterDetails.layoutClass)}’ 레이아웃으로 구성된 소재 묶음입니다.
                </div>
              </div>

              <div>
                <div className="font-semibold">예시 소재</div>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  {clusterDetails.items.slice(0, 8).map((x) => (
                    <CreativeResultCard
                      key={`cluster-${x.id}`}
                      item={x}
                      dimensionKey={clusterDetails.dimensionKey}
                      onOpenCluster={({ dimensionKey, clusterKey }) => setClusterModal({ open: true, dimensionKey, clusterKey })}
                    />
                  ))}
                  {clusterDetails.items.length === 0 && <div className="text-sm text-zinc-600">표시할 소재가 없습니다.</div>}
                </div>
              </div>
            </div>
          )}
        </Drawer>

        <ChatPanel
          open={chatOpen}
          onOpenChange={setChatOpen}
          dimensionKey={dimensionKey}
          onDimensionChange={setDimensionKey}
        />
        <BackToTopButton />
      </PageShell>
    );
  }

  window.__APP.pages.creativeSearchEmphasisTrend = CreativeSearchEmphasisTrendPage;
})();

