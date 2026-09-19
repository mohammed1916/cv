import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./CodeTracePanel.css";
import ResizerHandle from "./ResizerHandle";
import { resolvePattern } from "./patternCatalog";
import PointerStateBand from "./shared/PointerStateBand";

import OpenProblemInPlayground from "../playground/OpenProblemInPlayground";

export default function CodeTracePanel({
  step,
  codeLines,
  // `code` and `activeLine` are retained for older visualizers while they
  // migrate to the richer step/codeLines API.
  code,
  lines,
  activeLine,
  highlightedLines = [],
  highlightLines,
  onLineSelect,
  title = "Solution Code",
  subtitle = null,
  idleLabel = "Press Play to start",
  activeLabelPrefix = "Line",
  activeLabelSuffix = "is active",
  autoScroll = true,
  onActiveLineDomChange,
  disableResizer = false,
  playgroundLaunch = null,
  playgroundInput,
  playgroundDisabled = false,
}) {
  const resolvedCodeLines = Array.isArray(codeLines)
    ? codeLines
    : Array.isArray(code)
      ? code
      : Array.isArray(lines)
        ? lines
        : [];
  const resolvedHighlightedLines = Array.isArray(highlightLines) ? highlightLines : highlightedLines;
  const resolvedStep = useMemo(() => step || (Number.isFinite(activeLine) ? { activeLine } : undefined), [step, activeLine]);
  const codeRef = useRef(null);
  const lastManualScrollTsRef = useRef(0);
  const [copied, setCopied] = useState(false);
  const [panelHeight, setPanelHeight] = useState(() => {
    try {
      const v = window.localStorage.getItem("ctp.panelHeight");
      return v ? Number(v) : 420;
    } catch {
      return 420;
    }
  });
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(panelHeight);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!resolvedStep?.activeLine || !codeRef.current) return;

    const el = codeRef.current.querySelector(
      `[data-line="${resolvedStep.activeLine}"]`,
    );

    if (!el) {
      if (onActiveLineDomChange) onActiveLineDomChange(null);
      return;
    }

    // Notify parent of active line DOM element
    if (onActiveLineDomChange) {
      onActiveLineDomChange(el);
    }

    // Auto-scroll if enabled
    if (!autoScroll || Date.now() - lastManualScrollTsRef.current < 600) return;

    const container = codeRef.current;
    const elTop = el.offsetTop;
    const elBottom = elTop + el.offsetHeight;
    const ctTop = container.scrollTop;
    const ctBottom = ctTop + container.clientHeight;
    if (elTop < ctTop || elBottom > ctBottom) {
      el.scrollIntoView({ block: "nearest", behavior: "auto" });
    }
  }, [resolvedStep, autoScroll, onActiveLineDomChange]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      resolvedCodeLines.map(({ text }) => text).join("\n"),
    );
    setCopied(true);
  };

  const markManualScroll = () => {
    lastManualScrollTsRef.current = Date.now();
  };

  const highlightedLineSet = useMemo(() => new Set(resolvedHighlightedLines), [resolvedHighlightedLines]);
  const activePattern = useMemo(() => resolvePattern(resolvedStep?.phase), [resolvedStep?.phase]);
  const startDrag = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsResizing(true);
    startYRef.current = e.touches ? e.touches[0].clientY : e.clientY;
    startHeightRef.current = panelHeight;
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!isDraggingRef.current) return;
      const clientY = e.type.startsWith("touch")
        ? e.touches[0].clientY
        : e.clientY;
      const delta = clientY - startYRef.current;
      const next = Math.max(
        120,
        Math.min(1200, startHeightRef.current + delta),
      );
      setPanelHeight(next);
    };

    const onUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsResizing(false);
      document.body.style.userSelect = "";
      try {
        window.localStorage.setItem("ctp.panelHeight", String(panelHeight));
      } catch (err) {
        void err;
      }
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
  }, [panelHeight]);

  const codeAreaHeight = `${panelHeight}px`;

  return (
    <motion.div
      className={`ctp-panel ${disableResizer ? "ctp-managed" : ""}`}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div className="ctp-head">
        <div>
          <div className="ctp-title">{title}</div>
          <div className="ctp-subtitle">
            {subtitle ||
              (resolvedStep ? (
                <>
                  {activeLabelPrefix}{" "}
                  <span className="mono ctp-chip">{resolvedStep.activeLine}</span>{" "}
                  {activeLabelSuffix}
                </>
              ) : (
                idleLabel
              ))}
          </div>
          {activePattern && (
            <span className="ctp-pattern-chip" style={{ "--ctp-pattern-color": activePattern.color }}>
              <span aria-hidden="true">{activePattern.icon}</span> {activePattern.label}
            </span>
          )}
        </div>
        <button
          type="button"
          className={`ctp-copy-btn ${copied ? "copied" : ""}`}
          onClick={handleCopy}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copied ? "Copied" : "Copy code"}
        </button>
        {playgroundLaunch || <OpenProblemInPlayground source={resolvedCodeLines.map(({ text }) => text).join("\n")}
          input={playgroundInput} disabled={playgroundDisabled || !resolvedCodeLines.length} generic />}
      </div>

      <PointerStateBand step={resolvedStep} />

      <div
        className="ctp-scroll"
        ref={codeRef}
        onWheel={markManualScroll}
        onTouchMove={markManualScroll}
        style={
          disableResizer
            ? { flex: "1 1 auto", minHeight: 0 }
            : { height: codeAreaHeight }
        }
      >
        {resolvedCodeLines.map(({ line, text }) => {
          const isActive = resolvedStep?.activeLine === line;
          const isRelated = resolvedStep?.relatedLines?.includes(line);
          const isExternallyHighlighted = highlightedLineSet.has(line);
          return (
            <motion.div
              key={line}
              data-line={line}
              className={`ctp-row ${isActive ? "active" : ""} ${isRelated ? "related" : ""} ${isExternallyHighlighted ? "external-highlight" : ""} ${onLineSelect ? "clickable" : ""}`}
              animate={{
                x: isActive ? 6 : 0,
                opacity:
                  isRelated || isActive || isExternallyHighlighted || !resolvedStep
                    ? 1
                    : 0.56,
              }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              onClick={
                onLineSelect ? () => onLineSelect(line, { text }) : undefined
              }
            >
              <span className="ctp-no mono">{line}</span>
              <code className="ctp-text">{text || " "}</code>
            </motion.div>
          );
        })}
      </div>

      {!disableResizer && (
        <div
          className={`ctp-resizer ${isResizing ? "active" : ""}`}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          aria-hidden="true"
        >
          <ResizerHandle
            side="center"
            className="ctp"
            onPointerDown={startDrag}
          />
        </div>
      )}

    </motion.div>
  );
}
