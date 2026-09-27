import { useState, useRef, useCallback, useEffect } from "react";
import ContextBadge from "./ContextBadge";
import { captureVisualizer } from "../../services/screenshot";

const InputIcon = ({ name }) => {
  const paths = {
    image: "M3 3h10v10H3V3zm2 7 2-2 2 2 1-1 2 2M5 6h.01",
    capture: "M4 5h8v7H4V5zm2-2h4M7 8h2",
    voice:
      "M8 3a2 2 0 0 0-2 2v3a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm-4 4a4 4 0 0 0 8 0M8 11v2",
  };

  return (
    <svg className="chat-input-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
};

/**
 * Chat input bar with:
 * - Textarea (Enter sends, Shift+Enter newline)
 * - Image upload button
 * - Clipboard image paste
 * - Voice input
 * - Visualizer screenshot
 * - Attached context badge
 * - Image previews
 * - Send button
 * - Stop generation button while the assistant is streaming
 */
export default function ChatInput({
  onSend,
  onStop,
  attachedContext,
  onClearContext,
  disabled = false,
  isStreaming = false,
}) {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-resize textarea.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [text]);

  // Stop speech recognition when component unmounts.
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        void err;
      }
    };
  }, []);

  const addImageFromFile = useCallback((file) => {
    if (!file || !file.type?.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;
      if (!result) return;

      setImages((prev) => [...prev, result]);
    };

    reader.readAsDataURL(file);
  }, []);

  // Paste handler — capture images from clipboard.
  const handlePaste = useCallback(
    (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      let foundImage = false;

      for (const item of items) {
        if (!item.type.startsWith("image/")) continue;

        const file = item.getAsFile();
        if (!file) continue;

        foundImage = true;
        addImageFromFile(file);
      }

      if (foundImage) {
        e.preventDefault();
      }
    },
    [addImageFromFile],
  );

  const handleFileChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);

      for (const file of files) {
        addImageFromFile(file);
      }

      e.target.value = "";
    },
    [addImageFromFile],
  );

  const removeImage = useCallback((idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // Screenshot capture.
  const handleScreenshot = useCallback(async () => {
    if (disabled || isCapturing) return;

    setIsCapturing(true);

    try {
      const dataUrl = await captureVisualizer();

      if (dataUrl) {
        setImages((prev) => [...prev, dataUrl]);
      }
    } catch (err) {
      console.warn("Screenshot failed:", err?.message || err);
    } finally {
      setIsCapturing(false);
    }
  }, [disabled, isCapturing]);

  // Voice input using Web Speech API.
  const handleMic = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SR();

    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript;

      if (!transcript) return;

      setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  }, [isListening]);

  const hasContent = Boolean(text.trim()) || images.length > 0;

  const canSend = !disabled && !isStreaming && hasContent;

  const handleSend = useCallback(() => {
    if (!canSend) return;

    onSend({
      text: text.trim(),
      images,
      contextLabel: attachedContext?.label,
      contextData: attachedContext?.data,
    });

    setText("");
    setImages([]);

    onClearContext?.();

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [canSend, text, images, attachedContext, onSend, onClearContext]);

  const handleStop = useCallback(() => {
    if (!isStreaming) return;
    onStop?.();
  }, [isStreaming, onStop]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key !== "Enter" || e.shiftKey) return;

      e.preventDefault();

      // Do not submit another prompt while the current request
      // is still generating. The user can still type/edit text.
      if (isStreaming) return;

      handleSend();
    },
    [handleSend, isStreaming],
  );

  return (
    <div className="chat-input-wrap">
      {/* Attached context badge */}
      {attachedContext && (
        <div className="chat-input-ctx">
          <ContextBadge
            label={attachedContext.label}
            onRemove={onClearContext}
          />
        </div>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="chat-input-images">
          {images.map((src, i) => (
            <div
              key={`${src.slice(0, 32)}-${i}`}
              className="chat-input-img-wrap"
            >
              <img src={src} alt={`preview-${i}`} className="chat-input-img" />

              <button
                type="button"
                className="chat-input-img-remove"
                onClick={() => removeImage(i)}
                disabled={disabled}
                title="Remove image"
                aria-label={`Remove image ${i + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Attachment/tool row */}
      <div className="chat-input-row chat-input-tools-row">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <button
          type="button"
          className="chat-icon-btn"
          title="Attach image"
          aria-label="Attach image"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <InputIcon name="image" />
        </button>

        <button
          type="button"
          className={`chat-icon-btn${isCapturing ? " active" : ""}`}
          title="Screenshot visualizer"
          aria-label="Screenshot visualizer"
          onClick={handleScreenshot}
          disabled={disabled || isCapturing}
        >
          <InputIcon name="capture" />
        </button>

        <button
          type="button"
          className={`chat-icon-btn${isListening ? " active mic-pulse" : ""}`}
          title={isListening ? "Stop listening" : "Voice input"}
          aria-label={isListening ? "Stop listening" : "Voice input"}
          onClick={handleMic}
          disabled={disabled}
        >
          <InputIcon name="voice" />
        </button>

        {isStreaming && (
          <span className="chat-generating-label" aria-live="polite">
            Generating…
          </span>
        )}
      </div>

      {/* Composer row */}
      <div className="chat-input-row chat-composer-row">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={
            isStreaming
              ? "You can type the next prompt while this response generates…"
              : "Ask about the visualizer… (Enter to send, Shift+Enter for newline)"
          }
          rows={1}
          disabled={disabled}
        />

        {isStreaming ? (
          <button
            type="button"
            className="chat-send-btn chat-stop-btn"
            onClick={handleStop}
            title="Stop generating"
            aria-label="Stop generating"
          >
            <span className="chat-stop-square" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!canSend}
            title="Send"
            aria-label="Send message"
          >
            ↑
          </button>
        )}
      </div>
    </div>
  );
}
