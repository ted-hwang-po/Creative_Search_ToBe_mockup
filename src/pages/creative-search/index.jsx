// Creative Search page - main wiring component
// Composes all sub-components from creativeSearchComponents
// Registers to window.__APP.pages.creativeSearch

(function () {
  window.__APP = window.__APP || {};
  window.__APP.pages = window.__APP.pages || {};

  // ---------- Shared UI ----------
  var Pill = window.__APP.ui.Pill;
  var Drawer = window.__APP.ui.Drawer;
  var SectionHeader = window.__APP.ui.SectionHeader;
  var Tabs = window.__APP.ui.Tabs;
  var AccordionSection = window.__APP.ui.AccordionSection;
  var PageShell = window.__APP.ui.PageShell;
  var KpiStrip = window.__APP.ui.KpiStrip;
  var BackToTopButton = window.__APP.ui.BackToTopButton;
  var BarRow = window.__APP.ui.BarRow;
  var TypeGroupModal = window.__APP.ui.TypeGroupModal;
  var ChatPanel = window.__APP.ui.ChatPanel;

  // ---------- Sub-components ----------
  var comps = window.__APP.pages.creativeSearchComponents;
  var CreativeCard = comps.CreativeCard;
  var LayoutSilhouette = comps.LayoutSilhouette;
  var InsightsSummary = comps.InsightsSummary;
  var BrandSummaryCard = comps.BrandSummaryCard;
  var CompetitorBrandList = comps.CompetitorBrandList;
  var PromoPanel = comps.PromoPanel;
  var PartnershipPanel = comps.PartnershipPanel;
  var ABSection = comps.ABSection;
  var ResultList = comps.ResultList;
  var LAYOUT_LIBRARY = comps.LAYOUT_LIBRARY;
  var getBrand = comps.getBrand;
  var formatPct = comps.formatPct;

  // ---------- v1 fallback data ----------
  var PROMO = { key: "\uC62C\uC601 \uC138\uC77C", start: "2026-02-28", end: "2026-03-06" };

  var BRANDS_V1 = [
    { id: "oliveyoung", name: "\uC62C\uB9AC\uBE0C\uC601", isOwn: true },
    { id: "innisfree", name: "\uC774\uB2C8\uC2A4\uD504\uB9AC" },
    { id: "labiotte", name: "\uB77C\uBE44\uC624\uB728" },
    { id: "roundlab", name: "\uB77C\uC6B4\uB4DC\uB7A9" },
    { id: "hera", name: "\uD5E4\uB77C" },
  ];

  var INFLUENCERS = [
    { id: "inf_1", name: "\uBBFC\uC9C0(Minji)", handle: "@minji_daily", niche: "\uBDF0\uD2F0/\uB370\uC77C\uB9AC", followers: "128K", avatar: "\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83C\uDFA4" },
    { id: "inf_2", name: "\uC218\uC544(Sua)", handle: "@sua_makeup", niche: "\uBA54\uC774\uD06C\uC5C5", followers: "312K", avatar: "\uD83D\uDC84" },
    { id: "inf_3", name: "\uC9C0\uD6C8(Jihoon)", handle: "@jihoon_review", niche: "\uB9AC\uBDF0/\uBE44\uAD50", followers: "86K", avatar: "\uD83D\uDCE6" },
    { id: "inf_4", name: "\uC608\uB9B0(Yerin)", handle: "@yerin_beauty", niche: "\uC2A4\uD0A8\uCF00\uC5B4", followers: "410K", avatar: "\uD83E\uDDF4" },
  ];

  // v1 mock creatives (for backward compat when v2 dataset not loaded)
  var MOCK_CREATIVES = [
    { id: "c_oy_001", brandId: "oliveyoung", title: "\uC62C\uC601\uC138\uC77C | \uCFE0\uD3F0+\uCD94\uAC00\uD560\uC778", caption: "\uC62C\uC601 \uC138\uC77C! \uCFE0\uD3F0 \uBC1B\uAE30 + \uCD94\uAC00 \uD560\uC778 \uD61C\uD0DD", tags: ["\uC62C\uC601 \uC138\uC77C", "\uCFE0\uD3F0", "\uD560\uC778", "\uAE34\uAE09\uC131"], mediaType: "image", adType: "normal", runDays: 10, startDate: "2026-02-28", endDate: "2026-03-05", layout: "grid-3-benefits", keyMessage: "\uCFE0\uD3F0+\uCD94\uAC00\uD560\uC778\uC73C\uB85C \uCD5C\uC800\uAC00", emphasis: "\uD61C\uD0DD", copyType: "\uAE34\uAE09\uC131", ctaType: "\uCFE0\uD3F0 \uBC1B\uAE30", ctaSize: "L", textRatio: 0.45, predictedScore: 0.86, thumb: "\uD83D\uDFE9", thumbUrl: "./assets/thumbs/oliveyoung.svg" },
    { id: "c_oy_002", brandId: "oliveyoung", title: "\uBCA0\uC2A4\uD2B8\uD15C TOP", caption: "\uBCA0\uC2A4\uD2B8 TOP! \uC9C0\uAE08 \uBC14\uB85C \uB2F4\uAE30", tags: ["\uBCA0\uC2A4\uD2B8", "\uD61C\uD0DD \uAC15\uC870"], mediaType: "video", adType: "normal", runDays: 5, startDate: "2026-03-02", endDate: "2026-03-06", layout: "hero-product-left", keyMessage: "\uBCA0\uC2A4\uD2B8\uB97C \uD55C \uBC88\uC5D0", emphasis: "\uD050\uB808\uC774\uC158", copyType: "\uD61C\uD0DD \uAC15\uC870", ctaType: "\uAD6C\uB9E4\uD558\uAE30", ctaSize: "M", textRatio: 0.25, predictedScore: 0.71, thumb: "\uD83D\uDFE6", thumbUrl: "./assets/thumbs/oliveyoung.svg" },
    { id: "c_oy_003", brandId: "oliveyoung", title: "\uD30C\uD2B8\uB108\uC2ED | \uBBFC\uC9C0 \uD53D", caption: "\uBBFC\uC9C0 \uD53D! \uC138\uC77C \uAE30\uAC04 \uCD94\uCC9C\uD15C \uACF5\uAC1C", tags: ["\uD30C\uD2B8\uB108\uC2ED", "\uC778\uD50C\uB8E8\uC5B8\uC11C", "\uC62C\uC601 \uC138\uC77C"], mediaType: "video", adType: "partnership", influencerIds: ["inf_1"], runDays: 12, startDate: "2026-02-28", endDate: "2026-03-06", layout: "ugc-caption-heavy", keyMessage: "\uC778\uD50C\uB8E8\uC5B8\uC11C \uCD94\uCC9C + \uC138\uC77C \uD61C\uD0DD", emphasis: "\uC2E0\uB8B0", copyType: "\uB9AC\uBDF0/\uC2E0\uB8B0", ctaType: "\uC790\uC138\uD788 \uBCF4\uAE30", ctaSize: "S", textRatio: 0.55, predictedScore: 0.9, thumb: "\uD83D\uDFE5", thumbUrl: "./assets/thumbs/oliveyoung.svg" },
  ];

  // ---------- Helpers ----------
  function inRange(date, start, end) {
    var d = new Date(date).getTime();
    var s = new Date(start).getTime();
    var e = new Date(end).getTime();
    return d >= s && d <= e;
  }

  function getInfluencer(id) {
    return INFLUENCERS.find(function (x) { return x.id === id; });
  }

  var badgeHighEfficiency = window.__APP.ui.badgeHighEfficiency || function (creative) {
    return creative.runDays >= 5 && creative.predictedScore >= 0.75;
  };

  function mockLexicalScore(q, creative) {
    if (!q) return 0;
    var hay = (creative.title + " " + creative.caption).toLowerCase();
    var qq = q.toLowerCase();
    return hay.includes(qq) ? 1 : 0;
  }

  function mockSemanticScore(q, creative) {
    if (!q) return 0;
    var qq = q.toLowerCase();
    var tags = (creative.tags || []).map(function (t) { return t.toLowerCase(); });
    var hits = tags.filter(function (t) { return t.includes(qq) || qq.includes(t); }).length;
    return Math.min(1, hits * 0.35);
  }

  function calcSearchScore(q, mode, creative) {
    var lex = mockLexicalScore(q, creative);
    var sem = mockSemanticScore(q, creative);
    if (mode === "lexical") return lex;
    if (mode === "semantic") return sem;
    return Math.min(1, lex * 0.55 + sem * 0.7);
  }

  function groupBy(arr, keyFn) {
    return arr.reduce(function (acc, x) {
      var k = keyFn(x);
      acc[k] = acc[k] || [];
      acc[k].push(x);
      return acc;
    }, {});
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function hashStringToInt(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  function seededRand01(seedStr) {
    var x = hashStringToInt(seedStr) || 1;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 1000000) / 1000000;
  }

  function smoothedPct(_ref) {
    var count = _ref.count;
    var total = _ref.total;
    var uniqueCount = _ref.uniqueCount;
    var seedStr = _ref.seedStr;
    var t = Math.max(1, total);
    var k = Math.max(1, uniqueCount);
    var alpha = 1.7;
    var base = ((count + alpha) / (t + alpha * k)) * 100;
    var jitter = (seededRand01(seedStr) * 2 - 1) * 3.2;
    return clamp(base + jitter, 0, 100);
  }

  // ---------- Page Root ----------
  function CreativeSearchPage() {
    var ds = (window.__APP && window.__APP.dataset && window.__APP.dataset.creativeSearchV2) || null;
    var dsPromo = ds && ds.promos && ds.promos[0] || null;
    var activePromo = dsPromo ? { key: dsPromo.key, start: dsPromo.start, end: dsPromo.end, id: dsPromo.id } : PROMO;

    var BRANDS = (ds && ds.brands) || BRANDS_V1;

    var queryLabel = "\uC9C0\uB09C \uC62C\uB9AC\uBE0C\uC601 \uC138\uC77C \uAE30\uAC04 \uC18C\uC7AC";
    var query = "";
    var searchModeState = useState("hybrid");
    var searchMode = searchModeState[0];
    var selectedCreativeState = useState(null);
    var selectedCreative = selectedCreativeState[0];
    var setSelectedCreative = selectedCreativeState[1];
    var activeTabState = useState("overview");
    var activeTab = activeTabState[0];
    var setActiveTab = activeTabState[1];
    var chatOpenState = useState(false);
    var chatOpen = chatOpenState[0];
    var setChatOpen = chatOpenState[1];

    var expandedTypeGroupBrandsState = useState({});
    var expandedTypeGroupBrands = expandedTypeGroupBrandsState[0];
    var setExpandedTypeGroupBrands = expandedTypeGroupBrandsState[1];
    var typeGroupModalState = useState({ open: false, groupId: null });
    var typeGroupModal = typeGroupModalState[0];
    var setTypeGroupModal = typeGroupModalState[1];

    var libraryFiltersState = useState({ brandId: "all", mediaType: "all", adType: "all" });
    var libraryFilters = libraryFiltersState[0];
    var setLibraryFilters = libraryFiltersState[1];
    var libraryResultLimitState = useState(36);
    var libraryResultLimit = libraryResultLimitState[0];
    var setLibraryResultLimit = libraryResultLimitState[1];
    var insightsSummaryCollapsedState = useState(true);
    var insightsSummaryCollapsed = insightsSummaryCollapsedState[0];
    var setInsightsSummaryCollapsed = insightsSummaryCollapsedState[1];
    var promoCollapsedState = useState(true);
    var promoCollapsed = promoCollapsedState[0];
    var setPromoCollapsed = promoCollapsedState[1];
    var partnershipCollapsedState = useState(true);
    var partnershipCollapsed = partnershipCollapsedState[0];
    var setPartnershipCollapsed = partnershipCollapsedState[1];
    var compareAxisKeyState = useState("mediaRatio");
    var compareAxisKey = compareAxisKeyState[0];
    var setCompareAxisKey = compareAxisKeyState[1];
    var expandedBrandsState = useState({});
    var expandedBrands = expandedBrandsState[0];
    var setExpandedBrands = expandedBrandsState[1];
    var abTestModalOpenState = useState(null);
    var abTestModalOpen = abTestModalOpenState[0];
    var setAbTestModalOpen = abTestModalOpenState[1];

    var promoPool = useMemo(function () {
      if (ds && ds.creativeAssets && ds.creativeAssets.length && dsPromo && dsPromo.id) {
        return ds.creativeAssets.filter(function (c) { return c.promoId === dsPromo.id; });
      }
      return MOCK_CREATIVES.filter(function (c) {
        return inRange(c.startDate, PROMO.start, PROMO.end) || inRange(c.endDate, PROMO.start, PROMO.end);
      });
    }, [ds && ds.version, dsPromo && dsPromo.id]);

    var results = useMemo(function () {
      var scored = promoPool
        .map(function (c) { return Object.assign({}, c, { _score: calcSearchScore(query, searchMode, c) }); })
        .filter(function (c) { return c._score > 0 || query.trim() === ""; })
        .sort(function (a, b) { return b._score - a._score || b.predictedScore - a.predictedScore; });
      return scored;
    }, [promoPool, query, searchMode]);

    var filteredResults = useMemo(function () {
      return results.filter(function (c) {
        if (libraryFilters.brandId !== "all" && c.brandId !== libraryFilters.brandId) return false;
        if (libraryFilters.mediaType !== "all" && c.mediaType !== libraryFilters.mediaType) return false;
        if (libraryFilters.adType !== "all" && c.adType !== libraryFilters.adType) return false;
        return true;
      });
    }, [libraryFilters.adType, libraryFilters.brandId, libraryFilters.mediaType, results]);

    var mockTotalResults = useMemo(function () {
      var base = 320;
      var jitter = hashStringToInt(query + ":" + searchMode) % 120;
      return base + jitter;
    }, [query, searchMode]);

    var searchTimeMs = useMemo(function () {
      var base = 110 + mockTotalResults * 0.55;
      var jitter = hashStringToInt(query + ":" + searchMode + ":" + mockTotalResults) % 140;
      return Math.max(60, Math.min(520, base + jitter));
    }, [query, searchMode, mockTotalResults]);

    var resultsByBrand = useMemo(function () { return groupBy(results, function (c) { return c.brandId; }); }, [results]);

    var brandSummaries = useMemo(function () {
      var out = Object.entries(resultsByBrand).map(function (_ref) {
        var brandId = _ref[0];
        var arr = _ref[1];
        var total = arr.length || 1;
        var image = arr.filter(function (x) { return x.mediaType === "image"; }).length;
        var video = arr.filter(function (x) { return x.mediaType === "video"; }).length;
        var normal = arr.filter(function (x) { return x.adType === "normal"; }).length;
        var partnership = arr.filter(function (x) { return x.adType === "partnership"; }).length;

        var top = function (field, n) {
          n = n || 3;
          var counts = arr.reduce(function (acc, x) {
            var v = x[field];
            if (!v) return acc;
            acc[v] = (acc[v] || 0) + 1;
            return acc;
          }, {});
          var items = Object.entries(counts)
            .sort(function (a, b) { return b[1] - a[1]; })
            .slice(0, n)
            .map(function (_ref) { return { k: _ref[0], v: _ref[1] }; });
          return { items: items, uniqueCount: Object.keys(counts).length || 1 };
        };

        var withDisplayPct = function (kind, items, uniqueCount) {
          return items.map(function (t) {
            return Object.assign({}, t, {
              ratio: t.v / total,
              displayPct: smoothedPct({ count: t.v, total: total, uniqueCount: uniqueCount, seedStr: brandId + ":" + kind + ":" + t.k }),
            });
          });
        };

        var repeating = {
          layout: (function () {
            var r = top("layout", 2);
            // Also check layoutKey for v2 compat
            if (r.items.length === 0) r = top("layoutKey", 2);
            return withDisplayPct("layout", r.items, r.uniqueCount).map(function (t) {
              return Object.assign({}, t, { label: (LAYOUT_LIBRARY[t.k] && LAYOUT_LIBRARY[t.k].name) || t.k });
            });
          })(),
          keyMessage: (function () {
            var r = top("keyMessage", 2);
            return withDisplayPct("keyMessage", r.items, r.uniqueCount);
          })(),
          emphasis: (function () {
            var r = top("emphasis", 2);
            return withDisplayPct("emphasis", r.items, r.uniqueCount);
          })(),
          copyType: (function () {
            var r = top("copyType", 2);
            return withDisplayPct("copyType", r.items, r.uniqueCount);
          })(),
          ctaType: (function () {
            var r = top("ctaType", 2);
            return withDisplayPct("ctaType", r.items, r.uniqueCount);
          })(),
          ctaSize: (function () {
            var r = top("ctaSize", 2);
            return withDisplayPct("ctaSize", r.items, r.uniqueCount);
          })(),
          textBucket: (function () {
            var bucket = function (r) { return r >= 0.55 ? "\uD14D\uC2A4\uD2B8\u2191" : r >= 0.35 ? "\uD14D\uC2A4\uD2B8\u2194" : "\uD14D\uC2A4\uD2B8\u2193"; };
            var counts = arr.reduce(function (acc, x) {
              var b = bucket(x.textRatio);
              acc[b] = (acc[b] || 0) + 1;
              return acc;
            }, {});
            return Object.entries(counts)
              .sort(function (a, b) { return b[1] - a[1]; })
              .slice(0, 2)
              .map(function (_ref) {
                return {
                  k: _ref[0],
                  v: _ref[1],
                  ratio: _ref[1] / total,
                  displayPct: smoothedPct({ count: _ref[1], total: total, uniqueCount: Object.keys(counts).length || 1, seedStr: brandId + ":textBucket:" + _ref[0] }),
                };
              });
          })(),
        };

        var typeGroups =
          (ds && ds.creativeTypeGroups && ds.creativeTypeGroups.filter(function (g) { return g.brandId === brandId; }).sort(function (a, b) { return (b.predictedGroupScore || 0) - (a.predictedGroupScore || 0); })) ||
          [];

        return {
          brandId: brandId,
          total: total,
          breakdown: {
            imageRatio: image / total,
            videoRatio: video / total,
            normalRatio: normal / total,
            partnershipRatio: partnership / total,
            image: image,
            video: video,
            normal: normal,
            partnership: partnership,
          },
          repeating: repeating,
          typeGroups: typeGroups,
        };
      });

      return out.sort(function (a, b) {
        var A = getBrand(a.brandId);
        var B = getBrand(b.brandId);
        if (A && A.isOwn && !(B && B.isOwn)) return -1;
        if (!(A && A.isOwn) && B && B.isOwn) return 1;
        return b.total - a.total;
      });
    }, [ds && ds.version, resultsByBrand]);

    var ownBrandSummary = useMemo(function () {
      return brandSummaries.find(function (bs) { var b = getBrand(bs.brandId); return b && b.isOwn; });
    }, [brandSummaries]);

    var competitorBrandSummaries = useMemo(function () {
      return brandSummaries.filter(function (bs) { var b = getBrand(bs.brandId); return !(b && b.isOwn); });
    }, [brandSummaries]);

    var partnershipInsights = useMemo(function () {
      var partnerships = results.filter(function (c) { return c.adType === "partnership"; });
      var byBrand = groupBy(partnerships, function (c) { return c.brandId; });

      var brandCards = Object.entries(byBrand).map(function (_ref) {
        var brandId = _ref[0];
        var arr = _ref[1];

        var infCounts = arr.reduce(function (acc, c) {
          (c.influencerIds || []).forEach(function (id) {
            acc[id] = (acc[id] || 0) + 1;
          });
          return acc;
        }, {});
        var topInfluencers = Object.entries(infCounts)
          .sort(function (a, b) { return b[1] - a[1]; })
          .slice(0, 4)
          .map(function (_ref) { return { influencer: getInfluencer(_ref[0]), count: _ref[1] }; });

        var commonCopy = arr.reduce(function (acc, c) { acc[c.copyType] = (acc[c.copyType] || 0) + 1; return acc; }, {});
        var commonLayout = arr.reduce(function (acc, c) { var lk = c.layout || c.layoutKey; acc[lk] = (acc[lk] || 0) + 1; return acc; }, {});
        var topCopyType = Object.entries(commonCopy).sort(function (a, b) { return b[1] - a[1]; })[0];
        var topLayout = Object.entries(commonLayout).sort(function (a, b) { return b[1] - a[1]; })[0];

        return {
          brandId: brandId,
          total: arr.length,
          topInfluencers: topInfluencers,
          topCopyType: topCopyType && topCopyType[0],
          topLayout: topLayout && topLayout[0],
          examples: arr.slice(0, 3),
        };
      });

      return brandCards.sort(function (a, b) { return b.total - a.total; });
    }, [results]);

    var promoInsights = useMemo(function () {
      var inPromo = promoPool;
      var ownBrandId = BRANDS.find(function (b) { return b.isOwn; });
      var ownBrand = (ownBrandId && ownBrandId.id) || "oliveyoung";
      var ownCreatives = inPromo.filter(function (c) { return c.brandId === ownBrand; });
      var competitors = inPromo.filter(function (c) { return c.brandId !== ownBrand; });

      var avg = function (arr) {
        if (!arr.length) return { ctr: 0, roas: 0, cvr: 0 };
        var ctr = arr.reduce(function (s, c) { return s + (0.8 + c.predictedScore) * 1.2; }, 0) / arr.length;
        var roas = arr.reduce(function (s, c) { return s + (250 + c.predictedScore * 650); }, 0) / arr.length;
        var cvr = arr.reduce(function (s, c) { return s + (0.3 + c.predictedScore) * 0.8; }, 0) / arr.length;
        return { ctr: ctr, roas: roas, cvr: cvr };
      };

      var ownAvg = avg(ownCreatives);
      var bestOwn = ownCreatives.slice().sort(function (a, b) { return b.predictedScore - a.predictedScore; }).slice(0, 5);

      var spend = Math.round(ownCreatives.length * 1100000);
      var revenue = Math.round((spend * ownAvg.roas) / 100);
      var marginRate = 0.28 + clamp((ownAvg.cvr - 0.6) / 4, -0.05, 0.07);
      var contributionProfit = Math.round(revenue * clamp(marginRate, 0.2, 0.4));

      var compByBrand = groupBy(competitors, function (c) { return c.brandId; });
      var compCards = Object.entries(compByBrand)
        .map(function (_ref) {
          return {
            brandId: _ref[0],
            total: _ref[1].length,
            top: _ref[1].slice().sort(function (a, b) { return b.predictedScore - a.predictedScore; }).slice(0, 5),
          };
        })
        .sort(function (a, b) { return b.total - a.total; });

      return { ownBrandId: ownBrand, ownAvg: ownAvg, spend: spend, revenue: revenue, contributionProfit: contributionProfit, bestOwn: bestOwn, compCards: compCards };
    }, [promoPool]);

    var recommendedTypeGroups = useMemo(function () {
      var all = (ds && ds.creativeTypeGroups) || [];
      return all.slice().sort(function (a, b) { return (b.predictedGroupScore || 0) - (a.predictedGroupScore || 0); }).slice(0, 2);
    }, [ds && ds.version]);

    var abTestSuggestions = useMemo(function () { return (ds && ds.abTestSuggestions) || []; }, [ds && ds.version]);
    var compareSlice = useMemo(function () { return (ds && ds.competitiveCompareSlices && ds.competitiveCompareSlices[0]) || null; }, [ds && ds.version]);
    var compareRow = useMemo(function () {
      if (!compareSlice) return null;
      return (compareSlice.rowsByAxis || []).find(function (r) { return r.axisKey === compareAxisKey; }) || (compareSlice.rowsByAxis && compareSlice.rowsByAxis[0]) || null;
    }, [compareAxisKey, compareSlice]);

    var openTypeGroup = function (groupId) { setTypeGroupModal({ open: true, groupId: groupId }); };
    var currentTypeGroup = useMemo(function () {
      if (!typeGroupModal.open) return null;
      return ((ds && ds.creativeTypeGroups) || []).find(function (g) { return g.id === typeGroupModal.groupId; }) || null;
    }, [ds && ds.version, typeGroupModal]);

    // ---------- Compare section renderer (shared between tabs) ----------
    function renderCompareSection() {
      return (
        <div className="rounded-2xl border bg-white p-4">
          <SectionHeader
            title={"\uC790\uC0AC vs \uACBD\uC7C1 \uBE44\uAD50"}
            subtitle={"\uCD95\uC744 \uC120\uD0DD\uD558\uBA74 \uB3D9\uC77C \uC2A4\uCF00\uC77C\uB85C \uBE44\uAD50\uD574 \uCC28\uC774\uB97C \uBE68\uB9AC \uD655\uC778\uD569\uB2C8\uB2E4."}
            right={
              compareSlice ? (
                <label className="text-sm text-zinc-600">
                  {"\uCD95 "}
                  <select
                    className="ml-1 rounded-lg border bg-white px-2 py-1 text-sm"
                    value={compareAxisKey}
                    onChange={function (e) { setCompareAxisKey(e.target.value); }}
                  >
                    {(compareSlice.rowsByAxis || compareSlice.compareAxes || []).map(function (a) {
                      return <option key={a.axisKey} value={a.axisKey}>{a.label}</option>;
                    })}
                  </select>
                </label>
              ) : (
                <Pill tone="neutral">{"v2 \uB370\uC774\uD130 \uC5C6\uC74C"}</Pill>
              )
            }
          />

          {!compareSlice || !compareRow ? (
            <div className="rounded-xl border bg-zinc-50 p-4 text-center">
              <div className="text-sm text-zinc-600">{"\uBE44\uAD50\uD560 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."}</div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border bg-white p-3">
                <div className="text-sm font-semibold">{compareRow.label}</div>
                <div className="mt-3 space-y-3">
                  {compareRow.ownValue && compareRow.ownValue.kind === "pct" ? (
                    <>
                      <BarRow
                        label={"\uC790\uC0AC(" + (getBrand(compareSlice.ownBrandId) && getBrand(compareSlice.ownBrandId).name) + ")"}
                        valuePct={compareRow.ownValue.value}
                        tone="blue"
                      />
                      {(compareRow.competitorValues || []).map(function (cv) {
                        return (
                          <BarRow
                            key={"cmp-" + cv.brandId}
                            label={"\uACBD\uC7C1(" + (getBrand(cv.brandId) && getBrand(cv.brandId).name) + ")"}
                            valuePct={(cv.value && cv.value.value) || 0}
                            tone="zinc"
                          />
                        );
                      })}
                    </>
                  ) : (
                    <div className="space-y-2 text-sm text-zinc-700">
                      <div className="rounded-xl bg-zinc-50 p-2.5">
                        <div className="text-xs text-zinc-500">{"\uC790\uC0AC"}</div>
                        <div className="mt-1 font-semibold">{(compareRow.ownValue && compareRow.ownValue.display) || (compareRow.ownValue && compareRow.ownValue.value)}</div>
                      </div>
                      <div className="rounded-xl bg-zinc-50 p-2.5">
                        <div className="text-xs text-zinc-500">{"\uACBD\uC7C1"}</div>
                        <div className="mt-1 space-y-1">
                          {(compareRow.competitorValues || []).map(function (cv) {
                            return (
                              <div key={"lbl-" + cv.brandId} className="flex items-center justify-between gap-2">
                                <div className="text-zinc-500">{getBrand(cv.brandId) && getBrand(cv.brandId).name}</div>
                                <div className="font-semibold">{(cv.value && cv.value.display) || (cv.value && cv.value.value)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border bg-white p-3">
                <div className="text-sm font-semibold">{"\uCC28\uC774 \uC694\uC57D"}</div>
                <div className="mt-2 text-sm text-zinc-700">
                  {compareRow.ownValue && compareRow.ownValue.kind === "pct" ? (
                    (function () {
                      var own = (compareRow.ownValue && compareRow.ownValue.value) || 0;
                      var bestGap = (compareRow.competitorValues || [])
                        .map(function (cv) { return { brandId: cv.brandId, v: (cv.value && cv.value.value) || 0, gap: Math.abs(((cv.value && cv.value.value) || 0) - own) }; })
                        .sort(function (a, b) { return b.gap - a.gap; })[0];
                      if (!bestGap) return "\uBE44\uAD50\uD560 \uACBD\uC7C1 \uB370\uC774\uD130\uAC00 \uBD80\uC871\uD569\uB2C8\uB2E4.";
                      var sign = bestGap.v - own >= 0 ? "\uB192\uC74C" : "\uB0AE\uC74C";
                      return "\uC790\uC0AC\uB294 " + own.toFixed(1) + "%\uC774\uACE0, " + (getBrand(bestGap.brandId) && getBrand(bestGap.brandId).name) + "\uB294 " + bestGap.v.toFixed(1) + "%\uB85C " + bestGap.gap.toFixed(1) + "%p " + sign + "\uC785\uB2C8\uB2E4.";
                    })()
                  ) : (
                    "\uB77C\uBCA8 \uCD95\uC740 \uAC12 \uC790\uCCB4\uB97C \uBE44\uAD50\uD569\uB2C8\uB2E4. (\uD37C\uC13C\uD2B8 \uCD95\uC744 \uC120\uD0DD\uD558\uBA74 \uCC28\uC774 \uC694\uC57D\uC744 \uC218\uCE58\uB85C \uC81C\uACF5\uD569\uB2C8\uB2E4.)"
                  )}
                </div>
                <div className="mt-3 text-xs text-zinc-500">
                  {"* \uD504\uB85C\uD1A0\uD0C0\uC785 \uB370\uC774\uD130\uB294 v2 \uBAA9\uC5C5(`competitiveCompareSlices`) \uAE30\uBC18\uC774\uBA70 \uC2E4\uC81C \uC81C\uD488\uC5D0\uC11C\uB294 \uC9D1\uACC4 \uB85C\uADF8\uB85C \uB300\uCCB4\uD569\uB2C8\uB2E4."}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <PageShell
        title={"\uC18C\uC7AC \uAC80\uC0C9 \uACB0\uACFC"}
        subtitle={"\uD504\uB85C\uBAA8\uC158 \uAE30\uAC04 \uC18C\uC7AC\uB97C \uC694\uC57D\uD574 \uBE60\uB974\uAC8C \uB2E4\uC74C \uAE30\uD68D \uC561\uC158(\uCD94\uCC9C \uC18C\uC7AC \uC720\uD615/\uC6B0\uC218 \uC18C\uC7AC/A\u00B7B \uD14C\uC2A4\uD2B8)\uC744 \uACB0\uC815\uD560 \uC218 \uC788\uAC8C \uB3D5\uB2C8\uB2E4."}
        right={
          <>
            <Tabs
              value={activeTab}
              onChange={setActiveTab}
              items={[
                { value: "overview", label: "\uD83D\uDCCA \uAC1C\uC694" },
                { value: "compare", label: "\u2696\uFE0F \uBE44\uAD50" },
                { value: "details", label: "\uD83D\uDD0D \uC0C1\uC138 \uBD84\uC11D" },
                { value: "library", label: "\uD83D\uDCDA \uAC80\uC0C9 \uACB0\uACFC" },
              ]}
            />
            <KpiStrip
              items={[
                { key: "q", label: "\uAC80\uC0C9\uC5B4", value: queryLabel, tone: "blue" },
                { key: "t", label: "\uCD1D", value: mockTotalResults + "\uAC74" },
                { key: "ms", label: "\uAC80\uC0C9 \uC2DC\uAC04", value: Math.round(searchTimeMs) + "ms", tone: "amber" },
              ]}
            />
          </>
        }
      >
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* 1. Insights summary */}
            <AccordionSection
              title={"\uC804\uCCB4 \uC778\uC0AC\uC774\uD2B8 \uC694\uC57D"}
              subtitle={"\uD504\uB85C\uBAA8\uC158 \uAE30\uAC04 \uC804\uCCB4 \uC18C\uC7AC \uD2B8\uB80C\uB4DC\uC640 \uD328\uD134 \uC694\uC57D"}
              collapsed={insightsSummaryCollapsed}
              onToggle={function () { setInsightsSummaryCollapsed(function (v) { return !v; }); }}
              className="fixed left-4 top-4 z-[80] w-[min(420px,calc(100vw-2rem))] shadow-xl"
              contentClassName="max-h-[70vh] overflow-auto"
            >
              <InsightsSummary
                results={results}
                brandSummaries={brandSummaries}
                recommendedClusters={[]}
                abSuggestionForCluster={function () { return null; }}
                defaultCollapsed={true}
              />
            </AccordionSection>

            {/* 2. Quick pick */}
            <div className="rounded-2xl border-2 border-blue-500 bg-blue-50 p-4 shadow-md">
              <SectionHeader title={"\uD83C\uDFAF \uB300\uD45C \uC18C\uC7AC (\uC694\uC57D)"} subtitle={"\uC790\uC0AC Top 3 + \uACBD\uC7C1 Top 3 \uC608\uC2DC"} />
              <div className="grid gap-3 md:grid-cols-2">
                {promoInsights.bestOwn.slice(0, 3).map(function (c) {
                  return <CreativeCard key={"own-" + c.id} creative={c} onClick={function () { setSelectedCreative(c); }} />;
                })}
                {promoInsights.compCards
                  .reduce(function (acc, x) { return acc.concat(x.top.slice(0, 1)); }, [])
                  .slice(0, 3)
                  .map(function (c) {
                    return <CreativeCard key={"comp-" + c.id} creative={c} onClick={function () { setSelectedCreative(c); }} />;
                  })}
              </div>
            </div>

            {/* 3. Recommended type groups + AB test */}
            <ABSection
              recommendedTypeGroups={recommendedTypeGroups}
              abTestSuggestions={abTestSuggestions}
              onOpenTypeGroup={openTypeGroup}
              abTestModalOpen={abTestModalOpen}
              onSetAbTestModalOpen={setAbTestModalOpen}
            />

            {/* 4. Quick actions */}
            <div className="flex gap-2">
              <button
                onClick={function () { setActiveTab("compare"); }}
                className="rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
              >
                {"\u2696\uFE0F \uACBD\uC7C1 \uBE44\uAD50\uD558\uAE30"}
              </button>
              <button
                onClick={function () { setActiveTab("details"); }}
                className="rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
              >
                {"\uD83D\uDD0D \uC2EC\uD654 \uBD84\uC11D \uBCF4\uAE30"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <>
            <AccordionSection
              title={"\uD504\uB85C\uBAA8\uC158 \uC778\uC0AC\uC774\uD2B8"}
              subtitle={activePromo.key + " \u00B7 " + activePromo.start + "~" + activePromo.end}
              collapsed={promoCollapsed}
              onToggle={function () { setPromoCollapsed(function (v) { return !v; }); }}
              right={
                <button
                  type="button"
                  onClick={function () {
                    setActiveTab("library");
                    setLibraryFilters({ brandId: "oliveyoung", mediaType: "all", adType: "normal" });
                  }}
                  className="rounded-xl border bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  {"\uC608\uC2DC \uBCF4\uAE30 \u2192"}
                </button>
              }
            >
              <PromoPanel promoInsights={promoInsights} onPickCreative={function (c) { setSelectedCreative(c); }} variant="embedded" promo={activePromo} />
            </AccordionSection>

            <AccordionSection
              title={"\uD30C\uD2B8\uB108\uC2ED \uC778\uC0AC\uC774\uD2B8"}
              subtitle={"\uBE0C\uB79C\uB4DC\uBCC4 \uC790\uC8FC \uB178\uCD9C\uB418\uB294 \uC778\uD50C\uB8E8\uC5B8\uC11C + \uACF5\uD1B5 \uD2B9\uC9D5"}
              collapsed={partnershipCollapsed}
              onToggle={function () { setPartnershipCollapsed(function (v) { return !v; }); }}
              right={
                <button
                  type="button"
                  onClick={function () {
                    setActiveTab("library");
                    setLibraryFilters({ brandId: "all", mediaType: "all", adType: "partnership" });
                  }}
                  className="rounded-xl border bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  {"\uC608\uC2DC \uBCF4\uAE30 \u2192"}
                </button>
              }
            >
              <PartnershipPanel
                partnershipInsights={partnershipInsights}
                onPickCreative={function (c) { setSelectedCreative(c); }}
                variant="embedded"
              />
            </AccordionSection>

            {/* Own vs competitor compare */}
            {renderCompareSection()}
          </>
        )}

        {activeTab === "compare" && (
          <div className="space-y-6">
            {/* 1. Own brand summary */}
            {ownBrandSummary && (
              <div>
                <SectionHeader title={"\uD83C\uDFE2 \uC790\uC0AC \uBE0C\uB79C\uB4DC"} subtitle={"\uC6B0\uB9AC \uBE0C\uB79C\uB4DC\uC758 \uC18C\uC7AC \uD2B9\uC9D5\uC744 \uBA3C\uC800 \uD655\uC778\uD558\uC138\uC694."} />
                <div className="mt-3">
                  <BrandSummaryCard
                    brandSummary={ownBrandSummary}
                    highlighted={true}
                    expandedTypeGroupBrands={expandedTypeGroupBrands}
                    onToggleTypeGroupExpand={function (brandId) {
                      setExpandedTypeGroupBrands(function (prev) {
                        var next = Object.assign({}, prev);
                        next[brandId] = !prev[brandId];
                        return next;
                      });
                    }}
                    onOpenTypeGroup={openTypeGroup}
                    resultsByBrand={resultsByBrand}
                    onPickCreative={function (c) { setSelectedCreative(c); }}
                  />
                </div>
              </div>
            )}

            {/* 2. Compare chart */}
            {renderCompareSection()}

            {/* 3. Competitor brands */}
            <CompetitorBrandList
              competitorBrandSummaries={competitorBrandSummaries}
              expandedBrands={expandedBrands}
              onToggleBrand={function (brandId) {
                setExpandedBrands(function (prev) {
                  var next = Object.assign({}, prev);
                  next[brandId] = !prev[brandId];
                  return next;
                });
              }}
              expandedTypeGroupBrands={expandedTypeGroupBrands}
              onToggleTypeGroupExpand={function (brandId) {
                setExpandedTypeGroupBrands(function (prev) {
                  var next = Object.assign({}, prev);
                  next[brandId] = !prev[brandId];
                  return next;
                });
              }}
              onOpenTypeGroup={openTypeGroup}
              resultsByBrand={resultsByBrand}
              onPickCreative={function (c) { setSelectedCreative(c); }}
              onBrandSearch={function (brandId) {
                setActiveTab("library");
                setLibraryFilters({ brandId: brandId, mediaType: "all", adType: "all" });
              }}
            />
          </div>
        )}

        {activeTab === "library" && (
          <ResultList
            filteredResults={filteredResults}
            libraryFilters={libraryFilters}
            onSetLibraryFilters={setLibraryFilters}
            libraryResultLimit={libraryResultLimit}
            onSetLibraryResultLimit={setLibraryResultLimit}
            onPickCreative={function (c) { setSelectedCreative(c); }}
            brands={BRANDS}
          />
        )}

        {/* Creative Detail Drawer */}
        <Drawer
          open={!!selectedCreative}
          title={selectedCreative ? "\uC18C\uC7AC \uC0C1\uC138 \u00B7 " + selectedCreative.title : "\uC18C\uC7AC \uC0C1\uC138"}
          onClose={function () { setSelectedCreative(null); }}
          width="w-[min(620px,calc(100%-2rem))]"
        >
          {selectedCreative && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="blue">{getBrand(selectedCreative.brandId) && getBrand(selectedCreative.brandId).name}</Pill>
                {selectedCreative.adType === "partnership" && <Pill tone="purple">{"\uD30C\uD2B8\uB108\uC2ED"}</Pill>}
                <Pill>{selectedCreative.mediaType}</Pill>
                {badgeHighEfficiency(selectedCreative) && <Pill tone="green">{"\uACE0\uD6A8\uC728 \uC608\uC0C1"}</Pill>}
                <Pill>{"runDays "}{selectedCreative.runDays}</Pill>
              </div>

              <div className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700">{selectedCreative.caption}</div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border p-3">
                  <div className="font-semibold">{"\uD575\uC2EC \uD2B9\uC9D5"}</div>
                  <div className="mt-2 space-y-1 text-sm text-zinc-700">
                    <div>{"\uD0A4 \uBA54\uC2DC\uC9C0: "}{selectedCreative.keyMessage}</div>
                    <div>{"\uAC15\uC870\uC810: "}{selectedCreative.emphasis}</div>
                    <div>{"\uCE74\uD53C \uC720\uD615: "}{selectedCreative.copyType}</div>
                    <div>
                      {"CTA: "}{selectedCreative.ctaType}{" (\uD06C\uAE30 "}{selectedCreative.ctaSize}{")"}
                    </div>
                    <div>{"\uD14D\uC2A4\uD2B8 \uBE44\uC911: "}{formatPct(selectedCreative.textRatio * 100)}</div>
                    <div>
                      {"\uC6B4\uC601 \uAE30\uAC04: "}{selectedCreative.startDate}{" ~ "}{selectedCreative.endDate}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{"\uB808\uC774\uC544\uC6C3 \uC2E4\uB8E8\uC5FF"}</div>
                    <Pill tone="amber">{LAYOUT_LIBRARY[selectedCreative.layout || selectedCreative.layoutKey] && LAYOUT_LIBRARY[selectedCreative.layout || selectedCreative.layoutKey].name}</Pill>
                  </div>
                  <div className="mt-2 flex justify-center">
                    <LayoutSilhouette layoutKey={selectedCreative.layout || selectedCreative.layoutKey} />
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">{"* \uC2E4\uC81C \uC81C\uD488\uC5D0\uC11C\uB294 \uC774\uBBF8\uC9C0 \uBD84\uC11D\uC73C\uB85C silhouette/\uB808\uC774\uC544\uC6C3\uC744 \uC790\uB3D9 \uCD94\uCD9C\uD55C\uB2E4\uACE0 \uAC00\uC815"}</div>
                </div>
              </div>

              {selectedCreative.adType === "partnership" && (
                <div className="rounded-xl border p-3">
                  <div className="font-semibold">{"\uD30C\uD2B8\uB108\uC2ED \uC815\uBCF4"}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selectedCreative.influencerIds || []).map(function (id) {
                      var inf = getInfluencer(id);
                      if (!inf) return null;
                      return (
                        <div key={id} className="rounded-xl bg-zinc-50 px-3 py-2 text-sm">
                          <div className="font-semibold">
                            {inf.avatar}{" "}{inf.name}{" "}<span className="text-zinc-500">{inf.handle}</span>
                          </div>
                          <div className="text-xs text-zinc-600">
                            {inf.niche}{" \u00B7 "}{inf.followers}
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

        {/* Type group modal */}
        <TypeGroupModal
          open={typeGroupModal.open}
          group={currentTypeGroup}
          brandName={currentTypeGroup ? (getBrand(currentTypeGroup.brandId) && getBrand(currentTypeGroup.brandId).name) : ""}
          onClose={function () { setTypeGroupModal({ open: false, groupId: null }); }}
          onJumpToExamples={function () { setActiveTab("library"); }}
        />

        <BackToTopButton />
        <ChatPanel open={chatOpen} onOpenChange={setChatOpen} config={{ placeholder: "\uAC80\uC0C9\uACB0\uACFC\uC5D0 \uB300\uD574 \uB354 \uAD81\uAE08\uD55C \uAC83\uC744 \uBB3C\uC5B4\uBCF4\uC138\uC694.", title: "AI Chat" }} />
      </PageShell>
    );
  }

  window.__APP.pages.creativeSearch = CreativeSearchPage;
})();
