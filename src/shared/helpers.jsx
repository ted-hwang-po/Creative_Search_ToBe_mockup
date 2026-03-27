// Shared utility functions extracted from page-level duplications.
// Loaded early by boot.js so all pages can use them.

(function registerHelpers() {
  window.__APP = window.__APP || {};

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

  function formatPct(v) {
    return v.toFixed(1) + "%";
  }

  function safeText(s, max) {
    if (max === undefined) max = 10;
    return String(s || "")
      .replace(/[<>&]/g, "")
      .slice(0, max);
  }

  // Look up a brand from a list by id
  function findBrand(brands, brandId) {
    return (brands || []).find(function (b) { return b.id === brandId; });
  }

  // Date range overlap check
  function rangesOverlap(aStart, aEnd, bStart, bEnd) {
    return aStart <= bEnd && bStart <= aEnd;
  }

  // Smoothed percentage to reduce monotonous 28.6%/14.3% patterns from small samples
  function smoothedPct(raw, jitterSeed) {
    var r = seededRand01(String(jitterSeed || "sp"));
    var jitter = (r - 0.5) * 4;
    return clamp(raw + jitter, 0, 100);
  }

  window.__APP.helpers = {
    clamp: clamp,
    hashStringToInt: hashStringToInt,
    seededRand01: seededRand01,
    pick: pick,
    pickWeighted: pickWeighted,
    distribution: distribution,
    formatPct: formatPct,
    safeText: safeText,
    findBrand: findBrand,
    rangesOverlap: rangesOverlap,
    smoothedPct: smoothedPct,
  };
})();
