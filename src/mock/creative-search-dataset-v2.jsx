// Creative Search v2 dataset (feedback-driven)
// - No-build prototype: registers itself to window.__APP.dataset.creativeSearchV2
// - Generates rich thumbnails as data-url SVG so "type differences" are visible without real assets.

(function registerCreativeSearchDatasetV2() {
  window.__APP = window.__APP || {};
  window.__APP.dataset = window.__APP.dataset || {};

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
    // deterministic pseudo-random in [0,1)
    let x = hashStringToInt(seedStr) || 1;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 1000000) / 1000000;
  }

  function pick(items, r01) {
    if (!items.length) return null;
    return items[Math.floor(clamp(r01, 0, 0.999999) * items.length)];
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

  function safeText(s, max = 10) {
    return String(s || "")
      .replace(/[<>&]/g, "")
      .slice(0, max);
  }

  // ---------- Domain catalogs ----------
  const PROMOS = [
    { id: "promo_oliveyoung_sale_2026w9", key: "올영 세일", start: "2026-02-28", end: "2026-03-06" },
    { id: "promo_new_launch_2026w10", key: "신제품 런칭", start: "2026-03-07", end: "2026-03-14" },
  ];

  const BRANDS = [
    { id: "oliveyoung", name: "올리브영", isOwn: true, thumbUrl: "./assets/thumbs/oliveyoung.svg" },
    { id: "innisfree", name: "이니스프리", thumbUrl: "./assets/thumbs/innisfree.svg" },
    { id: "roundlab", name: "라운드랩", thumbUrl: "./assets/thumbs/roundlab.svg" },
    { id: "hera", name: "헤라", thumbUrl: "./assets/thumbs/hera.svg" },
    { id: "labiotte", name: "라비오뜨", thumbUrl: "./assets/thumbs/labiotte.svg" },
  ];

  // “동일 상품/프로모션 기준” 비교를 위한 제품 단위 (간단 목업)
  const PRODUCTS = [
    { id: "prd_toner_cica", name: "시카 토너", category: "스킨케어", heroIngredientId: "ing_cica" },
    { id: "prd_serum_vitc", name: "비타민C 세럼", category: "스킨케어", heroIngredientId: "ing_vitc" },
    { id: "prd_cream_ceramide", name: "세라마이드 크림", category: "스킨케어", heroIngredientId: "ing_ceramide" },
  ];

  const INGREDIENTS = [
    { id: "ing_niacinamide", name: "나이아신아마이드", synonyms: ["니아신아마이드"], category: "미백/톤", claims: ["톤 개선", "피지 케어"] },
    { id: "ing_retinol", name: "레티놀", synonyms: [], category: "주름/탄력", claims: ["탄력", "주름 케어"] },
    { id: "ing_vitc", name: "비타민C", synonyms: ["비타민 C"], category: "미백/톤", claims: ["광채", "톤 개선"] },
    { id: "ing_ceramide", name: "세라마이드", synonyms: [], category: "보습/장벽", claims: ["장벽 강화", "보습"] },
    { id: "ing_panthenol", name: "판테놀", synonyms: ["비타민B5"], category: "진정/장벽", claims: ["진정", "장벽 강화"] },
    { id: "ing_cica", name: "시카", synonyms: ["병풀", "센텔라"], category: "진정", claims: ["진정", "붉은기 완화"] },
    { id: "ing_hyaluronic", name: "히알루론산", synonyms: ["HA"], category: "보습", claims: ["수분", "보습"] },
  ];

  // v1에서 사용하던 layoutKey들과 호환
  const LAYOUT_LIBRARY = {
    "hero-product-left": { name: "제품 히어로(좌) + 텍스트(우)" },
    "hero-model-center": { name: "모델 중심 + 하단 CTA" },
    "grid-3-benefits": { name: "3분할 베네핏 그리드" },
    "ugc-caption-heavy": { name: "UGC(캡션 텍스트 비중↑)" },
    "before-after-split": { name: "전/후 비교 스플릿" },
  };

  // “실제 타입 예시”를 위해 type catalog를 명시
  const CREATIVE_TYPES = {
    BenefitGrid: { label: "혜택 그리드형", defaultLayoutKey: "grid-3-benefits" },
    IngredientProof: { label: "성분 근거형", defaultLayoutKey: "hero-product-left" },
    BeforeAfterProof: { label: "전/후 증거형", defaultLayoutKey: "before-after-split" },
    UGCReview: { label: "UGC 리뷰형", defaultLayoutKey: "ugc-caption-heavy" },
    Hook3s: { label: "3초 훅형(영상)", defaultLayoutKey: "hero-model-center" },
  };

  // ---------- Thumbnail generator (data-url SVG) ----------
  function buildCreativeThumbDataUrl({
    seedStr,
    brandName,
    productName,
    promoKey,
    mediaType,
    typeKey,
    keyMessage,
    ingredientName,
    ctaText,
  }) {
    const palettes = [
      ["#2563eb", "#0ea5e9", "#e0f2fe"], // blue
      ["#16a34a", "#22c55e", "#dcfce7"], // green
      ["#7c3aed", "#a855f7", "#faf5ff"], // purple
      ["#d97706", "#f59e0b", "#fffbeb"], // amber
      ["#be123c", "#ef4444", "#fff1f2"], // rose
    ];
    const pal = palettes[Math.floor(seededRand01(`${seedStr}:pal`) * palettes.length)];
    const [c1, c2, bg] = pal;

    const safeBrand = safeText(brandName, 6);
    const brandMark = safeBrand.replace(/\s+/g, "").slice(0, 2);
    const isVideo = mediaType === "video";

    const tType = safeText(CREATIVE_TYPES[typeKey]?.label || typeKey || "TYPE", 6);
    const tMsg = safeText(keyMessage, 8);
    const tIng = safeText(ingredientName, 6);
    const tCTA = safeText(ctaText, 6);
    const tProd = safeText(productName, 7);
    const tPromo = safeText(promoKey, 6);

    const stroke = "rgba(0,0,0,0.08)";
    const chipBg = "rgba(255,255,255,0.88)";
    const text = "#0f172a";

    const addChip = ({ x, y, w, label }) => `
      <rect x="${x}" y="${y}" width="${w}" height="10" rx="5" fill="${chipBg}" stroke="${stroke}"/>
      <text x="${x + w / 2}" y="${y + 7.1}" text-anchor="middle" font-size="6.2" font-weight="800"
        font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="${text}">${label}</text>
    `;

    const addVideoBadge = () =>
      isVideo
        ? `
      <rect x="46" y="6" width="12" height="10" rx="5" fill="rgba(15,23,42,0.78)"/>
      <text x="52" y="13.2" text-anchor="middle" font-size="6" font-weight="900"
        font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="#fff">VID</text>
      <circle cx="32" cy="36" r="9" fill="rgba(15,23,42,0.34)"/>
      <path d="M30 31.5 L38 36 L30 40.5 Z" fill="#fff"/>
    `
        : "";

    const blocksByType = () => {
      const r = (k) => seededRand01(`${seedStr}:${k}`);
      const n1 = Math.floor(r("n1") * 10);
      const n2 = Math.floor(r("n2") * 8);

      if (typeKey === "BenefitGrid") {
        return `
          <rect x="6" y="22" width="16" height="16" rx="6" fill="rgba(255,255,255,0.82)" stroke="${stroke}"/>
          <rect x="24" y="22" width="16" height="16" rx="6" fill="rgba(255,255,255,0.82)" stroke="${stroke}"/>
          <rect x="42" y="22" width="16" height="16" rx="6" fill="rgba(255,255,255,0.82)" stroke="${stroke}"/>
          <rect x="10" y="42" width="44" height="6" rx="3" fill="rgba(15,23,42,0.12)"/>
          <rect x="${10 + n1}" y="42" width="${14 + n2}" height="6" rx="3" fill="rgba(255,255,255,0.85)"/>
          ${addChip({ x: 38, y: 52, w: 20, label: tCTA || "CTA" })}
        `;
      }
      if (typeKey === "IngredientProof") {
        return `
          <rect x="6" y="22" width="26" height="40" rx="8" fill="rgba(255,255,255,0.8)" stroke="${stroke}"/>
          <rect x="14" y="28" width="10" height="22" rx="5" fill="rgba(15,23,42,0.18)"/>
          <rect x="35" y="26" width="23" height="6" rx="3" fill="rgba(15,23,42,0.14)"/>
          <rect x="35" y="35" width="21" height="5" rx="2.5" fill="rgba(15,23,42,0.10)"/>
          <rect x="35" y="43" width="19" height="5" rx="2.5" fill="rgba(15,23,42,0.10)"/>
          ${tIng ? addChip({ x: 36, y: 52, w: 22, label: tIng }) : ""}
        `;
      }
      if (typeKey === "BeforeAfterProof") {
        return `
          <rect x="6" y="22" width="25" height="32" rx="8" fill="rgba(255,255,255,0.78)" stroke="${stroke}"/>
          <rect x="33" y="22" width="25" height="32" rx="8" fill="rgba(15,23,42,0.16)"/>
          <rect x="31.5" y="22" width="1" height="32" fill="rgba(255,255,255,0.7)"/>
          ${addChip({ x: 6, y: 56, w: 24, label: "BEFORE" })}
          ${addChip({ x: 34, y: 56, w: 24, label: "AFTER" })}
        `;
      }
      if (typeKey === "UGCReview") {
        return `
          <rect x="6" y="22" width="52" height="14" rx="8" fill="rgba(255,255,255,0.84)" stroke="${stroke}"/>
          <rect x="6" y="39" width="52" height="8" rx="4" fill="rgba(255,255,255,0.72)" stroke="${stroke}"/>
          <rect x="6" y="49.5" width="40" height="8" rx="4" fill="rgba(255,255,255,0.72)" stroke="${stroke}"/>
          <circle cx="14" cy="29" r="5" fill="rgba(15,23,42,0.18)"/>
          ${addChip({ x: 40, y: 54, w: 18, label: "리뷰" })}
        `;
      }
      // Hook3s or default
      return `
        <rect x="6" y="22" width="52" height="34" rx="10" fill="rgba(255,255,255,0.78)" stroke="${stroke}"/>
        <text x="32" y="43" text-anchor="middle" font-size="18" font-weight="900"
          font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="rgba(15,23,42,0.78)">3s</text>
        <rect x="10" y="56" width="44" height="6" rx="3" fill="rgba(15,23,42,0.12)"/>
      `;
    };

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
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
  <rect x="1" y="1" width="94" height="94" rx="18" fill="url(#bg)"/>
  <path d="M-6 64 C 14 54, 30 74, 52 66 C 66 61, 76 48, 102 58 L 102 102 L -6 102 Z" fill="url(#accent)" opacity="0.55"/>
  <rect x="1" y="1" width="94" height="94" rx="18" fill="none" stroke="rgba(0,0,0,0.08)"/>

  ${addChip({ x: 6, y: 6, w: 18, label: brandMark || "BR" })}
  ${addVideoBadge()}
  ${addChip({ x: 28, y: 6, w: 28, label: tType })}
  ${tPromo ? addChip({ x: 60, y: 6, w: 30, label: tPromo }) : ""}

  <text x="48" y="20" text-anchor="middle" font-size="7.2" font-weight="800"
    font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="${text}" opacity="0.92">${tProd}</text>
  <text x="48" y="30" text-anchor="middle" font-size="6.5" font-weight="700"
    font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="${text}" opacity="0.78">${tMsg}</text>

  ${blocksByType()}
</svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  // ---------- Dataset builders ----------
  function buildCreativeAssets({ seed = "creativeSearchV2:v1", promoId = PROMOS[0].id, total = 120 } = {}) {
    const promo = PROMOS.find((p) => p.id === promoId) || PROMOS[0];
    const ctaTypes = ["구매하기", "자세히 보기", "할인 받기", "지금 보기", "쿠폰 받기"];
    const copyTypes = ["혜택 강조", "성분/기능", "리뷰/신뢰", "긴급성", "비교/전후", "사용법"];

    const typeKeys = Object.keys(CREATIVE_TYPES);
    const items = [];

    for (let i = 0; i < total; i++) {
      const brand = BRANDS[Math.floor(seededRand01(`${seed}:brand:${i}`) * BRANDS.length)];
      const product = PRODUCTS[Math.floor(seededRand01(`${seed}:product:${i}`) * PRODUCTS.length)];
      const ingredient = INGREDIENTS.find((x) => x.id === product.heroIngredientId) || pick(INGREDIENTS, seededRand01(`${seed}:ing:${i}`));

      const mediaType = seededRand01(`${seed}:media:${i}`) < 0.58 ? "video" : "image";
      const adType = seededRand01(`${seed}:ad:${i}`) < 0.22 ? "partnership" : "normal";

      const typeKey = pickWeighted(
        typeKeys,
        // Make video slightly favor hook/ugc
        mediaType === "video" ? [0.18, 0.18, 0.14, 0.28, 0.22] : [0.26, 0.26, 0.22, 0.18, 0.08],
        seededRand01(`${seed}:type:${i}`)
      );

      const layoutKey = CREATIVE_TYPES[typeKey]?.defaultLayoutKey || "hero-product-left";
      const ctaType = pick(ctaTypes, seededRand01(`${seed}:cta:${i}`));
      const copyType = pick(copyTypes, seededRand01(`${seed}:copy:${i}`));

      const runDays = 3 + Math.floor(seededRand01(`${seed}:run:${i}`) * 12); // 3~14
      const predictedScore = clamp(0.55 + Math.pow(seededRand01(`${seed}:score:${i}`), 0.55) * 0.4, 0.55, 0.95);
      const textRatio = clamp(0.25 + seededRand01(`${seed}:text:${i}`) * 0.45, 0.18, 0.75);

      const keyMessage =
        typeKey === "BenefitGrid"
          ? "쿠폰+추가할인"
          : typeKey === "IngredientProof"
            ? `${ingredient.name} 근거`
            : typeKey === "BeforeAfterProof"
              ? "7일 변화"
              : typeKey === "UGCReview"
                ? "리뷰 기반 신뢰"
                : "3초 훅";

      const derivedSignals = {
        hasBeforeAfter: typeKey === "BeforeAfterProof",
        hasCoupon: keyMessage.includes("쿠폰") || copyType === "긴급성" || copyType === "혜택 강조",
        hasUGCTextHeavy: typeKey === "UGCReview",
        hasIngredientProof: typeKey === "IngredientProof",
        ingredientId: ingredient?.id || null,
        ingredientName: ingredient?.name || null,
        typeKey,
        layoutKey,
        promoId: promo.id,
        productId: product.id,
      };

      const title = `${promo.key} · ${product.name} · ${CREATIVE_TYPES[typeKey]?.label || typeKey}`;
      const caption =
        typeKey === "BenefitGrid"
          ? `${promo.key} 혜택을 3포인트로 요약하고 CTA로 전환 유도`
          : typeKey === "IngredientProof"
            ? `핵심 성분(${ingredient?.name})을 전면에 배치하고 효능/근거를 짧게 정리`
            : typeKey === "BeforeAfterProof"
              ? `전/후 비교로 변화(기간/지표)를 명확히 보여주는 증거형`
              : typeKey === "UGCReview"
                ? `리뷰/사회적 증거를 큰 텍스트로 노출해 신뢰 신호 강화`
                : `초반 3초에 메시지/훅을 배치해 시청 지속 유도`;

      const thumbnailUrl = buildCreativeThumbDataUrl({
        seedStr: `${seed}:thumb:${i}:${brand.id}:${product.id}:${promo.id}:${typeKey}`,
        brandName: brand.name,
        productName: product.name,
        promoKey: promo.key,
        mediaType,
        typeKey,
        keyMessage,
        ingredientName: ingredient?.name,
        ctaText: ctaType,
      });

      // Evidence payload that UI can render without “hard-coded sentences”
      const evidence = {
        whyThisWorks: [
          typeKey === "BenefitGrid" ? "혜택을 3포인트로 구조화해 스캔 속도↑" : null,
          typeKey === "IngredientProof" ? "근거/효능을 짧게 정리해 ‘설명 가능’" : null,
          typeKey === "BeforeAfterProof" ? "변화 증거(전/후)로 설득 신호↑" : null,
          typeKey === "UGCReview" ? "사회적 증거(리뷰)로 불확실성↓" : null,
          typeKey === "Hook3s" ? "초반 훅으로 이탈↓(영상)" : null,
        ].filter(Boolean),
        supportingStats: {
          // purely mock, but stable per comparable set
          ctrLiftPct: Math.round((seededRand01(`${seed}:e:ctr:${i}`) * 9 + 3) * 10) / 10, // 3.0~12.0
          roasLiftPct: Math.round((seededRand01(`${seed}:e:roas:${i}`) * 18 + 4) * 10) / 10, // 4.0~22.0
          confidence: Math.round((0.62 + seededRand01(`${seed}:e:conf:${i}`) * 0.28) * 100) / 100, // 0.62~0.90
        },
        comparableSetId: `cmp_${promo.id}_${product.id}_${brand.id}`,
      };

      items.push({
        id: `as_${i.toString().padStart(4, "0")}`,
        brandId: brand.id,
        productId: product.id,
        promoId: promo.id,
        title,
        caption,
        mediaType,
        adType,
        runDays,
        startDate: promo.start,
        endDate: promo.end,
        predictedScore,
        layoutKey,
        ctaType,
        copyType,
        textRatio,
        thumbnailUrl,
        derivedSignals,
        evidence,
      });
    }

    return items;
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

  function buildIngredientInsights({ assets, topN = 6 } = {}) {
    const byIngredientId = (assets || []).reduce((acc, a) => {
      const ingId = a?.derivedSignals?.ingredientId;
      if (!ingId) return acc;
      acc[ingId] = acc[ingId] || [];
      acc[ingId].push(a);
      return acc;
    }, {});

    const out = Object.entries(byIngredientId).map(([ingredientId, arr]) => {
      const ingredient = INGREDIENTS.find((x) => x.id === ingredientId);
      const layouts = distribution(arr, (x) => x.layoutKey).slice(0, topN);
      const copyTypes = distribution(arr, (x) => x.copyType).slice(0, topN);
      const ctas = distribution(arr, (x) => x.ctaType).slice(0, topN);

      const typeDist = distribution(arr, (x) => x?.derivedSignals?.typeKey).slice(0, 3);
      const topType = typeDist[0]?.k;
      const traitsByType = {
        BenefitGrid: ["혜택 3포인트 구조화", "CTA를 하단에 크게", "가격/쿠폰 숫자 강조"],
        IngredientProof: ["성분명 배지 고정 노출", "근거/효능 불릿 2~3개", "제품 컷과 근거 영역 분리"],
        BeforeAfterProof: ["기간(7일/2주) 고정", "전/후 구분 라벨", "지표(톤/붉은기) 1개만 선택"],
        UGCReview: ["리뷰 수치(1,234+) 노출", "따옴표/실사용 문장", "자막 텍스트 비중↑"],
        Hook3s: ["초반 3초 키 메시지", "하이라이트 단어 1~2개", "빠른 컷 편집 가정"],
      };

      const visualTraits = [
        ...(traitsByType[topType] || ["텍스트 밀도/배치가 성분군마다 다르게 나타남"]),
        ingredient?.category ? `카테고리(${ingredient.category})는 ‘${(ingredient.claims || []).slice(0, 2).join("·")}’ 메시지로 연결` : null,
      ].filter(Boolean);

      const doDonts = [
        { kind: "do", text: "성분명은 한 번만 크게, 근거는 2~3개 불릿로 제한" },
        { kind: "do", text: "카테고리별 핵심 지표(톤/진정/장벽 등) 1개를 ‘증거’로 붙이기" },
        { kind: "dont", text: "성분/효능/후기/혜택을 한 장에 모두 넣어 과밀도 만들기" },
      ];

      return {
        ingredientId,
        summary: `${ingredient?.name || ingredientId} 소재는 ‘${CREATIVE_TYPES[topType]?.label || topType || "정보형"}’이 상대적으로 자주 나타납니다.`,
        commonLayouts: layouts.map((x) => ({ layoutKey: x.k, pct: x.pct, label: LAYOUT_LIBRARY[x.k]?.name || x.k })),
        commonCopyTypes: copyTypes.map((x) => ({ copyType: x.k, pct: x.pct })),
        commonCTAs: ctas.map((x) => ({ ctaType: x.k, pct: x.pct })),
        visualTraits,
        doDonts,
        exampleAssetIds: arr
          .slice()
          .sort((a, b) => b.predictedScore - a.predictedScore)
          .slice(0, 8)
          .map((x) => x.id),
      };
    });

    // show only top ingredients by volume
    return out
      .sort((a, b) => (byIngredientId[b.ingredientId]?.length || 0) - (byIngredientId[a.ingredientId]?.length || 0))
      .slice(0, 8);
  }

  function buildCreativeTypeGroups({ assets, seed = "groups:v1" } = {}) {
    const byBrand = (assets || []).reduce((acc, a) => {
      acc[a.brandId] = acc[a.brandId] || [];
      acc[a.brandId].push(a);
      return acc;
    }, {});

    const makeGroup = ({ brandId, typeKey, groupIdx }) => {
      const list = (byBrand[brandId] || []).filter((a) => a?.derivedSignals?.typeKey === typeKey);
      const top = list.slice().sort((a, b) => b.predictedScore - a.predictedScore).slice(0, 12);
      const brand = BRANDS.find((b) => b.id === brandId);

      const predictedGroupScore = clamp(0.68 + seededRand01(`${seed}:${brandId}:${typeKey}:${groupIdx}`) * 0.27, 0.62, 0.95);
      const drivers = [
        `${CREATIVE_TYPES[typeKey]?.label || typeKey} 비중이 상대적으로 높음`,
        "상위 성과 소재에서 반복되는 카피/CTA 패턴 확인",
        "동일 프로모션/상품 스코프로 A/B 구성 가능",
      ];

      return {
        id: `grp_${brandId}_${typeKey}`.toLowerCase(),
        brandId,
        name: `${CREATIVE_TYPES[typeKey]?.label || typeKey} (소재 유형)`,
        chips: [CREATIVE_TYPES[typeKey]?.label || typeKey, "추천", brand?.isOwn ? "자사" : "경쟁"],
        description: `${brand?.name || brandId}에서 '${CREATIVE_TYPES[typeKey]?.label || typeKey}' 유형이 반복적으로 관측됩니다. 핵심 메시지를 1개로 좁히고, 텍스트 밀도/CTA 변형으로 실험하기 좋습니다.`,
        predictedGroupScore,
        heroThumbnailUrls: top.slice(0, 8).map((x) => x.thumbnailUrl),
        assetIds: top.map((x) => x.id),
        rationale: {
          drivers,
          evidenceRefs: top.slice(0, 3).map((x) => ({
            kind: "top_asset",
            assetId: x.id,
            predictedScore: x.predictedScore,
            whyThisWorks: x.evidence?.whyThisWorks || [],
          })),
        },
      };
    };

    const typeKeys = Object.keys(CREATIVE_TYPES);
    const groups = [];
    BRANDS.forEach((b) => {
      typeKeys.forEach((typeKey, idx) => {
        // keep it compact per brand: 3 groups each
        const keep = seededRand01(`${seed}:keep:${b.id}:${typeKey}`) < 0.62;
        if (!keep) return;
        groups.push(makeGroup({ brandId: b.id, typeKey, groupIdx: idx }));
      });
    });

    // Limit to 3~6 per brand
    const byBrandId = groups.reduce((acc, g) => {
      acc[g.brandId] = acc[g.brandId] || [];
      acc[g.brandId].push(g);
      return acc;
    }, {});

    return Object.entries(byBrandId).flatMap(([brandId, gs]) =>
      gs
        .sort((a, b) => b.predictedGroupScore - a.predictedGroupScore)
        .slice(0, 5)
        .map((x) => x)
    );
  }

  function buildABTestSuggestions({ assets, seed = "ab:v1", promoId = PROMOS[0].id } = {}) {
    const promo = PROMOS.find((p) => p.id === promoId) || PROMOS[0];
    const ownBrandId = BRANDS.find((b) => b.isOwn)?.id || "oliveyoung";

    // pick 2 products for AB
    const products = PRODUCTS.slice(0, 2);

    const suggestions = products.map((p, i) => {
      const scope = { promoId: promo.id, productId: p.id, ownBrandId };
      const comparable = (assets || []).filter((a) => a.promoId === promo.id && a.productId === p.id && a.brandId === ownBrandId);
      const typeDist = distribution(comparable, (x) => x?.derivedSignals?.typeKey);
      const topType = typeDist[0]?.k || "BenefitGrid";
      const secondType = (typeDist[1]?.k || "UGCReview") === topType ? "IngredientProof" : typeDist[1]?.k || "UGCReview";

      const score = clamp(0.78 + seededRand01(`${seed}:score:${p.id}:${i}`) * 0.18, 0.72, 0.95);
      const days = score >= 0.88 ? 7 : 5;
      const budgetPerDay = Math.round(120000 * clamp(0.8 + score, 0.8, 1.8));
      const creativesPerGroup = score >= 0.9 ? 3 : 2;
      const objective = score >= 0.88 ? "구매(전환)" : "트래픽/랜딩 조회";

      const makeTypeExample = (typeKey, exIdx) => {
        const ingredient = INGREDIENTS.find((x) => x.id === p.heroIngredientId);
        const keyMessage =
          typeKey === "BenefitGrid"
            ? "쿠폰+추가할인"
            : typeKey === "IngredientProof"
              ? `${ingredient?.name} 근거`
              : typeKey === "BeforeAfterProof"
                ? "7일 변화"
                : typeKey === "UGCReview"
                  ? "리뷰 기반 신뢰"
                  : "3초 훅";

        return {
          typeKey,
          typeLabel: CREATIVE_TYPES[typeKey]?.label || typeKey,
          keyMessage,
          requiredElements: [
            typeKey === "BenefitGrid" ? "혜택 3포인트 + 숫자 1개" : null,
            typeKey === "IngredientProof" ? "성분명 배지 + 근거 2불릿" : null,
            typeKey === "BeforeAfterProof" ? "기간 + 전/후 라벨" : null,
            typeKey === "UGCReview" ? "리뷰 수치 + 실사용 문장" : null,
            typeKey === "Hook3s" ? "초반 3초 자막 훅" : null,
            "CTA 1개(고정)",
          ].filter(Boolean),
          variants: [
            { key: "v1", label: "텍스트↓", note: "카피를 1줄로 줄이고 제품 컷 비중↑" },
            { key: "v2", label: "텍스트↔", note: "핵심 불릿 2개 + CTA" },
            { key: "v3", label: "CTA↑", note: "버튼 대비를 높이고 문구를 행동형으로" },
          ].slice(0, creativesPerGroup),
          assetExamples: Array.from({ length: creativesPerGroup }).map((_, j) => ({
            id: `ab_ex_${p.id}_${typeKey}_${exIdx}_${j}`,
            thumbnailUrl: buildCreativeThumbDataUrl({
              seedStr: `${seed}:abthumb:${p.id}:${typeKey}:${exIdx}:${j}`,
              brandName: BRANDS.find((b) => b.id === ownBrandId)?.name,
              productName: p.name,
              promoKey: promo.key,
              mediaType: typeKey === "Hook3s" ? "video" : j === 0 ? "image" : "video",
              typeKey,
              keyMessage,
              ingredientName: ingredient?.name,
              ctaText: "쿠폰 받기",
            }),
          })),
        };
      };

      const groupAType = topType;
      const groupBType = groupAType === "UGCReview" ? "IngredientProof" : "UGCReview";

      return {
        id: `ab_${promo.id}_${p.id}`,
        scope,
        objective,
        periodDays: days,
        budgetPerDay,
        placements: ["IG Reels", "IG Stories", "FB Reels"],
        creativesPerGroup,
        groups: [
          {
            key: "A",
            conceptName: `${CREATIVE_TYPES[groupAType]?.label || groupAType} 강화`,
            hypothesis: "현재 반복되는 유형을 그대로 강화하면 전환 효율이 개선된다.",
            creativePlan: [makeTypeExample(groupAType, 0), makeTypeExample(secondType, 1)].slice(0, 2),
          },
          {
            key: "B",
            conceptName: `${CREATIVE_TYPES[groupBType]?.label || groupBType} 변형`,
            hypothesis: "동일 메시지를 다른 유형(정보/UGC/증거)으로 바꾸면 클릭/전환 병목이 해소된다.",
            creativePlan: [makeTypeExample(groupBType, 0), makeTypeExample("BenefitGrid", 1)].slice(0, 2),
          },
        ],
        evidence: {
          summary: "추천 근거는 ‘동일 상품/프로모션 스코프’에서 관측된 반복 유형 + 상위 성과 패턴을 기반으로 합니다.",
          drivers: [
            { label: "상위 유형", value: `${CREATIVE_TYPES[topType]?.label || topType} 비중`, pct: typeDist[0]?.pct || 0 },
            { label: "CTA 패턴", value: "쿠폰/행동형 CTA가 상위 성과에 집중", note: "mock" },
            { label: "텍스트 밀도", value: "텍스트↔ 구간에서 score 평균↑", note: "mock" },
          ],
          supportingStats: {
            topTypePct: typeDist[0]?.pct || 0,
            avgScoreTop10: Math.round(comparable.slice().sort((a, b) => b.predictedScore - a.predictedScore).slice(0, 10).reduce((s, x) => s + x.predictedScore, 0) / Math.max(1, Math.min(10, comparable.length)) * 100) / 100,
            sampleSize: comparable.length,
          },
          exampleAssetIds: comparable
            .slice()
            .sort((a, b) => b.predictedScore - a.predictedScore)
            .slice(0, 6)
            .map((x) => x.id),
        },
      };
    });

    return suggestions;
  }

  function buildCompetitiveCompareSlice({ assets, promoId = PROMOS[0].id } = {}) {
    const promo = PROMOS.find((p) => p.id === promoId) || PROMOS[0];
    const ownBrandId = BRANDS.find((b) => b.isOwn)?.id || "oliveyoung";
    const competitorBrandIds = BRANDS.filter((b) => !b.isOwn).slice(0, 3).map((b) => b.id);

    const inScope = (assets || []).filter((a) => a.promoId === promo.id);
    const byBrand = inScope.reduce((acc, a) => {
      acc[a.brandId] = acc[a.brandId] || [];
      acc[a.brandId].push(a);
      return acc;
    }, {});

    const axisDefs = [
      { axisKey: "mediaRatio", label: "미디어(영상 비중)" },
      { axisKey: "adTypeRatio", label: "광고유형(파트너십 비중)" },
      { axisKey: "topLayout", label: "Top 레이아웃" },
      { axisKey: "topCTA", label: "Top CTA" },
      { axisKey: "textBucket", label: "텍스트 비중(버킷)" },
      { axisKey: "typeMix", label: "유형 믹스(Top)" },
    ];

    const calc = (brandId) => {
      const arr = byBrand[brandId] || [];
      const total = arr.length || 1;
      const video = arr.filter((x) => x.mediaType === "video").length;
      const partnership = arr.filter((x) => x.adType === "partnership").length;

      const top = (k) => distribution(arr, k)[0]?.k;
      const bucket = (r) => (r >= 0.55 ? "텍스트↑" : r >= 0.35 ? "텍스트↔" : "텍스트↓");
      const tb = distribution(arr, (x) => bucket(x.textRatio))[0]?.k;
      const typeTop = distribution(arr, (x) => x?.derivedSignals?.typeKey)[0]?.k;

      return {
        brandId,
        total,
        videoPct: (video / total) * 100,
        partnershipPct: (partnership / total) * 100,
        topLayout: top((x) => x.layoutKey),
        topCTA: top((x) => x.ctaType),
        textBucket: tb,
        typeTop,
      };
    };

    const own = calc(ownBrandId);
    const comps = competitorBrandIds.map(calc);

    const rowsByAxis = axisDefs.map((a) => {
      if (a.axisKey === "mediaRatio") {
        return {
          axisKey: a.axisKey,
          label: a.label,
          ownValue: { kind: "pct", value: own.videoPct },
          competitorValues: comps.map((c) => ({ brandId: c.brandId, value: { kind: "pct", value: c.videoPct } })),
        };
      }
      if (a.axisKey === "adTypeRatio") {
        return {
          axisKey: a.axisKey,
          label: a.label,
          ownValue: { kind: "pct", value: own.partnershipPct },
          competitorValues: comps.map((c) => ({ brandId: c.brandId, value: { kind: "pct", value: c.partnershipPct } })),
        };
      }
      if (a.axisKey === "topLayout") {
        return {
          axisKey: a.axisKey,
          label: a.label,
          ownValue: { kind: "label", value: own.topLayout, display: LAYOUT_LIBRARY[own.topLayout]?.name || own.topLayout },
          competitorValues: comps.map((c) => ({
            brandId: c.brandId,
            value: { kind: "label", value: c.topLayout, display: LAYOUT_LIBRARY[c.topLayout]?.name || c.topLayout },
          })),
        };
      }
      if (a.axisKey === "topCTA") {
        return {
          axisKey: a.axisKey,
          label: a.label,
          ownValue: { kind: "label", value: own.topCTA, display: own.topCTA },
          competitorValues: comps.map((c) => ({ brandId: c.brandId, value: { kind: "label", value: c.topCTA, display: c.topCTA } })),
        };
      }
      if (a.axisKey === "textBucket") {
        return {
          axisKey: a.axisKey,
          label: a.label,
          ownValue: { kind: "label", value: own.textBucket, display: own.textBucket },
          competitorValues: comps.map((c) => ({ brandId: c.brandId, value: { kind: "label", value: c.textBucket, display: c.textBucket } })),
        };
      }
      return {
        axisKey: a.axisKey,
        label: a.label,
        ownValue: { kind: "label", value: own.typeTop, display: CREATIVE_TYPES[own.typeTop]?.label || own.typeTop },
        competitorValues: comps.map((c) => ({
          brandId: c.brandId,
          value: { kind: "label", value: c.typeTop, display: CREATIVE_TYPES[c.typeTop]?.label || c.typeTop },
        })),
      };
    });

    return {
      id: `cmp_${promo.id}`,
      scope: { promoId: promo.id },
      ownBrandId,
      competitorBrandIds,
      compareAxes: axisDefs,
      rowsByAxis,
    };
  }

  // ---------- Build default dataset ----------
  const DEFAULT_PROMO_ID = PROMOS[0].id;
  const assets = buildCreativeAssets({ promoId: DEFAULT_PROMO_ID, total: 120, seed: "creativeSearchV2:assets:v1" });
  const ingredientInsights = buildIngredientInsights({ assets, topN: 6 });
  const creativeTypeGroups = buildCreativeTypeGroups({ assets, seed: "creativeSearchV2:groups:v1" });
  const abTestSuggestions = buildABTestSuggestions({ assets, seed: "creativeSearchV2:ab:v1", promoId: DEFAULT_PROMO_ID });
  const competitiveCompareSlices = [buildCompetitiveCompareSlice({ assets, promoId: DEFAULT_PROMO_ID })];

  window.__APP.dataset.creativeSearchV2 = {
    version: "v2",
    generatedAt: "2026-01-16",
    promos: PROMOS,
    brands: BRANDS,
    products: PRODUCTS,
    ingredients: INGREDIENTS,
    layoutLibrary: LAYOUT_LIBRARY,
    creativeTypes: CREATIVE_TYPES,
    creativeAssets: assets,
    ingredientInsights,
    creativeTypeGroups,
    abTestSuggestions,
    competitiveCompareSlices,
    // expose builders for tuning without editing the file
    __builders: {
      buildCreativeAssets,
      buildIngredientInsights,
      buildCreativeTypeGroups,
      buildABTestSuggestions,
      buildCompetitiveCompareSlice,
      buildCreativeThumbDataUrl,
    },
  };
})();

