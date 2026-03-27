// URL State management via hash parameters.
// Hash format: #page-key?param1=value1&param2=value2

(function registerUrlState() {
  window.__APP = window.__APP || {};

  function parseHash(hash) {
    var h = (hash || window.location.hash || "").replace(/^#\/?/, "");
    var qIdx = h.indexOf("?");
    var route = qIdx >= 0 ? h.slice(0, qIdx) : h;
    var paramStr = qIdx >= 0 ? h.slice(qIdx + 1) : "";
    var params = {};
    if (paramStr) {
      paramStr.split("&").forEach(function (pair) {
        var parts = pair.split("=");
        if (parts[0]) params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || "");
      });
    }
    return { route: route.trim(), params: params };
  }

  function buildHash(route, params) {
    var pairs = [];
    var p = params || {};
    Object.keys(p).forEach(function (k) {
      if (p[k] !== undefined && p[k] !== null && p[k] !== "" && p[k] !== "all") {
        pairs.push(encodeURIComponent(k) + "=" + encodeURIComponent(p[k]));
      }
    });
    return "#" + route + (pairs.length ? "?" + pairs.join("&") : "");
  }

  // React hook: returns [params, setParams]
  // setParams merges new params into current
  function useHashParams() {
    var parsed = parseHash();
    var paramsRef = useRef(parsed.params);
    var routeRef = useRef(parsed.route);
    var rerender = useState(0)[1];

    useEffect(function () {
      function onHash() {
        var p = parseHash();
        paramsRef.current = p.params;
        routeRef.current = p.route;
        rerender(function (n) { return n + 1; });
      }
      window.addEventListener("hashchange", onHash);
      return function () { window.removeEventListener("hashchange", onHash); };
    }, []);

    function setParams(newParams) {
      var merged = Object.assign({}, paramsRef.current, newParams);
      // Remove empty/null values
      Object.keys(merged).forEach(function (k) {
        if (merged[k] === undefined || merged[k] === null || merged[k] === "" || merged[k] === "all") {
          delete merged[k];
        }
      });
      paramsRef.current = merged;
      window.location.hash = buildHash(routeRef.current, merged);
    }

    return [paramsRef.current, setParams];
  }

  window.__APP.urlState = {
    parseHash: parseHash,
    buildHash: buildHash,
    useHashParams: useHashParams,
  };
})();
