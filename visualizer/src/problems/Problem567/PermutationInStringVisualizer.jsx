import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";

import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import ManualInputPanel from "../../components/shared/ManualInputPanel";

import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";

import { getExamples } from "../../config/examplesRegistry";

import "./PermutationInStringVisualizer.css";

const SOLUTION_CODE = [
  { line: 1, text: "def checkInclusion(s1, s2):" },
  { line: 2, text: "    if len(s1) > len(s2): return False" },
  { line: 3, text: "    need = Counter(s1)" },
  { line: 4, text: "    have = Counter(s2[:len(s1)])" },
  { line: 5, text: "    if have == need: return True" },
  { line: 6, text: "    for i in range(len(s1), len(s2)):" },
  { line: 7, text: "        have[s2[i]] += 1" },
  { line: 8, text: "        out = s2[i - len(s1)]" },
  { line: 9, text: "        have[out] -= 1" },
  { line: 10, text: "        if have[out] == 0: del have[out]" },
  { line: 11, text: "        if have == need: return True" },
  { line: 12, text: "    return False" },
];

const EXAMPLES = getExamples("permutation-in-string");

function countEq(a, b) {
  const ka = Object.keys(a);
  const kb = Object.keys(b);

  if (ka.length !== kb.length) {
    return false;
  }

  for (const k of ka) {
    if (a[k] !== b[k]) {
      return false;
    }
  }

  return true;
}

function generateSteps(s1, s2) {
  const steps = [];

  if (s1.length > s2.length) {
    steps.push({
      activeLine: 2,
      winStart: -1,
      winEnd: -1,
      have: {},
      need: {},
      result: false,
      matchWin: false,
      message: "s1 longer than s2 → false",
    });

    return steps;
  }

  const need = {};

  for (const c of s1) {
    need[c] = (need[c] || 0) + 1;
  }

  const have = {};

  for (let i = 0; i < s1.length; i++) {
    have[s2[i]] = (have[s2[i]] || 0) + 1;
  }

  const initMatch = countEq(have, need);

  steps.push({
    activeLine: 5,
    winStart: 0,
    winEnd: s1.length - 1,
    have: { ...have },
    need: { ...need },
    result: initMatch ? true : null,
    matchWin: initMatch,
    message: `Initial window [0..${s1.length - 1}]. Match=${initMatch}`,
  });

  if (initMatch) {
    return steps;
  }

  for (let i = s1.length; i < s2.length; i++) {
    have[s2[i]] = (have[s2[i]] || 0) + 1;

    const out = s2[i - s1.length];

    have[out]--;

    if (have[out] === 0) {
      delete have[out];
    }

    const winStart = i - s1.length + 1;
    const match = countEq(have, need);

    steps.push({
      activeLine: match ? 11 : 10,
      winStart,
      winEnd: i,
      have: { ...have },
      need: { ...need },
      result: match ? true : null,
      matchWin: match,
      message: `Window [${winStart}..${i}]: add '${s2[i]}', remove '${out}'. Match=${match}`,
    });

    if (match) {
      return steps;
    }
  }

  steps.push({
    activeLine: 12,
    winStart: -1,
    winEnd: -1,
    have: { ...have },
    need: { ...need },
    result: false,
    matchWin: false,
    message: "No permutation found → return false.",
  });

  return steps;
}

export default function PermutationInStringVisualizer() {
  const initialExample = EXAMPLES[0];

  const [ex, setEx] = useState(initialExample);

  const [s1Input, setS1Input] = useState(
    initialExample?.s1 != null ? String(initialExample.s1) : "ab",
  );

  const [s2Input, setS2Input] = useState(
    initialExample?.s2 != null ? String(initialExample.s2) : "eidbaooo",
  );

  /*
   * ------------------------------------------------------------
   * Parsed input
   * ------------------------------------------------------------
   */

  const { s1, s2, inputError } = useMemo(() => {
    try {
      return {
        s1: s1Input,
        s2: s2Input,
        inputError: "",
      };
    } catch (error) {
      return {
        s1: "",
        s2: "",
        inputError: error.message,
      };
    }
  }, [s1Input, s2Input]);

  /*
   * ------------------------------------------------------------
   * Algorithm steps
   * ------------------------------------------------------------
   */

  const steps = useMemo(() => {
    if (inputError) {
      return [];
    }

    try {
      return generateSteps(s1, s2);
    } catch {
      return [];
    }
  }, [s1, s2, inputError]);

  /*
   * ------------------------------------------------------------
   * Playback
   * ------------------------------------------------------------
   */

  const {
    stepIndex,
    setStepIndex,
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

  /*
   * ------------------------------------------------------------
   * Examples / input
   * ------------------------------------------------------------
   */

  const applyEx = useCallback(
    (example) => {
      setEx(example);
      setS1Input(String(example.s1 ?? ""));
      setS2Input(String(example.s2 ?? ""));
      handleReset();
    },
    [handleReset],
  );

  const handleInputChange = useCallback(
    (key, value) => {
      /*
       * Once the user manually edits an input, it is no longer
       * necessarily identical to the selected example.
       */
      setEx(null);

      if (key === "s1") {
        setS1Input(value);
      }

      if (key === "s2") {
        setS2Input(value);
      }

      handleReset();
    },
    [handleReset],
  );

  /*
   * ------------------------------------------------------------
   * Frequency characters
   * ------------------------------------------------------------
   */

  const relevantChars = useMemo(() => {
    if (!step) {
      return [];
    }

    return [
      ...new Set([
        ...Object.keys(step.need || {}),
        ...Object.keys(step.have || {}),
      ]),
    ];
  }, [step]);

  /*
   * ------------------------------------------------------------
   * Pattern overlay / code connectivity
   * ------------------------------------------------------------
   */

  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  });

  /*
   * ============================================================
   * INPUT PANEL
   * ============================================================
   *
   * Input belongs here and ONLY here.
   *
   * Do not render example buttons or editable inputs again inside
   * the visualization panel.
   */

  const inputPanel = (
    <div className="pis-input-panel">
      <ManualInputPanel
        fields={[
          {
            key: "s1",
            label: "s1",
            type: "string",
          },
          {
            key: "s2",
            label: "s2",
            type: "string",
          },
        ]}
        values={{
          s1: s1Input,
          s2: s2Input,
        }}
        onChange={handleInputChange}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
      />
    </div>
  );

  /*
   * ============================================================
   * CODE PANEL
   * ============================================================
   */

  const codePanel = (
    <CodeTracePanel
      step={step}
      codeLines={SOLUTION_CODE}
      highlightedLines={connectivity.highlightedLines}
      onLineSelect={connectivity.handleLineSelect}
      onActiveLineDomChange={setActiveLineDom}
    />
  );

  /*
   * ============================================================
   * VISUALIZATION PANEL
   * ============================================================
   *
   * No inputs.
   * No example buttons.
   *
   * This panel only visualizes the current algorithm state.
   */

  const vizPanel = (
    <div className="pis-shell">
      {/* Current strings */}

      <div className="pis-strings">
        <div>
          <span className="pis-lbl s1">s1:</span>

          <span className="pis-val">{s1}</span>
        </div>

        <div>
          <span className="pis-lbl s2">s2:</span>

          <span className="pis-val">{s2}</span>
        </div>
      </div>

      {/* Sliding window */}

      <div className="pis-panel">
        <div className="pis-panel-label">Sliding Window</div>

        <div className="pis-chars-row">
          {s2.split("").map((ch, i) => {
            const inWindow = step && i >= step.winStart && i <= step.winEnd;

            const isMatch = inWindow && step?.matchWin;

            let className = "pis-ch";

            if (inWindow) {
              className += " window";
            }

            if (isMatch) {
              className += " match";
            }

            return (
              <div key={`${ch}-${i}`} className={className}>
                {ch}
              </div>
            );
          })}
        </div>
      </div>

      {/* Frequency counters */}

      {step && (
        <div className="pis-freq-row">
          {/* NEED */}

          <div className="pis-panel pis-freq-panel">
            <div className="pis-panel-label">Need — s1</div>

            <div className="pis-freq-items">
              {relevantChars.map((char) => (
                <div key={char} className="pis-freq-item">
                  <div className="pis-freq-char">{char}</div>

                  <div className="pis-freq-val need">
                    {step.need?.[char] ?? 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HAVE */}

          <div className="pis-panel pis-freq-panel">
            <div className="pis-panel-label">Have — current window</div>

            <div className="pis-freq-items">
              {relevantChars.map((char) => {
                const need = step.need?.[char] ?? 0;

                const have = step.have?.[char] ?? 0;

                const matches = need === have;

                return (
                  <div key={char} className="pis-freq-item">
                    <div className="pis-freq-char">{char}</div>

                    <div
                      className={`pis-freq-val have ${matches ? "ok" : "diff"}`}
                    >
                      {have}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Current step explanation */}

      {step?.message && <div className="pis-status">{step.message}</div>}

      {/* Final result */}

      {step?.result != null && (
        <div className={`pis-result ${step.result ? "true" : "false"}`}>
          {step.result ? "✓ Permutation found!" : "✗ No permutation found"}
        </div>
      )}
    </div>
  );

  /*
   * ------------------------------------------------------------
   * Lumino panels
   * ------------------------------------------------------------
   */

  const [panelDivs, setPanelDivs] = useState(null);

  const panelConfigs = useMemo(
    () => [
      {
        id: "code",
        title: "Code",
      },
      {
        id: "input",
        title: "Input",
        dockMode: "split-right",
      },
      {
        id: "viz",
        title: "🔍 Sliding Window",
        dockMode: "split-bottom",
      },
    ],
    [],
  );

  const handlePanelReady = useCallback((divs) => {
    setPanelDivs(divs);
  }, []);

  /*
   * ------------------------------------------------------------
   * Render
   * ------------------------------------------------------------
   */

  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />

      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}

          {panelDivs.input && createPortal(inputPanel, panelDivs.input)}

          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
        </>
      )}

      {createPortal(
        <FloatingPanel title="Playback Controls">
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
          />
        </FloatingPanel>,
        document.body,
      )}

      {showPatternOverlay && step && (
        <PatternOverlay step={step} activeLineDom={activeLineDom} />
      )}
    </div>
  );
}
