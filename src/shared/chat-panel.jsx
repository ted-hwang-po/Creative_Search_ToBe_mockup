// Shared ChatPanel component used across all pages.
// Each page passes a config object to customize behavior.
//
// Config shape:
// {
//   title: "소재 도우미",
//   disclaimer: "프로토타입에서는 사전 설정된 응답을 제공합니다.",
//   initialMessages: [{ role: "assistant", text: "..." }],
//   quickActions: [{ label: "성분", action: "ingredient" }],
//   onSend: (text, helpers) => void,
//   onQuickAction: (action, helpers) => void,
//   renderMessage: (msg, index) => ReactElement | null,
// }

(function registerChatPanel() {
  var ui = window.__APP.ui;

  function ChatPanel({ open, onOpenChange, config }) {
    var cfg = config || {};
    var title = cfg.title || "소재 도우미";
    var disclaimer = cfg.disclaimer || "프로토타입에서는 사전 설정된 응답을 제공합니다.";

    var defaultInitial = [
      { role: "assistant", text: disclaimer },
    ];
    var initialMsgs = (cfg.initialMessages || []).length > 0
      ? [{ role: "assistant", text: disclaimer }].concat(cfg.initialMessages)
      : defaultInitial;

    var msgRef = useRef(initialMsgs);
    var rerender = useState(0)[1];
    var inputRef = useRef(null);
    var listRef = useRef(null);
    var inputText = useState("")[0];
    var setInputText = useState("")[1];
    // Re-implement with single useState for input
    var inputState = useState("");

    useEffect(function () {
      if (open && inputRef.current) inputRef.current.focus();
    }, [open]);

    useEffect(function () {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });

    function pushMsg(role, text, extra) {
      var msg = Object.assign({ role: role, text: text }, extra || {});
      msgRef.current = msgRef.current.concat([msg]);
      rerender(function (n) { return n + 1; });
    }

    function handleSend() {
      var text = inputState[0].trim();
      if (!text) return;
      pushMsg("user", text);
      inputState[1]("");

      var helpers = {
        pushAssistant: function (t, extra) { pushMsg("assistant", t, extra); },
        pushUser: function (t) { pushMsg("user", t); },
      };

      if (cfg.onSend) {
        cfg.onSend(text, helpers);
      } else {
        pushMsg("assistant", "정식 서비스에서 도움을 드리겠습니다. 지금은 프로토타입 모드입니다.");
      }
    }

    function handleQuickAction(action) {
      var helpers = {
        pushAssistant: function (t, extra) { pushMsg("assistant", t, extra); },
        pushUser: function (t) { pushMsg("user", t); },
      };
      if (cfg.onQuickAction) {
        cfg.onQuickAction(action, helpers);
      }
    }

    // Floating toggle button (always visible)
    if (!open) {
      return (
        <button
          type="button"
          onClick={function () { onOpenChange(true); }}
          className="fixed bottom-20 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full border bg-white/90 shadow-lg backdrop-blur hover:bg-white"
          aria-label="소재 도우미 열기"
          title="소재 도우미"
        >
          <span className="text-lg leading-none">💬</span>
        </button>
      );
    }

    var messages = msgRef.current;

    return (
      <div className="fixed bottom-20 right-6 z-[60] flex w-80 flex-col rounded-2xl border bg-white shadow-xl" style={{ maxHeight: "480px" }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-base">💬</span>
            <span className="text-sm font-semibold">{title}</span>
          </div>
          <button
            type="button"
            onClick={function () { onOpenChange(false); }}
            className="rounded-lg border bg-white px-2 py-1 text-xs text-zinc-900 hover:bg-zinc-50"
          >
            닫기
          </button>
        </div>

        {/* Quick Actions */}
        {cfg.quickActions && cfg.quickActions.length > 0 && (
          <div className="flex flex-wrap gap-1 border-b px-3 py-2">
            {cfg.quickActions.map(function (qa) {
              return (
                <button
                  key={qa.action}
                  type="button"
                  onClick={function () { handleQuickAction(qa.action); }}
                  className="rounded-full border bg-zinc-50 px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-100"
                >
                  {qa.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Messages */}
        <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-3" style={{ maxHeight: "320px" }}>
          {messages.map(function (msg, i) {
            // Allow custom message rendering
            if (cfg.renderMessage) {
              var custom = cfg.renderMessage(msg, i);
              if (custom) return <div key={i}>{custom}</div>;
            }
            var isUser = msg.role === "user";
            return (
              <div key={i} className={isUser ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm " +
                    (isUser
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-800")
                  }
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="border-t p-2">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={inputState[0]}
              onChange={function (e) { inputState[1](e.target.value); }}
              onKeyDown={function (e) {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="메시지를 입력하세요..."
              rows={1}
              className="flex-1 resize-none rounded-xl border bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300"
            />
            <button
              type="button"
              onClick={handleSend}
              className="shrink-0 rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    );
  }

  ui.ChatPanel = ChatPanel;
})();
