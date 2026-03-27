// Monthly trend results page (time-query: "이번 달 많이 사용된 소재 뭐야?")
// This module registers itself to window.__APP.pages.creativeSearchMonthlyTrend
//
// Requirements snapshot:
// - Month fixed: 2026-01 (local timezone)
// - Week: Sunday~Saturday, display full week boundaries (W1: 12/28~1/3 ...)
// - Season bracket fixed: 1/1~1/4 "신년맞이 프로모션"
// - 200+ creatives, image:video ~ 4:6
// - Weekly clusters: 3~5 clusters/week, 5~30 creatives/cluster (natural distribution)
// - Latest week has at least 1 meme-usage cluster
// - Top summary: promo + weekly Top3 clusters (fold UI) with thumbnails
// - Brand share charts: ingredient-focused vs composition-focused
// - Chat UI same as creative-search.jsx, with meme recommendation flow

(function registerCreativeSearchMonthlyTrendPage() {
  const { Pill, Drawer, SectionHeader, Tabs, PageShell, KpiStrip, AccordionSection, BackToTopButton, MiniBarRow, ChatPanel, badgeHighEfficiency } = window.__APP.ui;
  const { clamp, hashStringToInt, seededRand01, pick: pickOne, pickWeighted, distribution } = window.__APP.helpers;

  // ---------- Constants ----------
  const QUERY_LABEL = "이번 달 많이 사용된 소재 뭐야?";

  const MONTH = {
    year: 2026,
    monthIndex: 0, // Jan
  };

  const PROMO = {
    name: "신년맞이 프로모션",
    start: new Date(MONTH.year, MONTH.monthIndex, 1),
    end: new Date(MONTH.year, MONTH.monthIndex, 4),
  };

  // Brands from shared dataset with fallback
  const _ds = window.__APP.dataset && window.__APP.dataset.creativeSearchV2;
  const BRANDS = _ds ? _ds.brands : [
    { id: "oliveyoung", name: "올리브영", isOwn: true, thumbUrl: "./assets/thumbs/oliveyoung.svg" },
    { id: "innisfree", name: "이니스프리", thumbUrl: "./assets/thumbs/innisfree.svg" },
    { id: "roundlab", name: "라운드랩", thumbUrl: "./assets/thumbs/roundlab.svg" },
    { id: "hera", name: "헤라", thumbUrl: "./assets/thumbs/hera.svg" },
    { id: "labiotte", name: "라비오뜨", thumbUrl: "./assets/thumbs/labiotte.svg" },
    { id: "mediheal", name: "메디힐" },
    { id: "drg", name: "닥터지" },
    { id: "beplain", name: "비플레인" },
  ];

  const INFLUENCERS = [
    { id: "inf_1", name: "민지", handle: "@minji_daily", niche: "뷰티/데일리", followers: "128K", avatar: "🧑🏻‍🎤" },
    { id: "inf_2", name: "수아", handle: "@sua_makeup", niche: "메이크업", followers: "312K", avatar: "💄" },
    { id: "inf_3", name: "지훈", handle: "@jihoon_review", niche: "리뷰/비교", followers: "86K", avatar: "📦" },
    { id: "inf_4", name: "예린", handle: "@yerin_beauty", niche: "스킨케어", followers: "410K", avatar: "🧴" },
    { id: "inf_5", name: "하늘", handle: "@haneul_reels", niche: "숏폼/밈", followers: "520K", avatar: "🎬" },
  ];

  // Image layouts: align with creative-search.jsx keys
  const IMAGE_LAYOUTS = ["hero-product-left", "hero-model-center", "grid-3-benefits", "ugc-caption-heavy", "before-after-split"];

  // Video layouts: align with creative-search-key-message.jsx classes
  const VIDEO_LAYOUTS = ["plot", "composition", "hook-3s", "demo"];

  const CTA_TYPES = ["구매하기", "자세히 보기", "할인 받기", "쿠폰 받기", "지금 보기"];
  const KEY_MESSAGE_TYPES = ["혜택", "신뢰", "전후", "성분", "구성", "UGC", "밈 사용"];

  const MEME_LIBRARY = [
    {
      id: "meme_1",
      title: "POV 리액션 컷 편집",
      summary: "상황(POV) 자막 → 짧은 리액션 컷 → 제품 포인트로 전환하는 편집이 많이 사용됩니다.",
      usageHint: "초수 2~3초에 상황 자막을 크게 넣고, 전환 시점에 CTA를 얹어주세요.",
    },
    {
      id: "meme_2",
      title: "문답(Yes/No) 템플릿",
      summary: "화면을 양분해 질문/답을 빠르게 보여주고, 마지막에 제품 추천으로 연결합니다.",
      usageHint: "Yes/No 2~3턴 이후 ‘그래서 추천은?’으로 후킹을 유지합니다.",
    },
    {
      id: "meme_3",
      title: "밈 사운드 + 자막 싱크",
      summary: "유행 사운드에 맞춘 짧은 자막 싱크로 몰입을 만들고, 제품 컷을 1~2회 반복 노출합니다.",
      usageHint: "제품 컷은 0.5~0.8초로 짧게, 자막은 키워드만 크게.",
    },
    {
      id: "meme_4",
      title: "전/후 과장 리액션(UGC)",
      summary: "전/후를 과장 리액션으로 연결해 시청 지속을 유도하고 ‘증거’ 프레임을 강화합니다.",
      usageHint: "전/후 컷 사이에 ‘3일차/7일차’ 같은 타임스탬프를 넣으면 설득력이 좋아집니다.",
    },
  ];

  // ---------- Helpers (page-specific; shared ones imported above) ----------
  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function fmtYMD(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function fmtMD(d) {
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  function addDays(d, days) {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
  }

  function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  function endOfDay(d) {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  }

  function weekStartSunday(d) {
    const x = startOfDay(d);
    x.setDate(x.getDate() - x.getDay());
    return x;
  }

  function weekEndSaturday(d) {
    return endOfDay(addDays(weekStartSunday(d), 6));
  }

  function intersects(aStart, aEnd, bStart, bEnd) {
    return aStart.getTime() <= bEnd.getTime() && bStart.getTime() <= aEnd.getTime();
  }

  function inRange(date, start, end) {
    const t = date.getTime();
    return t >= start.getTime() && t <= end.getTime();
  }

  function rangeIntersection(aStart, aEnd, bStart, bEnd) {
    if (!intersects(aStart, aEnd, bStart, bEnd)) return null;
    const s = new Date(Math.max(aStart.getTime(), bStart.getTime()));
    const e = new Date(Math.min(aEnd.getTime(), bEnd.getTime()));
    return { start: s, end: e };
  }

  function groupBy(arr, keyFn) {
    return arr.reduce((acc, x) => {
      const k = keyFn(x);
      acc[k] = acc[k] || [];
      acc[k].push(x);
      return acc;
    }, {});
  }

  function getBrand(brandId) {
    return BRANDS.find((b) => b.id === brandId);
  }

  function buildThumbDataUrl({ seedStr, brandName, mediaType, keyMessageType, token }) {
    const r = (k) => seededRand01(`${seedStr}:${k}`);
    const bgList = [
      ["#e0f2fe", "#2563eb", "#0ea5e9"],
      ["#dcfce7", "#16a34a", "#22c55e"],
      ["#faf5ff", "#6d28d9", "#8b5cf6"],
      ["#fff7ed", "#c2410c", "#f97316"],
      ["#fff1f2", "#be123c", "#ef4444"],
      ["#fefce8", "#ca8a04", "#eab308"],
    ];
    const pal = bgList[Math.floor(r("pal") * bgList.length)];
    const [bg, c1, c2] = pal;
    const safeBrand = (brandName || "BR").replace(/[<>&]/g, "").slice(0, 6);
    const brandMark = safeBrand.replace(/\s+/g, "").slice(0, 2);
    const tkn = (token || "").replace(/[<>&]/g, "").slice(0, 6);
    const isVideo = mediaType === "video";

    const stroke = "rgba(0,0,0,0.08)";
    const chipBg = "rgba(255,255,255,0.86)";
    const text = "#0f172a";
    const accent = `url(#accent)`;
    const km = (keyMessageType || "").slice(0, 4);

    const blockStyle = isVideo
      ? `
        <rect x="6" y="18" width="52" height="34" rx="10" fill="rgba(255,255,255,0.76)" stroke="${stroke}"/>
        <circle cx="32" cy="35" r="9" fill="rgba(15,23,42,0.32)"/>
        <path d="M30 30.5 L38 35 L30 39.5 Z" fill="#fff"/>
      `
      : `
        <rect x="6" y="18" width="24" height="40" rx="10" fill="rgba(255,255,255,0.78)" stroke="${stroke}"/>
        <rect x="33" y="22" width="25" height="7" rx="3.5" fill="rgba(15,23,42,0.12)"/>
        <rect x="33" y="33" width="21" height="6" rx="3" fill="rgba(15,23,42,0.10)"/>
        <rect x="33" y="43" width="23" height="6" rx="3" fill="rgba(15,23,42,0.10)"/>
        <rect x="33" y="52" width="23" height="8" rx="4" fill="${chipBg}" stroke="${stroke}"/>
        <text x="44.5" y="58.2" text-anchor="middle" font-size="6.2" font-weight="800"
          font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="${text}">CTA</text>
      `;

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect x="1" y="1" width="62" height="62" rx="14" fill="${bg}"/>
  <path d="M-5 44 C 10 36, 22 50, 36 44 C 46 40, 56 32, 72 38 L 72 72 L -5 72 Z" fill="${accent}" opacity="0.55"/>
  <rect x="1" y="1" width="62" height="62" rx="14" fill="none" stroke="${stroke}"/>

  <rect x="6" y="6" width="16" height="10" rx="5" fill="${chipBg}" stroke="${stroke}"/>
  <text x="14" y="13.2" text-anchor="middle" font-size="6.2" font-weight="900"
    font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="${text}">${brandMark}</text>

  ${isVideo ? `<rect x="44" y="6" width="14" height="10" rx="5" fill="rgba(15,23,42,0.72)"/>
  <text x="51" y="13.2" text-anchor="middle" font-size="6.2" font-weight="900"
    font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="#fff">VID</text>` : ""}

  <text x="32" y="19" text-anchor="middle" font-size="7" font-weight="800"
    font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="${text}" opacity="0.92">${tkn}</text>

  <text x="32" y="27" text-anchor="middle" font-size="6.2" font-weight="800"
    font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="${text}" opacity="0.9">${km}</text>

  ${blockStyle}
</svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function buildWeeksForMonth({ year, monthIndex }) {
    const monthStart = startOfDay(new Date(year, monthIndex, 1));
    const monthEnd = endOfDay(new Date(year, monthIndex + 1, 0));

    const start = weekStartSunday(monthStart);
    const out = [];
    let cursor = start;
    let i = 0;
    while (cursor.getTime() <= monthEnd.getTime()) {
      const wStart = startOfDay(cursor);
      const wEnd = weekEndSaturday(cursor);
      if (intersects(wStart, wEnd, monthStart, monthEnd)) {
        i += 1;
        out.push({
          key: `W${i}`,
          index: i,
          start: wStart,
          end: wEnd,
          monthIntersection: rangeIntersection(wStart, wEnd, monthStart, monthEnd),
        });
      }
      cursor = addDays(cursor, 7);
    }
    return { weeks: out, monthStart, monthEnd };
  }

  function allocateClusterSizes({ clusterCount, targetTotal, minSize = 5, maxSize = 30, seedStr }) {
    // Guarantee minSize per cluster, then distribute remainder deterministically.
    const sizes = new Array(clusterCount).fill(minSize);
    let remaining = targetTotal - minSize * clusterCount;
    remaining = Math.max(0, remaining);

    // First pass: add variable bumps with random caps
    const caps = sizes.map((_, i) => {
      const r = seededRand01(`${seedStr}:cap:${i}`);
      return Math.min(maxSize, minSize + Math.floor(r * (maxSize - minSize + 1)));
    });

    let guard = 0;
    while (remaining > 0 && guard < 20000) {
      guard += 1;
      const i = Math.floor(seededRand01(`${seedStr}:pick:${guard}`) * clusterCount);
      if (sizes[i] < caps[i]) {
        sizes[i] += 1;
        remaining -= 1;
      } else {
        // If picked full, try a different index next loop
      }
      // If all are capped, break to avoid infinite loop
      if (guard % 200 === 0) {
        const full = sizes.every((s, idx) => s >= caps[idx]);
        if (full) break;
      }
    }

    // If still remaining (rare), spill within absolute maxSize
    guard = 0;
    while (remaining > 0 && guard < 20000) {
      guard += 1;
      const i = guard % clusterCount;
      if (sizes[i] < maxSize) {
        sizes[i] += 1;
        remaining -= 1;
      } else {
        const allMaxed = sizes.every((s) => s >= maxSize);
        if (allMaxed) break;
      }
    }

    return sizes;
  }

  function buildWeekClusters({ week, seedBase }) {
    const clusterCount = 3 + (hashStringToInt(`${seedBase}:${week.key}:clusterCount`) % 3); // 3~5
    const baseSeed = `${seedBase}:${week.key}`;

    const clusterTemplates = [];
    for (let i = 0; i < clusterCount; i++) {
      const r0 = seededRand01(`${baseSeed}:cluster:${i}:r0`);
      const r1 = seededRand01(`${baseSeed}:cluster:${i}:r1`);
      const r2 = seededRand01(`${baseSeed}:cluster:${i}:r2`);

      const keyMessageType = pickWeighted(KEY_MESSAGE_TYPES, [0.19, 0.18, 0.12, 0.18, 0.15, 0.12, 0.06], r0);
      const ctaType = pickOne(CTA_TYPES, r1);
      const includeInfluencer = r2 < 0.28 || keyMessageType === "UGC";
      const mediaBias = r1 < 0.6 ? "video" : "mixed"; // keep overall video-heavy

      const layoutPool =
        mediaBias === "video"
          ? VIDEO_LAYOUTS
          : keyMessageType === "전후"
            ? ["before-after-split", "plot", "demo", "hook-3s"]
            : keyMessageType === "성분"
              ? ["hero-product-left", "grid-3-benefits", "composition", "demo"]
              : keyMessageType === "구성"
                ? ["grid-3-benefits", "composition", "plot", "hero-product-left"]
                : keyMessageType === "혜택"
                  ? ["grid-3-benefits", "hook-3s", "composition", "ugc-caption-heavy"]
                  : ["ugc-caption-heavy", "plot", "hero-model-center", "composition"];

      clusterTemplates.push({
        id: `${week.key}_cl_${i + 1}`,
        weekKey: week.key,
        name: "",
        chips: [],
        description: "",
        spec: { keyMessageType, ctaType, includeInfluencer, mediaBias, layoutPool, memeUsage: false, memeTag: null },
      });
    }

    // Guarantee meme cluster in latest week (week.index is 1..; latest is max index)
    // We will set this for W5 only (month fixed, so latest week is last element).
    if (week.isLatest) {
      const idx = hashStringToInt(`${seedBase}:${week.key}:memePick`) % clusterTemplates.length;
      const memeCluster = clusterTemplates[idx];
      memeCluster.spec.memeUsage = true;
      memeCluster.spec.keyMessageType = "밈 사용";
      memeCluster.spec.includeInfluencer = true; // meme cluster tends to be influencer/UGC-like
      memeCluster.spec.mediaBias = "video";
      memeCluster.spec.layoutPool = ["hook-3s", "plot", "composition", "demo"];
      memeCluster.spec.memeTag = pickOne(MEME_LIBRARY.map((m) => m.title), seededRand01(`${seedBase}:${week.key}:memeTag`));
    }

    // Fill name/chips/description
    clusterTemplates.forEach((cl, i) => {
      const km = cl.spec.keyMessageType;
      const layoutHint = cl.spec.layoutPool[0];
      const mediaText = cl.spec.mediaBias === "video" ? "영상 중심" : "이미지/영상 혼합";
      const infText = cl.spec.includeInfluencer ? "인플루언서/UGC 포함" : "브랜드 메시지 중심";

      const name =
        km === "밈 사용"
          ? `밈 사용 숏폼 클러스터`
          : km === "성분"
            ? `성분 근거형 정보 클러스터`
            : km === "구성"
              ? `구성/라인업 큐레이션 클러스터`
              : km === "전후"
                ? `전/후 증거형 클러스터`
                : km === "혜택"
                  ? `혜택/쿠폰 강조 클러스터`
                  : km === "신뢰"
                    ? `리뷰/신뢰 강화 클러스터`
                    : `UGC 텍스트 비중 클러스터`;

      const chips = [
        km,
        mediaText,
        `CTA: ${cl.spec.ctaType}`,
        infText,
        cl.spec.memeUsage && cl.spec.memeTag ? `밈: ${cl.spec.memeTag}` : null,
        `레이아웃: ${layoutHint}`,
      ].filter(Boolean);

      const description =
        km === "밈 사용"
          ? `유행하는 밈/템플릿을 초수 훅에 적용하고, 짧은 컷 편집으로 몰입을 만든 뒤 CTA로 전환하는 소재가 묶인 클러스터입니다.`
          : `레이아웃(${layoutHint})과 키 메시지(${km}), CTA(${cl.spec.ctaType}) 조합이 반복적으로 나타나는 소재를 묶은 클러스터입니다.`;

      cl.name = name;
      cl.chips = chips;
      cl.description = description;
      cl.rankHint = i + 1;
    });

    return clusterTemplates;
  }

  function buildMonthlyDataset({ totalTarget = 260, seed = "monthly-trend:v1" } = {}) {
    const { weeks, monthStart, monthEnd } = buildWeeksForMonth(MONTH);
    const latestWeekKey = weeks[weeks.length - 1]?.key;
    const promoRange = { start: startOfDay(PROMO.start), end: endOfDay(PROMO.end) };

    // Compute day weights by intersection days (Jan only)
    const daysInMonth = Math.round((endOfDay(monthEnd).getTime() - startOfDay(monthStart).getTime()) / (24 * 3600 * 1000)) + 1;
    const weekDayCounts = weeks.map((w) => {
      const inter = w.monthIntersection;
      if (!inter) return 0;
      const s = startOfDay(inter.start);
      const e = startOfDay(inter.end);
      return Math.round((e.getTime() - s.getTime()) / (24 * 3600 * 1000)) + 1;
    });

    let remaining = totalTarget;
    const weekTargets = weeks.map((w, idx) => {
      const weight = weekDayCounts[idx] / Math.max(1, daysInMonth);
      const t = Math.round(totalTarget * weight);
      return t;
    });

    // Rebalance rounding to exact totalTarget
    let sumTargets = weekTargets.reduce((s, x) => s + x, 0);
    const deltas = weekTargets.map((t, i) => ({ i, frac: (totalTarget * (weekDayCounts[i] / Math.max(1, daysInMonth))) - t }));
    deltas.sort((a, b) => b.frac - a.frac);
    while (sumTargets < totalTarget) {
      const pick = deltas.shift();
      if (!pick) break;
      weekTargets[pick.i] += 1;
      sumTargets += 1;
    }
    while (sumTargets > totalTarget) {
      const pick = deltas.pop();
      if (!pick) break;
      if (weekTargets[pick.i] > 0) {
        weekTargets[pick.i] -= 1;
        sumTargets -= 1;
      } else {
        break;
      }
    }

    const clustersByWeek = {};
    const creatives = [];

    let globalId = 0;
    weeks.forEach((week, wIdx) => {
      const isLatest = week.key === latestWeekKey;
      const clusters = buildWeekClusters({ week: { ...week, isLatest }, seedBase: seed });

      const targetTotal = Math.max(20, weekTargets[wIdx] || 0); // keep each week rich enough
      const sizes = allocateClusterSizes({
        clusterCount: clusters.length,
        targetTotal,
        minSize: 5,
        maxSize: 30,
        seedStr: `${seed}:${week.key}:sizes`,
      });

      // Ensure the latest week's meme cluster is always prominent (Top3),
      // so the Chat "Yes" action can reliably scroll/highlight it.
      if (isLatest) {
        const memeIdx = clusters.findIndex((c) => c?.spec?.memeUsage);
        if (memeIdx >= 0 && sizes.length > 0) {
          const maxSize = Math.max(...sizes);
          const maxIdx = sizes.indexOf(maxSize);
          if (maxIdx >= 0 && maxIdx !== memeIdx) {
            const tmp = sizes[memeIdx];
            sizes[memeIdx] = sizes[maxIdx];
            sizes[maxIdx] = tmp;
          }
        }
      }

      clusters.forEach((c, idx) => {
        c.size = sizes[idx];
      });

      clustersByWeek[week.key] = clusters;

      // Generate creatives for each cluster
      clusters.forEach((cl, cIdx) => {
        const inter = week.monthIntersection;
        // In this page, we consider “이번 달(2026-01)” creatives only.
        // Week label may extend outside month, but counts are based on month intersection.
        if (!inter) return;
        const interStart = startOfDay(inter.start);
        const interEnd = startOfDay(inter.end);
        const daySpan = Math.round((interEnd.getTime() - interStart.getTime()) / (24 * 3600 * 1000)) + 1;

        for (let i = 0; i < cl.size; i++) {
          globalId += 1;
          const seedStr = `${seed}:c:${week.key}:${cl.id}:${i}`;
          const r0 = seededRand01(`${seedStr}:r0`);
          const r1 = seededRand01(`${seedStr}:r1`);
          const r2 = seededRand01(`${seedStr}:r2`);
          const r3 = seededRand01(`${seedStr}:r3`);
          const r4 = seededRand01(`${seedStr}:r4`);

          const dayOffset = Math.floor(r0 * Math.max(1, daySpan));
          const date = addDays(interStart, dayOffset);
          // spread within day
          date.setHours(Math.floor(r1 * 24), Math.floor(r2 * 60), 0, 0);

          const brand = pickWeighted(
            BRANDS,
            BRANDS.map((b) => (b.isOwn ? 1.3 : 1.0)),
            seededRand01(`${seedStr}:brand`)
          );

          // Focus for brand-share charts
          const focus = pickWeighted(["ingredient", "composition", "other"], [0.34, 0.28, 0.38], seededRand01(`${seedStr}:focus`));

          // Media type ratio ~ 4:6 overall, with cluster bias
          const mediaType = (() => {
            const baseVideo = 0.6;
            const bias = cl.spec.mediaBias === "video" ? 0.18 : 0.0;
            const pVideo = clamp(baseVideo + bias, 0.1, 0.9);
            return seededRand01(`${seedStr}:media`) < pVideo ? "video" : "image";
          })();

          const layoutClass = (() => {
            const pool = cl.spec.layoutPool || [];
            const r = seededRand01(`${seedStr}:layoutPick`);
            const pick = pickOne(pool, r);
            const isVideoLayout = VIDEO_LAYOUTS.includes(pick);
            const isImageLayout = IMAGE_LAYOUTS.includes(pick);
            if (mediaType === "video") {
              if (isVideoLayout) return pick;
              return pickOne(VIDEO_LAYOUTS, r3);
            }
            if (isImageLayout) return pick;
            return pickOne(IMAGE_LAYOUTS, r4);
          })();

          const influencer =
            cl.spec.includeInfluencer && seededRand01(`${seedStr}:inf`) < 0.72
              ? pickOne(INFLUENCERS, seededRand01(`${seedStr}:infPick`))
              : null;

          const runDays = 3 + Math.floor(seededRand01(`${seedStr}:run`) * 13); // 3~15
          const predictedScore = clamp(0.55 + Math.pow(seededRand01(`${seedStr}:score`), 0.6) * 0.42, 0.55, 0.97);

          const kmType = cl.spec.keyMessageType;
          const keyMessage =
            kmType === "혜택"
              ? pickOne(["쿠폰/추가할인", "타임딜", "한정 혜택", "세트 할인", "무료배송"], seededRand01(`${seedStr}:km`))
              : kmType === "신뢰"
                ? pickOne(["리뷰 기반", "실사용 후기", "전문가 추천", "인플루언서 검증"], seededRand01(`${seedStr}:km`))
                : kmType === "전후"
                  ? pickOne(["7일 변화", "전/후 비교", "2주 루틴", "Before & After"], seededRand01(`${seedStr}:km`))
                  : kmType === "성분"
                    ? pickOne(["나이아신아마이드", "레티놀", "비타민C", "세라마이드", "시카"], seededRand01(`${seedStr}:km`))
                    : kmType === "구성"
                      ? pickOne(["3종 세트", "라인업 구성", "키트 구성", "조합 추천"], seededRand01(`${seedStr}:km`))
                      : kmType === "UGC"
                        ? pickOne(["찐후기 톤", "캡션 중심", "댓글 반응", "리액션 컷"], seededRand01(`${seedStr}:km`))
                        : pickOne(["POV 템플릿", "Yes/No 템플릿", "사운드 싱크", "리액션 컷"], seededRand01(`${seedStr}:km`));

          const memeUsage = !!cl.spec.memeUsage;
          const memeTag = memeUsage ? cl.spec.memeTag || keyMessage : null;

          const token = focus === "ingredient" ? "성분" : focus === "composition" ? "구성" : kmType;

          creatives.push({
            id: `mt_${String(globalId).padStart(4, "0")}`,
            date,
            dateYmd: fmtYMD(date),
            weekKey: week.key,
            clusterId: cl.id,
            clusterName: cl.name,
            brandId: brand.id,
            mediaType,
            layoutClass,
            keyMessage,
            keyMessageType: kmType,
            ctaType: cl.spec.ctaType,
            focus,
            influencer,
            memeUsage,
            memeTag,
            runDays,
            predictedScore,
            thumbUrl: buildThumbDataUrl({
              seedStr: `${seedStr}:thumb`,
              brandName: brand.name,
              mediaType,
              keyMessageType: kmType,
              token,
            }),
          });
        }
      });
    });

    const monthOnly = creatives
      .filter((c) => inRange(c.date, startOfDay(monthStart), endOfDay(monthEnd)))
      .sort((a, b) => b.predictedScore - a.predictedScore);

    const promoOnly = monthOnly.filter((c) => inRange(c.date, promoRange.start, promoRange.end));

    const latestMemeCluster = (() => {
      const latestWeekCreatives = monthOnly.filter((c) => c.weekKey === latestWeekKey);
      const meme = latestWeekCreatives.find((c) => c.memeUsage);
      if (!meme) return null;
      return { weekKey: meme.weekKey, clusterId: meme.clusterId };
    })();

    return {
      seed,
      monthStart,
      monthEnd,
      weeks,
      promo: PROMO,
      promoRange,
      clustersByWeek,
      creatives: monthOnly,
      promoCreatives: promoOnly,
      latestWeekKey,
      latestMemeCluster,
    };
  }

  // ---------- UI bits ----------
  function ClusterThumbStrip({ creatives, max = 10 }) {
    const list = (creatives || []).slice(0, max);
    return (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {list.map((c) => (
          <img
            key={c.id}
            src={c.thumbUrl}
            alt="thumbnail"
            className="h-8 w-8 rounded-lg border bg-white object-cover"
            loading="lazy"
            draggable="false"
          />
        ))}
      </div>
    );
  }

  function CreativeCard({ creative, onClick }) {
    const brand = getBrand(creative.brandId);
    return (
      <button onClick={onClick} className="w-full rounded-2xl border bg-white p-4 text-left hover:bg-zinc-50">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-0 truncate font-semibold">
                {creative.clusterName} <span className="text-zinc-500">· {brand?.name || creative.brandId}</span>
              </div>
              <Pill tone={creative.mediaType === "video" ? "purple" : "neutral"}>{creative.mediaType === "video" ? "영상" : "이미지"}</Pill>
              {creative.memeUsage && <Pill tone="amber">밈 사용</Pill>}
              {badgeHighEfficiency(creative) && <Pill tone="green">고효율 예상</Pill>}
            </div>
            <div className="mt-2 text-sm text-zinc-700 line-clamp-2">
              키 메시지: {creative.keyMessage} · CTA: {creative.ctaType} · 레이아웃: {creative.layoutClass}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill tone={creative.focus === "ingredient" ? "blue" : creative.focus === "composition" ? "amber" : "neutral"}>
                {creative.focus === "ingredient" ? "성분 강조" : creative.focus === "composition" ? "제품 구성 강조" : "기타"}
              </Pill>
              <Pill>운영 {creative.runDays}d</Pill>
              <Pill>score {Math.round(creative.predictedScore * 100)}</Pill>
              <Pill tone="blue">{creative.dateYmd}</Pill>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <img
              src={creative.thumbUrl}
              alt="thumbnail"
              className="h-14 w-14 rounded-xl border bg-white object-cover"
              loading="lazy"
              draggable="false"
            />
          </div>
        </div>
      </button>
    );
  }

  // ---------- Page Root ----------
  function CreativeSearchMonthlyTrendPage() {
    const seed = "monthly-trend:v1";
    const data = useMemo(() => buildMonthlyDataset({ totalTarget: 260, seed }), []);

    const [activeTab, setActiveTab] = useState("summary"); // summary | breakdown | library
    const [summaryCollapsed, setSummaryCollapsed] = useState(true);
    const [selectedCreative, setSelectedCreative] = useState(null);
    const [clusterModal, setClusterModal] = useState({ open: false, weekKey: null, clusterId: null });
    const [chatOpen, setChatOpen] = useState(false);
    const [highlight, setHighlight] = useState({ weekKey: null, clusterId: null });

    const mockTotalResults = useMemo(() => {
      const base = 280;
      const jitter = hashStringToInt(`${QUERY_LABEL}:${seed}`) % 160; // 0~159
      return base + jitter; // 280~439
    }, [seed]);

    const searchTimeMs = useMemo(() => {
      const base = 120 + data.creatives.length * 0.68;
      const jitter = hashStringToInt(`${seed}:${data.creatives.length}:${mockTotalResults}`) % 220;
      return Math.round(clamp(base + jitter, 90, 820));
    }, [data.creatives.length, mockTotalResults, seed]);

    const creativesByWeek = useMemo(() => groupBy(data.creatives, (c) => c.weekKey), [data.creatives]);

    const clustersByWeekWithCreatives = useMemo(() => {
      const out = {};
      data.weeks.forEach((w) => {
        const clusters = (data.clustersByWeek[w.key] || []).map((cl) => {
          const list = (creativesByWeek[w.key] || []).filter((c) => c.clusterId === cl.id);
          return { ...cl, creatives: list };
        });
        out[w.key] = clusters.sort((a, b) => (b.creatives?.length || 0) - (a.creatives?.length || 0));
      });
      return out;
    }, [data.clustersByWeek, data.weeks, creativesByWeek]);

    const promoClusters = useMemo(() => {
      const byCluster = groupBy(data.promoCreatives, (c) => c.clusterId);
      const list = Object.entries(byCluster).map(([clusterId, arr]) => {
        const any = arr[0];
        return {
          clusterId,
          clusterName: any?.clusterName || clusterId,
          weekKey: any?.weekKey || "-",
          count: arr.length,
          chips: (clustersByWeekWithCreatives[any?.weekKey] || []).find((x) => x.id === clusterId)?.chips || [],
          creatives: arr,
        };
      });
      return list.sort((a, b) => b.count - a.count);
    }, [clustersByWeekWithCreatives, data.promoCreatives]);

    const insightLines = useMemo(() => {
      const total = data.creatives.length || 1;
      const topKm = distribution(data.creatives, (c) => c.keyMessageType)[0];
      const topCta = distribution(data.creatives, (c) => c.ctaType)[0];
      const topMedia = distribution(data.creatives, (c) => c.mediaType)[0];

      const w5 = data.latestWeekKey;
      const w5Clusters = clustersByWeekWithCreatives[w5] || [];
      const memeCluster = w5Clusters.find((cl) => (cl.creatives || []).some((c) => c.memeUsage));

      const line1 = `이번 달(2026년 1월) 검색 결과는 '${topKm?.k || "키 메시지"}' 중심이며, CTA는 '${topCta?.k || "자세히 보기"}'가 두드러집니다.`;
      const line2 = memeCluster
        ? `주차별로는 ${topMedia?.k === "video" ? "영상" : "이미지"} 비중이 높고, 최신 주차(${w5})에는 '밈 사용' 클러스터(예: ${
            memeCluster.name
          })가 포함되어 트렌드형 숏폼이 강화되는 흐름입니다.`
        : `주차별로는 ${topMedia?.k === "video" ? "영상" : "이미지"} 비중이 높고, 최신 주차(${w5})에서 숏폼/UGC 계열이 강화되는 흐름입니다.`;
      return { line1, line2, total };
    }, [clustersByWeekWithCreatives, data.creatives, data.latestWeekKey]);

    const topTrends = useMemo(() => {
      return distribution(data.creatives, (c) => c.keyMessageType).slice(0, 3);
    }, [data.creatives]);

    const openCluster = (weekKey, clusterId) => setClusterModal({ open: true, weekKey, clusterId });

    const currentCluster = useMemo(() => {
      if (!clusterModal.open) return null;
      const list = clustersByWeekWithCreatives[clusterModal.weekKey] || [];
      return list.find((cl) => cl.id === clusterModal.clusterId) || null;
    }, [clusterModal, clustersByWeekWithCreatives]);

    const memeAnchorId = useMemo(() => {
      const m = data.latestMemeCluster;
      if (!m) return null;
      return `meme-${m.weekKey}-${m.clusterId}`;
    }, [data.latestMemeCluster]);

    const gotoMemeCluster = () => {
      const m = data.latestMemeCluster;
      if (!m) return;
      setSummaryCollapsed(false);
      setHighlight({ weekKey: m.weekKey, clusterId: m.clusterId });
      // allow layout to expand before scrolling
      setTimeout(() => {
        const el = document.getElementById(`meme-${m.weekKey}-${m.clusterId}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 80);
      // clear highlight after a bit
      setTimeout(() => setHighlight({ weekKey: null, clusterId: null }), 2800);
    };

    return (
      <PageShell
        title="소재 검색 결과 (월간 트렌드)"
        subtitle="이번 달(2026년 1월) 트렌드를 요약하고, 필요할 때만 주차별 클러스터/전체 예시로 확장합니다."
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
                { key: "t", label: "총", value: `${mockTotalResults}건` },
                { key: "ms", label: "검색 시간", value: `${searchTimeMs}ms`, tone: "amber" },
              ]}
            />
          </>
        }
      >
        {activeTab === "summary" && (
          <>
            <div className="rounded-2xl border bg-white p-4">
              <SectionHeader title="검색결과 인사이트" subtitle="자연어 요약(2줄)" />
              <div className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">
                <div>{insightLines.line1}</div>
                <div className="mt-1">{insightLines.line2}</div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <SectionHeader
                title="이번 달 Top 트렌드 3"
                subtitle="키 메시지 타입 기준"
                right={
                  <button
                    type="button"
                    onClick={() => {
                      gotoMemeCluster();
                      setActiveTab("breakdown");
                    }}
                    className="rounded-xl border bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                  >
                    최신 밈 클러스터로 이동
                  </button>
                }
              />
              <div className="grid gap-3 md:grid-cols-3">
                {topTrends.map((t) => (
                  <div key={t.k} className="rounded-2xl border bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold">{t.k}</div>
                      <Pill>{t.pct.toFixed(0)}%</Pill>
                    </div>
                    <div className="mt-3">
                      <MiniBarRow label="비중" valuePct={t.pct} tone="zinc" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "breakdown" && (
          <>
            {/* Summary (fold) */}
            <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">검색 결과 요약</div>
                <div className="text-sm text-zinc-600">프로모션 브래킷 + 주차별 Top3 클러스터 특징을 확인합니다.</div>
              </div>
              <button
                type="button"
                onClick={() => setSummaryCollapsed((v) => !v)}
                className="rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
              >
                {summaryCollapsed ? "펼치기" : "접기"}
              </button>
            </div>

            {summaryCollapsed ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill tone="blue">
                  {PROMO.name} {fmtMD(PROMO.start)}~{fmtMD(PROMO.end)}
                </Pill>
                {data.weeks.map((w) => (
                  <Pill key={w.key}>
                    {w.key} {fmtMD(w.start)}~{fmtMD(w.end)}
                  </Pill>
                ))}
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {/* Promo bracket card */}
                <div className="rounded-2xl border bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold">{PROMO.name}</div>
                      <div className="text-sm text-zinc-600">
                        시즌 브래킷 {fmtYMD(PROMO.start)} ~ {fmtYMD(PROMO.end)}
                      </div>
                    </div>
                    <Pill tone="blue">{data.promoCreatives.length}개 소재</Pill>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {promoClusters.slice(0, 3).map((cl) => (
                      <Pill key={cl.clusterId} tone="green">
                        {cl.clusterName} ({cl.count})
                      </Pill>
                    ))}
                    {promoClusters.length === 0 && <Pill>클러스터 데이터 없음</Pill>}
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {promoClusters.slice(0, 3).map((cl) => (
                      <div key={cl.clusterId} className="rounded-2xl border bg-zinc-50 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 truncate font-semibold">{cl.clusterName}</div>
                          <Pill tone="blue">{cl.count}개</Pill>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(cl.chips || []).slice(0, 4).map((x) => (
                            <Pill key={x} tone="blue">
                              {x}
                            </Pill>
                          ))}
                        </div>
                        <ClusterThumbStrip creatives={cl.creatives} max={10} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly cards */}
                <div className="grid gap-4">
                  {data.weeks.map((w) => {
                    const clusters = clustersByWeekWithCreatives[w.key] || [];
                    const totalInWeek = (creativesByWeek[w.key] || []).length;
                    return (
                      <div key={w.key} className="rounded-2xl border bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold">
                              {w.key} <span className="text-zinc-500">{fmtYMD(w.start)} ~ {fmtYMD(w.end)}</span>
                            </div>
                            <div className="text-sm text-zinc-600">
                              이번 달 기준 집계: {w.monthIntersection ? `${fmtYMD(w.monthIntersection.start)}~${fmtYMD(w.monthIntersection.end)}` : "-"}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Pill>{totalInWeek}개 소재</Pill>
                            <Pill tone="amber">클러스터 {clusters.length}개</Pill>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {clusters.slice(0, 3).map((cl) => (
                            <Pill key={cl.id} tone="green">
                              {cl.name} ({cl.creatives?.length || 0})
                            </Pill>
                          ))}
                        </div>

                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          {clusters.slice(0, 3).map((cl) => {
                            const anchorId = cl.spec?.memeUsage ? `meme-${w.key}-${cl.id}` : null;
                            const highlighted = highlight.weekKey === w.key && highlight.clusterId === cl.id;
                            return (
                              <div
                                key={cl.id}
                                id={anchorId || undefined}
                                className={`rounded-2xl border bg-zinc-50 p-3 ${highlighted ? "ring-2 ring-amber-400" : ""}`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="min-w-0 truncate font-semibold">{cl.name}</div>
                                    <div className="mt-1 text-xs text-zinc-600 line-clamp-2">{cl.description}</div>
                                  </div>
                                  <div className="shrink-0 text-right">
                                    {cl.spec?.memeUsage && <Pill tone="amber">밈 사용</Pill>}
                                    <div className="mt-1 text-xs text-zinc-500">{cl.creatives?.length || 0}개</div>
                                  </div>
                                </div>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  {(cl.chips || []).slice(0, 4).map((x) => (
                                    <Pill key={x} tone="blue">
                                      {x}
                                    </Pill>
                                  ))}
                                </div>

                                <ClusterThumbStrip creatives={cl.creatives} max={10} />

                                <div className="mt-3 flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openCluster(w.key, cl.id)}
                                    className="rounded-xl border bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
                                  >
                                    클러스터 보기
                                  </button>
                                  {cl.spec?.memeUsage && (
                                    <button
                                      type="button"
                                      onClick={() => setChatOpen(true)}
                                      className="rounded-xl border bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
                                    >
                                      밈 추천 받기
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          </>
        )}

        {activeTab === "library" && (
          <>
            {/* Results list */}
            <div className="rounded-2xl border bg-white p-4">
            <SectionHeader
              title="검색 결과 카드 리스트"
              subtitle="고효율 예상 뱃지(runDays ≥ 7) 포함"
              right={
                <Pill>
                  상위 {Math.min(36, data.creatives.length)} / {data.creatives.length} 결과
                </Pill>
              }
            />
            <div className="grid gap-3 md:grid-cols-2">
              {data.creatives.slice(0, 36).map((c) => (
                <CreativeCard key={c.id} creative={c} onClick={() => setSelectedCreative(c)} />
              ))}
            </div>
          </div>
          </>
        )}

        {/* Creative detail drawer */}
        <Drawer
          open={!!selectedCreative}
          title={selectedCreative ? `소재 상세 · ${selectedCreative.id}` : "소재 상세"}
          onClose={() => setSelectedCreative(null)}
          width="w-[min(720px,calc(100%-2rem))]"
        >
          {selectedCreative && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="blue">{getBrand(selectedCreative.brandId)?.name || selectedCreative.brandId}</Pill>
                <Pill tone={selectedCreative.mediaType === "video" ? "purple" : "neutral"}>
                  {selectedCreative.mediaType === "video" ? "영상" : "이미지"}
                </Pill>
                {selectedCreative.memeUsage && <Pill tone="amber">밈 사용</Pill>}
                {badgeHighEfficiency(selectedCreative) && <Pill tone="green">고효율 예상</Pill>}
                <Pill>{selectedCreative.weekKey}</Pill>
              </div>

              <div className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700">
                <div>날짜: {selectedCreative.dateYmd}</div>
                <div>클러스터: {selectedCreative.clusterName}</div>
                <div>키 메시지: {selectedCreative.keyMessageType} · {selectedCreative.keyMessage}</div>
                <div>CTA: {selectedCreative.ctaType}</div>
                <div>레이아웃: {selectedCreative.layoutClass}</div>
                <div>
                  포커스: {selectedCreative.focus === "ingredient" ? "성분 강조" : selectedCreative.focus === "composition" ? "제품 구성 강조" : "기타"}
                </div>
                {selectedCreative.influencer && (
                  <div>
                    인플루언서: {selectedCreative.influencer.avatar} {selectedCreative.influencer.name}{" "}
                    <span className="text-zinc-500">{selectedCreative.influencer.handle}</span>
                  </div>
                )}
                {selectedCreative.memeUsage && selectedCreative.memeTag && <div>밈 태그: {selectedCreative.memeTag}</div>}
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={selectedCreative.thumbUrl}
                  alt="thumbnail"
                  className="h-20 w-20 rounded-2xl border bg-white object-cover"
                  loading="lazy"
                  draggable="false"
                />
                <div className="text-sm text-zinc-700">
                  운영 {selectedCreative.runDays}일 · score {Math.round(selectedCreative.predictedScore * 100)}
                </div>
              </div>
            </div>
          )}
        </Drawer>

        {/* Cluster drawer */}
        <Drawer
          open={clusterModal.open}
          title={
            currentCluster
              ? `클러스터 · ${clusterModal.weekKey} / ${currentCluster.name}`
              : `클러스터 · ${clusterModal.weekKey || ""}`
          }
          onClose={() => setClusterModal({ open: false, weekKey: null, clusterId: null })}
          width="w-[min(760px,calc(100%-2rem))]"
        >
          {currentCluster && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {(currentCluster.chips || []).map((x) => (
                  <Pill key={x} tone="blue">
                    {x}
                  </Pill>
                ))}
                <Pill tone="amber">{currentCluster.creatives?.length || 0}개</Pill>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700">{currentCluster.description}</div>
              <div className="grid gap-3 md:grid-cols-2">
                {(currentCluster.creatives || []).slice(0, 24).map((c) => (
                  <CreativeCard key={c.id} creative={c} onClick={() => setSelectedCreative(c)} />
                ))}
              </div>
            </div>
          )}
        </Drawer>

        <ChatPanel
          open={chatOpen}
          onOpenChange={setChatOpen}
          config={{
            title: "소재 도우미",
            disclaimer: "프로토타입에서는 사전 설정된 응답을 제공합니다.",
            initialMessages: [
              { role: "assistant", text: "새로운 소재 기획이 필요하신가요? 최근 트렌드인 '밈 사용' 을 추천합니다.\n최근 트렌드를 추천해드릴까요?" },
            ],
            onSend: function (text, { pushAssistant }) {
              var normalized = text.replace(/\s+/g, "").toLowerCase();
              if (normalized === "네" || normalized === "yes" || normalized === "y") {
                pushAssistant("밈 추천을 확인해 보세요.", { type: "meme_list", memes: MEME_LIBRARY.slice(0, 3) });
                pushAssistant("해당 밈을 사용한 소재를 만들어보시겠습니까?", { type: "meme_cta" });
              } else {
                pushAssistant("프로토타입에서는 밈 추천 흐름만 제공됩니다. '네' 라고 입력하시면 최근 트렌드 밈을 요약해드릴게요.");
              }
            },
            renderMessage: function (msg, i) {
              if (msg.type === "meme_list" && msg.memes) {
                return (
                  <div className="mr-auto max-w-[95%] rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-800">
                    <div className="font-semibold">최근 한국 인스타그램/틱톡 밈 요약</div>
                    <div className="mt-2 space-y-2">
                      {msg.memes.map(function (mm) {
                        return (
                          <div key={mm.id} className="rounded-xl border bg-white p-2 text-sm text-zinc-900">
                            <div className="font-semibold">{mm.title}</div>
                            <div className="mt-1 text-xs text-zinc-700">{mm.summary}</div>
                            <div className="mt-1 text-xs text-zinc-500">활용 팁: {mm.usageHint}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              if (msg.type === "meme_cta") {
                return (
                  <div className="mr-auto max-w-[95%] rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-800">
                    <div>{msg.text}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={function () { gotoMemeCluster(); }}
                        className="rounded-xl border bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
                      >
                        Yes
                      </button>
                    </div>
                  </div>
                );
              }
              return null;
            },
          }}
        />
        <BackToTopButton />
      </PageShell>
    );
  }

  window.__APP.pages.creativeSearchMonthlyTrend = CreativeSearchMonthlyTrendPage;
})();

