// Influencer creative results page.
// This module registers itself to window.__APP.pages.creativeSearchInfluencer

(function registerCreativeSearchInfluencerPage() {
  const {
    Pill,
    Drawer,
    SectionHeader,
    Tabs,
    PageShell,
    KpiStrip,
    AccordionSection,
    BackToTopButton,
    MiniBarRow,
    StackedBar,
  } = window.__APP.ui;

  // ---------- Constants ----------
  const QUERY_LABEL = "인플루언서 소재";

  // Keep brand style consistent with other pages (thumbUrl uses existing assets when possible).
  const BRANDS = [
    { id: "oliveyoung", name: "올리브영", isOwn: true, thumbUrl: "./assets/thumbs/oliveyoung.svg" },
    { id: "innisfree", name: "이니스프리", thumbUrl: "./assets/thumbs/innisfree.svg" },
    { id: "roundlab", name: "라운드랩", thumbUrl: "./assets/thumbs/roundlab.svg" },
    { id: "hera", name: "헤라", thumbUrl: "./assets/thumbs/hera.svg" },
    { id: "labiotte", name: "라비오뜨", thumbUrl: "./assets/thumbs/labiotte.svg" },
    { id: "beplain", name: "비플레인" },
  ];

  const FORMAT_LABEL = { story: "스토리", reels: "릴스", feed: "피드" };

  const TIER = {
    nano: { key: "nano", label: "nano", min: 0, max: 10000 },
    micro: { key: "micro", label: "micro", min: 10000, max: 100000 },
    mid: { key: "mid", label: "mid", min: 100000, max: 500000 },
    mega: { key: "mega", label: "mega", min: 500000, max: Infinity },
  };
  const TIERS = [TIER.nano, TIER.micro, TIER.mid, TIER.mega];

  const CLUSTERS = [
    {
      id: "cl_hook_3s",
      name: "3초 훅(리얼 사용감)형",
      chips: ["초수훅", "텍스처", "리얼", "자막"],
      layoutKey: "hook-3s",
      description: "첫 3초에 ‘사용감/텍스처’를 보여주고, 핵심 포인트를 큰 자막으로 빠르게 전달하는 패턴.",
    },
    {
      id: "cl_before_after",
      name: "전/후 비교 증거형",
      chips: ["전후", "기간", "증거", "정량"],
      layoutKey: "before-after-split",
      description: "기간(7일/14일)과 함께 전/후를 화면 분할로 제시해 설득력을 높이는 패턴.",
    },
    {
      id: "cl_comment_cta",
      name: "댓글 유도(저장/문의)형",
      chips: ["댓글", "DM", "저장", "질문"],
      layoutKey: "ugc-caption-heavy",
      description: "댓글/DM 유도를 명시하고, 저장해야 할 포인트를 리스트업해 참여를 높이는 패턴.",
    },
    {
      id: "cl_routine",
      name: "루틴/조합 추천형",
      chips: ["루틴", "조합", "사용순서", "추천"],
      layoutKey: "composition",
      description: "사용 순서·조합을 컷 편집으로 보여주며, 루틴을 따라 하도록 안내하는 패턴.",
    },
    {
      id: "cl_benefit_grid",
      name: "3포인트 요약형",
      chips: ["3포인트", "요약", "핵심", "한눈에"],
      layoutKey: "grid-3-benefits",
      description: "핵심 포인트 3개를 그리드로 배치해 한눈에 이해되도록 만드는 패턴.",
    },
    {
      id: "cl_trust_review",
      name: "리뷰/사회적 증거형",
      chips: ["리뷰", "수치", "인기", "신뢰"],
      layoutKey: "ugc-caption-heavy",
      description: "리뷰 수치/반복 언급 포인트를 전면에 노출해 신뢰 신호를 강화하는 패턴.",
    },
  ];

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

  function formatNumber(n) {
    if (n == null || Number.isNaN(n)) return "-";
    return Math.round(n).toLocaleString();
  }

  function formatPct(n, digits = 0) {
    const v = Math.round(n * Math.pow(10, digits)) / Math.pow(10, digits);
    return `${v.toFixed(digits)}%`;
  }

  function mean(arr) {
    if (!arr.length) return 0;
    return arr.reduce((s, x) => s + x, 0) / arr.length;
  }

  function getBrand(brandId) {
    return BRANDS.find((b) => b.id === brandId);
  }

  function getTierKeyByFollowers(f) {
    const n = Math.max(0, Number(f) || 0);
    if (n < TIER.micro.min) return TIER.nano.key;
    if (n < TIER.mid.min) return TIER.micro.key;
    if (n < TIER.mega.min) return TIER.mid.key;
    return TIER.mega.key;
  }

  function badgeHighEfficiency(item) {
    return (item?.runDays || 0) >= 7;
  }

  function overlapsLastNDays({ startDate, endDate, days = 30 }) {
    const end = new Date();
    const startWindow = new Date(end.getTime() - days * 24 * 3600 * 1000);
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    return e >= startWindow.getTime() && s <= end.getTime();
  }

  function buildAvatarDataUrl({ seedStr, label }) {
    const pal = [
      ["#0ea5e9", "#2563eb", "#e0f2fe"],
      ["#22c55e", "#16a34a", "#dcfce7"],
      ["#f59e0b", "#d97706", "#fffbeb"],
      ["#a855f7", "#7e22ce", "#faf5ff"],
      ["#ef4444", "#be123c", "#fff1f2"],
      ["#14b8a6", "#0f766e", "#ccfbf1"],
    ];
    const p = pal[Math.floor(seededRand01(`${seedStr}:pal`) * pal.length)];
    const [c1, c2, bg] = p;
    const safe = (label || "IN").replace(/[<>&]/g, "").slice(0, 2);
    const r = (k) => seededRand01(`${seedStr}:${k}`);
    const n1 = Math.floor(r("n1") * 14);
    const n2 = Math.floor(r("n2") * 18);

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
  <rect x="1" y="1" width="62" height="62" rx="16" fill="url(#bg)"/>
  <path d="M-6 46 C 12 33, 25 56, 40 46 C 50 39, 58 30, 72 38 L 72 72 L -6 72 Z" fill="url(#accent)" opacity="0.55"/>
  <circle cx="${18 + n1}" cy="${22 + n2 / 2}" r="10" fill="rgba(15,23,42,0.14)"/>
  <rect x="14" y="40" width="36" height="16" rx="8" fill="rgba(255,255,255,0.85)" stroke="rgba(0,0,0,0.08)"/>
  <text x="32" y="51.5" text-anchor="middle" font-size="12" font-weight="900"
    font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="rgba(15,23,42,0.88)">${safe}</text>
  <rect x="1" y="1" width="62" height="62" rx="16" fill="none" stroke="rgba(0,0,0,0.08)"/>
</svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function buildCreativeThumbDataUrl({ seedStr, brandName, format, clusterId, token }) {
    const pal = [
      ["#0ea5e9", "#2563eb", "#e0f2fe"],
      ["#22c55e", "#16a34a", "#dcfce7"],
      ["#f59e0b", "#d97706", "#fffbeb"],
      ["#a855f7", "#7e22ce", "#faf5ff"],
      ["#ef4444", "#be123c", "#fff1f2"],
      ["#14b8a6", "#0f766e", "#ccfbf1"],
    ];
    const p = pal[Math.floor(seededRand01(`${seedStr}:pal`) * pal.length)];
    const [c1, c2, bg] = p;
    const safeBrand = (brandName || "BR").replace(/[<>&]/g, "").slice(0, 6);
    const mark = safeBrand.replace(/\s+/g, "").slice(0, 2);
    const tkn = (token || "").replace(/[<>&]/g, "").slice(0, 6);
    const fmt = FORMAT_LABEL[format] || format || "피드";
    const cl = (clusterId || "").replace(/[<>&]/g, "").slice(0, 6);

    const r = (k) => seededRand01(`${seedStr}:${k}`);
    const n1 = Math.floor(r("n1") * 10);
    const n2 = Math.floor(r("n2") * 10);
    const stroke = "rgba(0,0,0,0.08)";
    const text = "#0f172a";

    // Minimal “layout hint” blocks by cluster type.
    let blocks = "";
    if (clusterId === "cl_before_after") {
      blocks = `
        <rect x="6" y="20" width="25" height="28" rx="9" fill="rgba(255,255,255,0.78)" stroke="${stroke}"/>
        <rect x="33" y="20" width="25" height="28" rx="9" fill="rgba(15,23,42,0.14)" />
        <rect x="31.5" y="20" width="1" height="28" fill="rgba(255,255,255,0.7)"/>
        <rect x="6" y="52" width="52" height="8" rx="4" fill="rgba(255,255,255,0.82)" stroke="${stroke}"/>
      `;
    } else if (clusterId === "cl_hook_3s") {
      blocks = `
        <rect x="6" y="20" width="52" height="30" rx="10" fill="rgba(255,255,255,0.78)" stroke="${stroke}"/>
        <text x="32" y="41" text-anchor="middle" font-size="18" font-weight="900"
          font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="rgba(15,23,42,0.75)">3s</text>
        <rect x="10" y="53" width="44" height="7" rx="3.5" fill="rgba(15,23,42,0.10)"/>
      `;
    } else if (clusterId === "cl_benefit_grid") {
      blocks = `
        <rect x="6" y="20" width="16" height="16" rx="6" fill="rgba(255,255,255,0.80)" stroke="${stroke}"/>
        <rect x="24" y="20" width="16" height="16" rx="6" fill="rgba(255,255,255,0.80)" stroke="${stroke}"/>
        <rect x="42" y="20" width="16" height="16" rx="6" fill="rgba(255,255,255,0.80)" stroke="${stroke}"/>
        <rect x="6" y="40" width="52" height="20" rx="10" fill="rgba(15,23,42,0.10)"/>
      `;
    } else {
      blocks = `
        <rect x="6" y="20" width="52" height="16" rx="8" fill="rgba(255,255,255,0.82)" stroke="${stroke}"/>
        <rect x="6" y="39" width="52" height="8" rx="4" fill="rgba(255,255,255,0.7)" stroke="${stroke}"/>
        <rect x="6" y="50" width="${44 - n1}" height="8" rx="4" fill="rgba(255,255,255,0.7)" stroke="${stroke}"/>
        <circle cx="${14 + n2}" cy="28" r="5" fill="rgba(15,23,42,0.16)"/>
      `;
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
  <path d="M-6 42 C 12 35, 24 52, 38 44 C 50 38, 58 31, 72 37 L 72 72 L -6 72 Z" fill="url(#accent)" opacity="0.55"/>
  <rect x="1" y="1" width="62" height="62" rx="14" fill="none" stroke="rgba(0,0,0,0.08)"/>
  <rect x="6" y="6" width="16" height="10" rx="5" fill="rgba(255,255,255,0.85)" stroke="rgba(0,0,0,0.08)"/>
  <text x="14" y="13.2" text-anchor="middle" font-size="6.2" font-weight="800"
    font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="${text}">${mark}</text>
  <rect x="44" y="6" width="14" height="10" rx="5" fill="rgba(15,23,42,0.72)"/>
  <text x="51" y="13.2" text-anchor="middle" font-size="6.2" font-weight="800"
    font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="#fff">${fmt.slice(0, 2)}</text>
  <text x="32" y="19" text-anchor="middle" font-size="7" font-weight="800"
    font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="${text}" opacity="0.92">${tkn}</text>
  ${blocks}
  <text x="32" y="61.3" text-anchor="middle" font-size="6.2" font-weight="800"
    font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" fill="rgba(15,23,42,0.72)">${cl}</text>
</svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function buildMockInfluencers({ total = 60, seed = "influencers:v1" } = {}) {
    const first = ["민", "서", "지", "하", "예", "수", "윤", "채", "다", "은", "주", "현", "유", "나", "아", "라", "린", "연"];
    const second = ["지", "아", "은", "윤", "서", "린", "현", "주", "민", "연", "하", "수", "채", "별", "혜", "린"];
    const niches = ["뷰티/데일리", "스킨케어", "메이크업", "루틴/템추천", "리뷰/비교", "민감성/진정", "톤업/베이스", "헤어/바디"];

    const out = [];
    for (let i = 0; i < total; i++) {
      const name = `${first[Math.floor(seededRand01(`${seed}:f:${i}`) * first.length)]}${
        second[Math.floor(seededRand01(`${seed}:s:${i}`) * second.length)]
      }`;
      const handle = `@${["daily", "beauty", "review", "routine", "makeup", "skin"][Math.floor(seededRand01(`${seed}:h1:${i}`) * 6)]}_${
        1000 + Math.floor(seededRand01(`${seed}:h2:${i}`) * 9000)
      }`;

      // Followers are log-ish distributed across tiers.
      const u = seededRand01(`${seed}:followers:${i}`);
      const followers = Math.round(Math.pow(u, 0.22) * 1200000); // 0~1.2M skewed high
      const avgLikes = Math.round(clamp(120 + Math.pow(seededRand01(`${seed}:likes:${i}`), 0.6) * 12000, 80, 16000));
      const avgComments = Math.round(clamp(6 + Math.pow(seededRand01(`${seed}:comments:${i}`), 0.65) * 520, 3, 720));

      const reelsPct = Math.round(clamp(25 + seededRand01(`${seed}:reels:${i}`) * 55, 10, 85));
      const storyPct = Math.round(clamp(10 + seededRand01(`${seed}:story:${i}`) * 40, 5, 70));
      const feedPct = clamp(100 - reelsPct - storyPct, 0, 100);
      const totalMix = reelsPct + storyPct + feedPct || 1;

      const mix = {
        storyPct: Math.round((storyPct / totalMix) * 100),
        reelsPct: Math.round((reelsPct / totalMix) * 100),
        feedPct: clamp(100 - Math.round((storyPct / totalMix) * 100) - Math.round((reelsPct / totalMix) * 100), 0, 100),
      };

      const label = name.slice(0, 2);
      const profileImageUrl = buildAvatarDataUrl({ seedStr: `${seed}:avatar:${i}`, label });

      out.push({
        id: `inf_${(i + 1).toString().padStart(3, "0")}`,
        name,
        handle,
        niche: niches[Math.floor(seededRand01(`${seed}:niche:${i}`) * niches.length)],
        followers,
        avgLikes,
        avgComments,
        formatMix: mix,
        profileImageUrl,
        profileUrl: `https://instagram.com/${handle.replace("@", "")}`,
      });
    }
    return out;
  }

  function buildMockCreatives({ total = 420, influencerRatio = 0.4, seed = "influencer-creatives:v1", influencers } = {}) {
    const tokens = ["전/후", "7일", "루틴", "텍스처", "정량", "꿀팁", "비교", "추천", "보습", "진정", "광채", "톤업"];
    const ctas = ["저장", "댓글", "DM", "자세히", "링크", "지금 보기"];

    const formats = ["story", "reels", "feed"];
    const out = [];

    const today = new Date();
    const toISO = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    for (let i = 0; i < total; i++) {
      const brand = BRANDS[Math.floor(seededRand01(`${seed}:brand:${i}`) * BRANDS.length)];
      const isInfluencerCreative = seededRand01(`${seed}:isInf:${i}`) < influencerRatio;
      const influencer = isInfluencerCreative
        ? influencers[Math.floor(seededRand01(`${seed}:infPick:${i}`) * influencers.length)]
        : null;

      const format = pickWeighted(
        formats,
        // influencer 소재는 reels 비중을 높게
        isInfluencerCreative ? [0.26, 0.52, 0.22] : [0.34, 0.38, 0.28],
        seededRand01(`${seed}:format:${i}`)
      );

      const cluster = pickWeighted(
        CLUSTERS,
        // reels일수록 훅/전후/댓글유도 쪽 가중
        format === "reels" ? [0.22, 0.18, 0.18, 0.16, 0.14, 0.12] : [0.14, 0.2, 0.18, 0.18, 0.16, 0.14],
        seededRand01(`${seed}:cluster:${i}`)
      );

      const token = tokens[Math.floor(seededRand01(`${seed}:token:${i}`) * tokens.length)];
      const runDays = 3 + Math.floor(seededRand01(`${seed}:run:${i}`) * 12); // 3~14

      const startOffsetDays = Math.floor(seededRand01(`${seed}:startOffset:${i}`) * 60); // last 60 days
      const start = new Date(today.getTime() - startOffsetDays * 24 * 3600 * 1000);
      const end = new Date(Math.min(today.getTime(), start.getTime() + runDays * 24 * 3600 * 1000));

      const predictedScore = clamp(0.55 + Math.pow(seededRand01(`${seed}:score:${i}`), 0.5) * 0.42, 0.55, 0.97);
      const title =
        isInfluencerCreative && influencer
          ? `${influencer.name} ${FORMAT_LABEL[format]} | ${cluster.name}`
          : `${brand.name} ${FORMAT_LABEL[format]} | ${cluster.name}`;

      const captionBase = [
        `${token} 포인트를 ${format === "reels" ? "짧게" : "명확히"} 보여주는 ${cluster.name} 소재.`,
        `핵심은 '${cluster.chips[0]}'와 '${cluster.chips[1]}' 신호를 빠르게 전달하는 것.`,
        `CTA는 '${ctas[Math.floor(seededRand01(`${seed}:cta:${i}`) * ctas.length)]}' 중심으로 유도.`,
      ];

      const caption = captionBase.join(" ");
      const thumbUrl = buildCreativeThumbDataUrl({
        seedStr: `${seed}:thumb:${i}:${brand.id}`,
        brandName: brand.name,
        format,
        clusterId: cluster.id,
        token,
      });

      out.push({
        id: `ic_${(i + 1).toString().padStart(4, "0")}`,
        brandId: brand.id,
        isInfluencerCreative,
        influencerId: influencer?.id || null,
        format,
        title,
        caption,
        runDays,
        startDate: toISO(start),
        endDate: toISO(end),
        predictedScore,
        clusterId: cluster.id,
        clusterLabel: cluster.name,
        thumbUrl,
      });
    }
    return out;
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

  // ---------- UI Pieces ----------
  function StatCard({ label, value, sub }) {
    return (
      <div className="rounded-xl border bg-white p-3">
        <div className="text-xs text-zinc-500">{label}</div>
        <div className="mt-1 text-sm font-semibold text-zinc-900">{value}</div>
        {sub ? <div className="mt-1 text-[11px] text-zinc-500">{sub}</div> : null}
      </div>
    );
  }

  function InfluencerCard({ influencer, meta, onClick }) {
    if (!influencer) return null;
    const tierKey = getTierKeyByFollowers(influencer.followers);
    const tierTone = tierKey === "mega" ? "purple" : tierKey === "mid" ? "blue" : tierKey === "micro" ? "amber" : "zinc";
    return (
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-semibold">
                {influencer.name} <span className="text-zinc-500">{influencer.handle}</span>
              </div>
              <Pill tone={tierTone}>{TIERS.find((t) => t.key === tierKey)?.label}</Pill>
              {meta?.score != null && <Pill tone="green">추천 score {Math.round(meta.score * 100)}</Pill>}
            </div>
            <div className="mt-1 text-xs text-zinc-600">{influencer.niche}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill>팔로워 {formatNumber(influencer.followers)}</Pill>
              <Pill>평균 좋아요 {formatNumber(influencer.avgLikes)}</Pill>
              <Pill>평균 댓글 {formatNumber(influencer.avgComments)}</Pill>
              <Pill>
                스토리 {influencer.formatMix.storyPct}% · 릴스 {influencer.formatMix.reelsPct}% · 피드 {influencer.formatMix.feedPct}%
              </Pill>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <img
              src={influencer.profileImageUrl}
              alt={`${influencer.name} profile`}
              className="h-14 w-14 rounded-2xl border bg-white object-cover"
              loading="lazy"
              draggable="false"
            />
            <a
              href={influencer.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border bg-white px-2 py-1 text-xs text-zinc-900 hover:bg-zinc-50"
              onClick={(e) => e.stopPropagation()}
            >
              프로필 바로가기
            </a>
            {onClick ? (
              <button
                type="button"
                onClick={onClick}
                className="rounded-xl border bg-zinc-900 px-2 py-1 text-xs font-semibold text-white hover:bg-zinc-800"
              >
                추천 이유 보기
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  function CreativeCard({ item, influencer, onClick }) {
    const brand = getBrand(item.brandId);
    const cluster = CLUSTERS.find((c) => c.id === item.clusterId);
    const isInf = item.isInfluencerCreative;
    const formatTone = item.format === "reels" ? "purple" : item.format === "story" ? "amber" : "blue";
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-2xl border bg-white p-4 text-left text-zinc-900 hover:bg-zinc-50"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-0 truncate font-semibold">
                {item.title} <span className="text-zinc-500">· {brand?.name || item.brandId}</span>
              </div>
              {isInf ? <Pill tone="purple">인플루언서 소재</Pill> : <Pill>비인플루언서</Pill>}
              <Pill tone={formatTone}>{FORMAT_LABEL[item.format] || item.format}</Pill>
              {badgeHighEfficiency(item) && <Pill tone="green">고효율 예상</Pill>}
            </div>
            <div className="mt-2 text-sm text-zinc-700 line-clamp-2">{item.caption}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill tone="blue">클러스터: {cluster?.name || item.clusterLabel}</Pill>
              {isInf && influencer ? <Pill>인플루언서: {influencer.handle}</Pill> : null}
              <Pill>운영 {item.startDate} ~ {item.endDate}</Pill>
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
      </button>
    );
  }

  function ChatPanel({ open, onOpenChange }) {
    const [draft, setDraft] = useState("");
    const [messages, setMessages] = useState([]);
    const bottomRef = useRef(null);

    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages.length, open]);

    useEffect(() => {
      if (!open) return;
      // When opened first time, show the required prompt.
      setMessages((prev) => {
        if (prev.length > 0) return prev;
        return [{ role: "assistant", text: "적합한 인플루언서를 탐색해보시겠습니까?" }];
      });
    }, [open]);

    const send = () => {
      const text = draft.trim();
      if (!text) return;
      setDraft("");

      const normalized = text.replace(/\s+/g, "");
      const assistantText =
        normalized === "네" ? "정식 제품에서는 인플루언서 시딩도 도와드릴게요." : "원하시면 “네”라고 입력해 주세요.";

      setMessages((prev) => [...prev, { role: "user", text }, { role: "assistant", text: assistantText }]);
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
              placeholder="“네”라고 입력해 추천 탐색을 진행해보세요."
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

  // ---------- Page ----------
  function CreativeSearchInfluencerPage() {
    const influencers = useMemo(() => buildMockInfluencers({ total: 60, seed: "inf:v1" }), []);
    const influencerById = useMemo(() => Object.fromEntries(influencers.map((x) => [x.id, x])), [influencers]);

    // 전체 소재 풀(비중 계산용)
    const allCreatives = useMemo(
      () =>
        buildMockCreatives({
          total: 420,
          influencerRatio: 0.4,
          seed: "ic:v1",
          influencers,
        }),
      [influencers]
    );

    const [activeTab, setActiveTab] = useState("summary"); // summary | breakdown | library
    const [selectedCreative, setSelectedCreative] = useState(null);
    const [selectedInfluencerId, setSelectedInfluencerId] = useState(null);
    const [clusterModal, setClusterModal] = useState({ open: false, clusterId: null });
    const [hiCollapsed, setHiCollapsed] = useState(true);
    const [brandCollapsed, setBrandCollapsed] = useState(true);
    const [resultLimit, setResultLimit] = useState(36);
    const [showAllRecommended, setShowAllRecommended] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    // 검색어가 “인플루언서 소재”인 경우: 결과는 인플루언서 소재만 구성
    const influencerCreatives = useMemo(() => allCreatives.filter((c) => c.isInfluencerCreative), [allCreatives]);
    const results = influencerCreatives;

    const stats = useMemo(() => {
      const total = allCreatives.length || 1; // 전체 소재 풀 기준
      const influencerCount = influencerCreatives.length;
      const sharePct = (influencerCount / total) * 100;

      const infIds = Array.from(new Set(influencerCreatives.map((c) => c.influencerId).filter(Boolean)));
      const usedInfluencers = infIds.map((id) => influencerById[id]).filter(Boolean);

      const avgFollowers = mean(usedInfluencers.map((x) => x.followers));
      const avgLikes = mean(usedInfluencers.map((x) => x.avgLikes));
      const avgComments = mean(usedInfluencers.map((x) => x.avgComments));
      const formatDist = distribution(influencerCreatives, (c) => c.format);
      const reelsPct = (formatDist.find((d) => d.k === "reels")?.pct || 0).toFixed(0);

      const last30 = influencerCreatives.filter((c) => overlapsLastNDays({ startDate: c.startDate, endDate: c.endDate, days: 30 })).length;
      const hi = influencerCreatives.filter((c) => badgeHighEfficiency(c)).length;

      return {
        total,
        influencerCount,
        sharePct,
        usedInfluencersCount: usedInfluencers.length,
        avgFollowers,
        avgLikes,
        avgComments,
        reelsPct: Number(reelsPct),
        last30,
        hi,
      };
    }, [allCreatives, influencerCreatives, influencerById]);

    const insightLines = useMemo(() => {
      const line1 = `전체 ${formatNumber(stats.total)}건 중 인플루언서 소재는 ${formatNumber(stats.influencerCount)}건(${formatPct(
        stats.sharePct,
        0
      )})으로, 릴스 비중이 ${formatPct(stats.reelsPct, 0)}로 높습니다.`;
      const line2 = `인플루언서(중복 제거 ${formatNumber(stats.usedInfluencersCount)}명) 평균 팔로워는 ${formatNumber(
        stats.avgFollowers
      )}이며, 최근 30일 집행된 인플루언서 소재는 ${formatNumber(stats.last30)}건입니다.`;
      return { line1, line2 };
    }, [stats]);

    const highEfficiencyCreatives = useMemo(() => {
      return [...influencerCreatives]
        .filter((c) => badgeHighEfficiency(c))
        .sort((a, b) => b.predictedScore - a.predictedScore)
        .slice(0, 12);
    }, [influencerCreatives]);

    const highEfficiencyInsights = useMemo(() => {
      const hi = influencerCreatives.filter((c) => badgeHighEfficiency(c));
      const fmtTop = distribution(hi, (c) => c.format)[0];
      const clTop = distribution(hi, (c) => c.clusterId)[0];

      const tierTop = (() => {
        const tiers = hi
          .map((c) => influencerById[c.influencerId])
          .filter(Boolean)
          .map((inf) => getTierKeyByFollowers(inf.followers));
        return distribution(tiers, (x) => x)[0];
      })();

      const clName = (id) => CLUSTERS.find((c) => c.id === id)?.name || id;
      const tierLabel = (k) => TIERS.find((t) => t.key === k)?.label || k;

      // Always output 3~5 lines (use computed tops + a couple stable heuristics).
      const lines = [
        fmtTop ? `${FORMAT_LABEL[fmtTop.k] || fmtTop.k} 포맷 비중이 높습니다 (${fmtTop.pct.toFixed(0)}%).` : "릴스/스토리 중심으로 분포합니다.",
        clTop ? `클러스터는 '${clName(clTop.k)}' 계열이 자주 등장합니다 (${clTop.pct.toFixed(0)}%).` : "전/후·훅·루틴 계열 패턴이 반복됩니다.",
        tierTop ? `인플루언서 등급은 ${tierLabel(tierTop.k)} 비중이 두드러집니다 (${tierTop.pct.toFixed(0)}%).` : "micro~mid 중심으로 운영됩니다.",
        "운영 기간이 7일 이상으로 길게 유지되는 소재가 ‘고효율 예상’으로 묶입니다.",
      ].slice(0, 4);

      return lines;
    }, [influencerCreatives, influencerById]);

    const brandCards = useMemo(() => {
      const byBrand = BRANDS.map((b) => {
        const infPosts = influencerCreatives.filter((c) => c.brandId === b.id);
        const hiInfPosts = infPosts.filter((c) => badgeHighEfficiency(c));

        const tierDist = (() => {
          const tiers = infPosts
            .map((c) => influencerById[c.influencerId])
            .filter(Boolean)
            .map((inf) => getTierKeyByFollowers(inf.followers));
          const dist = distribution(tiers, (x) => x);
          const byKey = Object.fromEntries(dist.map((d) => [d.k, d.pct]));
          return {
            nano: byKey.nano || 0,
            micro: byKey.micro || 0,
            mid: byKey.mid || 0,
            mega: byKey.mega || 0,
          };
        })();

        const common = (() => {
          const fmt = distribution(infPosts, (c) => c.format)[0];
          const cl = distribution(infPosts, (c) => c.clusterId)[0];
          const lineA = fmt ? `주요 포맷: ${FORMAT_LABEL[fmt.k] || fmt.k} (${fmt.pct.toFixed(0)}%)` : "주요 포맷: -";
          const lineB = cl ? `자주 쓰는 패턴: ${CLUSTERS.find((x) => x.id === cl.k)?.name || cl.k}` : "자주 쓰는 패턴: -";
          const lineC = `인플루언서 소재 ${formatNumber(infPosts.length)}건`;
          return [lineA, lineB, lineC];
        })();

        const commonHi = (() => {
          const fmt = distribution(hiInfPosts, (c) => c.format)[0];
          const cl = distribution(hiInfPosts, (c) => c.clusterId)[0];
          const lineA = fmt ? `고효율 예상 포맷: ${FORMAT_LABEL[fmt.k] || fmt.k} (${fmt.pct.toFixed(0)}%)` : "고효율 예상 포맷: -";
          const lineB = cl ? `고효율 예상 패턴: ${CLUSTERS.find((x) => x.id === cl.k)?.name || cl.k}` : "고효율 예상 패턴: -";
          const lineC = `고효율 예상 인플루언서 소재 ${formatNumber(hiInfPosts.length)}건`;
          return [lineA, lineB, lineC];
        })();

        const clusters = (() => {
          const dist = distribution(infPosts, (c) => c.clusterId).slice(0, 6);
          return dist.map((d) => ({
            clusterId: d.k,
            name: CLUSTERS.find((x) => x.id === d.k)?.name || d.k,
            pct: d.pct,
          }));
        })();

        return {
          brandId: b.id,
          brandName: b.name,
          isOwn: !!b.isOwn,
          totalInf: infPosts.length,
          tierDist,
          common,
          commonHi,
          clusters,
        };
      })
        .filter((x) => x.totalInf > 0)
        .sort((a, b) => {
          if (a.isOwn && !b.isOwn) return -1;
          if (!a.isOwn && b.isOwn) return 1;
          return b.totalInf - a.totalInf;
        });

      return byBrand;
    }, [influencerCreatives, influencerById]);

    const recommendedInfluencers = useMemo(() => {
      // score: engagement proxy + count of high-efficiency influencer creatives they appear in.
      const counts = influencerCreatives.reduce((acc, c) => {
        if (!c.influencerId) return acc;
        acc[c.influencerId] = acc[c.influencerId] || { total: 0, hi: 0 };
        acc[c.influencerId].total += 1;
        if (badgeHighEfficiency(c)) acc[c.influencerId].hi += 1;
        return acc;
      }, {});

      const list = influencers.map((inf) => {
        const c = counts[inf.id] || { total: 0, hi: 0 };
        const engagement = (inf.avgLikes + inf.avgComments) / Math.max(1, inf.followers);
        const score = clamp(0.55 + engagement * 9 + Math.min(0.18, c.hi * 0.02), 0, 1);
        return { influencer: inf, meta: { ...c, engagement, score } };
      });

      return list
        .sort((a, b) => b.meta.score - a.meta.score || b.meta.hi - a.meta.hi || b.meta.engagement - a.meta.engagement)
        .slice(0, 8);
    }, [influencers, influencerCreatives]);

    const selectedInfluencer = useMemo(() => {
      if (!selectedInfluencerId) return null;
      return influencerById[selectedInfluencerId] || null;
    }, [influencerById, selectedInfluencerId]);

    const selectedInfluencerMeta = useMemo(() => {
      if (!selectedInfluencerId) return null;
      return recommendedInfluencers.find((x) => x.influencer.id === selectedInfluencerId)?.meta || null;
    }, [recommendedInfluencers, selectedInfluencerId]);

    const selectedInfluencerExamples = useMemo(() => {
      if (!selectedInfluencerId) return [];
      return [...results]
        .filter((c) => c.influencerId === selectedInfluencerId)
        .sort((a, b) => b.predictedScore - a.predictedScore)
        .slice(0, 12);
    }, [results, selectedInfluencerId]);

    const searchTimeMs = useMemo(() => {
      const base = 130 + results.length * 0.62;
      const jitter = hashStringToInt(`${QUERY_LABEL}:${results.length}`) % 180;
      return Math.round(clamp(base + jitter, 90, 820));
    }, [results.length]);

    const openCluster = (clusterId) => setClusterModal({ open: true, clusterId });
    const currentCluster = useMemo(() => CLUSTERS.find((c) => c.id === clusterModal.clusterId) || null, [clusterModal]);

    return (
      <PageShell
        title="소재 검색 결과 (인플루언서 소재)"
        subtitle="추천 인플루언서를 빠르게 확인하고, 필요할 때만 분해/전체 리스트로 내려갑니다."
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
                { key: "t", label: "총", value: `${formatNumber(results.length)}건` },
                { key: "ms", label: "검색 시간", value: `${searchTimeMs}ms`, tone: "amber" },
              ]}
            />
          </>
        }
      >
        {activeTab === "summary" && (
          <>
            {/* 1) Natural language summary + stat cards */}
            <div className="rounded-2xl border bg-white p-4">
            <SectionHeader title="인플루언서 소재 일반 요약" />
            <div className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">
              <div>{insightLines.line1}</div>
              <div className="mt-1">{insightLines.line2}</div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <StatCard
                label="인플루언서 소재 비중"
                value={`${formatNumber(stats.influencerCount)} / ${formatNumber(stats.total)} (${formatPct(stats.sharePct, 0)})`}
                sub="동일 검색결과 내 전체 소재 대비"
              />
              <StatCard label="평균 팔로워 수" value={formatNumber(stats.avgFollowers)} sub="인플루언서 소재 참여 인플루언서 기준" />
              <StatCard label="평균 좋아요/댓글" value={`${formatNumber(stats.avgLikes)} / ${formatNumber(stats.avgComments)}`} sub="인플루언서 평균 지표" />
              <StatCard label="최근 30일 집행 수" value={formatNumber(stats.last30)} sub="운영 기간이 최근 30일과 겹치는 소재" />
            </div>
          </div>

            {/* 2) Recommended influencers (Top 4) */}
            <div className="rounded-2xl border bg-white p-4">
              <SectionHeader
                title="추천 인플루언서"
                subtitle="score 상위 기준(프로토타입)"
                right={
                  <button
                    type="button"
                    onClick={() => setShowAllRecommended((v) => !v)}
                    className="rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
                  >
                    {showAllRecommended ? "접기" : "더 보기"}
                  </button>
                }
              />
              <div className="grid gap-3 md:grid-cols-2">
                {(showAllRecommended ? recommendedInfluencers : recommendedInfluencers.slice(0, 4)).map((x) => (
                  <InfluencerCard
                    key={x.influencer.id}
                    influencer={x.influencer}
                    meta={x.meta}
                    onClick={() => setSelectedInfluencerId(x.influencer.id)}
                  />
                ))}
              </div>
            </div>

            {/* 3) High-efficiency expected preview (Top 6) */}
            <div className="rounded-2xl border bg-white p-4">
              <SectionHeader
                title="고효율 예상 게시물 (Top 6)"
                subtitle="운영 기간 7일 이상 소재"
                right={
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("breakdown");
                      setHiCollapsed(false);
                    }}
                    className="rounded-xl border bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                  >
                    분해에서 더 보기
                  </button>
                }
              />
              <div className="grid gap-3 md:grid-cols-2">
                {highEfficiencyCreatives.slice(0, 6).map((c) => (
                  <CreativeCard
                    key={c.id}
                    item={c}
                    influencer={c.influencerId ? influencerById[c.influencerId] : null}
                    onClick={() => setSelectedCreative(c)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "breakdown" && (
          <>
            {/* High-efficiency expected insights (fold) */}
            <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">고효율 예상 게시물 인사이트</div>
                <div className="text-sm text-zinc-600">운영 기간 7일 이상 소재를 “고효율 예상”으로 취급합니다.</div>
              </div>
              <button
                type="button"
                onClick={() => setHiCollapsed((v) => !v)}
                className="rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
              >
                {hiCollapsed ? "펼치기" : "접기"}
              </button>
            </div>

            {hiCollapsed ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill tone="green">고효율 예상 {formatNumber(stats.hi)}건</Pill>
                <Pill tone="purple">인플루언서 소재 {formatNumber(stats.influencerCount)}건</Pill>
                <Pill>상위 {Math.min(12, highEfficiencyCreatives.length)}개 카드 노출</Pill>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-zinc-50 p-4">
                  <div className="text-sm font-semibold text-zinc-900">공통 특징 (3~5개)</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                    {highEfficiencyInsights.slice(0, 5).map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {highEfficiencyCreatives.map((c) => (
                    <CreativeCard
                      key={c.id}
                      item={c}
                      influencer={c.influencerId ? influencerById[c.influencerId] : null}
                      onClick={() => setSelectedCreative(c)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

            {/* Brand usage patterns (fold) */}
            <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">브랜드별 인플루언서 활용</div>
                <div className="text-sm text-zinc-600">브랜드별 nano/micro/mid/mega 등급 인플루언서 활용 비중과 반복 패턴을 확인합니다.</div>
              </div>
              <button
                type="button"
                onClick={() => setBrandCollapsed((v) => !v)}
                className="rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
              >
                {brandCollapsed ? "펼치기" : "접기"}
              </button>
            </div>

            {brandCollapsed ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill>브랜드 {formatNumber(brandCards.length)}개</Pill>
                <Pill tone="blue">nano/micro/mid/mega 분포 차트</Pill>
                <Pill tone="purple">클러스터 클릭 시 모달</Pill>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {/* Quick comparison chart */}
                <div className="rounded-2xl border bg-white p-4">
                  <div className="font-semibold">브랜드별 등급 분포(요약)</div>
                  <div className="mt-3 space-y-3">
                    {brandCards.slice(0, 6).map((b) => (
                      <div key={b.brandId} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-zinc-600">
                          <div className="font-semibold text-zinc-900">{b.brandName}</div>
                          <div>인플루언서 소재 {formatNumber(b.totalInf)}건</div>
                        </div>
                        <StackedBar
                          parts={[
                            { key: "nano", label: "nano", valuePct: b.tierDist.nano, className: "bg-zinc-700" },
                            { key: "micro", label: "micro", valuePct: b.tierDist.micro, className: "bg-amber-500" },
                            { key: "mid", label: "mid", valuePct: b.tierDist.mid, className: "bg-blue-500" },
                            { key: "mega", label: "mega", valuePct: b.tierDist.mega, className: "bg-violet-500" },
                          ]}
                        />
                        <div className="grid gap-2 md:grid-cols-4">
                          <MiniBarRow label="nano" valuePct={b.tierDist.nano} tone="zinc" />
                          <MiniBarRow label="micro" valuePct={b.tierDist.micro} tone="amber" />
                          <MiniBarRow label="mid" valuePct={b.tierDist.mid} tone="blue" />
                          <MiniBarRow label="mega" valuePct={b.tierDist.mega} tone="purple" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Per brand cards */}
                <div className="grid gap-4 md:grid-cols-2">
                  {brandCards.map((b) => (
                    <div key={b.brandId} className="rounded-2xl border bg-white p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-base font-semibold">{b.brandName}</div>
                          {b.isOwn ? <Pill tone="blue">자사</Pill> : null}
                          <Pill>인플루언서 소재 {formatNumber(b.totalInf)}건</Pill>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-sm font-semibold">등급 분포</div>
                        <div className="mt-2">
                          <StackedBar
                            parts={[
                              { key: "nano", label: "nano", valuePct: b.tierDist.nano, className: "bg-zinc-700" },
                              { key: "micro", label: "micro", valuePct: b.tierDist.micro, className: "bg-amber-500" },
                              { key: "mid", label: "mid", valuePct: b.tierDist.mid, className: "bg-blue-500" },
                              { key: "mega", label: "mega", valuePct: b.tierDist.mega, className: "bg-violet-500" },
                            ]}
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl bg-zinc-50 p-3">
                          <div className="text-sm font-semibold text-zinc-900">공통 특징</div>
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                            {b.common.slice(0, 3).map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-2xl bg-zinc-50 p-3">
                          <div className="text-sm font-semibold text-zinc-900">고효율 예상 공통 특징</div>
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                            {b.commonHi.slice(0, 3).map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-sm font-semibold">클러스터 (클릭 시 모달)</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {b.clusters.slice(0, 6).map((cl) => (
                            <button
                              key={`${b.brandId}:${cl.clusterId}`}
                              type="button"
                              onClick={() => openCluster(cl.clusterId)}
                              className="rounded-full border bg-white px-3 py-1.5 text-xs text-zinc-900 hover:bg-zinc-50"
                              title={`${cl.name} (${cl.pct.toFixed(1)}%)`}
                            >
                              {cl.name} · {cl.pct.toFixed(0)}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          </>
        )}

        {activeTab === "library" && (
          <>
            {/* Result list (limited) */}
            <div className="rounded-2xl border bg-white p-4">
            <SectionHeader
              title="검색 결과 카드 리스트"
              subtitle="인플루언서 소재로만 구성됩니다. 카드 클릭 시 상세 모달을 확인할 수 있습니다."
              right={
                <Pill>
                  {Math.min(resultLimit, results.length)} / {formatNumber(results.length)} 결과 노출
                </Pill>
              }
            />
            <div className="grid gap-3 md:grid-cols-2">
              {[...results]
                .sort((a, b) => b.predictedScore - a.predictedScore)
                .slice(0, resultLimit)
                .map((c) => (
                  <CreativeCard
                    key={c.id}
                    item={c}
                    influencer={c.influencerId ? influencerById[c.influencerId] : null}
                    onClick={() => setSelectedCreative(c)}
                  />
                ))}
            </div>
            {results.length > resultLimit && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setResultLimit((prev) => prev + 36)}
                  className="rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50 inline-flex items-center gap-1"
                >
                  <span>더 보기 (+36)</span>
                  <span className="text-base leading-none">▼</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResultLimit(results.length)}
                  className="rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
                >
                  전체 보기
                </button>
              </div>
            )}
          </div>
          </>
        )}

        {/* Influencer reason drawer */}
        <Drawer
          open={!!selectedInfluencerId}
          title={selectedInfluencer ? `추천 이유 · ${selectedInfluencer.name} ${selectedInfluencer.handle}` : "추천 이유"}
          onClose={() => setSelectedInfluencerId(null)}
          width="w-[min(720px,calc(100%-2rem))]"
        >
          {selectedInfluencer && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">
                <div>
                  추천 score: <span className="font-semibold">{Math.round((selectedInfluencerMeta?.score || 0) * 100)}</span>
                </div>
                <div className="mt-1">
                  고효율 예상 소재 참여: <span className="font-semibold">{formatNumber(selectedInfluencerMeta?.hi || 0)}건</span>
                </div>
                <div className="mt-1">
                  참여 소재 수: <span className="font-semibold">{formatNumber(selectedInfluencerMeta?.total || 0)}건</span>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4">
                <div className="font-semibold">예시 소재 (Top)</div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {selectedInfluencerExamples.slice(0, 8).map((c) => (
                    <CreativeCard
                      key={c.id}
                      item={c}
                      influencer={c.influencerId ? influencerById[c.influencerId] : null}
                      onClick={() => setSelectedCreative(c)}
                    />
                  ))}
                  {selectedInfluencerExamples.length === 0 && <div className="text-sm text-zinc-600">표시할 예시가 없습니다.</div>}
                </div>
              </div>
            </div>
          )}
        </Drawer>

        {/* Creative detail drawer */}
        <Drawer
          open={!!selectedCreative}
          title={selectedCreative ? `소재 상세 · ${selectedCreative.title}` : "소재 상세"}
          onClose={() => setSelectedCreative(null)}
          width="w-[min(720px,calc(100%-2rem))]"
        >
          {selectedCreative && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="blue">{getBrand(selectedCreative.brandId)?.name}</Pill>
                {selectedCreative.isInfluencerCreative ? <Pill tone="purple">인플루언서 소재</Pill> : <Pill>비인플루언서</Pill>}
                <Pill tone={selectedCreative.format === "reels" ? "purple" : selectedCreative.format === "story" ? "amber" : "blue"}>
                  {FORMAT_LABEL[selectedCreative.format] || selectedCreative.format}
                </Pill>
                {badgeHighEfficiency(selectedCreative) && <Pill tone="green">고효율 예상</Pill>}
                <Pill>runDays {selectedCreative.runDays}</Pill>
                <Pill>score {Math.round(selectedCreative.predictedScore * 100)}</Pill>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border bg-white p-4">
                  <div className="font-semibold">게시물(소재) 정보</div>
                  <div className="mt-2 space-y-1 text-sm text-zinc-700">
                    <div>운영 기간: {selectedCreative.startDate} ~ {selectedCreative.endDate}</div>
                    <div>클러스터: {CLUSTERS.find((c) => c.id === selectedCreative.clusterId)?.name || selectedCreative.clusterLabel}</div>
                    <div className="mt-2 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700">{selectedCreative.caption}</div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">썸네일</div>
                    <img
                      src={selectedCreative.thumbUrl}
                      alt="creative thumbnail"
                      className="h-14 w-14 rounded-xl border bg-white object-cover"
                      loading="lazy"
                      draggable="false"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </Drawer>

        {/* Cluster drawer */}
        <Drawer
          open={clusterModal.open}
          title={currentCluster ? `클러스터 · ${currentCluster.name}` : "클러스터"}
          onClose={() => setClusterModal({ open: false, clusterId: null })}
          width="w-[min(620px,calc(100%-2rem))]"
        >
          {currentCluster && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {(currentCluster.chips || []).map((x) => (
                  <Pill key={x} tone="blue">
                    {x}
                  </Pill>
                ))}
              </div>
              <div className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">{currentCluster.description}</div>
              <div className="rounded-2xl border bg-white p-4 text-sm text-zinc-900">해당 메시지와 레이아웃을 기준으로 소재를 만들어볼까요?</div>
            </div>
          )}
        </Drawer>

        <ChatPanel open={chatOpen} onOpenChange={setChatOpen} />
        <BackToTopButton />
      </PageShell>
    );
  }

  window.__APP.pages.creativeSearchInfluencer = CreativeSearchInfluencerPage;
})();

