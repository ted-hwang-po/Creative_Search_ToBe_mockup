// Creative Search prototype page (migrated from the previous monolithic app.jsx).
// This module registers itself to window.__APP.pages.creativeSearch

(function registerCreativeSearchPage() {
  const {
    Pill,
    Drawer,
    SectionHeader,
    Tabs,
    AccordionSection,
    PageShell,
    KpiStrip,
    BackToTopButton,
    MiniBarRow,
    BarRow,
    StackedBar,
    TypeGroupModal,
  } = window.__APP.ui;

  /**
   * Static Prototype for Creative Search Result Enhancements
   * - Mock semantic + lexical search
   * - Brand-level breakdown (image vs video, normal vs partnership)
   * - Brand repeating creative traits summary
   * - "High efficiency expected" badge when runDays >= 7
   * - Partnership section: frequent influencer profiles + partnership traits
   * - Promo section: "올영 세일" (2/28~3/6) own brand period avg + best creatives + competitor list + badges
   * - Brand clusters (max 5) with modal (chips + NL description + creatives)
   * - Recommend 2 high-efficiency clusters + AB test suggestion (budget/period/objective/placements/creative count) + layout silhouettes
   */

  // ---------- Mock Data ----------
  const PROMO = {
    key: "올영 세일",
    start: "2026-02-28",
    end: "2026-03-06",
  };

  const BRANDS = [
    {
      id: "oliveyoung",
      name: "올리브영",
      isOwn: true,
    },
    { id: "innisfree", name: "이니스프리" },
    { id: "labiotte", name: "라비오뜨" },
    { id: "roundlab", name: "라운드랩" },
    { id: "hera", name: "헤라" },
  ];

  const INFLUENCERS = [
    {
      id: "inf_1",
      name: "민지(Minji)",
      handle: "@minji_daily",
      niche: "뷰티/데일리",
      followers: "128K",
      avatar: "🧑🏻‍🎤",
    },
    {
      id: "inf_2",
      name: "수아(Sua)",
      handle: "@sua_makeup",
      niche: "메이크업",
      followers: "312K",
      avatar: "💄",
    },
    {
      id: "inf_3",
      name: "지훈(Jihoon)",
      handle: "@jihoon_review",
      niche: "리뷰/비교",
      followers: "86K",
      avatar: "📦",
    },
    {
      id: "inf_4",
      name: "예린(Yerin)",
      handle: "@yerin_beauty",
      niche: "스킨케어",
      followers: "410K",
      avatar: "🧴",
    },
  ];

  const LAYOUT_LIBRARY = {
    "hero-product-left": {
      name: "제품 히어로(좌) + 텍스트(우)",
      img: "./assets/silhouettes/hero-product-left.svg",
      silhouette:
        "┌───────────────┐\n│ ████      ░░░ │\n│ ████      ░░░ │\n│ ████      ░░░ │\n│            CTA │\n└───────────────┘",
    },
    "hero-model-center": {
      name: "모델 중심 + 하단 CTA",
      img: "./assets/silhouettes/hero-model-center.svg",
      silhouette:
        "┌───────────────┐\n│     █████     │\n│     █████     │\n│     █████     │\n│  ░░░░░  CTA    │\n└───────────────┘",
    },
    "grid-3-benefits": {
      name: "3분할 베네핏 그리드",
      img: "./assets/silhouettes/grid-3-benefits.svg",
      silhouette:
        "┌───────────────┐\n│ ░░░ ░░░ ░░░   │\n│ ░░░ ░░░ ░░░   │\n│     ████      │\n│  CTA      ░░░  │\n└───────────────┘",
    },
    "ugc-caption-heavy": {
      name: "UGC(캡션 텍스트 비중↑)",
      img: "./assets/silhouettes/ugc-caption-heavy.svg",
      silhouette:
        "┌───────────────┐\n│ ████████████  │\n│ ░░░░░░░░░░░░  │\n│ ░░░░░░░░░░░░  │\n│ CTA           │\n└───────────────┘",
    },
    "before-after-split": {
      name: "전/후 비교 스플릿",
      img: "./assets/silhouettes/before-after-split.svg",
      silhouette:
        "┌───────────────┐\n│ ████│████     │\n│ ████│████     │\n│ ░░░░│░░░░     │\n│    CTA        │\n└───────────────┘",
    },
  };

  const CTA_TYPES = ["구매하기", "자세히 보기", "할인 받기", "지금 보기", "쿠폰 받기"];
  const COPY_TYPES = ["혜택 강조", "성분/기능", "리뷰/신뢰", "긴급성", "비교/전후"];
  const HIGHLIGHTS = ["할인", "쿠폰", "1+1", "신제품", "재입고", "한정", "베스트"];

  const MOCK_CREATIVES = [
    // 올리브영(자사)
    {
      id: "c_oy_001",
      brandId: "oliveyoung",
      title: "올영세일 | 쿠폰+추가할인",
      caption: "올영 세일! 쿠폰 받기 + 추가 할인 혜택",
      tags: ["올영 세일", "쿠폰", "할인", "긴급성"],
      mediaType: "image", // image | video
      adType: "normal", // normal | partnership
      runDays: 10,
      startDate: "2026-02-28",
      endDate: "2026-03-05",
      layout: "grid-3-benefits",
      keyMessage: "쿠폰+추가할인으로 최저가",
      emphasis: "혜택",
      copyType: "긴급성",
      ctaType: "쿠폰 받기",
      ctaSize: "L",
      textRatio: 0.45,
      predictedScore: 0.86,
      thumb: "🟩",
      thumbUrl: "./assets/thumbs/oliveyoung.svg",
    },
    {
      id: "c_oy_002",
      brandId: "oliveyoung",
      title: "베스트템 TOP",
      caption: "베스트 TOP! 지금 바로 담기",
      tags: ["베스트", "혜택 강조"],
      mediaType: "video",
      adType: "normal",
      runDays: 5,
      startDate: "2026-03-02",
      endDate: "2026-03-06",
      layout: "hero-product-left",
      keyMessage: "베스트를 한 번에",
      emphasis: "큐레이션",
      copyType: "혜택 강조",
      ctaType: "구매하기",
      ctaSize: "M",
      textRatio: 0.25,
      predictedScore: 0.71,
      thumb: "🟦",
      thumbUrl: "./assets/thumbs/oliveyoung.svg",
    },
    {
      id: "c_oy_003",
      brandId: "oliveyoung",
      title: "파트너십 | 민지 픽",
      caption: "민지 픽! 세일 기간 추천템 공개",
      tags: ["파트너십", "인플루언서", "올영 세일"],
      mediaType: "video",
      adType: "partnership",
      influencerIds: ["inf_1"],
      runDays: 12,
      startDate: "2026-02-28",
      endDate: "2026-03-06",
      layout: "ugc-caption-heavy",
      keyMessage: "인플루언서 추천 + 세일 혜택",
      emphasis: "신뢰",
      copyType: "리뷰/신뢰",
      ctaType: "자세히 보기",
      ctaSize: "S",
      textRatio: 0.55,
      predictedScore: 0.9,
      thumb: "🟥",
      thumbUrl: "./assets/thumbs/oliveyoung.svg",
    },
    {
      id: "c_oy_004",
      brandId: "oliveyoung",
      title: "전/후 비교 | 7일 변화",
      caption: "7일 전/후로 확인하는 피부 변화, 지금 확인하세요",
      tags: ["전후", "비교/전후", "신뢰", "리뷰"],
      mediaType: "image",
      adType: "normal",
      runDays: 9,
      startDate: "2026-02-26",
      endDate: "2026-03-06",
      layout: "before-after-split",
      keyMessage: "7일 변화",
      emphasis: "효과",
      copyType: "비교/전후",
      ctaType: "자세히 보기",
      ctaSize: "M",
      textRatio: 0.35,
      predictedScore: 0.79,
      thumb: "🟪",
      thumbUrl: "./assets/thumbs/oliveyoung.svg",
    },
    {
      id: "c_oy_005",
      brandId: "oliveyoung",
      title: "쿠폰 | 장바구니 추가 혜택",
      caption: "세일 기간 쿠폰 + 추가 적립, 지금 담아보세요",
      tags: ["쿠폰", "할인", "긴급성", "혜택"],
      mediaType: "image",
      adType: "normal",
      runDays: 8,
      startDate: "2026-02-28",
      endDate: "2026-03-04",
      layout: "grid-3-benefits",
      keyMessage: "쿠폰+추가적립",
      emphasis: "혜택",
      copyType: "긴급성",
      ctaType: "쿠폰 받기",
      ctaSize: "L",
      textRatio: 0.52,
      predictedScore: 0.83,
      thumb: "🟩",
      thumbUrl: "./assets/thumbs/oliveyoung.svg",
    },
    {
      id: "c_oy_006",
      brandId: "oliveyoung",
      title: "리뷰 기반 추천 | 베스트",
      caption: "리뷰 상위 베스트만 모아 추천드려요",
      tags: ["리뷰", "베스트", "신뢰"],
      mediaType: "video",
      adType: "normal",
      runDays: 6,
      startDate: "2026-03-01",
      endDate: "2026-03-06",
      layout: "ugc-caption-heavy",
      keyMessage: "리뷰 기반 추천",
      emphasis: "신뢰",
      copyType: "리뷰/신뢰",
      ctaType: "지금 보기",
      ctaSize: "M",
      textRatio: 0.6,
      predictedScore: 0.76,
      thumb: "🟥",
      thumbUrl: "./assets/thumbs/oliveyoung.svg",
    },
    {
      id: "c_oy_007",
      brandId: "oliveyoung",
      title: "성분/기능 한눈에",
      caption: "핵심 성분과 기능을 한 장으로 정리",
      tags: ["성분/기능", "신뢰", "할인"],
      mediaType: "image",
      adType: "normal",
      runDays: 7,
      startDate: "2026-02-28",
      endDate: "2026-03-06",
      layout: "hero-product-left",
      keyMessage: "핵심 성분/기능 요약",
      emphasis: "성분",
      copyType: "성분/기능",
      ctaType: "자세히 보기",
      ctaSize: "M",
      textRatio: 0.33,
      predictedScore: 0.74,
      thumb: "🟦",
      thumbUrl: "./assets/thumbs/oliveyoung.svg",
    },

    // 경쟁 브랜드들
    {
      id: "c_in_001",
      brandId: "innisfree",
      title: "그린티 라인 할인",
      caption: "그린티 라인 최대 30% + 증정",
      tags: ["할인", "증정", "성분/기능"],
      mediaType: "image",
      adType: "normal",
      runDays: 9,
      startDate: "2026-02-28",
      endDate: "2026-03-06",
      layout: "hero-product-left",
      keyMessage: "그린티 보습",
      emphasis: "성분",
      copyType: "성분/기능",
      ctaType: "할인 받기",
      ctaSize: "M",
      textRatio: 0.35,
      predictedScore: 0.78,
      thumb: "🟩",
      thumbUrl: "./assets/thumbs/innisfree.svg",
    },
    {
      id: "c_in_002",
      brandId: "innisfree",
      title: "파트너십 | 수아 메이크업",
      caption: "수아가 보여주는 톤업 베이스 꿀팁",
      tags: ["파트너십", "인플루언서", "메이크업", "리뷰/신뢰", "리뷰"],
      mediaType: "video",
      adType: "partnership",
      influencerIds: ["inf_2"],
      runDays: 7,
      startDate: "2026-02-28",
      endDate: "2026-03-05",
      layout: "hero-model-center",
      keyMessage: "실사용 팁",
      emphasis: "사용법",
      copyType: "리뷰/신뢰",
      ctaType: "지금 보기",
      ctaSize: "S",
      textRatio: 0.3,
      predictedScore: 0.82,
      thumb: "🟦",
      thumbUrl: "./assets/thumbs/innisfree.svg",
    },
    {
      id: "c_in_003",
      brandId: "innisfree",
      title: "쿠폰 | 한정 혜택",
      caption: "기간 한정 쿠폰 + 무료배송 혜택",
      tags: ["쿠폰", "혜택", "긴급성", "할인"],
      mediaType: "image",
      adType: "normal",
      runDays: 8,
      startDate: "2026-02-27",
      endDate: "2026-03-06",
      layout: "grid-3-benefits",
      keyMessage: "쿠폰+무료배송",
      emphasis: "혜택",
      copyType: "긴급성",
      ctaType: "쿠폰 받기",
      ctaSize: "L",
      textRatio: 0.48,
      predictedScore: 0.76,
      thumb: "🟧",
      thumbUrl: "./assets/thumbs/innisfree.svg",
    },
    {
      id: "c_in_004",
      brandId: "innisfree",
      title: "전/후 비교 | 2주 루틴",
      caption: "2주 전/후로 확인하는 보습 변화",
      tags: ["전후", "비교/전후", "신뢰", "성분/기능"],
      mediaType: "image",
      adType: "normal",
      runDays: 10,
      startDate: "2026-02-28",
      endDate: "2026-03-06",
      layout: "before-after-split",
      keyMessage: "2주 변화",
      emphasis: "효과",
      copyType: "비교/전후",
      ctaType: "자세히 보기",
      ctaSize: "M",
      textRatio: 0.38,
      predictedScore: 0.8,
      thumb: "🟪",
      thumbUrl: "./assets/thumbs/innisfree.svg",
    },
    {
      id: "c_in_005",
      brandId: "innisfree",
      title: "리뷰 하이라이트 | 신뢰",
      caption: "리뷰에서 자주 언급된 포인트만 요약",
      tags: ["리뷰", "신뢰", "긴급성"],
      mediaType: "video",
      adType: "normal",
      runDays: 7,
      startDate: "2026-03-01",
      endDate: "2026-03-06",
      layout: "ugc-caption-heavy",
      keyMessage: "리뷰 하이라이트",
      emphasis: "신뢰",
      copyType: "리뷰/신뢰",
      ctaType: "지금 보기",
      ctaSize: "S",
      textRatio: 0.57,
      predictedScore: 0.73,
      thumb: "🟥",
      thumbUrl: "./assets/thumbs/innisfree.svg",
    },
    {
      id: "c_rl_001",
      brandId: "roundlab",
      title: "전/후 비교",
      caption: "7일 전/후 비교로 확인하는 진정",
      tags: ["전후", "비교/전후", "신뢰", "리뷰"],
      mediaType: "image",
      adType: "normal",
      runDays: 14,
      startDate: "2026-02-20",
      endDate: "2026-03-05",
      layout: "before-after-split",
      keyMessage: "7일 변화",
      emphasis: "효과",
      copyType: "비교/전후",
      ctaType: "자세히 보기",
      ctaSize: "M",
      textRatio: 0.4,
      predictedScore: 0.88,
      thumb: "🟪",
      thumbUrl: "./assets/thumbs/roundlab.svg",
    },
    {
      id: "c_rl_002",
      brandId: "roundlab",
      title: "파트너십 | 예린의 루틴",
      caption: "예린이 추천하는 진정 루틴, 사용 팁까지",
      tags: ["파트너십", "인플루언서", "리뷰", "신뢰"],
      mediaType: "video",
      adType: "partnership",
      influencerIds: ["inf_4"],
      runDays: 11,
      startDate: "2026-02-28",
      endDate: "2026-03-06",
      layout: "ugc-caption-heavy",
      keyMessage: "루틴 추천",
      emphasis: "신뢰",
      copyType: "리뷰/신뢰",
      ctaType: "지금 보기",
      ctaSize: "S",
      textRatio: 0.58,
      predictedScore: 0.87,
      thumb: "🟥",
      thumbUrl: "./assets/thumbs/roundlab.svg",
    },
    {
      id: "c_rl_003",
      brandId: "roundlab",
      title: "쿠폰 | 세일 기간 한정",
      caption: "세일 기간 한정 쿠폰 + 추가 할인",
      tags: ["쿠폰", "할인", "긴급성", "혜택"],
      mediaType: "image",
      adType: "normal",
      runDays: 8,
      startDate: "2026-02-28",
      endDate: "2026-03-06",
      layout: "grid-3-benefits",
      keyMessage: "쿠폰+추가할인",
      emphasis: "혜택",
      copyType: "긴급성",
      ctaType: "쿠폰 받기",
      ctaSize: "L",
      textRatio: 0.49,
      predictedScore: 0.75,
      thumb: "🟧",
      thumbUrl: "./assets/thumbs/roundlab.svg",
    },
    {
      id: "c_rl_004",
      brandId: "roundlab",
      title: "성분/기능 | 진정 포인트",
      caption: "진정 성분과 사용 타이밍을 간단히 정리",
      tags: ["성분/기능", "신뢰", "리뷰"],
      mediaType: "image",
      adType: "normal",
      runDays: 6,
      startDate: "2026-03-02",
      endDate: "2026-03-06",
      layout: "hero-product-left",
      keyMessage: "진정 성분 요약",
      emphasis: "성분",
      copyType: "성분/기능",
      ctaType: "자세히 보기",
      ctaSize: "M",
      textRatio: 0.34,
      predictedScore: 0.7,
      thumb: "🟦",
      thumbUrl: "./assets/thumbs/roundlab.svg",
    },
    {
      id: "c_lb_001",
      brandId: "labiotte",
      title: "쿠폰/혜택 강조",
      caption: "쿠폰 받기 + 무료배송",
      tags: ["쿠폰", "혜택 강조", "무료배송"],
      mediaType: "image",
      adType: "normal",
      runDays: 6,
      startDate: "2026-03-01",
      endDate: "2026-03-06",
      layout: "grid-3-benefits",
      keyMessage: "쿠폰+무료배송",
      emphasis: "혜택",
      copyType: "혜택 강조",
      ctaType: "쿠폰 받기",
      ctaSize: "L",
      textRatio: 0.5,
      predictedScore: 0.74,
      thumb: "🟧",
      thumbUrl: "./assets/thumbs/labiotte.svg",
    },
    {
      id: "c_lb_002",
      brandId: "labiotte",
      title: "리뷰 1,000+ | 베스트",
      caption: "리뷰로 검증된 베스트, 지금 바로 확인",
      tags: ["리뷰", "신뢰", "베스트"],
      mediaType: "image",
      adType: "normal",
      runDays: 7,
      startDate: "2026-02-25",
      endDate: "2026-03-06",
      layout: "ugc-caption-heavy",
      keyMessage: "리뷰 기반 신뢰",
      emphasis: "후기",
      copyType: "리뷰/신뢰",
      ctaType: "자세히 보기",
      ctaSize: "M",
      textRatio: 0.62,
      predictedScore: 0.77,
      thumb: "🟥",
      thumbUrl: "./assets/thumbs/labiotte.svg",
    },
    {
      id: "c_lb_003",
      brandId: "labiotte",
      title: "할인 | 타임딜",
      caption: "오늘만 타임딜, 장바구니 쿠폰까지",
      tags: ["할인", "쿠폰", "긴급성", "혜택"],
      mediaType: "image",
      adType: "normal",
      runDays: 5,
      startDate: "2026-02-28",
      endDate: "2026-03-02",
      layout: "grid-3-benefits",
      keyMessage: "타임딜+쿠폰",
      emphasis: "혜택",
      copyType: "긴급성",
      ctaType: "할인 받기",
      ctaSize: "M",
      textRatio: 0.46,
      predictedScore: 0.72,
      thumb: "🟧",
      thumbUrl: "./assets/thumbs/labiotte.svg",
    },
    {
      id: "c_lb_004",
      brandId: "labiotte",
      title: "파트너십 | 지훈 리뷰",
      caption: "지훈이 비교해보는 사용감, 전/후까지",
      tags: ["파트너십", "인플루언서", "리뷰", "전후"],
      mediaType: "video",
      adType: "partnership",
      influencerIds: ["inf_3"],
      runDays: 9,
      startDate: "2026-03-01",
      endDate: "2026-03-06",
      layout: "hero-model-center",
      keyMessage: "비교 리뷰",
      emphasis: "신뢰",
      copyType: "리뷰/신뢰",
      ctaType: "지금 보기",
      ctaSize: "S",
      textRatio: 0.29,
      predictedScore: 0.78,
      thumb: "🟦",
      thumbUrl: "./assets/thumbs/labiotte.svg",
    },
    {
      id: "c_he_001",
      brandId: "hera",
      title: "UGC 텍스트 비중↑",
      caption: "리뷰 1,234개 돌파! 이유가 있어요",
      tags: ["리뷰", "신뢰", "UGC", "긴급성"],
      mediaType: "video",
      adType: "normal",
      runDays: 8,
      startDate: "2026-02-27",
      endDate: "2026-03-06",
      layout: "ugc-caption-heavy",
      keyMessage: "리뷰 기반 신뢰",
      emphasis: "후기",
      copyType: "리뷰/신뢰",
      ctaType: "구매하기",
      ctaSize: "M",
      textRatio: 0.6,
      predictedScore: 0.8,
      thumb: "🟥",
      thumbUrl: "./assets/thumbs/hera.svg",
    },
    {
      id: "c_he_002",
      brandId: "hera",
      title: "파트너십 | 수아 Pick",
      caption: "수아가 고른 베이스 추천, 전/후 비교까지",
      tags: ["파트너십", "인플루언서", "전후", "리뷰", "신뢰"],
      mediaType: "video",
      adType: "partnership",
      influencerIds: ["inf_2"],
      runDays: 10,
      startDate: "2026-02-28",
      endDate: "2026-03-06",
      layout: "hero-model-center",
      keyMessage: "전/후로 확인",
      emphasis: "효과",
      copyType: "비교/전후",
      ctaType: "지금 보기",
      ctaSize: "S",
      textRatio: 0.32,
      predictedScore: 0.85,
      thumb: "🟦",
      thumbUrl: "./assets/thumbs/hera.svg",
    },
    {
      id: "c_he_003",
      brandId: "hera",
      title: "쿠폰 | 세일 기간 전용",
      caption: "세일 기간 전용 쿠폰 + 추가 혜택",
      tags: ["쿠폰", "할인", "혜택", "긴급성"],
      mediaType: "image",
      adType: "normal",
      runDays: 8,
      startDate: "2026-02-28",
      endDate: "2026-03-06",
      layout: "grid-3-benefits",
      keyMessage: "쿠폰+추가혜택",
      emphasis: "혜택",
      copyType: "긴급성",
      ctaType: "쿠폰 받기",
      ctaSize: "L",
      textRatio: 0.5,
      predictedScore: 0.81,
      thumb: "🟧",
      thumbUrl: "./assets/thumbs/hera.svg",
    },
    {
      id: "c_he_004",
      brandId: "hera",
      title: "리뷰/신뢰 | 실제 후기",
      caption: "실제 구매자 후기 핵심만 요약",
      tags: ["리뷰", "신뢰", "UGC"],
      mediaType: "video",
      adType: "normal",
      runDays: 6,
      startDate: "2026-03-02",
      endDate: "2026-03-06",
      layout: "ugc-caption-heavy",
      keyMessage: "후기 요약",
      emphasis: "후기",
      copyType: "리뷰/신뢰",
      ctaType: "자세히 보기",
      ctaSize: "M",
      textRatio: 0.63,
      predictedScore: 0.74,
      thumb: "🟥",
      thumbUrl: "./assets/thumbs/hera.svg",
    },
  ];

  // Brand clusters (precomputed mock; max 5 shown in UI)
  const MOCK_CLUSTERS_BY_BRAND = {
    oliveyoung: [
      {
        id: "cl_oy_1",
        name: "쿠폰/추가할인 혜택형",
        chips: ["쿠폰", "추가할인", "긴급성", "혜택"],
        description:
          "텍스트 비중이 중간 이상이며, '쿠폰/추가할인' 키워드를 상단에 배치하고 CTA를 크게 노출하는 혜택형 레이아웃.",
        predictedClusterScore: 0.9,
        layoutKey: "grid-3-benefits",
        creativeIds: ["c_oy_001"],
      },
      {
        id: "cl_oy_2",
        name: "인플루언서 신뢰형(파트너십)",
        chips: ["파트너십", "인플루언서", "리뷰", "UGC"],
        description:
          "인플루언서가 직접 사용/추천 맥락을 제공하고, 캡션/자막 텍스트 비중이 높아 신뢰 신호를 강화하는 UGC 스타일.",
        predictedClusterScore: 0.92,
        layoutKey: "ugc-caption-heavy",
        creativeIds: ["c_oy_003"],
      },
    ],
    innisfree: [
      {
        id: "cl_in_1",
        name: "성분/기능 중심 제품 히어로형",
        chips: ["성분", "보습", "제품 히어로", "깔끔"],
        description:
          "제품을 좌측에 크게 배치하고, 우측에 성분/기능을 짧은 불릿으로 정리한 정보형 소재.",
        predictedClusterScore: 0.81,
        layoutKey: "hero-product-left",
        creativeIds: ["c_in_001"],
      },
      {
        id: "cl_in_2",
        name: "메이크업 튜토리얼형(파트너십)",
        chips: ["파트너십", "사용법", "모델 중심", "영상"],
        description:
          "모델 중심 프레이밍 + 간단한 사용법/팁으로 체류를 유도하는 튜토리얼형 영상.",
        predictedClusterScore: 0.84,
        layoutKey: "hero-model-center",
        creativeIds: ["c_in_002"],
      },
    ],
    roundlab: [
      {
        id: "cl_rl_1",
        name: "전/후 비교 증거형",
        chips: ["전후", "7일", "효과", "증거"],
        description:
          "전/후를 화면 분할로 명확히 보여주고, 기간(7일)과 핵심 지표를 강조해 설득력을 강화하는 증거형.",
        predictedClusterScore: 0.89,
        layoutKey: "before-after-split",
        creativeIds: ["c_rl_001"],
      },
    ],
    labiotte: [
      {
        id: "cl_lb_1",
        name: "쿠폰/무료배송 혜택형",
        chips: ["쿠폰", "무료배송", "혜택", "가격"],
        description:
          "혜택(쿠폰/무료배송)을 큰 글자 + 아이콘으로 반복 노출하고, CTA를 크게 배치한 혜택형.",
        predictedClusterScore: 0.77,
        layoutKey: "grid-3-benefits",
        creativeIds: ["c_lb_001"],
      },
    ],
    hera: [
      {
        id: "cl_he_1",
        name: "리뷰/사회적 증거 UGC형",
        chips: ["리뷰", "1,234", "UGC", "신뢰"],
        description:
          "리뷰 수치와 실제 사용자 톤의 문장을 전면에 배치해 사회적 증거를 극대화하는 UGC형.",
        predictedClusterScore: 0.83,
        layoutKey: "ugc-caption-heavy",
        creativeIds: ["c_he_001"],
      },
    ],
  };

  // ---------- Helpers ----------
  function formatPct(n, digits = 0) {
    const v = Math.round(n * Math.pow(10, digits)) / Math.pow(10, digits);
    return `${v}%`;
  }

  function inRange(date, start, end) {
    const d = new Date(date).getTime();
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return d >= s && d <= e;
  }

  function getBrand(brandId) {
    return BRANDS.find((b) => b.id === brandId);
  }

  function getInfluencer(id) {
    return INFLUENCERS.find((x) => x.id === id);
  }

  function badgeHighEfficiency(creative) {
    return creative.runDays >= 7;
  }

  function mockLexicalScore(q, creative) {
    if (!q) return 0;
    const hay = `${creative.title} ${creative.caption}`.toLowerCase();
    const qq = q.toLowerCase();
    return hay.includes(qq) ? 1 : 0;
  }

  function mockSemanticScore(q, creative) {
    if (!q) return 0;
    const qq = q.toLowerCase();
    const tags = (creative.tags || []).map((t) => t.toLowerCase());
    // naive: partial match count
    const hits = tags.filter((t) => t.includes(qq) || qq.includes(t)).length;
    return Math.min(1, hits * 0.35);
  }

  function calcSearchScore(q, mode, creative) {
    const lex = mockLexicalScore(q, creative);
    const sem = mockSemanticScore(q, creative);
    if (mode === "lexical") return lex;
    if (mode === "semantic") return sem;
    // hybrid
    return Math.min(1, lex * 0.55 + sem * 0.7);
  }

  function groupBy(arr, keyFn) {
    return arr.reduce((acc, x) => {
      const k = keyFn(x);
      acc[k] = acc[k] || [];
      acc[k].push(x);
      return acc;
    }, {});
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function hashStringToInt(s) {
    // simple deterministic hash (for stable "mock" timings without randomness)
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  function seededRand01(seedStr) {
    // deterministic pseudo-random in [0, 1)
    let x = hashStringToInt(seedStr) || 1;
    // xorshift32
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    // >>> 0 to uint32
    return ((x >>> 0) % 1000000) / 1000000;
  }

  function smoothedPct({ count, total, uniqueCount, seedStr }) {
    // Turn tiny-sample ratios (2/7, 3/7...) into more "natural" looking estimates.
    // - Laplace/Dirichlet-style smoothing
    // - small deterministic jitter to avoid identical-looking bars when counts tie
    const t = Math.max(1, total);
    const k = Math.max(1, uniqueCount);
    const alpha = 1.7; // smoothing strength
    const base = ((count + alpha) / (t + alpha * k)) * 100;
    const jitter = (seededRand01(seedStr) * 2 - 1) * 3.2; // +/- 3.2%
    return clamp(base + jitter, 0, 100);
  }

  // ---------- UI ----------
  function CreativeCard({ creative, onClick, variant = "default" }) {
    const brand = getBrand(creative.brandId);
    const compact = variant === "compact";
    const thumbUrl = creative.thumbnailUrl || creative.thumbUrl;
    const layoutKey = creative.layoutKey || creative.layout;
    return (
      <button
        onClick={onClick}
        className={`w-full rounded-2xl border bg-white text-left text-zinc-900 hover:bg-zinc-50 ${
          compact ? "p-3" : "p-4"
        }`}
      >
        <div className={`flex items-start justify-between ${compact ? "gap-2" : "gap-3"}`}>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-semibold">
                {creative.title} <span className="text-zinc-500">· {brand?.name}</span>
              </div>
              {creative.adType === "partnership" && <Pill tone="purple">파트너십</Pill>}
              {creative.mediaType === "video" ? <Pill tone="blue">영상</Pill> : <Pill>이미지</Pill>}
              {badgeHighEfficiency(creative) && <Pill tone="green">고효율 예상</Pill>}
            </div>
            <div className={`mt-2 ${compact ? "text-xs" : "text-sm"} text-zinc-700 line-clamp-2`}>
              {creative.caption}
            </div>

            {!compact ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill>레이아웃: {LAYOUT_LIBRARY[layoutKey]?.name || layoutKey}</Pill>
                <Pill>
                  CTA: {creative.ctaType}
                  {creative.ctaSize ? ` (${creative.ctaSize})` : ""}
                </Pill>
                <Pill>텍스트 비중: {formatPct(creative.textRatio * 100)}</Pill>
                <Pill>카피 유형: {creative.copyType}</Pill>
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill>레이아웃: {LAYOUT_LIBRARY[layoutKey]?.name || layoutKey}</Pill>
                <Pill>CTA: {creative.ctaType}</Pill>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            {thumbUrl ? (
              <img
                src={thumbUrl}
                alt={`${brand?.name || ""} thumbnail`}
                className={`${compact ? "h-12 w-12" : "h-14 w-14"} rounded-xl border bg-white object-cover`}
                loading="lazy"
                draggable="false"
              />
            ) : (
              <div className="text-3xl">{creative.thumb}</div>
            )}
            <div className={`${compact ? "text-[11px]" : "text-xs"} text-zinc-500`}>
              run {creative.runDays}d · score {Math.round(creative.predictedScore * 100)}
            </div>
          </div>
        </div>
      </button>
    );
  }

  function LayoutSilhouette({ layoutKey, className = "" }) {
    const layout = LAYOUT_LIBRARY[layoutKey];
    if (!layout) return null;
    const alt = `레이아웃 실루엣: ${layout.name}`;

    if (layout.img) {
      return (
        <img
          src={layout.img}
          alt={alt}
          className={`w-full max-w-[280px] select-none ${className}`}
          draggable="false"
          loading="lazy"
        />
      );
    }

    return (
      <div className={`whitespace-pre font-mono text-xs leading-4 text-zinc-700 ${className}`}>
        {layout.silhouette}
      </div>
    );
  }

  function StatCard({ label, value, children }) {
    return (
      <div className="rounded-xl border bg-white p-3">
        <div className="text-xs text-zinc-500">{label}</div>
        {value != null && <div className="mt-1 text-sm font-semibold text-zinc-900">{value}</div>}
        {children}
      </div>
    );
  }

  function InsightsSummary({ results, brandSummaries, recommendedClusters, abSuggestionForCluster, defaultCollapsed = true }) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    const totals = useMemo(() => {
      const total = results.length || 1;
      const image = results.filter((x) => x.mediaType === "image").length;
      const video = results.filter((x) => x.mediaType === "video").length;
      const normal = results.filter((x) => x.adType === "normal").length;
      const partnership = results.filter((x) => x.adType === "partnership").length;
      return {
        total,
        image,
        video,
        normal,
        partnership,
        imagePct: (image / total) * 100,
        videoPct: (video / total) * 100,
        normalPct: (normal / total) * 100,
        partnershipPct: (partnership / total) * 100,
      };
    }, [results]);

    const prominent = useMemo(() => {
      const total = results.length || 1;
      const countBy = (keyFn) =>
        results.reduce((acc, x) => {
          const k = keyFn(x);
          if (!k) return acc;
          acc[k] = (acc[k] || 0) + 1;
          return acc;
        }, {});

      const top = (counts) =>
        Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => ({ k, v, pct: (v / total) * 100 }))[0];

      const topLayoutKey = top(countBy((c) => c.layout));
      const topCopyType = top(countBy((c) => c.copyType));
      const topCTA = top(countBy((c) => c.ctaType));
      return { topLayoutKey, topCopyType, topCTA };
    }, [results]);

    const brandKeyMessages = useMemo(() => {
      return (brandSummaries || [])
        .slice(0, 4)
        .map((bs) => {
          const brand = getBrand(bs.brandId);
          const km = bs.repeating?.keyMessage?.[0];
          const label = km?.k || "-";
          const pct = km?.displayPct ?? (km?.ratio != null ? km.ratio * 100 : 0);
          return {
            brandId: bs.brandId,
            brandName: brand?.name || bs.brandId,
            keyMessage: label,
            pct,
            total: bs.total,
          };
        })
        .filter((x) => x.keyMessage && x.keyMessage !== "-");
    }, [brandSummaries]);

    const abSummary = useMemo(() => {
      if (!recommendedClusters?.length) return null;
      const top = recommendedClusters[0];
      const ab = abSuggestionForCluster(top);
      return {
        count: recommendedClusters.length,
        budget: ab.budget,
        period: ab.period,
        objective: ab.objective,
        creativesPerGroup: ab.creativesPerGroup,
        groupA: { layoutKey: ab.groups?.[0]?.layoutKey, keyMessage: ab.groups?.[0]?.keyMessage },
        groupB: { layoutKey: ab.groups?.[1]?.layoutKey, keyMessage: ab.groups?.[1]?.keyMessage },
      };
    }, [recommendedClusters, abSuggestionForCluster]);

    const insightLines = useMemo(() => {
      const topLayoutName =
        prominent.topLayoutKey && (LAYOUT_LIBRARY[prominent.topLayoutKey.k]?.name || prominent.topLayoutKey.k);
      const topCopy = prominent.topCopyType?.k;
      const topCTA = prominent.topCTA?.k;

      const prominentParts = [
        topLayoutName ? `레이아웃은 '${topLayoutName}' 경향입니다` : null,
        topCopy ? `카피는 '${topCopy}' 중심입니다` : null,
        topCTA ? `CTA는 '${topCTA}'가 두드러집니다` : null,
      ].filter(Boolean);

      const prominentLine =
        prominentParts.length > 0 ? `${prominentParts.join(" · ")}.` : "두드러지는 소재 특징을 요약할 데이터가 부족합니다.";

      const ratioLine = `이미지 ${totals.imagePct.toFixed(0)}% / 영상 ${totals.videoPct.toFixed(0)}%, 파트너십 ${totals.partnershipPct.toFixed(0)}%로 구성됩니다.`;

      const topBrands = brandKeyMessages.slice(0, 2);
      const brandLine =
        topBrands.length > 0
          ? `브랜드별로 ${topBrands.map((x) => `${x.brandName}은(는) '${x.keyMessage}'`).join(", ")} 메시지를 주로 사용합니다.`
          : "브랜드별 키 메시지 패턴을 요약할 데이터가 부족합니다.";

      const abLine = abSummary
        ? `추천 소재 유형 기준 ${abSummary.period} A/B를 권장합니다. A는 '${
            LAYOUT_LIBRARY[abSummary.groupA.layoutKey]?.name || abSummary.groupA.layoutKey || "-"
          }', B는 '${
            LAYOUT_LIBRARY[abSummary.groupB.layoutKey]?.name || abSummary.groupB.layoutKey || "-"
          }' 컨셉입니다.`
        : "현재 조건에서는 A/B 테스트 추천이 없습니다.";

      return { prominentLine, ratioLine, brandLine, abLine };
    }, [abSummary, brandKeyMessages, prominent, totals]);

    return (
      <div className="rounded-2xl border bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-zinc-900">검색결과 인사이트 요약</div>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="rounded-lg border bg-white px-2 py-1 text-xs text-zinc-900 hover:bg-zinc-50 inline-flex items-center gap-1"
            aria-label={collapsed ? "펼치기" : "접기"}
          >
            <span>{collapsed ? "펼치기" : "접기"}</span>
            <span className="text-sm leading-none">{collapsed ? "▼" : "▲"}</span>
          </button>
        </div>

        {collapsed ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {prominent.topLayoutKey && (
              <Pill tone="green">특징: {LAYOUT_LIBRARY[prominent.topLayoutKey.k]?.name || prominent.topLayoutKey.k}</Pill>
            )}
            <Pill>
              이미지 {totals.imagePct.toFixed(0)}% · 영상 {totals.videoPct.toFixed(0)}%
            </Pill>
            <Pill tone="purple">파트너십 {totals.partnershipPct.toFixed(0)}%</Pill>
            <Pill tone={abSummary ? "amber" : "neutral"}>A/B {abSummary ? "추천" : "없음"}</Pill>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-zinc-50 p-2.5">
              <div className="text-xs font-semibold text-zinc-600">두드러지는 특징</div>
              <div className="mt-1 text-xs text-zinc-600">{insightLines.prominentLine}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {prominent.topLayoutKey && (
                  <Pill tone="green">
                    레이아웃 {Math.round(prominent.topLayoutKey.pct)}% ·{" "}
                    {LAYOUT_LIBRARY[prominent.topLayoutKey.k]?.name || prominent.topLayoutKey.k}
                  </Pill>
                )}
                {prominent.topCopyType && (
                  <Pill tone="amber">
                    카피 {Math.round(prominent.topCopyType.pct)}% · {prominent.topCopyType.k}
                  </Pill>
                )}
                {prominent.topCTA && (
                  <Pill tone="blue">
                    CTA {Math.round(prominent.topCTA.pct)}% · {prominent.topCTA.k}
                  </Pill>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-zinc-50 p-2.5">
              <div className="text-xs font-semibold text-zinc-600">비중</div>
              <div className="mt-1 text-xs text-zinc-600">{insightLines.ratioLine}</div>
              <div className="mt-2 space-y-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-600">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    이미지
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    영상
                  </div>
                </div>
                <StackedBar
                  parts={[
                    { key: "img", label: `이미지 ${totals.image}`, valuePct: totals.imagePct, className: "bg-blue-500" },
                    { key: "vid", label: `영상 ${totals.video}`, valuePct: totals.videoPct, className: "bg-violet-500" },
                  ]}
                />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-zinc-600">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-700" />
                    일반
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    파트너십
                  </div>
                </div>
                <StackedBar
                  parts={[
                    { key: "normal", label: `일반 ${totals.normal}`, valuePct: totals.normalPct, className: "bg-zinc-700" },
                    { key: "part", label: `파트너십 ${totals.partnership}`, valuePct: totals.partnershipPct, className: "bg-emerald-500" },
                  ]}
                />
              </div>
            </div>

            <div className="rounded-xl bg-zinc-50 p-2.5">
              <div className="text-xs font-semibold text-zinc-600">브랜드별 키 메시지(Top)</div>
              <div className="mt-1 text-xs text-zinc-600">{insightLines.brandLine}</div>
              <div className="mt-2 space-y-1.5">
                {brandKeyMessages.slice(0, 3).map((x) => (
                  <MiniBarRow
                    key={`${x.brandId}:${x.keyMessage}`}
                    label={`${x.brandName}: ${x.keyMessage}`}
                    valuePct={x.pct}
                    tone="zinc"
                  />
                ))}
                {brandKeyMessages.length === 0 && (
                  <div className="rounded-xl border bg-zinc-50 p-4 text-center">
                    <div className="text-sm text-zinc-600">표시할 핵심 메시지가 없습니다.</div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-zinc-50 p-2.5">
              <div className="text-xs font-semibold text-zinc-600">A/B 테스트</div>
              {abSummary ? (
                <div className="mt-2 space-y-2">
                  <div className="text-xs text-zinc-600">{insightLines.abLine}</div>
                  <div className="flex flex-wrap gap-2">
                    <Pill tone="amber">추천 {abSummary.count}개</Pill>
                    <Pill>기간 {abSummary.period}</Pill>
                    <Pill>예산 {abSummary.budget}</Pill>
                    <Pill tone="blue">목적 {abSummary.objective}</Pill>
                    <Pill>그룹당 소재 {abSummary.creativesPerGroup}개</Pill>
                  </div>

                  <div className="grid gap-2 text-[11px] leading-4 text-zinc-700">
                    <div className="rounded-lg border bg-white px-2 py-1.5">
                      <span className="font-semibold">A</span>{" "}
                      <span className="text-zinc-500">
                        {LAYOUT_LIBRARY[abSummary.groupA.layoutKey]?.name || abSummary.groupA.layoutKey || "-"}
                      </span>
                      <span className="text-zinc-400"> · </span>
                      <span className="truncate">{abSummary.groupA.keyMessage || "-"}</span>
                    </div>
                    <div className="rounded-lg border bg-white px-2 py-1.5">
                      <span className="font-semibold">B</span>{" "}
                      <span className="text-zinc-500">
                        {LAYOUT_LIBRARY[abSummary.groupB.layoutKey]?.name || abSummary.groupB.layoutKey || "-"}
                      </span>
                      <span className="text-zinc-400"> · </span>
                      <span className="truncate">{abSummary.groupB.keyMessage || "-"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-zinc-600">추천 없음</div>
              )}
            </div>
          </div>
        )}
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

  function PromoPanel({ promoInsights, onPickCreative, variant = "standalone" }) {
    return (
      <div className={variant === "embedded" ? "rounded-2xl bg-zinc-50 p-4" : "rounded-2xl border bg-white p-4"}>
        <SectionHeader title="프로모션 인사이트" subtitle={`${PROMO.key} · ${PROMO.start}~${PROMO.end}`} />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">자사({getBrand(promoInsights.ownBrandId)?.name}) · 기간 평균 성과</div>
              <Pill tone="blue">기간 집계</Pill>
            </div>

            <div className="mt-3 space-y-2">
              {/* Row 1: big money metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-zinc-50 p-3">
                  <div className="text-xs text-zinc-500">매출</div>
                  <div className="mt-1 text-right text-base font-semibold tabular-nums text-zinc-900">
                    {promoInsights.revenue.toLocaleString()}원
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3">
                  <div className="text-xs text-zinc-500">공헌이익</div>
                  <div className="mt-1 text-right text-base font-semibold tabular-nums text-zinc-900">
                    {promoInsights.contributionProfit.toLocaleString()}원
                  </div>
                </div>
              </div>

              {/* Row 2: rate metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-zinc-50 p-3">
                  <div className="text-xs text-zinc-500">CTR</div>
                  <div className="mt-1 text-right text-base font-semibold tabular-nums text-zinc-900">
                    {promoInsights.ownAvg.ctr.toFixed(2)}%
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3">
                  <div className="text-xs text-zinc-500">CVR</div>
                  <div className="mt-1 text-right text-base font-semibold tabular-nums text-zinc-900">
                    {promoInsights.ownAvg.cvr.toFixed(2)}%
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3">
                  <div className="text-xs text-zinc-500">ROAS</div>
                  <div className="mt-1 text-right text-base font-semibold tabular-nums text-zinc-900">
                    {Math.round(promoInsights.ownAvg.roas)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="font-semibold">우수 소재 리스트 (Top 5)</div>
              <div className="mt-2 space-y-2">
                {promoInsights.bestOwn.map((c) => (
                  <CreativeCard key={c.id} creative={c} onClick={() => onPickCreative(c)} />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">동일 기간 경쟁 브랜드 소재</div>
              <Pill tone="green">고효율 뱃지 포함</Pill>
            </div>

            <div className="mt-3 space-y-4">
              {promoInsights.compCards.map((card) => (
                <div key={card.brandId} className="rounded-2xl border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{getBrand(card.brandId)?.name}</div>
                    <div className="text-xs text-zinc-500">{card.total}개</div>
                  </div>
                  <div className="mt-2 space-y-2">
                    {card.top.map((c) => (
                      <CreativeCard key={c.id} creative={c} onClick={() => onPickCreative(c)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-xs text-zinc-500">
              * 실제 제품에서는 “기간 내 운영 소재”를 광고 집행 로그/메타 라이브러리 스냅샷으로 확정하고, 성과는 자사 계정 데이터로 집계한다고 가정
            </div>
          </div>
        </div>
      </div>
    );
  }

  function PartnershipPanel({ partnershipInsights, onPickCreative, variant = "standalone" }) {
    return (
      <div className={variant === "embedded" ? "rounded-2xl bg-zinc-50 p-4" : "rounded-2xl border bg-white p-4"}>
        <SectionHeader title="파트너십 인사이트" subtitle="브랜드별 자주 노출되는 인플루언서 + 공통 특징" />
        <div className="space-y-4">
          {partnershipInsights.length === 0 && (
            <div className="rounded-xl border bg-zinc-50 p-4 text-sm text-zinc-600">검색 결과 내 파트너십 광고가 없습니다.</div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {partnershipInsights.map((card) => {
              const brand = getBrand(card.brandId);
              const topLayoutName = LAYOUT_LIBRARY[card.topLayout]?.name || card.topLayout;
              return (
                <div key={card.brandId} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{brand?.name}</div>
                      <div className="text-sm text-zinc-600">파트너십 소재 {card.total}개</div>
                    </div>
                    <div className="text-right text-xs text-zinc-600">
                      <div>빈출 카피: {card.topCopyType || "-"}</div>
                      <div>빈출 레이아웃: {topLayoutName || "-"}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm font-semibold">자주 등장하는 인플루언서</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {card.topInfluencers.map((x) => (
                        <div key={x.influencer?.id} className="rounded-xl bg-zinc-50 px-3 py-2 text-sm">
                          <div className="font-semibold">
                            {x.influencer?.avatar} {x.influencer?.name}{" "}
                            <span className="text-zinc-500">{x.influencer?.handle}</span>
                          </div>
                          <div className="text-xs text-zinc-600">
                            {x.influencer?.niche} · {x.influencer?.followers} · {x.count}회
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-semibold">예시 소재</div>
                    <div className="mt-2 space-y-2">
                      {card.examples.map((c) => (
                        <CreativeCard key={c.id} creative={c} onClick={() => onPickCreative(c)} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Page Root ----------
  function CreativeSearchPage() {
    const ds = (window.__APP && window.__APP.dataset && window.__APP.dataset.creativeSearchV2) || null;
    const dsPromo = ds?.promos?.[0] || null;
    const activePromo = dsPromo ? { key: dsPromo.key, start: dsPromo.start, end: dsPromo.end, id: dsPromo.id } : PROMO;

    // Display label vs internal query:
    // - UI should read like a real search context
    // - internal query stays matchable against our mock tags/text to keep results rich
    const queryLabel = "지난 올리브영 세일 기간 소재";
    // For this specific context, we want to show "all creatives during the promo window"
    // across multiple brands, not just those matching a single keyword.
    const query = "";
    const [searchMode] = useState("hybrid"); // lexical | semantic | hybrid (fixed for prototype)
    const [selectedCreative, setSelectedCreative] = useState(null);
    const [activeTab, setActiveTab] = useState("overview"); // overview | compare | details | library
    const [chatOpen, setChatOpen] = useState(false);

    const [expandedTypeGroupBrands, setExpandedTypeGroupBrands] = useState({});
    const [typeGroupModal, setTypeGroupModal] = useState({ open: false, groupId: null });

    const [libraryFilters, setLibraryFilters] = useState({ brandId: "all", mediaType: "all", adType: "all" });
    const [libraryResultLimit, setLibraryResultLimit] = useState(36);
    const [insightsSummaryCollapsed, setInsightsSummaryCollapsed] = useState(true); // Phase IA-2: 기본 접힌 상태
    const [promoCollapsed, setPromoCollapsed] = useState(true); // Phase IA-4: 기본 접힌 상태로 변경
    const [partnershipCollapsed, setPartnershipCollapsed] = useState(true);
    const [abReasonOpenById, setAbReasonOpenById] = useState({});
    const [compareAxisKey, setCompareAxisKey] = useState("mediaRatio");
    const [expandedBrands, setExpandedBrands] = useState({}); // Phase IA-3: 경쟁 브랜드 접기/펼치기
    const [abTestModalOpen, setAbTestModalOpen] = useState(null); // Phase IA-5: A/B 테스트 모달

    const promoPool = useMemo(() => {
      // Prefer v2 dataset if available: promo scope is explicit via promoId.
      if (ds?.creativeAssets?.length && dsPromo?.id) {
        return ds.creativeAssets.filter((c) => c.promoId === dsPromo.id);
      }
      // v1 fallback: "지난 올리브영 세일 기간 소재" = creatives overlapping promo dates
      return MOCK_CREATIVES.filter(
        (c) => inRange(c.startDate, PROMO.start, PROMO.end) || inRange(c.endDate, PROMO.start, PROMO.end)
      );
    }, [ds?.version, dsPromo?.id]);

    const results = useMemo(() => {
      const scored = promoPool
        .map((c) => ({ ...c, _score: calcSearchScore(query, searchMode, c) }))
        .filter((c) => c._score > 0 || query.trim() === "")
        .sort((a, b) => b._score - a._score || b.predictedScore - a.predictedScore);
      return scored;
    }, [promoPool, query, searchMode]);

    const filteredResults = useMemo(() => {
      return results.filter((c) => {
        if (libraryFilters.brandId !== "all" && c.brandId !== libraryFilters.brandId) return false;
        if (libraryFilters.mediaType !== "all" && c.mediaType !== libraryFilters.mediaType) return false;
        if (libraryFilters.adType !== "all" && c.adType !== libraryFilters.adType) return false;
        return true;
      });
    }, [libraryFilters.adType, libraryFilters.brandId, libraryFilters.mediaType, results]);

    const mockTotalResults = useMemo(() => {
      const base = 320;
      const jitter = hashStringToInt(`${query}:${searchMode}`) % 120; // 0~119
      return base + jitter; // 320~439
    }, [query, searchMode]);

    const searchTimeMs = useMemo(() => {
      const base = 110 + mockTotalResults * 0.55; // ~280~350ms
      const jitter = hashStringToInt(`${query}:${searchMode}:${mockTotalResults}`) % 140; // 0~139
      return Math.max(60, Math.min(520, base + jitter));
    }, [query, searchMode, mockTotalResults]);

    const resultsByBrand = useMemo(() => groupBy(results, (c) => c.brandId), [results]);

    const brandSummaries = useMemo(() => {
      const out = Object.entries(resultsByBrand).map(([brandId, arr]) => {
        const total = arr.length || 1;
        const image = arr.filter((x) => x.mediaType === "image").length;
        const video = arr.filter((x) => x.mediaType === "video").length;
        const normal = arr.filter((x) => x.adType === "normal").length;
        const partnership = arr.filter((x) => x.adType === "partnership").length;

        const top = (field, n = 3) => {
          const counts = arr.reduce((acc, x) => {
            const v = x[field];
            if (!v) return acc;
            acc[v] = (acc[v] || 0) + 1;
            return acc;
          }, {});
          const items = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, n)
            .map(([k, v]) => ({ k, v }));
          return { items, uniqueCount: Object.keys(counts).length || 1 };
        };

        const withDisplayPct = (kind, items, uniqueCount) =>
          items.map((t) => ({
            ...t,
            ratio: t.v / total,
            displayPct: smoothedPct({ count: t.v, total, uniqueCount, seedStr: `${brandId}:${kind}:${t.k}` }),
          }));

        const repeating = {
          layout: (() => {
            const r = top("layout", 2);
            return withDisplayPct("layout", r.items, r.uniqueCount).map((t) => ({ ...t, label: LAYOUT_LIBRARY[t.k]?.name || t.k }));
          })(),
          keyMessage: (() => {
            const r = top("keyMessage", 2);
            return withDisplayPct("keyMessage", r.items, r.uniqueCount);
          })(),
          emphasis: (() => {
            const r = top("emphasis", 2);
            return withDisplayPct("emphasis", r.items, r.uniqueCount);
          })(),
          copyType: (() => {
            const r = top("copyType", 2);
            return withDisplayPct("copyType", r.items, r.uniqueCount);
          })(),
          ctaType: (() => {
            const r = top("ctaType", 2);
            return withDisplayPct("ctaType", r.items, r.uniqueCount);
          })(),
          ctaSize: (() => {
            const r = top("ctaSize", 2);
            return withDisplayPct("ctaSize", r.items, r.uniqueCount);
          })(),
          textBucket: (() => {
            const bucket = (r) => (r >= 0.55 ? "텍스트↑" : r >= 0.35 ? "텍스트↔" : "텍스트↓");
            const counts = arr.reduce((acc, x) => {
              const b = bucket(x.textRatio);
              acc[b] = (acc[b] || 0) + 1;
              return acc;
            }, {});
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 2)
              .map(([k, v]) => ({
                k,
                v,
                ratio: v / total,
                displayPct: smoothedPct({
                  count: v,
                  total,
                  uniqueCount: Object.keys(counts).length || 1,
                  seedStr: `${brandId}:textBucket:${k}`,
                }),
              }));
          })(),
        };

        const typeGroups =
          ds?.creativeTypeGroups?.filter((g) => g.brandId === brandId).sort((a, b) => (b.predictedGroupScore || 0) - (a.predictedGroupScore || 0)) ||
          [];

        return {
          brandId,
          total,
          breakdown: {
            imageRatio: image / total,
            videoRatio: video / total,
            normalRatio: normal / total,
            partnershipRatio: partnership / total,
            image,
            video,
            normal,
            partnership,
          },
          repeating,
          typeGroups,
        };
      });

      return out.sort((a, b) => {
        const A = getBrand(a.brandId);
        const B = getBrand(b.brandId);
        if (A?.isOwn && !B?.isOwn) return -1;
        if (!A?.isOwn && B?.isOwn) return 1;
        return b.total - a.total;
      });
    }, [ds?.version, resultsByBrand]);

    // Phase IA-3: 브랜드 요약 분리 (자사 vs 경쟁)
    const ownBrandSummary = useMemo(() =>
      brandSummaries.find(bs => getBrand(bs.brandId)?.isOwn),
      [brandSummaries]
    );

    const competitorBrandSummaries = useMemo(() =>
      brandSummaries.filter(bs => !getBrand(bs.brandId)?.isOwn),
      [brandSummaries]
    );

    const partnershipInsights = useMemo(() => {
      const partnerships = results.filter((c) => c.adType === "partnership");
      const byBrand = groupBy(partnerships, (c) => c.brandId);

      const brandCards = Object.entries(byBrand).map(([brandId, arr]) => {
        const infCounts = arr.reduce((acc, c) => {
          (c.influencerIds || []).forEach((id) => {
            acc[id] = (acc[id] || 0) + 1;
          });
          return acc;
        }, {});
        const topInfluencers = Object.entries(infCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([id, count]) => ({ influencer: getInfluencer(id), count }));

        const commonCopy = arr.reduce((acc, c) => {
          acc[c.copyType] = (acc[c.copyType] || 0) + 1;
          return acc;
        }, {});
        const commonLayout = arr.reduce((acc, c) => {
          acc[c.layout] = (acc[c.layout] || 0) + 1;
          return acc;
        }, {});
        const topCopyType = Object.entries(commonCopy).sort((a, b) => b[1] - a[1])[0]?.[0];
        const topLayout = Object.entries(commonLayout).sort((a, b) => b[1] - a[1])[0]?.[0];

        return {
          brandId,
          total: arr.length,
          topInfluencers,
          topCopyType,
          topLayout,
          examples: arr.slice(0, 3),
        };
      });

      return brandCards.sort((a, b) => b.total - a.total);
    }, [results]);

    const promoInsights = useMemo(() => {
      const inPromo = promoPool;

      const ownBrand = BRANDS.find((b) => b.isOwn)?.id || "oliveyoung";
      const ownCreatives = inPromo.filter((c) => c.brandId === ownBrand);
      const competitors = inPromo.filter((c) => c.brandId !== ownBrand);

      const avg = (arr) => {
        if (!arr.length) return { ctr: 0, roas: 0, cvr: 0 };
        const ctr = arr.reduce((s, c) => s + (0.8 + c.predictedScore) * 1.2, 0) / arr.length;
        const roas = arr.reduce((s, c) => s + (250 + c.predictedScore * 650), 0) / arr.length;
        const cvr = arr.reduce((s, c) => s + (0.3 + c.predictedScore) * 0.8, 0) / arr.length;
        return { ctr, roas, cvr };
      };

      const ownAvg = avg(ownCreatives);
      const bestOwn = [...ownCreatives].sort((a, b) => b.predictedScore - a.predictedScore).slice(0, 5);

      const spend = Math.round(ownCreatives.length * 1100000);
      const revenue = Math.round((spend * ownAvg.roas) / 100);
      const marginRate = 0.28 + clamp((ownAvg.cvr - 0.6) / 4, -0.05, 0.07);
      const contributionProfit = Math.round(revenue * clamp(marginRate, 0.2, 0.4));

      const compByBrand = groupBy(competitors, (c) => c.brandId);
      const compCards = Object.entries(compByBrand)
        .map(([brandId, arr]) => ({
          brandId,
          total: arr.length,
          top: [...arr].sort((a, b) => b.predictedScore - a.predictedScore).slice(0, 5),
        }))
        .sort((a, b) => b.total - a.total);

      return { ownBrandId: ownBrand, ownAvg, spend, revenue, contributionProfit, bestOwn, compCards };
    }, [promoPool]);

    const recommendedTypeGroups = useMemo(() => {
      const all = ds?.creativeTypeGroups || [];
      return all.slice().sort((a, b) => (b.predictedGroupScore || 0) - (a.predictedGroupScore || 0)).slice(0, 2);
    }, [ds?.version]);

    const abTestSuggestions = useMemo(() => ds?.abTestSuggestions || [], [ds?.version]);
    const compareSlice = useMemo(() => ds?.competitiveCompareSlices?.[0] || null, [ds?.version]);
    const compareRow = useMemo(() => {
      if (!compareSlice) return null;
      return (compareSlice.rowsByAxis || []).find((r) => r.axisKey === compareAxisKey) || compareSlice.rowsByAxis?.[0] || null;
    }, [compareAxisKey, compareSlice]);

    const openTypeGroup = (groupId) => setTypeGroupModal({ open: true, groupId });
    const currentTypeGroup = useMemo(() => {
      if (!typeGroupModal.open) return null;
      return (ds?.creativeTypeGroups || []).find((g) => g.id === typeGroupModal.groupId) || null;
    }, [ds?.version, typeGroupModal]);

    // Phase IA-3: BrandSummaryCard 컴포넌트 분리
    const BrandSummaryCard = ({ brandSummary, highlighted = false }) => {
      const bs = brandSummary;
      const brand = getBrand(bs.brandId);
      const b = bs.breakdown;

      const containerClassName = highlighted
        ? "rounded-2xl border-2 border-blue-500 bg-blue-50 p-4 shadow-md"
        : "rounded-2xl border p-4";

      return (
        <div className={containerClassName}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="h-8 w-8 text-sm rounded-lg bg-zinc-100 flex items-center justify-center font-semibold text-zinc-700"
                  title={bs.brandId}
                  aria-label={`${bs.brandId} 로고`}
                >
                  {bs.brandId ? bs.brandId.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="text-base font-semibold">{brand?.name}</div>
                {brand?.isOwn && <Pill tone="blue">자사</Pill>}
                <Pill>검색 결과 {bs.total}개</Pill>
              </div>

              <div className="grid gap-2 text-sm text-zinc-700 md:grid-cols-2">
                <div className="rounded-xl bg-zinc-50 p-3">
                  <div className="font-semibold">소재 유형 비중</div>
                  <div className="mt-3 space-y-3">
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-zinc-600">미디어</div>
                      <StackedBar
                        parts={[
                          { key: "img", label: `이미지 ${b.image}`, valuePct: b.imageRatio * 100, className: "bg-blue-500" },
                          { key: "vid", label: `영상 ${b.video}`, valuePct: b.videoRatio * 100, className: "bg-violet-500" },
                        ]}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <BarRow label={`이미지 (${b.image})`} valuePct={b.imageRatio * 100} tone="blue" />
                        <BarRow label={`영상 (${b.video})`} valuePct={b.videoRatio * 100} tone="purple" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-zinc-600">광고 유형</div>
                      <StackedBar
                        parts={[
                          { key: "normal", label: `일반 ${b.normal}`, valuePct: b.normalRatio * 100, className: "bg-zinc-700" },
                          { key: "part", label: `파트너십 ${b.partnership}`, valuePct: b.partnershipRatio * 100, className: "bg-emerald-500" },
                        ]}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <BarRow label={`일반 (${b.normal})`} valuePct={b.normalRatio * 100} tone="zinc" />
                        <BarRow label={`파트너십 (${b.partnership})`} valuePct={b.partnershipRatio * 100} tone="emerald" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-zinc-50 p-3">
                  <div className="font-semibold">유의미하게 반복되는 특징</div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-zinc-600">레이아웃</div>
                      {(bs.repeating.layout || []).slice(0, 2).map((t) => (
                        <MiniBarRow key={`layout-${t.k}`} label={t.label} valuePct={t.displayPct ?? t.ratio * 100} tone="emerald" />
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-zinc-600">카피</div>
                      {(bs.repeating.copyType || []).slice(0, 2).map((t) => (
                        <MiniBarRow key={`copy-${t.k}`} label={t.k} valuePct={t.displayPct ?? t.ratio * 100} tone="amber" />
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-zinc-600">CTA</div>
                      {(bs.repeating.ctaType || []).slice(0, 2).map((t) => (
                        <MiniBarRow key={`cta-${t.k}`} label={t.k} valuePct={t.displayPct ?? t.ratio * 100} tone="blue" />
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-zinc-600">텍스트 비중</div>
                      {(bs.repeating.textBucket || []).slice(0, 2).map((t) => (
                        <MiniBarRow key={`text-${t.k}`} label={t.k} valuePct={t.displayPct ?? t.ratio * 100} tone="zinc" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full shrink-0 space-y-2 md:w-[320px] lg:w-[340px]">
              <div className="font-semibold">소재 유형 (최대 5개)</div>
              <div className="space-y-2">
                {bs.typeGroups.length === 0 && (
                  <div className="rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-600">
                    아직 소재 유형이 분류되지 않았습니다.
                  </div>
                )}
                {(expandedTypeGroupBrands[bs.brandId] ? bs.typeGroups : bs.typeGroups.slice(0, 2)).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => openTypeGroup(g.id)}
                    className="w-full rounded-xl border bg-white p-2.5 text-left hover:bg-zinc-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold">{g.name}</div>
                      <div className="text-xs text-zinc-500">score {Math.round((g.predictedGroupScore || 0) * 100)}</div>
                    </div>
                    <div className="mt-2 text-xs text-zinc-600 line-clamp-2">{g.description}</div>
                  </button>
                ))}

                {bs.typeGroups.length > 2 && (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedTypeGroupBrands((prev) => ({
                        ...prev,
                        [bs.brandId]: !prev[bs.brandId],
                      }))
                    }
                    className="w-full rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50 inline-flex items-center justify-center gap-1"
                    aria-label={expandedTypeGroupBrands[bs.brandId] ? "접기" : "더 보기"}
                  >
                    <span>{expandedTypeGroupBrands[bs.brandId] ? "접기" : `더 보기 (+${bs.typeGroups.length - 2})`}</span>
                    <span className="text-base leading-none">{expandedTypeGroupBrands[bs.brandId] ? "▲" : "▼"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* brand creatives list */}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(resultsByBrand[bs.brandId] || []).slice(0, 4).map((c) => (
              <CreativeCard key={c.id} creative={c} variant="compact" onClick={() => setSelectedCreative(c)} />
            ))}
          </div>
        </div>
      );
    };

    // Phase IA-5: ABTestModal 컴포넌트
    const ABTestModal = ({ abTest, open, onClose }) => {
      // 디버깅: 항상 true로 테스트
      if (!open) return null;

      // 테스트: abTest가 없어도 기본 내용 표시
      if (!abTest) {
        return (
          <Modal open={open} onClose={onClose} title="테스트 Modal">
            <div className="p-4">
              <div className="text-lg">abTest 데이터가 없습니다.</div>
              <div className="mt-2 text-sm text-zinc-600">버튼 클릭이 정상 작동하는지 확인하는 테스트입니다.</div>
            </div>
          </Modal>
        );
      }

      // 안전하게 데이터 추출
      const objective = abTest.objective || "A/B 테스트";
      const periodDays = abTest.periodDays || 7;
      const creativesPerGroup = abTest.creativesPerGroup || 2;
      const budgetPerDay = abTest.budgetPerDay || 0;
      const placements = abTest.placements || [];
      const groups = abTest.groups || [];
      const evidence = abTest.evidence;

      return (
        <Modal open={open} onClose={onClose} title={`A/B 테스트 제안 · ${objective}`}>
          <div className="max-h-[80vh] space-y-4 overflow-y-auto">
            {/* 기본 정보 */}
            <div className="rounded-xl bg-zinc-50 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="amber">
                  {periodDays}일 · {creativesPerGroup}개/그룹
                </Pill>
                <Pill>예산 {budgetPerDay.toLocaleString()}원/일</Pill>
              </div>
              {placements.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {placements.map((p, idx) => (
                    <Pill key={`${abTest.id}:place:${idx}`} tone="blue">{p}</Pill>
                  ))}
                </div>
              )}
            </div>

            {/* A/B 그룹별 크리에이티브 플랜 */}
            {groups.length > 0 && (
              <div>
                <div className="font-semibold">크리에이티브 플랜</div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {groups.map((g) => {
                    const groupKey = g.key || "A";
                    const conceptName = g.conceptName || "컨셉";
                    const hypothesis = g.hypothesis || "";
                    const creativePlan = g.creativePlan || [];

                    return (
                      <div key={`${abTest.id}:${groupKey}`} className="rounded-xl border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold">{groupKey}안</div>
                          <Pill tone={groupKey === "A" ? "blue" : "amber"}>{conceptName}</Pill>
                        </div>
                        {hypothesis && (
                          <div className="mt-2 text-sm text-zinc-700">{hypothesis}</div>
                        )}

                        {creativePlan.length > 0 && (
                          <div className="mt-3 space-y-3">
                            {creativePlan.map((p, pIdx) => {
                              const typeKey = p.typeKey || "type";
                              const typeLabel = p.typeLabel || typeKey;
                              const keyMessage = p.keyMessage || "";
                              const assetExamples = p.assetExamples || [];
                              const requiredElements = p.requiredElements || [];

                              return (
                                <div key={`${abTest.id}:${groupKey}:${typeKey}:${pIdx}`} className="rounded-xl bg-zinc-50 p-2.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-semibold">{typeLabel}</div>
                                    {keyMessage && <Pill>메시지: {keyMessage}</Pill>}
                                  </div>
                                  {assetExamples.length > 0 && (
                                    <div className="mt-2 grid grid-cols-3 gap-2">
                                      {assetExamples.slice(0, 3).map((ex, exIdx) => (
                                        <img
                                          key={ex.id || `ex-${exIdx}`}
                                          src={ex.thumbnailUrl}
                                          alt={`${typeLabel} example`}
                                          className="h-20 w-20 rounded-xl border bg-white object-cover"
                                          loading="lazy"
                                          draggable="false"
                                        />
                                      ))}
                                    </div>
                                  )}
                                  {requiredElements.length > 0 && (
                                    <div className="mt-2 text-[11px] text-zinc-600">
                                      {requiredElements.slice(0, 3).join(" · ")}
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

            {/* 추천 근거 */}
            {evidence && (
              <div className="rounded-xl border bg-white p-3">
                <div className="text-sm font-semibold">추천 근거</div>
                {evidence.summary && (
                  <div className="mt-2 text-sm text-zinc-700">{evidence.summary}</div>
                )}
                {evidence.drivers && evidence.drivers.length > 0 && (
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {evidence.drivers.slice(0, 4).map((d, i) => (
                      <div key={`${abTest.id}:drv:${i}`} className="rounded-xl bg-zinc-50 p-2.5 text-sm text-zinc-700">
                        <div className="font-semibold">{d.label || "항목"}</div>
                        <div className="mt-1">{d.value || "-"}</div>
                        {d.pct != null && <div className="mt-1 text-xs text-zinc-500">{d.pct.toFixed(0)}%</div>}
                      </div>
                    ))}
                  </div>
                )}
                {evidence.supportingStats && (
                  <div className="mt-3 text-xs text-zinc-500">
                    표본 {evidence.supportingStats.sampleSize || 0} · top10 평균 score{" "}
                    {evidence.supportingStats.avgScoreTop10 ?? "-"}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      );
    };

    return (
      <PageShell
        title="소재 검색 결과"
        subtitle="프로모션 기간 소재를 요약해 빠르게 다음 기획 액션(추천 소재 유형/우수 소재/A·B 테스트)을 결정할 수 있게 돕습니다."
        right={
          <>
            <Tabs
              value={activeTab}
              onChange={setActiveTab}
              items={[
                { value: "overview", label: "📊 개요" },
                { value: "compare", label: "⚖️ 비교" },
                { value: "details", label: "🔍 상세 분석" },
                { value: "library", label: "📚 검색 결과" },
              ]}
            />
            <KpiStrip
              items={[
                { key: "q", label: "검색어", value: queryLabel, tone: "blue" },
                { key: "t", label: "총", value: `${mockTotalResults}건` },
                { key: "ms", label: "검색 시간", value: `${Math.round(searchTimeMs)}ms`, tone: "amber" },
              ]}
            />
          </>
        }
      >
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* 1. 전체 인사이트 요약 - 기본 접힌 상태 */}
            <AccordionSection
              title="전체 인사이트 요약"
              subtitle="프로모션 기간 전체 소재 트렌드와 패턴 요약"
              collapsed={insightsSummaryCollapsed}
              onToggle={() => setInsightsSummaryCollapsed((v) => !v)}
              className="fixed left-4 top-4 z-[80] w-[min(420px,calc(100vw-2rem))] shadow-xl"
              contentClassName="max-h-[70vh] overflow-auto"
            >
              <InsightsSummary
                results={results}
                brandSummaries={brandSummaries}
                recommendedClusters={[]} // legacy prop kept; v2 uses dedicated section below
                abSuggestionForCluster={() => null}
                defaultCollapsed={true}
              />
            </AccordionSection>

            {/* 2. 대표 소재 Quick Pick - 항상 펼쳐짐, 시각적 강조 */}
            <div className="rounded-2xl border-2 border-blue-500 bg-blue-50 p-4 shadow-md">
              <SectionHeader title="🎯 대표 소재 (요약)" subtitle="자사 Top 3 + 경쟁 Top 3 예시" />
              <div className="grid gap-3 md:grid-cols-2">
                {promoInsights.bestOwn.slice(0, 3).map((c) => (
                  <CreativeCard key={`own-${c.id}`} creative={c} onClick={() => setSelectedCreative(c)} />
                ))}
                {promoInsights.compCards
                  .flatMap((x) => x.top.slice(0, 1))
                  .slice(0, 3)
                  .map((c) => (
                    <CreativeCard key={`comp-${c.id}`} creative={c} onClick={() => setSelectedCreative(c)} />
                  ))}
              </div>
            </div>

              {/* Recommended type groups + AB test suggestions (v2) */}
              <div className="rounded-2xl border bg-white p-4">
                <SectionHeader
                  title="추천 소재 유형(Top 2) + A/B 테스트 제안"
                  subtitle="추천은 요약만 먼저 보여주고, 근거/예시는 클릭 시 펼쳐서 확인합니다."
                />

                <div className="grid gap-4 md:grid-cols-2">
                  {recommendedTypeGroups.map((g) => {
                    const brand = getBrand(g.brandId);
                    return (
                      <div key={g.id} className="rounded-2xl border p-4">
                        <div className="flex flex-col gap-3">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="font-semibold">
                                {brand?.name} · {g.name}
                              </div>
                              <Pill tone="green">score {Math.round((g.predictedGroupScore || 0) * 100)}</Pill>
                            </div>
                            <div className="text-sm text-zinc-700">{g.description}</div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openTypeGroup(g.id)}
                                className="rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
                              >
                                유형 상세 보기 →
                              </button>
                            </div>
                          </div>

                          <div className="rounded-2xl border bg-zinc-50 p-3">
                            <div className="text-sm font-semibold text-zinc-900">대표 예시</div>
                            <div className="mt-2 grid grid-cols-4 gap-2">
                              {(g.heroThumbnailUrls || []).slice(0, 4).map((url, i) => (
                                <img
                                  key={`gthumb-${g.id}-${i}`}
                                  src={url}
                                  alt={`${g.name} example ${i + 1}`}
                                  className="h-16 w-16 rounded-xl border bg-white object-cover"
                                  loading="lazy"
                                  draggable="false"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 4. A/B 테스트 제안 - 초간소화 */}
                {abTestSuggestions.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="font-semibold">A/B 테스트 제안</div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {abTestSuggestions.slice(0, 2).map((ab) => (
                        <div key={ab.id} className="rounded-2xl border p-4">
                          <div className="space-y-3">
                            <div>
                              <div className="font-semibold text-zinc-900">
                                동일 상품/프로모션 기준 A/B · {ab.objective}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Pill tone="amber">
                                  {ab.periodDays}일 · {ab.creativesPerGroup}개/그룹
                                </Pill>
                                <Pill>예산 {ab.budgetPerDay.toLocaleString()}원/일</Pill>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {(ab.placements || []).slice(0, 3).map((p) => (
                                <Pill key={`${ab.id}:${p}`} tone="blue">
                                  {p}
                                </Pill>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => setAbTestModalOpen(ab.id)}
                              className="rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
                            >
                              제안 상세 보기 →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            {/* 5. Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("compare")}
                className="rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
              >
                ⚖️ 경쟁 비교하기
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className="rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
              >
                🔍 심화 분석 보기
              </button>
            </div>

            </div>
        )}

        {activeTab === "details" && (
          <>
            <AccordionSection
              title="프로모션 인사이트"
              subtitle={`${activePromo.key} · ${activePromo.start}~${activePromo.end}`}
              collapsed={promoCollapsed}
              onToggle={() => setPromoCollapsed((v) => !v)}
              right={
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("library");
                    setLibraryFilters({ brandId: "oliveyoung", mediaType: "all", adType: "normal" });
                  }}
                  className="rounded-xl border bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  예시 보기 →
                </button>
              }
            >
              <PromoPanel promoInsights={promoInsights} onPickCreative={(c) => setSelectedCreative(c)} variant="embedded" />
            </AccordionSection>

            <AccordionSection
              title="파트너십 인사이트"
              subtitle="브랜드별 자주 노출되는 인플루언서 + 공통 특징"
              collapsed={partnershipCollapsed}
              onToggle={() => setPartnershipCollapsed((v) => !v)}
              right={
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("library");
                    setLibraryFilters({ brandId: "all", mediaType: "all", adType: "partnership" });
                  }}
                  className="rounded-xl border bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  예시 보기 →
                </button>
              }
            >
              <PartnershipPanel
                partnershipInsights={partnershipInsights}
                onPickCreative={(c) => setSelectedCreative(c)}
                variant="embedded"
              />
            </AccordionSection>

            {/* Own vs competitor compare */}
            <div className="rounded-2xl border bg-white p-4">
              <SectionHeader
                title="자사 vs 경쟁 비교"
                subtitle="축을 선택하면 동일 스케일로 비교해 차이를 빠르게 확인합니다."
                right={
                  compareSlice ? (
                    <label className="text-sm text-zinc-600">
                      축{" "}
                      <select
                        className="ml-1 rounded-lg border bg-white px-2 py-1 text-sm"
                        value={compareAxisKey}
                        onChange={(e) => setCompareAxisKey(e.target.value)}
                      >
                        {(compareSlice.compareAxes || []).map((a) => (
                          <option key={a.axisKey} value={a.axisKey}>
                            {a.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <Pill tone="neutral">v2 데이터 없음</Pill>
                  )
                }
              />

              {!compareSlice || !compareRow ? (
                <div className="rounded-xl border bg-zinc-50 p-4 text-center">
                  <div className="text-sm text-zinc-600">비교할 데이터가 없습니다.</div>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border bg-white p-3">
                    <div className="text-sm font-semibold">{compareRow.label}</div>
                    <div className="mt-3 space-y-3">
                      {compareRow.ownValue?.kind === "pct" ? (
                        <>
                          <BarRow
                            label={`자사(${getBrand(compareSlice.ownBrandId)?.name})`}
                            valuePct={compareRow.ownValue.value}
                            tone="blue"
                          />
                          {(compareRow.competitorValues || []).map((cv) => (
                            <BarRow
                              key={`cmp-${cv.brandId}`}
                              label={`경쟁(${getBrand(cv.brandId)?.name})`}
                              valuePct={cv.value?.value || 0}
                              tone="zinc"
                            />
                          ))}
                        </>
                      ) : (
                        <div className="space-y-2 text-sm text-zinc-700">
                          <div className="rounded-xl bg-zinc-50 p-2.5">
                            <div className="text-xs text-zinc-500">자사</div>
                            <div className="mt-1 font-semibold">{compareRow.ownValue?.display || compareRow.ownValue?.value}</div>
                          </div>
                          <div className="rounded-xl bg-zinc-50 p-2.5">
                            <div className="text-xs text-zinc-500">경쟁</div>
                            <div className="mt-1 space-y-1">
                              {(compareRow.competitorValues || []).map((cv) => (
                                <div key={`lbl-${cv.brandId}`} className="flex items-center justify-between gap-2">
                                  <div className="text-zinc-500">{getBrand(cv.brandId)?.name}</div>
                                  <div className="font-semibold">{cv.value?.display || cv.value?.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border bg-white p-3">
                    <div className="text-sm font-semibold">차이 요약</div>
                    <div className="mt-2 text-sm text-zinc-700">
                      {compareRow.ownValue?.kind === "pct" ? (
                        (() => {
                          const own = compareRow.ownValue.value || 0;
                          const bestGap = (compareRow.competitorValues || [])
                            .map((cv) => ({
                              brandId: cv.brandId,
                              v: cv.value?.value || 0,
                              gap: Math.abs((cv.value?.value || 0) - own),
                            }))
                            .sort((a, b) => b.gap - a.gap)[0];
                          if (!bestGap) return "비교할 경쟁 데이터가 부족합니다.";
                          const sign = bestGap.v - own >= 0 ? "높음" : "낮음";
                          return `자사는 ${own.toFixed(1)}%이고, ${getBrand(bestGap.brandId)?.name}는 ${bestGap.v.toFixed(
                            1
                          )}%로 ${bestGap.gap.toFixed(1)}%p ${sign}입니다.`;
                        })()
                      ) : (
                        "라벨 축은 값 자체를 비교합니다. (퍼센트 축을 선택하면 차이 요약을 수치로 제공합니다.)"
                      )}
                    </div>
                    <div className="mt-3 text-xs text-zinc-500">
                      * 프로토타입 데이터는 v2 목업(`competitiveCompareSlices`) 기반이며 실제 제품에서는 집계 로그로 대체합니다.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "compare" && (
          <div className="space-y-6">
            {/* 1. 자사 브랜드 요약 - 최상단 고정, 하이라이트 */}
            {ownBrandSummary && (
              <div>
                <SectionHeader title="🏢 자사 브랜드" subtitle="우리 브랜드의 소재 특징을 먼저 확인하세요." />
                <div className="mt-3">
                  <BrandSummaryCard brandSummary={ownBrandSummary} highlighted={true} />
                </div>
              </div>
            )}

            {/* 2. 자사 vs 경쟁 비교 차트 */}
            <div className="rounded-2xl border bg-white p-4">
              <SectionHeader
                title="자사 vs 경쟁 비교"
                subtitle="축을 선택하면 동일 스케일로 비교해 차이를 빠르게 확인합니다."
                right={
                  compareSlice ? (
                    <label className="text-sm text-zinc-600">
                      축{" "}
                      <select
                        className="ml-1 rounded-lg border bg-white px-2 py-1 text-sm"
                        value={compareAxisKey}
                        onChange={(e) => setCompareAxisKey(e.target.value)}
                      >
                        {(compareSlice.rowsByAxis || []).map((r) => (
                          <option key={r.axisKey} value={r.axisKey}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <Pill tone="neutral">v2 데이터 없음</Pill>
                  )
                }
              />

              {!compareSlice || !compareRow ? (
                <div className="rounded-xl border bg-zinc-50 p-4 text-center">
                  <div className="text-sm text-zinc-600">비교할 데이터가 없습니다.</div>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border bg-white p-3">
                    <div className="text-sm font-semibold">{compareRow.label}</div>
                    <div className="mt-3 space-y-3">
                      {compareRow.ownValue?.kind === "pct" ? (
                        <>
                          <BarRow
                            label={`자사(${getBrand(compareSlice.ownBrandId)?.name})`}
                            valuePct={compareRow.ownValue.value}
                            tone="blue"
                          />
                          {(compareRow.competitorValues || []).map((cv) => (
                            <BarRow
                              key={`cmp-${cv.brandId}`}
                              label={`경쟁(${getBrand(cv.brandId)?.name})`}
                              valuePct={cv.value?.value || 0}
                              tone="zinc"
                            />
                          ))}
                        </>
                      ) : (
                        <div className="space-y-2 text-sm text-zinc-700">
                          <div className="rounded-xl bg-zinc-50 p-2.5">
                            <div className="text-xs text-zinc-500">자사</div>
                            <div className="mt-1 font-semibold">{compareRow.ownValue?.display || compareRow.ownValue?.value}</div>
                          </div>
                          <div className="rounded-xl bg-zinc-50 p-2.5">
                            <div className="text-xs text-zinc-500">경쟁</div>
                            <div className="mt-1 space-y-1">
                              {(compareRow.competitorValues || []).map((cv) => (
                                <div key={`lbl-${cv.brandId}`} className="flex items-center justify-between gap-2">
                                  <div className="text-zinc-500">{getBrand(cv.brandId)?.name}</div>
                                  <div className="font-semibold">{cv.value?.display || cv.value?.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border bg-white p-3">
                    <div className="text-sm font-semibold">차이 요약</div>
                    <div className="mt-2 text-sm text-zinc-700">
                      {compareRow.ownValue?.kind === "pct" ? (
                        (() => {
                          const own = compareRow.ownValue.value || 0;
                          const bestGap = (compareRow.competitorValues || [])
                            .map((cv) => ({
                              brandId: cv.brandId,
                              v: cv.value?.value || 0,
                              gap: Math.abs((cv.value?.value || 0) - own),
                            }))
                            .sort((a, b) => b.gap - a.gap)[0];
                          if (!bestGap) return "비교할 경쟁 데이터가 부족합니다.";
                          const sign = bestGap.v - own >= 0 ? "높음" : "낮음";
                          return `자사는 ${own.toFixed(1)}%이고, ${getBrand(bestGap.brandId)?.name}는 ${bestGap.v.toFixed(
                            1
                          )}%로 ${bestGap.gap.toFixed(1)}%p ${sign}입니다.`;
                        })()
                      ) : (
                        "라벨 축은 값 자체를 비교합니다. (퍼센트 축을 선택하면 차이 요약을 수치로 제공합니다.)"
                      )}
                    </div>
                    <div className="mt-3 text-xs text-zinc-500">
                      * 프로토타입 데이터는 v2 목업(`competitiveCompareSlices`) 기반이며 실제 제품에서는 집계 로그로 대체합니다.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. 경쟁 브랜드별 요약 - 기본 접힌 상태 */}
            <div className="rounded-2xl border bg-white p-4">
              <SectionHeader title="경쟁 브랜드 요약" subtitle="관심있는 경쟁 브랜드를 펼쳐서 상세히 확인하세요." />

              <div className="space-y-2">
                {competitorBrandSummaries.length === 0 && (
                  <div className="rounded-xl border bg-zinc-50 p-4 text-center">
                    <div className="text-sm text-zinc-600">경쟁 브랜드 데이터가 없습니다.</div>
                  </div>
                )}
                {competitorBrandSummaries.map((bs) => {
                  const brand = getBrand(bs.brandId);
                  const isExpanded = expandedBrands[bs.brandId];

                  return (
                    <div key={bs.brandId} className="rounded-xl border">
                      {/* 헤더 */}
                      <button
                        onClick={() => setExpandedBrands(prev => ({
                          ...prev,
                          [bs.brandId]: !prev[bs.brandId]
                        }))}
                        className="w-full p-3 text-left hover:bg-zinc-50 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">{brand?.name}</div>
                          <Pill>검색 결과 {bs.total}개</Pill>
                        </div>
                        <span className="text-base leading-none">{isExpanded ? "▲" : "▼"}</span>
                      </button>

                      {/* 본문 */}
                      {isExpanded && (
                        <div className="border-t p-3">
                          <BrandSummaryCard brandSummary={bs} />

                          {/* "이 브랜드 검색" 버튼 */}
                          <button
                            onClick={() => {
                              setActiveTab("library");
                              setLibraryFilters({ brandId: bs.brandId, mediaType: "all", adType: "all" });
                            }}
                            className="mt-3 rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
                          >
                            이 브랜드 검색 →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "library" && (
          <>
            <div className="rounded-2xl border bg-white p-4">
              <SectionHeader
                title="예시 카드 (필터)"
                subtitle="필터로 범위를 좁히고, 카드를 클릭해 상세를 확인하세요."
                right={
                  <Pill>
                    {Math.min(libraryResultLimit, filteredResults.length)} / {filteredResults.length}개 노출
                  </Pill>
                }
              />

              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm text-zinc-600">필터:</div>
                <label className="text-sm text-zinc-600">
                  브랜드{" "}
                  <select
                    className="ml-1 rounded-lg border bg-white px-2 py-1 text-sm"
                    value={libraryFilters.brandId}
                    onChange={(e) => setLibraryFilters((p) => ({ ...p, brandId: e.target.value }))}
                  >
                    <option value="all">전체</option>
                    {BRANDS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-zinc-600">
                  미디어{" "}
                  <select
                    className="ml-1 rounded-lg border bg-white px-2 py-1 text-sm"
                    value={libraryFilters.mediaType}
                    onChange={(e) => setLibraryFilters((p) => ({ ...p, mediaType: e.target.value }))}
                  >
                    <option value="all">전체</option>
                    <option value="image">이미지</option>
                    <option value="video">영상</option>
                  </select>
                </label>
                <label className="text-sm text-zinc-600">
                  유형{" "}
                  <select
                    className="ml-1 rounded-lg border bg-white px-2 py-1 text-sm"
                    value={libraryFilters.adType}
                    onChange={(e) => setLibraryFilters((p) => ({ ...p, adType: e.target.value }))}
                  >
                    <option value="all">전체</option>
                    <option value="normal">일반</option>
                    <option value="partnership">파트너십</option>
                  </select>
                </label>
                {(() => {
                  const activeCount = Object.values(libraryFilters).filter((v) => v !== "all" && v !== "").length;
                  return activeCount > 0 ? <Pill tone="blue">{activeCount}개 필터 적용됨</Pill> : null;
                })()}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {filteredResults.slice(0, libraryResultLimit).map((c) => (
                  <CreativeCard key={c.id} creative={c} onClick={() => setSelectedCreative(c)} />
                ))}
              </div>

              {filteredResults.length > libraryResultLimit && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLibraryResultLimit((prev) => prev + 36)}
                    className="rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50 inline-flex items-center gap-1"
                  >
                    <span>더 보기 (+36)</span>
                    <span className="text-base leading-none">▼</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLibraryResultLimit(filteredResults.length)}
                    className="rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
                  >
                    전체 보기
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Creative Detail Drawer */}
        <Drawer
          open={!!selectedCreative}
          title={selectedCreative ? `소재 상세 · ${selectedCreative.title}` : "소재 상세"}
          onClose={() => setSelectedCreative(null)}
          width="w-[min(620px,calc(100%-2rem))]"
        >
          {selectedCreative && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="blue">{getBrand(selectedCreative.brandId)?.name}</Pill>
                {selectedCreative.adType === "partnership" && <Pill tone="purple">파트너십</Pill>}
                <Pill>{selectedCreative.mediaType}</Pill>
                {badgeHighEfficiency(selectedCreative) && <Pill tone="green">고효율 예상</Pill>}
                <Pill>runDays {selectedCreative.runDays}</Pill>
              </div>

              <div className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700">{selectedCreative.caption}</div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border p-3">
                  <div className="font-semibold">핵심 특징</div>
                  <div className="mt-2 space-y-1 text-sm text-zinc-700">
                    <div>키 메시지: {selectedCreative.keyMessage}</div>
                    <div>강조점: {selectedCreative.emphasis}</div>
                    <div>카피 유형: {selectedCreative.copyType}</div>
                    <div>
                      CTA: {selectedCreative.ctaType} (크기 {selectedCreative.ctaSize})
                    </div>
                    <div>텍스트 비중: {formatPct(selectedCreative.textRatio * 100)}</div>
                    <div>
                      운영 기간: {selectedCreative.startDate} ~ {selectedCreative.endDate}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">레이아웃 실루엣</div>
                    <Pill tone="amber">{LAYOUT_LIBRARY[selectedCreative.layout]?.name}</Pill>
                  </div>
                  <div className="mt-2 flex justify-center">
                    <LayoutSilhouette layoutKey={selectedCreative.layout} />
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">* 실제 제품에서는 이미지 분석으로 silhouette/레이아웃을 자동 추출한다고 가정</div>
                </div>
              </div>

              {selectedCreative.adType === "partnership" && (
                <div className="rounded-xl border p-3">
                  <div className="font-semibold">파트너십 정보</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selectedCreative.influencerIds || []).map((id) => {
                      const inf = getInfluencer(id);
                      if (!inf) return null;
                      return (
                        <div key={id} className="rounded-xl bg-zinc-50 px-3 py-2 text-sm">
                          <div className="font-semibold">
                            {inf.avatar} {inf.name} <span className="text-zinc-500">{inf.handle}</span>
                          </div>
                          <div className="text-xs text-zinc-600">
                            {inf.niche} · {inf.followers}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </Drawer>

        {/* Type group modal (replaces legacy "cluster") */}
        <TypeGroupModal
          open={typeGroupModal.open}
          group={currentTypeGroup}
          brandName={currentTypeGroup ? getBrand(currentTypeGroup.brandId)?.name : ""}
          onClose={() => setTypeGroupModal({ open: false, groupId: null })}
          onJumpToExamples={() => setActiveTab("library")}
        />

        {/* Phase IA-5: A/B Test Modal */}
        <ABTestModal
          abTest={abTestSuggestions.find(a => a.id === abTestModalOpen)}
          open={!!abTestModalOpen}
          onClose={() => setAbTestModalOpen(null)}
        />

        <BackToTopButton />
        <ChatPanel open={chatOpen} onOpenChange={setChatOpen} />
      </PageShell>
    );
  }

  window.__APP.pages.creativeSearch = CreativeSearchPage;
})();

