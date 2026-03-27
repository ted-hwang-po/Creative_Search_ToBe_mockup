// Shared UI primitives used across pages.
// Keep these generic so each page can evolve without depending on other pages.

(function registerSharedUI() {
  const ui = (window.__APP && window.__APP.ui) || (window.__APP.ui = {});

  function Pill({ children, tone = "neutral" }) {
    const tones = {
      neutral: "bg-zinc-100 text-zinc-800 border-zinc-200",
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      green: "bg-emerald-50 text-emerald-700 border-emerald-200",
      red: "bg-rose-50 text-rose-700 border-rose-200",
      purple: "bg-violet-50 text-violet-700 border-violet-200",
      amber: "bg-amber-50 text-amber-800 border-amber-200",
    };
    return (
      <span
        className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs ${
          tones[tone] || tones.neutral
        }`}
      >
        {children}
      </span>
    );
  }

  function Modal({ open, title, onClose, children, width = "max-w-3xl" }) {
    if (!open) return null;

    React.useEffect(() => {
      const onKeyDown = (e) => {
        if (e.key === "Escape") onClose?.();
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div className={`w-full ${width} rounded-2xl bg-white shadow-xl`}>
          <div className="flex items-center justify-between border-b p-4">
            <div className="text-base font-semibold">{title}</div>
            <button
              onClick={onClose}
              className="rounded-lg border bg-white px-2 py-1 text-sm text-zinc-900 hover:bg-zinc-50"
            >
              닫기
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    );
  }

  function SectionHeader({ title, subtitle, right }) {
    return (
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          {subtitle && <div className="text-sm text-zinc-600">{subtitle}</div>}
        </div>
        {right}
      </div>
    );
  }

  ui.Pill = Pill;
  ui.Modal = Modal;
  ui.SectionHeader = SectionHeader;
})();

