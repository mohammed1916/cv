import { COACHING_MODE_KEY, readCoachingMode, coachingInstructions } from './coachingMode';
import { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useChatContext } from "../../context/ChatContext";
import { useVisualizationContext } from "../../context/VisualizationContext";
import {
  defaultChatModel,
  getChatProvider,
  setChatProvider,
  streamProviderChat,
  subscribeChatProvider,
} from "../../services/chatProviders";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ResizablePanel from "../ResizablePanel";
import PanelScaleControl from "../shared/PanelScaleControl";
import { SelectModeToggle } from '../shared/CodeSelection.jsx';
import "./chatbot.css";

const Icon = ({ name }) => {
  const paths = {
    close: "M5 5l6 6m0-6-6 6",
    clear: "M4 5h8m-7 0 .7 8h4.6l.7-8M7 5V3h2v2",
    send: "M3 3l10 5-10 5 2-5-2-5zm2 5h5",
    plus: "M8 3v10M3 8h10",
    sidebar: "M2.5 3h11v10h-11zM6 3v10",
    newChat: "M8 3H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8M11.5 2.5l2 2L9 9H7V7z",
    select: "M4 3l7 5-4 1-1 4-2-10z",
    pin: "M5 3h6l-1 3 2 2H4l2-2-1-3zM8 8v5",
    trash: "M4 5h8m-7 0 .7 8h4.6l.7-8M7 5V3h2v2",
    float: "M3 3h4M3 3v4M13 3H9m4 0v4M3 13h4m-4 0V9m10 4H9m4 0V9",
  };
  return (
    <svg className="chat-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
};

const CHAT_PROVIDER_OPTIONS = [
  { value: "ollama-local", label: "Ollama Local" },
  { value: "ollama-cloud", label: "Ollama Cloud" },
  { value: "gemini", label: "Gemini" },
];

const LAYOUT_ZONES = {
  topLeft: { name: "Code Panel", label: "CODE", row: 0, col: 0 },
  topCenter: { name: "Visualization", label: "VIZ", row: 0, col: 1 },
  topRight: { name: "Problem Info", label: "INFO", row: 0, col: 2 },
  bottomLeft: { name: "Console / Output", label: "OUTPUT", row: 1, col: 0 },
  bottomCenter: { name: "Details Panel", label: "DETAILS", row: 1, col: 1 },
  bottomRight: { name: "Chat / Hints", label: "CHAT", row: 1, col: 2 },
};

// Keep the embedded tutor focused. This is deliberately narrow: normal coding
// questions are still sent to the selected model, while clear lifestyle/email
// requests get a useful local redirect without spending the user's API quota.
function isClearlyOffTopic(text = "") {
  const value = text.toLowerCase();
  return (
    /\b(hi|dear)\s+[a-z]/.test(value) &&
    /\b(regards|sincerely|thank you for your time|follow up regarding|interview process|managerial round)\b/.test(
      value,
    )
  );
}

const OFF_TOPIC_REPLY =
  "I’m the algorithm tutor for this visualizer, so I can help with the selected problem, its code, complexity, or its animation. For that email, a general writing assistant would be a better fit.";

/**
 * Formats the current visualizer step as a readable context string
 * to inject into the chat message before the user's question.
 */
function formatStepContext(step, problemTitle) {
  if (!step) return null;
  const lines = [`[Context: ${problemTitle || "Visualizer"} — Step data]`];
  for (const [key, value] of Object.entries(step)) {
    if (key === "buckets" && Array.isArray(value)) {
      const filled = value.filter((b) => b[0] !== Infinity);
      lines.push(`  buckets (filled): ${JSON.stringify(filled)}`);
    } else if (typeof value !== "object" || value === null) {
      lines.push(`  ${key}: ${value}`);
    } else if (Array.isArray(value)) {
      lines.push(`  ${key}: [${value.join(", ")}]`);
    }
  }
  return lines.join("\n");
}

function formatElementContext(label, data) {
  if (!data) return label;
  const lines = [`[Context: Selected element — ${label}]`];
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== "object" || value === null) {
      lines.push(`  ${key}: ${value}`);
    }
  }
  return lines.join("\n");
}

  const getClosestZone = (mouseX, mouseY) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const previewWidth = 600;
    const previewHeight = 400;
    const startX = centerX - previewWidth / 2;
    const startY = centerY - previewHeight / 2;

    const cellWidth = previewWidth / 3;
    const cellHeight = previewHeight / 2;

    let closest = null;
    let minDistance = Infinity;

    Object.entries(LAYOUT_ZONES).forEach(([key, zone]) => {
      const zoneX = startX + zone.col * cellWidth + cellWidth / 2;
      const zoneY = startY + zone.row * cellHeight + cellHeight / 2;
      const distance = Math.sqrt(
        Math.pow(mouseX - zoneX, 2) + Math.pow(mouseY - zoneY, 2),
      );

      if (distance < minDistance) {
        minDistance = distance;
        closest = key;
      }
    });

    return closest;
  };


export default function ChatDrawer() {
  const {
    messages,
    addMessage,
    updateLastMessage,
    togglePinChat,
    conversations,
    activeConversationId,
    newChat,
    switchChat,
    deleteChat,
    attachedContext,
    attachContext,
    clearContext,
    isOpen,
    closeChat,
    selectMode,
    disableSelectMode,
    codeSelections,
    toggleSelectMode,
    floatingMode,
    toggleFloatingMode,
  } = useChatContext();
  const [showCoachingInfo, setShowCoachingInfo] = useState(false);
  const [coachingAnchor, setCoachingAnchor] = useState(null);

  // Close the coaching info popup on Escape or any press outside it.
  useEffect(() => {
    if (!showCoachingInfo) return undefined;
    const onKey = (event) => { if (event.key === "Escape") setShowCoachingInfo(false); };
    const onDown = (event) => {
      if (!event.target.closest?.(".chat-coaching-popover, .chat-coaching-info")) setShowCoachingInfo(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown, true);
    };
  }, [showCoachingInfo]);
  const [providerMenuOpen, setProviderMenuOpen] = useState(false);
  const [coachingMode, setCoachingMode] = useState(() => {
    try { return readCoachingMode(window.localStorage); } catch { return false; }
  });
  function changeCoachingMode(enabled) {
    setCoachingMode(enabled);
    try { window.localStorage.setItem(COACHING_MODE_KEY, enabled ? 'on' : 'off'); } catch { /* Keep the choice for this session. */ }
  }
  const [historyOpen, setHistoryOpen] = useState(false);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [providerConfig, setProviderConfig] = useState(getChatProvider);
  const [ollamaApiKey, setOllamaApiKey] = useState(() => {
    try {
      return window.sessionStorage.getItem("chat.ollama-api-key") || "";
    } catch (err) {
      void err;
    }
    return "";
  });
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    try {
      return window.sessionStorage.getItem("chat.gemini-api-key") || "";
    } catch (err) {
      void err;
    }
    return "";
  });
  const selectedModel =
    providerConfig.model || defaultChatModel(providerConfig.provider);
  const selectedProviderLabel =
    providerConfig.provider === "gemini"
      ? "Gemini"
      : providerConfig.provider === "ollama-cloud"
        ? "Ollama Cloud"
        : "Ollama Local";

  useEffect(() => subscribeChatProvider(setProviderConfig), []);

  const handleToggleSelectMode = toggleSelectMode;

  const viz = useVisualizationContext();
  const {
    currentStep,
    problemTitle,
    problemDescription,
    problemState,
    getManifest,
  } = viz;
  const messagesEndRef = useRef(null);

  const isStreamingRef = useRef(false);
  const abortControllerRef = useRef(null);

  const [isStreaming, setIsStreaming] = useState(false);

  const handleStop = useCallback(() => {
    const controller = abortControllerRef.current;

    if (!controller || !isStreamingRef.current) {
      return;
    }

    controller.abort();

    abortControllerRef.current = null;
    isStreamingRef.current = false;
    setIsStreaming(false);

    // Preserve whatever text has already streamed.
    updateLastMessage({
      isStreaming: false,
    });
  }, [updateLastMessage]);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Floating position (persisted) and dragging refs — keep hooks unconditionally
  const [pos, setPos] = useState(() => {
    try {
      const s = window.localStorage.getItem("chat.pos");
      if (s) return JSON.parse(s);
    } catch (err) {
      void err;
    }
    // default near bottom-right
    return { x: Math.max(12, window.innerWidth - 440), y: Math.max(12, window.innerHeight - 620) };
  });

  // Chat size (persisted) — width and height for floating, width for docked
  const [chatSize, setChatSize] = useState(() => {
    try {
      const s = window.localStorage.getItem("chat.size");
      if (s) return JSON.parse(s);
    } catch (err) {
      void err;
    }
    return { width: 420, height: 600 };
  });
  const [dockedSize, setDockedSize] = useState(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("chat.docked-size"));
      if (saved?.width >= 300 && saved?.height >= 320) return saved;
    } catch (err) {
      void err;
    }
    return { width: 380, height: Math.max(360, window.innerHeight - 60) };
  });
  const [contentScale, setContentScale] = useState(() => {
    try {
      const saved = Number(window.localStorage.getItem("chat.content-scale"));
      if (saved >= 65 && saved <= 240) return saved;
    } catch (err) {
      void err;
    }
    return 100;
  });
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, origX: 0, origY: 0 });

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const clientX = e.type.startsWith("touch")
        ? e.touches[0].clientX
        : e.clientX;
      const clientY = e.type.startsWith("touch")
        ? e.touches[0].clientY
        : e.clientY;
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;
      const nx = Math.max(
        6,
        Math.min(window.innerWidth - 200, dragStartRef.current.origX + dx),
      );
      const ny = Math.max(
        6,
        Math.min(window.innerHeight - 120, dragStartRef.current.origY + dy),
      );
      setPos({ x: nx, y: ny });

      // Track hovered zone
      const zone = getClosestZone(clientX, clientY);
      setHoveredZone(zone);
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;

      // Snap to zone if hovering
      setHoveredZone(null);
      try {
        window.localStorage.setItem("chat.pos", JSON.stringify(pos));
      } catch (err) {
        void err;
      }
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [pos, hoveredZone]);

  // Attach current step to context
  const handleAttachStep = useCallback(() => {
    if (!currentStep) return;
    attachContext(
      `Step${currentStep.activeLine ? ` (line ${currentStep.activeLine})` : ""} · ${problemTitle || "Visualizer"}`,
      currentStep,
    );
  }, [currentStep, problemTitle, attachContext]);

  const handleSend = useCallback(
    async ({ text, images, contextLabel, contextData }) => {
      if (isStreamingRef.current) return;

      if (isClearlyOffTopic(text)) {
        addMessage({
          id: Date.now(),
          role: "user",
          text,
          images,
          contextLabel,
        });

        addMessage({
          id: Date.now() + 1,
          role: "assistant",
          text: OFF_TOPIC_REPLY,
          isStreaming: false,
        });

        return;
      }

      let contextBlock = "";

      const wantsVisualization =
        /\b(visuali[sz]e|show|annotat|highlight|animate)\b/i.test(text || "");

      if (contextData) {
        const isStep =
          contextData.activeLine !== undefined ||
          contextData.phase !== undefined;

        contextBlock = isStep
          ? formatStepContext(contextData, problemTitle)
          : formatElementContext(contextLabel, contextData);
      } else if (wantsVisualization && (currentStep || problemState)) {
        const baseline = problemState
          ? `[Context: Problem state]\n${JSON.stringify(problemState, null, 2)}`
          : "";

        const stepCtx = currentStep
          ? formatStepContext(currentStep, problemTitle)
          : "";

        contextBlock = [baseline, stepCtx].filter(Boolean).join("\n\n");
      }

      const fullText = contextBlock
        ? `${contextBlock}\n\nQuestion: ${text}`
        : text;

      const userMsg = {
        id: Date.now(),
        role: "user",
        text,
        images,
        contextLabel,
      };

      addMessage(userMsg);

      const assistantId = Date.now() + 1;

      addMessage({
        id: assistantId,
        role: "assistant",
        text: "",
        isStreaming: true,
      });

      const controller = new AbortController();

      abortControllerRef.current = controller;
      isStreamingRef.current = true;
      setIsStreaming(true);

      try {
        const problemContext = problemTitle
          ? `The user is currently viewing the "${problemTitle}" problem in the visualizer.`
          : "The user is in a competitive programming visualizer.";

        const stepContext = currentStep
          ? " They are on a specific algorithm step (step data may be attached to the message)."
          : "";

        const descContext = problemDescription
          ? `\n\nHere is the full problem statement:\n${problemDescription}`
          : "";

        let solutionContext = "";

        try {
          const sol = problemState && problemState.solution;

          if (sol) {
            if (Array.isArray(sol)) {
              const lines = sol
                .map((l) => (typeof l === "string" ? l : l.text || ""))
                .join("\n");

              solutionContext =
                `\n\nFull solution source ` +
                `(language guessed as Python):\n` +
                `~~~python\n${lines}\n~~~`;
            } else if (typeof sol === "string") {
              solutionContext =
                `\n\nFull solution source (string):\n` + `~~~\n${sol}\n~~~`;
            }
          }
        } catch (err) {
          void err;
        }

        const manifest = getManifest ? getManifest() : null;

        const manifestText = manifest
          ? `\n\nAvailable visualization primitives and targets:\n${JSON.stringify(
              manifest,
              null,
              2,
            )}`
          : "";

        const stepStateText = currentStep
          ? `\n\nCurrent visualizer state (JSON):\n${JSON.stringify(
              currentStep,
              null,
              2,
            )}`
          : "";

        const problemStateText = problemState
          ? `\n\nBaseline problem state (JSON):\n${JSON.stringify(
              problemState,
              null,
              2,
            )}`
          : "";

        const assistantInstructions = `

If the user asks to visualize a calculation or expression, use only the available targets and primitives from the manifest and the current visualizer state. Do NOT ask for variables that are already present in the current state.

When producing visualization output, prefer emitting a single fenced JSON block using either ~~~json or ~~~viz containing a command object.

Example command (annotate buckets):

~~~json
{
  "action": "annotate",
  "labels": [
    {
      "target": "bucket",
      "index": 2,
      "text": "b = (x - lo) // bsize"
    }
  ]
}
~~~

The JSON schema: top-level object with 'action' (string) and action-specific fields.

Allowed actions:
- annotate
- highlight
- animate

Use target types from the manifest (e.g., 'bucket', 'array-item').

Format normal answers as GitHub-Flavored Markdown.

Put code, formulas, or long algorithm statements in fenced code blocks (~~~text), rather than plain prose.

Put headings and ordered-list items on their own lines, leave a blank line before lists, and keep each list item concise.`;

        const history = [
          {
            role: "system",
            text:
              `You are a helpful coding assistant embedded in a competitive programming visualizer. ` +
              `${problemContext}` +
              `${stepContext}` +
              `${descContext}` +
              `${solutionContext}` +
              `${manifestText}` +
              `${stepStateText}` +
              `${problemStateText}` +
              `${assistantInstructions}

${coachingInstructions(coachingMode)}

Answer questions only about the selected algorithm, its implementation, complexity, debugging, or visualization.

If a request is unrelated (for example email writing, personal messages, interview follow-ups, or general life advice), briefly state that you are the algorithm tutor and redirect the user to ask about the current problem.

When the user asks about "why" or "how" something works, answer in the context of this problem's algorithm.

When the user shares visualizer step data, explain what is happening in the algorithm at that step in clear, concise terms.

When asked about code or data structures, be precise and educational.`,
          },

          ...messages.slice(-20).map((m) => ({
            role: m.role,
            text: m.text,
            images: m.images,
          })),

          {
            role: "user",
            text: fullText,
            images,
          },
        ];

        let accumulated = "";

        for await (const delta of streamProviderChat(history, {
          ...providerConfig,
          ollamaApiKey,
          geminiApiKey,

          // IMPORTANT:
          // streamProviderChat must forward this
          // AbortSignal to fetch().
          signal: controller.signal,
        })) {
          if (controller.signal.aborted) {
            break;
          }

          accumulated += delta;

          updateLastMessage({
            text: accumulated,
          });
        }

        if (!controller.signal.aborted) {
          updateLastMessage({
            text: accumulated,
            isStreaming: false,
          });
        }
      } catch (err) {
        const wasAborted =
          controller.signal.aborted || err?.name === "AbortError";

        if (wasAborted) {
          // This is an intentional Stop, not an error.
          updateLastMessage({
            isStreaming: false,
          });

          return;
        }

        const guidance =
          providerConfig.provider === "ollama-cloud"
            ? `Paste your Ollama API key in AI connection settings, then check that \`${selectedModel}\` is available on Ollama Cloud.`
            : providerConfig.provider === "gemini"
              ? `Paste your Gemini API key in AI connection settings, then check that \`${selectedModel}\` is supported.`
              : `Make sure Ollama is running with \`ollama serve\` and the model \`${selectedModel}\` is available.`;

        updateLastMessage({
          text: `Error: ${
            err?.message || "Chat request failed"
          }\n\n${guidance}`,
          isStreaming: false,
        });
      } finally {
        // Only clean up if this is still the active request.
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }

        isStreamingRef.current = false;
        setIsStreaming(false);
      }
    },
    [
      messages,
      addMessage,
      updateLastMessage,
      problemTitle,
      currentStep,
      problemDescription,
      problemState,
      getManifest,
      providerConfig,
      ollamaApiKey,
      geminiApiKey,
      selectedModel,
      coachingMode,
    ],
  );

  if (!isOpen) return null;
  // Floating position (persisted)
  const startDrag = (e) => {
    if (e.target.closest("button, select, input, textarea, summary, [data-chat-ignore]")) return;
    e.preventDefault();
    draggingRef.current = true;
    const clientX = e.type.startsWith("touch")
      ? e.touches[0].clientX
      : e.clientX;
    const clientY = e.type.startsWith("touch")
      ? e.touches[0].clientY
      : e.clientY;
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      origX: pos.x,
      origY: pos.y,
    };
    document.body.style.userSelect = "none";
  };
  const handleResize = (size, type) => {
    setChatSize((prev) => {
      const newSize = {
        ...prev,
        ...(size.width ? { width: size.width } : {}),
        ...(size.height ? { height: size.height } : {}),
      };
      // Adjust position when resizing from left or top to keep the opposite edge fixed
      if (floatingMode) {
        if (type === "left" && size.width) {
          setPos((p) => ({
            x: Math.max(
              6,
              Math.min(
                window.innerWidth - 200,
                p.x + (prev.width - size.width),
              ),
            ),
            y: p.y,
          }));
        }
        if (type === "top" && size.height) {
          setPos((p) => ({
            x: p.x,
            y: Math.max(
              6,
              Math.min(
                window.innerHeight - 120,
                p.y + (prev.height - size.height),
              ),
            ),
          }));
        }
      }
      return newSize;
    });
  };
  const handleResizeEnd = () => {
    try {
      window.localStorage.setItem("chat.size", JSON.stringify(chatSize));
    } catch (err) {
      void err;
    }
  };
  const handleDockedResize = (size) => {
    setDockedSize((current) => ({ ...current, ...size }));
  };
  const handleDockedResizeEnd = () => {
    try {
      window.localStorage.setItem(
        "chat.docked-size",
        JSON.stringify(dockedSize),
      );
    } catch (err) {
      void err;
    }
  };
  const handleContentScale = (nextScale) => {
    setContentScale(nextScale);
    try {
      window.localStorage.setItem("chat.content-scale", String(nextScale));
    } catch (err) {
      void err;
    }
  };

  // render content (header, messages, input)
  const chatContent = (
    <div
      className={`chat-drawer ${floatingMode ? "chat-drawer--floating" : "chat-drawer--docked"}`}
      role="complementary"
      aria-label="AI Chat Assistant"
      style={
        floatingMode
          ? {
              position: "relative",
              width: "100%",
              height: "100%",
              cursor: "default",
            }
          : { position: "relative", width: "100%", height: "100%" }
      }
    >
      <div
        className="chat-content-scale"
        style={{ "--chat-content-scale": contentScale / 100 }}
      >
        {/* Header */}
        <div
          className="chat-header"
          onMouseDown={floatingMode ? startDrag : undefined}
          onTouchStart={floatingMode ? startDrag : undefined}
          style={floatingMode ? { cursor: "move" } : {}}
        >
          <div className="chat-header-nav">
            <button
              type="button"
              className={`chat-sidebar-toggle ${historyOpen ? "active" : ""}`}
              onClick={() => setHistoryOpen((v) => !v)}
              title="Toggle chat history"
              aria-label="Toggle chat history"
              aria-expanded={historyOpen}
            >
              <Icon name="sidebar" />
            </button>
            <button
              type="button"
              className="chat-new-toggle"
              onClick={() => {
                newChat();
                setHistoryOpen(false);
              }}
              title="Start new chat"
              aria-label="Start new chat"
            >
              <Icon name="newChat" />
            </button>
          </div>
          <div className="chat-header-left">
            <span className="chat-header-icon">AI</span>
            <div>
              <div className="chat-header-title">
                Algorithm Assistant
              </div>
              <div className="chat-coaching-row" data-chat-ignore
                onMouseDown={event => event.stopPropagation()} onTouchStart={event => event.stopPropagation()}>
                <label className="chat-coaching-toggle">
                  <input type="checkbox" role="switch" checked={coachingMode} onChange={event => changeCoachingMode(event.target.checked)} />
                  <span className="chat-coaching-track" aria-hidden="true"><span className="chat-coaching-thumb" /></span>
                  <span>Interview coaching <strong>{coachingMode ? 'On' : 'Off'}</strong></span>
                </label>
                <button type="button" className="chat-coaching-info" aria-label="What is interview coaching?" aria-expanded={showCoachingInfo}
                  onClick={(event) => {
                    if (showCoachingInfo) { setShowCoachingInfo(false); return; }
                    const rect = event.currentTarget.getBoundingClientRect();
                    setCoachingAnchor({ top: rect.bottom, left: rect.left });
                    setShowCoachingInfo(true);
                  }}>i</button>
              </div>
              {showCoachingInfo && coachingAnchor && createPortal(
                <div
                  className="chat-coaching-popover"
                  role="dialog"
                  aria-label="Interview coaching"
                  style={{
                    top: coachingAnchor.top + 8,
                    left: Math.max(8, Math.min(coachingAnchor.left, window.innerWidth - 316)),
                  }}
                >
                  <div className="chat-coaching-popover-head">
                    <strong>Interview coaching</strong>
                    <button type="button" className="chat-coaching-x" aria-label="Close" onClick={() => setShowCoachingInfo(false)}>×</button>
                  </div>
                  <p>When on, the assistant coaches instead of handing you the answer first: it restates the requirements, asks one question about the key idea, gives progressive hints, suggests edge cases and common mistakes, and ends with a next step.</p>
                  <p>If you ask for the full solution, it still provides it. Reviews of code you paste focus on correctness, edge cases and complexity. The setting applies to your next message and is saved on this device.</p>
                </div>,
                document.body,
              )}
              <details className="chat-provider-settings" data-chat-ignore>
              <summary>AI connection · {selectedProviderLabel}</summary>
              <form
                className="chat-model-controls"
                data-chat-ignore
                onSubmit={(event) => event.preventDefault()}
              >
                <div className="chat-provider-dropdown">
                  <span className="chat-field-caption" id="chat-provider-caption">Provider</span>
                  <button
                    type="button"
                    className="chat-provider-trigger"
                    aria-haspopup="listbox"
                    aria-labelledby="chat-provider-caption"
                    aria-expanded={providerMenuOpen}
                    onClick={() => setProviderMenuOpen((open) => !open)}
                  >
                    <span className="chat-provider-chip">{selectedProviderLabel}</span>
                    <svg className="chat-provider-chevron" width="12" height="8" viewBox="0 0 12 8" aria-hidden="true">
                      <path d={providerMenuOpen ? "M1 6.5l5-5 5 5" : "M1 1.5l5 5 5-5"} />
                    </svg>
                  </button>
                  {providerMenuOpen && (
                    <ul className="chat-provider-menu" role="listbox" aria-labelledby="chat-provider-caption">
                      {CHAT_PROVIDER_OPTIONS.map((option) => (
                        <li key={option.value} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={providerConfig.provider === option.value}
                            className={`chat-provider-option ${providerConfig.provider === option.value ? "is-selected" : ""}`}
                            onClick={() => {
                              const next = setChatProvider({
                                provider: option.value,
                                model: defaultChatModel(option.value),
                              });
                              setProviderConfig(next);
                              setProviderMenuOpen(false);
                            }}
                          >
                            {option.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <label>
                  Model
                  <input
                    value={providerConfig.model || ""}
                    onChange={(e) => {
                      const next = setChatProvider({
                        ...providerConfig,
                        model: e.target.value,
                      });
                      setProviderConfig(next);
                    }}
                    placeholder="Model name"
                  />
                </label>
                {providerConfig.provider === "ollama-cloud" && (
                  <div className="chat-key-steps" data-chat-ignore>
                    <strong>Get an Ollama Cloud key</strong>
                    <ol>
                      <li>Go to <a href="https://ollama.com" target="_blank" rel="noopener noreferrer">ollama.com</a> and sign in.</li>
                      <li>Open the API keys page in your account settings.</li>
                      <li>Create a key and paste it below.</li>
                    </ol>
                  </div>
                )}
                {providerConfig.provider === "gemini" && (
                  <div className="chat-key-steps" data-chat-ignore>
                    <strong>Get a Gemini key</strong>
                    <ol>
                      <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">aistudio.google.com/app/apikey</a>.</li>
                      <li>Create an API key and paste it below.</li>
                    </ol>
                  </div>
                )}
                {providerConfig.provider === "ollama-cloud" && (
                  <label className="chat-cloud-key">
                    Ollama API key
                    <input
                      type="password"
                      value={ollamaApiKey}
                      onChange={(e) => {
                        const nextKey = e.target.value;
                        setOllamaApiKey(nextKey);
                        try {
                          if (nextKey)
                            window.sessionStorage.setItem(
                              "chat.ollama-api-key",
                              nextKey,
                            );
                          else
                            window.sessionStorage.removeItem(
                              "chat.ollama-api-key",
                            );
                        } catch (err) {
                          void err;
                        }
                      }}
                      placeholder="ollama.com API key"
                      autoComplete="off"
                    />
                  </label>
                )}
                {providerConfig.provider === "gemini" && (
                  <label className="chat-cloud-key">
                    Gemini API key
                    <input
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => {
                        const nextKey = e.target.value;
                        setGeminiApiKey(nextKey);
                        try {
                          if (nextKey)
                            window.sessionStorage.setItem(
                              "chat.gemini-api-key",
                              nextKey,
                            );
                          else
                            window.sessionStorage.removeItem(
                              "chat.gemini-api-key",
                            );
                        } catch (err) {
                          void err;
                        }
                      }}
                      placeholder="Google AI API key"
                      autoComplete="off"
                    />
                  </label>
                )}
              </form>
              {providerConfig.provider === "ollama-cloud" && (
                <p className="chat-cloud-key-note">
                  Stored only in this browser tab (session storage), cleared when
                  the tab closes. Sent directly to ollama.com with each request;
                  this site does not keep it. Local Ollama needs no key.
                </p>
              )}
              {providerConfig.provider === "gemini" && (
                <p className="chat-cloud-key-note">
                  Stored only in this browser tab (session storage), cleared when
                  the tab closes. Sent directly to Google with each request; this
                  site does not keep it. Local Ollama needs no key.
                </p>
              )}
              </details>
            </div>
          </div>
          <div className="chat-header-actions">
            <div className="visually-hidden" aria-live="polite">
              {selectMode ? "Select mode enabled" : "Select mode disabled"}
            </div>

            <button
              className={`chat-float-toggle ${floatingMode ? "active" : ""}`}
              onClick={() => toggleFloatingMode()}
              title="Toggle floating chat"
            >
              <Icon name="float" />
            </button>

            <button
              className="chat-close-btn"
              onClick={closeChat}
              title="Close chat"
            >
              <Icon name="close" />
            </button>
          </div>
        </div>

        <div className="chat-context-tools" data-chat-ignore>
          <SelectModeToggle enabled={selectMode} onChange={handleToggleSelectMode} />
          {selectMode && <button type="button" className="chat-exit-selection" onClick={disableSelectMode}>Exit select mode · Esc</button>}
          <button
            type="button"
            className="chat-attach-step-btn"
            onClick={handleAttachStep}
            disabled={!currentStep}
            title={currentStep ? `Attach current step from ${problemTitle || "visualizer"}` : "No active visualizer step"}
          >
            Attach step
          </button>
          <span>{selectMode ? 'Choose lines in a code panel, then Attach to chat. Esc exits.' : 'Select code or a visual element to give your question context.'}</span>
        </div>
        <div className="chat-selection-status" role="status" aria-live="polite" data-chat-ignore>
          {Object.values(codeSelections).length > 0 ? <>
            <strong>Highlighted code{selectMode ? ' · selection in progress' : ' · selection kept'}</strong>
            {Object.entries(codeSelections).map(([id, selection]) => <div key={id}>{selection.title} · lines {selection.lines}</div>)}
            <small>Use Attach to chat in the code panel to include these lines in your next message.</small>
          </> : selectMode ? <span>Select mode is on. No code lines selected yet.</span> : null}
          {attachedContext && <div><strong>Attached to next message:</strong> {attachedContext.label}</div>}
        </div>
        {selectMode && (
          <div className="chat-selection-banner">
            Code: click lines, Shift-click a range, then attach. Other visual elements attach with one click.
          </div>
        )}

        {historyOpen && (
          <div className="chat-history-panel">
            {[...conversations]
              .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)))
              .map((c) => (
              <div
                key={c.id}
                className={`chat-history-item ${c.id === activeConversationId ? "active" : ""}`}
                onClick={() => {
                  switchChat(c.id);
                  setHistoryOpen(false);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    switchChat(c.id);
                    setHistoryOpen(false);
                  }
                }}
              >
                <div className="chat-history-main">
                  <div className="chat-history-title">
                    {c.title || "New Chat"}
                  </div>
                  <div className="chat-history-meta">
                    {(c.messages || []).length} msgs
                  </div>
                </div>
                <div className="chat-history-actions">
                  <button
                    type="button"
                    className={`chat-history-pin ${c.pinned ? "is-pinned" : ""}`}
                    aria-pressed={Boolean(c.pinned)}
                    aria-label={c.pinned ? "Unpin chat" : "Pin chat"}
                    title={c.pinned ? "Unpin chat" : "Pin chat to top"}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinChat(c.id);
                    }}
                  >
                    <Icon name="pin" />
                  </button>
                  <button
                    type="button"
                    className="chat-history-delete"
                    aria-label="Delete chat"
                    title="Delete chat"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete "${c.title || "New Chat"}"? This cannot be undone.`)) deleteChat(c.id);
                    }}
                  >
                    <Icon name="trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message list */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              <div className="chat-empty-icon">AI</div>
              <p>
                Ask {selectedModel} via {selectedProviderLabel} anything about
                the algorithm you&apos;re visualizing.
              </p>
              <p className="chat-empty-hint">
                Use <strong>Attach step</strong> to share the current timestep,
                or select any visual element to attach it.
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          attachedContext={attachedContext}
          onClearContext={clearContext}
          disabled={false}
          isStreaming={isStreaming}
        />
      </div>
      <PanelScaleControl
        value={contentScale}
        onChange={handleContentScale}
        label="AI scale"
        ariaLabel="AI assistant content scale"
        max={240}
      />
    </div>
  );

  return (
    <>
      {/* Backdrop (click to close) — ignore when select or floating mode is active */}
      <div
        className="chat-backdrop"
        style={
          floatingMode && !selectMode
            ? { display: "none" }
            : selectMode
              ? { pointerEvents: "none" }
              : {}
        }
        onClick={() => {
          if (selectMode || floatingMode) return;
          closeChat();
        }}
      />

      {/* Floating: position wrapper + full resizable panel; Docked: resizable panel anchored left */}
      {floatingMode ? (
        <div
          style={{
            position: "fixed",
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            zIndex: 1000,
          }}
        >
          <ResizablePanel
            width={chatSize.width}
            height={chatSize.height}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            handles={["left", "right", "top", "bottom", "corner"]}
          >
            {chatContent}
          </ResizablePanel>
        </div>
      ) : (
        <ResizablePanel
          width={dockedSize.width}
          height={dockedSize.height}
          minWidth={300}
          minHeight={320}
          maxWidth={Math.max(300, window.innerWidth - 16)}
          maxHeight={Math.max(320, window.innerHeight - 60)}
          onResize={handleDockedResize}
          onResizeEnd={handleDockedResizeEnd}
          handles={["left", "bottom", "corner"]}
          className="chat-panel-docked"
          style={{ position: "fixed", top: "60px", right: 0, zIndex: 1002 }}
        >
          {chatContent}
        </ResizablePanel>
      )}
    </>
  );
}
