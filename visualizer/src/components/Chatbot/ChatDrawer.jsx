import { useEffect, useRef, useCallback, useState } from "react";
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
import PanelScaleControl from '../shared/PanelScaleControl';
import "./chatbot.css";

const Icon = ({ name }) => {
  const paths = { close: 'M5 5l6 6m0-6-6 6', clear: 'M4 5h8m-7 0 .7 8h4.6l.7-8M7 5V3h2v2', send: 'M3 3l10 5-10 5 2-5-2-5zm2 5h5', plus: 'M8 3v10M3 8h10', history: 'M3 8a5 5 0 1 0 1.5-3.5M3 3v3h3', select: 'M4 3l7 5-4 1-1 4-2-10z', pin: 'M5 3h6l-1 3 2 2H4l2-2-1-3zM8 8v5', float: 'M3 3h4M3 3v4M13 3H9m4 0v4M3 13h4m-4 0V9m10 4H9m4 0V9' };
  return <svg className="chat-icon" viewBox="0 0 16 16" aria-hidden="true"><path d={paths[name]} /></svg>;
};

const LAYOUT_ZONES = {
  topLeft: { name: 'Code Panel', label: 'CODE', row: 0, col: 0 },
  topCenter: { name: 'Visualization', label: 'VIZ', row: 0, col: 1 },
  topRight: { name: 'Problem Info', label: 'INFO', row: 0, col: 2 },
  bottomLeft: { name: 'Console / Output', label: 'OUTPUT', row: 1, col: 0 },
  bottomCenter: { name: 'Details Panel', label: 'DETAILS', row: 1, col: 1 },
  bottomRight: { name: 'Chat / Hints', label: 'CHAT', row: 1, col: 2 },
};

// Keep the embedded tutor focused. This is deliberately narrow: normal coding
// questions are still sent to the selected model, while clear lifestyle/email
// requests get a useful local redirect without spending the user's API quota.
function isClearlyOffTopic(text = '') {
  const value = text.toLowerCase();
  return /\b(hi|dear)\s+[a-z]/.test(value)
    && /\b(regards|sincerely|thank you for your time|follow up regarding|interview process|managerial round)\b/.test(value);
}

const OFF_TOPIC_REPLY = "I’m the algorithm tutor for this visualizer, so I can help with the selected problem, its code, complexity, or its animation. For that email, a general writing assistant would be a better fit.";

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

export default function ChatDrawer() {
  const {
    messages, addMessage, updateLastMessage, clearMessages,
    conversations, activeConversationId, newChat, switchChat, deleteChat,
    attachedContext, attachContext, clearContext,
    isOpen, closeChat,
    selectMode, toggleSelectMode,
    floatingMode, toggleFloatingMode,
  } = useChatContext();
  const [selectAnnouncement, setSelectAnnouncement] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [providerConfig, setProviderConfig] = useState(getChatProvider);
  const [ollamaApiKey, setOllamaApiKey] = useState(() => {
    try { return window.sessionStorage.getItem('chat.ollama-api-key') || ''; } catch (err) { void err }
    return '';
  });
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    try { return window.sessionStorage.getItem('chat.gemini-api-key') || ''; } catch (err) { void err }
    return '';
  });
  const selectedModel = providerConfig.model || defaultChatModel(providerConfig.provider);
  const selectedProviderLabel = providerConfig.provider === 'gemini'
    ? 'Gemini'
    : providerConfig.provider === 'ollama-cloud'
      ? 'Ollama Cloud'
      : 'Ollama Local';

  useEffect(() => subscribeChatProvider(setProviderConfig), []);

  const handleToggleSelectMode = useCallback(() => {
    const newMode = !selectMode;
    toggleSelectMode();
    try {
      if (newMode) document.body.classList.add('chat-select-mode');
      else document.body.classList.remove('chat-select-mode');
    } catch (err) { void err }
    setSelectAnnouncement(newMode ? 'Select mode enabled' : 'Select mode disabled');
    const t = setTimeout(() => setSelectAnnouncement(''), 1800);
    return () => clearTimeout(t);
  }, [selectMode, toggleSelectMode]);

  const viz = useVisualizationContext();
  const { currentStep, problemTitle, problemDescription, problemState, getManifest } = viz;
  const messagesEndRef = useRef(null);
  const isStreamingRef = useRef(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Floating position (persisted) and dragging refs — keep hooks unconditionally
  const [pos, setPos] = useState(() => {
    try { const s = window.localStorage.getItem('chat.pos'); if (s) return JSON.parse(s); } catch (err) { void err }
    // default near bottom-right
    return { x: window.innerWidth - 420, y: window.innerHeight - 520 };
  });

  // Chat size (persisted) — width and height for floating, width for docked
  const [chatSize, setChatSize] = useState(() => {
    try { const s = window.localStorage.getItem('chat.size'); if (s) return JSON.parse(s); } catch (err) { void err }
    return { width: 380, height: 520 };
  });
  const [dockedSize, setDockedSize] = useState(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('chat.docked-size'));
      if (saved?.width >= 300 && saved?.height >= 320) return saved;
    } catch (err) { void err }
    return { width: 380, height: Math.max(360, window.innerHeight - 60) };
  });
  const [contentScale, setContentScale] = useState(() => {
    try {
      const saved = Number(window.localStorage.getItem('chat.content-scale'));
      if (saved >= 65 && saved <= 240) return saved;
    } catch (err) { void err }
    return 100;
  });
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, origX: 0, origY: 0 });

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;
      const nx = Math.max(6, Math.min(window.innerWidth - 200, dragStartRef.current.origX + dx));
      const ny = Math.max(6, Math.min(window.innerHeight - 120, dragStartRef.current.origY + dy));
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
      try { window.localStorage.setItem('chat.pos', JSON.stringify(pos)); } catch (err) { void err }
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
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
        addMessage({ id: Date.now(), role: "user", text, images, contextLabel });
        addMessage({ id: Date.now() + 1, role: "assistant", text: OFF_TOPIC_REPLY, isStreaming: false });
        return;
      }

      // Build context block to prepend to the user's question
      let contextBlock = "";
      const wantsVisualization = /\b(visuali[sz]e|show|annotat|highlight|animate)\b/i.test(text || "");
      if (contextData) {
        const isStep = contextData.activeLine !== undefined || contextData.phase !== undefined;
        contextBlock = isStep
          ? formatStepContext(contextData, problemTitle)
          : formatElementContext(contextLabel, contextData);
      } else if (wantsVisualization && (currentStep || problemState)) {
        const baseline = problemState ? `[Context: Problem state]\n${JSON.stringify(problemState, null, 2)}` : "";
        const stepCtx = currentStep ? formatStepContext(currentStep, problemTitle) : "";
        contextBlock = [baseline, stepCtx].filter(Boolean).join("\n\n");
      }

      const fullText = contextBlock ? `${contextBlock}\n\nQuestion: ${text}` : text;

      // Add the user's message to UI (show original text, send contextual text to model)
      const userMsg = {
        id: Date.now(),
        role: "user",
        text,
        images,
        contextLabel,
      };
      addMessage(userMsg);

      // Placeholder streaming assistant message
      const assistantId = Date.now() + 1;
      addMessage({ id: assistantId, role: "assistant", text: "", isStreaming: true });

      isStreamingRef.current = true;
      setIsStreaming(true);
      try {
        // Build history for Ollama — use full contextual text for last user message
        const problemContext = problemTitle
          ? `The user is currently viewing the "${problemTitle}" problem in the visualizer.`
          : "The user is in a competitive programming visualizer.";
        const stepContext = currentStep
          ? ` They are on a specific algorithm step (step data may be attached to the message).`
          : "";
        const descContext = problemDescription
          ? `\n\nHere is the full problem statement:\n${problemDescription}`
          : "";
        // Include full solution source if the visualizer provided it in problemState.solution
        let solutionContext = '';
        try {
          const sol = problemState && problemState.solution;
          if (sol) {
            if (Array.isArray(sol)) {
              const lines = sol.map((l) => (typeof l === 'string' ? l : (l.text || ''))).join('\n');
              solutionContext = `\n\nFull solution source (language guessed as Python):\n~~~python\n${lines}\n~~~`;
            } else if (typeof sol === 'string') {
              solutionContext = `\n\nFull solution source (string):\n~~~\n${sol}\n~~~`;
            }
          }
        } catch (err) { void err }
        const manifest = getManifest ? getManifest() : null;
        const manifestText = manifest ? `\n\nAvailable visualization primitives and targets:\n${JSON.stringify(manifest, null, 2)}` : '';
        const stepStateText = currentStep ? `\n\nCurrent visualizer state (JSON):\n${JSON.stringify(currentStep, null, 2)}` : '';
        const problemStateText = problemState ? `\n\nBaseline problem state (JSON):\n${JSON.stringify(problemState, null, 2)}` : '';
        const assistantInstructions = `\n\nIf the user asks to visualize a calculation or expression, use only the available targets and primitives from the manifest and the current visualizer state. Do NOT ask for variables that are already present in the current state. When producing visualization output, prefer emitting a single fenced JSON block using either ~~~json or ~~~viz containing a command object. Example command (annotate buckets):\n\n~~~json\n{\n  "action": "annotate",\n  "labels": [ { "target": "bucket", "index": 2, "text": "b = (x - lo) // bsize" } ]\n}\n~~~\n\nThe JSON schema: top-level object with 'action' (string) and action-specific fields. Allowed actions: 'annotate', 'highlight', 'animate'. Use target types from the manifest (e.g., 'bucket', 'array-item').\n\nFormat normal answers as GitHub-Flavored Markdown. Put code, formulas, or long algorithm statements in fenced code blocks (~~~text), rather than plain prose. Put headings and ordered-list items on their own lines, leave a blank line before lists, and keep each list item concise.`;
        const history = [
          {
            role: "system",
            text: `You are a helpful coding assistant embedded in a competitive programming visualizer. ${problemContext}${stepContext}${descContext}${solutionContext}${manifestText}${stepStateText}${problemStateText}${assistantInstructions}\n\nAnswer questions only about the selected algorithm, its implementation, complexity, debugging, or visualization. If a request is unrelated (for example email writing, personal messages, interview follow-ups, or general life advice), briefly state that you are the algorithm tutor and redirect the user to ask about the current problem. When the user asks about "why" or "how" something works, answer in the context of this problem's algorithm. When the user shares visualizer step data, explain what is happening in the algorithm at that step in clear, concise terms. When asked about code or data structures, be precise and educational.`,
          },
          // Previous messages (last 10 pairs for context window)
          ...messages.slice(-20).map((m) => ({ role: m.role, text: m.text, images: m.images })),
          { role: "user", text: fullText, images },
        ];

        let accumulated = "";
        for await (const delta of streamProviderChat(history, { ...providerConfig, ollamaApiKey, geminiApiKey })) {
          accumulated += delta;
          updateLastMessage({ text: accumulated });
        }
        updateLastMessage({ text: accumulated, isStreaming: false });
      } catch (err) {
        const guidance = providerConfig.provider === 'ollama-cloud'
          ? `Set \`OLLAMA_API_KEY\` for the Vite server and confirm \`${selectedModel}\` is available through Ollama Cloud.`
          : providerConfig.provider === 'gemini'
            ? `Enter a Gemini API key above or set \`GEMINI_API_KEY\` for the Vite server, then verify \`${selectedModel}\`.`
            : `Make sure Ollama is running with \`ollama serve\` and the model \`${selectedModel}\` is available.`;
        updateLastMessage({
          text: `Error: ${err.message}\n\n${guidance}`,
          isStreaming: false,
        });
      } finally {
        isStreamingRef.current = false;
        setIsStreaming(false);
      }
    },
    [messages, addMessage, updateLastMessage, problemTitle, currentStep, problemDescription, problemState, getManifest, providerConfig, ollamaApiKey, geminiApiKey, selectedModel],
  );

  if (!isOpen) return null;
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
      const distance = Math.sqrt(Math.pow(mouseX - zoneX, 2) + Math.pow(mouseY - zoneY, 2));

      if (distance < minDistance) {
        minDistance = distance;
        closest = key;
      }
    });

    return closest;
  };

  const snapToZone = (zoneKey) => {
    const zone = LAYOUT_ZONES[zoneKey];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const previewWidth = 600;
    const previewHeight = 400;
    const startX = centerX - previewWidth / 2;
    const startY = centerY - previewHeight / 2;

    const cellWidth = previewWidth / 3;
    const cellHeight = previewHeight / 2;

    const newX = startX + zone.col * cellWidth + cellWidth / 2 - 100;
    const newY = startY + zone.row * cellHeight + cellHeight / 2 - 80;

    setPos({ x: Math.max(6, Math.min(window.innerWidth - 200, newX)), y: Math.max(6, Math.min(window.innerHeight - 120, newY)) });
  };

  // Floating position (persisted)
  const startDrag = (e) => {
    if (e.target.closest('button, select, input, textarea')) return;
    e.preventDefault();
    draggingRef.current = true;
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: clientX, y: clientY, origX: pos.x, origY: pos.y };
    document.body.style.userSelect = 'none';
  };
  const handleResize = (size, type) => {
    setChatSize((prev) => {
      const newSize = { ...prev, ...(size.width ? { width: size.width } : {}), ...(size.height ? { height: size.height } : {}) };
      // Adjust position when resizing from left or top to keep the opposite edge fixed
      if (floatingMode) {
        if (type === 'left' && size.width) {
          setPos((p) => ({ x: Math.max(6, Math.min(window.innerWidth - 200, p.x + (prev.width - size.width))), y: p.y }));
        }
        if (type === 'top' && size.height) {
          setPos((p) => ({ x: p.x, y: Math.max(6, Math.min(window.innerHeight - 120, p.y + (prev.height - size.height))) }));
        }
      }
      return newSize;
    });
  };
  const handleResizeEnd = () => {
    try { window.localStorage.setItem('chat.size', JSON.stringify(chatSize)); } catch (err) { void err }
  };
  const handleDockedResize = (size) => {
    setDockedSize((current) => ({ ...current, ...size }));
  };
  const handleDockedResizeEnd = () => {
    try { window.localStorage.setItem('chat.docked-size', JSON.stringify(dockedSize)); } catch (err) { void err }
  };
  const handleContentScale = (nextScale) => {
    setContentScale(nextScale);
    try { window.localStorage.setItem('chat.content-scale', String(nextScale)); } catch (err) { void err }
  };

  // render content (header, messages, input)
  const chatContent = (
    <div
      className={`chat-drawer ${floatingMode ? 'chat-drawer--floating' : 'chat-drawer--docked'}`}
      role="complementary"
      aria-label="AI Chat Assistant"
      style={floatingMode ? { position: 'relative', width: '100%', height: '100%', cursor: 'default' } : { position: 'relative', width: '100%', height: '100%' }}
    >
      <div className="chat-content-scale" style={{ '--chat-content-scale': contentScale / 100 }}>
        {/* Header */}
        <div
          className="chat-header"
          onMouseDown={floatingMode ? startDrag : undefined}
          onTouchStart={floatingMode ? startDrag : undefined}
          style={floatingMode ? { cursor: 'move' } : {}}
        >
          <div className="chat-header-left">
            <span className="chat-header-icon">AI</span>
            <div>
              <div className="chat-header-title">Algorithm Assistant <span className="chat-shortcut" title="Open or close chat with Alt+C">Alt+C</span></div>
              <form className="chat-model-controls" data-chat-ignore onSubmit={(event) => event.preventDefault()}>
                <label>Provider
                  <select value={providerConfig.provider} onChange={(e) => { const provider = e.target.value; const next = setChatProvider({ provider, model: defaultChatModel(provider) }); setProviderConfig(next) }}>
                    <option value="ollama-local">Ollama Local</option><option value="ollama-cloud">Ollama Cloud</option><option value="gemini">Gemini</option>
                  </select>
                </label>
                <label>Model
                  <input value={providerConfig.model || ''} onChange={(e) => { const next = setChatProvider({ ...providerConfig, model: e.target.value }); setProviderConfig(next) }} placeholder="Model name" />
                </label>
                {providerConfig.provider === 'ollama-cloud' && (
                  <label className="chat-cloud-key">Ollama API key
                    <input
                      type="password"
                      value={ollamaApiKey}
                      onChange={(e) => {
                        const nextKey = e.target.value;
                        setOllamaApiKey(nextKey);
                        try {
                          if (nextKey) window.sessionStorage.setItem('chat.ollama-api-key', nextKey);
                          else window.sessionStorage.removeItem('chat.ollama-api-key');
                        } catch (err) { void err }
                      }}
                      placeholder="ollama.com API key"
                      autoComplete="off"
                    />
                  </label>
                )}
                {providerConfig.provider === 'gemini' && (
                  <label className="chat-cloud-key">Gemini API key
                    <input
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => {
                        const nextKey = e.target.value;
                        setGeminiApiKey(nextKey);
                        try {
                          if (nextKey) window.sessionStorage.setItem('chat.gemini-api-key', nextKey);
                          else window.sessionStorage.removeItem('chat.gemini-api-key');
                        } catch (err) { void err }
                      }}
                      placeholder="Google AI API key"
                      autoComplete="off"
                    />
                  </label>
                )}
              </form>
              {providerConfig.provider === 'ollama-cloud' && (
                <p className="chat-cloud-key-note">Kept only for this browser session; sent to the chat proxy and Ollama Cloud for your request, never saved by this app.</p>
              )}
              {providerConfig.provider === 'gemini' && (
                <p className="chat-cloud-key-note">Kept only for this browser session; sent to the chat proxy and Google for your request, never saved by this app.</p>
              )}
            </div>
          </div>
          <div className="chat-header-actions">
            <button
              className="chat-history-toggle"
              onClick={() => setHistoryOpen((v) => !v)}
              title="Toggle chat history"
            >
              <Icon name="history" />
            </button>

            <button
              className="chat-new-toggle"
              onClick={() => {
                newChat();
                setHistoryOpen(false);
              }}
              title="Start new chat"
            >
              <Icon name="plus" />
            </button>

            <button
              className={`chat-select-toggle ${selectMode ? "active" : ""}`}
              onClick={handleToggleSelectMode}
              aria-pressed={selectMode}
              title="Toggle Select Mode (hover to highlight, click to attach)"
            >
              <Icon name="select" />
              {selectMode && (
                <span className="chat-select-hint">
                  Select mode ON
                </span>
              )}
            </button>

            <div
              className="visually-hidden"
              aria-live="polite"
            >
              {selectAnnouncement}
            </div>

            <button
              className="chat-attach-step-btn"
              onClick={handleAttachStep}
              disabled={!currentStep}
              title={
                currentStep
                  ? `Attach current step from ${problemTitle || "visualizer"}`
                  : "No active visualizer step"
              }
            >
              <Icon name="pin" />
            </button>

            <button
              className="chat-clear-btn"
              onClick={clearMessages}
              title="Clear chat"
            >
              <Icon name="clear" />
            </button>

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

        {selectMode && <div className="chat-selection-banner">Selection mode: click any visual element to add it as context.</div>}

        {historyOpen && (
          <div className="chat-history-panel">
            {conversations.map((c) => (
              <div
                key={c.id}
                className={`chat-history-item ${c.id === activeConversationId ? 'active' : ''}`}
                onClick={() => {
                  switchChat(c.id);
                  setHistoryOpen(false);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    switchChat(c.id);
                    setHistoryOpen(false);
                  }
                }}
              >
                <div className="chat-history-main">
                  <div className="chat-history-title">{c.title || 'New Chat'}</div>
                  <div className="chat-history-meta">{(c.messages || []).length} msgs</div>
                </div>
                <button
                  className="chat-history-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(c.id);
                  }}
                  title="Delete chat"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Message list */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              <div className="chat-empty-icon">AI</div>
              <p>Ask {selectedModel} via {selectedProviderLabel} anything about the algorithm you&apos;re visualizing.</p>
              <p className="chat-empty-hint">
                Use <strong>Attach step</strong> to share the current timestep, or select any visual element to attach it.
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
          attachedContext={attachedContext}
          onClearContext={clearContext}
          disabled={isStreaming}
        />
      </div>
      <PanelScaleControl
        value={contentScale}
        onChange={handleContentScale}
        label="AI scale"
        ariaLabel="AI assistant content scale"
        max={240}
      />
    </div >
  );

  return (
    <>
      {/* Backdrop (click to close) — ignore when select or floating mode is active */}
      <div
        className="chat-backdrop"
        style={floatingMode && !selectMode ? { display: 'none' } : selectMode ? { pointerEvents: 'none' } : {}}
        onClick={() => {
          if (selectMode || floatingMode) return;
          closeChat();
        }}
      />

      {/* Floating: position wrapper + full resizable panel; Docked: resizable panel anchored left */}
      {floatingMode ? (
        <div style={{ position: 'fixed', left: `${pos.x}px`, top: `${pos.y}px`, zIndex: 1000 }}>
          <ResizablePanel width={chatSize.width} height={chatSize.height} onResize={handleResize} onResizeEnd={handleResizeEnd} handles={['left', 'right', 'top', 'bottom', 'corner']}>
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
          handles={['left', 'bottom', 'corner']}
          className="chat-panel-docked"
          style={{ position: 'fixed', top: '60px', right: 0, zIndex: 1002 }}
        >
          {chatContent}
        </ResizablePanel>
      )}
    </>
  );
}
