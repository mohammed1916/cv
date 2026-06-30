import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DockableWorkspace from "../../components/shared/DockableWorkspace";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { getExamples } from "../../config/examplesRegistry"
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend";
import "./LongestValidParenthesesVisualizer.css";
const SOLUTION_CODE = [
  { line: 1, text: "def longestValidParentheses(s):" },
  { line: 2, text: "    stack = [-1]" },
  { line: 3, text: "    max_len = 0" },
  { line: 4, text: "    for i in range(len(s)):" },
  { line: 5, text: "        if s[i] == '(':" },
  { line: 6, text: "            stack.append(i)" },
  { line: 7, text: "        else:  # s[i] == ')'" },
  { line: 8, text: "            stack.pop()" },
  { line: 9, text: "            if not stack:" },
  { line: 10, text: "                stack.append(i)" },
  { line: 11, text: "            else:" },
  { line: 12, text: "                max_len = max(max_len, i - stack[-1])" },
  { line: 13, text: "    return max_len" },
];



const LONGESTVALIDPARENTHESES_PATTERNS = ['calculate_len', 'check', 'check_close', 'done', 'init', 'pop', 'push_current', 'push_open', 'stack_empty']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  2: 'init',
  5: 'check',
  6: 'push_open',
  7: 'check_close',
  8: 'pop',
  10: 'stack_empty',
  12: 'calculate_len',
  13: 'done',
}

function generateSteps(s) {
  const steps = [];
  const chars = s.split("");
  let stack = [-1];
  let maxLen = 0;

  steps.push({
    phase: "init",
    activeLine: 2,
    stack: [-1],
    maxLen: 0,
    charIdx: -1,
    message: "Initialize stack = [-1], max_len = 0",
  });

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    if (ch === "(") {
      steps.push({
        phase: "check",
        activeLine: 5,
        stack: [...stack],
        maxLen,
        charIdx: i,
        message: `Index ${i}: '(' → Check if open paren`,
      });

      stack.push(i);
      steps.push({
        phase: "push_open",
        activeLine: 6,
        stack: [...stack],
        maxLen,
        charIdx: i,
        message: `Index ${i}: '(' → Push index ${i} to stack`,
      });
    } else {
      steps.push({
        phase: "check_close",
        activeLine: 7,
        stack: [...stack],
        maxLen,
        charIdx: i,
        message: `Index ${i}: ')' → Found closing paren`,
      });

      const popped = stack.pop();
      steps.push({
        phase: "pop",
        activeLine: 8,
        stack: [...stack],
        maxLen,
        charIdx: i,
        poppedVal: popped,
        message: `Index ${i}: ')' → Pop ${popped} from stack`,
      });

      if (stack.length === 0) {
        steps.push({
          phase: "stack_empty",
          activeLine: 10,
          stack: [...stack],
          maxLen,
          charIdx: i,
          message: `Stack empty → Push current index ${i}`,
        });
        stack.push(i);
        steps.push({
          phase: "push_current",
          activeLine: 10,
          stack: [...stack],
          maxLen,
          charIdx: i,
          message: `Stack: [${stack.join(", ")}]`,
        });
      } else {
        const len = i - stack[stack.length - 1];
        const newMaxLen = Math.max(maxLen, len);
        steps.push({
          phase: "calculate_len",
          activeLine: 12,
          stack: [...stack],
          maxLen: newMaxLen,
          charIdx: i,
          currentLen: len,
          message: `Length = ${i} - ${stack[stack.length - 1]} = ${len}. max_len = ${newMaxLen}`,
        });
        maxLen = newMaxLen;
      }
    }
  }

  steps.push({
    phase: "done",
    activeLine: 13,
    stack: [...stack],
    maxLen,
    charIdx: -1,
    message: `Result: ${maxLen}`,
  });

  return steps;
}

const EXAMPLES = getExamples("longest-valid-parentheses") || [
  { label: "Simple", s: "()" },
  { label: "Complex", s: ")()())" },
  { label: "Nested", s: "(())" },
  { label: "Multiple", s: "()(())" },
  { label: "Invalid Start", s: "()(()" },
];

export default function LongestValidParenthesesVisualizer() {
  const [input, setInput] = useState('")()())"');
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();

  const steps = useMemo(() => generateSteps(input), [input]);
  const {
    stepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

  const applyExample = useCallback(
    (ex) => {
      setInput(ex.s);
      handleReset();
    },
    [handleReset]
  );

  const chars = input.split("");
  const stack = step?.stack ?? [-1];
  const maxLen = step?.maxLen ?? 0;
  const charIdx = step?.charIdx ?? -1;

  const dockPanels = useMemo(
    () => [
      {
        id: "input",
        title: "Input Controls",
        subtitle: `Length: ${input.length}`,
        defaultZone: "left",
        content: (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>
                Examples
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => applyExample(ex)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 4,
                      border: input === ex.s ? "2px solid #0ea5e9" : "1px solid #cbd5e1",
                      cursor: "pointer",
                      fontSize: 12,
                      backgroundColor: input === ex.s ? "#e0f2fe" : "#f1f5f9",
                      fontWeight: input === ex.s ? 600 : 400,
                      color: "#1e293b",
                    }}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", display: "block", marginBottom: 8 }}>
                String
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  handleReset();
                }}
                placeholder='e.g., ")()())"'
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: 4,
                  fontSize: 13,
                  fontFamily: "monospace",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        ),
      },
      {
        id: "viz",
        title: "Stack Visualization",
        subtitle: step ? `Step ${stepIndex + 1} of ${steps.length}` : "Press play to start",
        defaultZone: "right",
        content: (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>
                String: {step?.charIdx >= 0 ? `Index ${step.charIdx}` : ""}
              </div>
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap", minHeight: 40, padding: 8, backgroundColor: "#f8fafc", borderRadius: 4 }}>
                {chars.map((ch, i) => (
                  <motion.span
                    key={i}
                    animate={{
                      scale: i === charIdx ? 1.5 : 1,
                      backgroundColor:
                        i === charIdx
                          ? "#fbbf24"
                          : ch === "("
                          ? "#dbeafe"
                          : "#fee2e2",
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      fontSize: 14,
                      fontWeight: "bold",
                      borderRadius: 4,
                      color: "#1e293b",
                      border: i === charIdx ? "2px solid #d97706" : "none",
                    }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>
                  Stack (top→bottom)
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column-reverse",
                    gap: 6,
                    minHeight: 100,
                    padding: 8,
                    backgroundColor: "#f8fafc",
                    borderRadius: 4,
                  }}
                >
                  <AnimatePresence>
                    {stack.map((val, i) => (
                      <motion.div
                        key={`${i}-${val}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: i === stack.length - 1 ? "#dbeafe" : "#e0e7ff",
                          border: i === stack.length - 1 ? "1px solid #0ea5e9" : "1px solid #c7d2fe",
                          borderRadius: 4,
                          fontSize: 13,
                          fontWeight: "bold",
                          color: "#1e293b",
                        }}
                      >
                        {val}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>
                  Max Length
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 100,
                    padding: 16,
                    backgroundColor: "#f0fdf4",
                    border: "2px solid #22c55e",
                    borderRadius: 4,
                  }}
                >
                  <motion.div
                    animate={{ scale: step?.phase === "calculate_len" ? 1.2 : 1 }}
                    style={{
                      fontSize: 48,
                      fontWeight: "bold",
                      color: "#16a34a",
                    }}
                  >
                    {maxLen}
                  </motion.div>
                </div>
              </div>
            </div>

            {step?.currentLen !== undefined && (
              <div style={{ padding: 12, backgroundColor: "#e0f2fe", borderRadius: 4, borderLeft: "4px solid #0ea5e9" }}>
                <div style={{ fontSize: 12, color: "#0c4a6e", fontWeight: 600 }}>
                  Current length: {step.currentLen}
                </div>
              </div>
            )}

            <div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 4 }}>
              <div style={{ fontSize: 12, color: "#166534", fontWeight: 500 }}>
                {step?.message ?? "Press Play to begin."}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "code",
        title: "Code Trace",
        subtitle: step ? `Line ${step.activeLine}` : "Trace the algorithm",
        defaultZone: "full",
        content: (
                    <div style={{ position: "relative" }}>
            <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            onActiveLineDomChange={setActiveLineDom}
            autoScroll={autoScrollCode}
          />

            {showPatternOverlay && (
              <CodePatternAnnotations
                linePatterns={LINE_PATTERN_MAP}
                currentPhase={step?.phase}
                activeLineDom={activeLineDom}
                activeLine={step?.activeLine}
              />
            )}
          </div>
        ),
      },
    ],
    [input, stepIndex, steps, step, applyExample, charIdx, stack, maxLen, autoScrollCode, setActiveLineDom]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#fafafa" }}>
      <section style={{ padding: "24px 32px", backgroundColor: "white", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
            Longest Valid Parentheses
          </span>
          <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: 28, fontWeight: 700, color: "#1e293b" }}>
            Find the longest valid parentheses substring
          </h2>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
            This visualization traces the stack-based algorithm that efficiently finds the length of the longest
            valid parentheses substring by maintaining a stack of indices.
          </p>
        </div>
      </section>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <DockableWorkspace
          title="Longest Valid Parentheses Workspace"
          panels={dockPanels}
          initialLayout={{
            rows: [
              ["input", "viz"],
              ["code", "code"],
            ],
            minimized: [],
          }}
        />
      </div>

      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={LONGESTVALIDPARENTHESES_PATTERNS} />
        )}
        <PlaybackControls
          isPlaying={isPlaying}
          isDone={isDone}
          speed={speed}
          onPlayToggle={togglePlay}
          onPrev={stepBack}
          onNext={stepForward}
          onReset={handleReset}
          prevDisabled={stepIndex < 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
          autoScrollLabel="Auto-scroll code"
          showAutoScroll
        />
      </FloatingPanel>

      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  );
}

