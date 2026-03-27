// Shared "고효율 예상" badge logic + tooltip text.
// Replaces the duplicated `badgeHighEfficiency(creative)` in every page.

(function registerHighEfficiency() {
  var ui = window.__APP.ui;

  // Composite rule: both operational days and predicted score must meet threshold
  function badgeHighEfficiency(creative) {
    return creative.runDays >= 5 && creative.predictedScore >= 0.75;
  }

  var HIGH_EFFICIENCY_TOOLTIP = "운영 5일 이상 + 예측 점수 상위 25%에 해당합니다";

  // Convenience component: renders the "고효율 예상" pill with tooltip if conditions met
  function HighEfficiencyBadge({ creative }) {
    if (!badgeHighEfficiency(creative)) return null;
    return (
      <span title={HIGH_EFFICIENCY_TOOLTIP}>
        <ui.Pill tone="green">고효율 예상</ui.Pill>
      </span>
    );
  }

  window.__APP.ui.badgeHighEfficiency = badgeHighEfficiency;
  window.__APP.ui.HighEfficiencyBadge = HighEfficiencyBadge;
  window.__APP.ui.HIGH_EFFICIENCY_TOOLTIP = HIGH_EFFICIENCY_TOOLTIP;
})();
