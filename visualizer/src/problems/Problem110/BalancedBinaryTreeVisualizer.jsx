import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import FloatingPanel from "../../components/shared/FloatingPanel";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { binaryTreeLayout } from "../../components/shared/binaryTreeLayout";
import { getExamples } from "../../config/examplesRegistry";
import "./BalancedBinaryTreeVisualizer.css";
import { parseBalancedTree, traceBalance } from "./algorithm";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import LuminoDockPanel from "../../components/LuminoDockPanel";

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = { 4: 'visit', 5: 'return', 6: 'visit', 7: 'return', 8: 'compare', 9: 'return', 10: 'done' };
const PATTERNS = ['visit', 'compare', 'return', 'done'];


const NODE_R = 22;

const SOLUTION_CODE = [
  { line: 1, text: "def isBalanced(root):" },
  { line: 2, text: "    def height(node):" },
  { line: 3, text: "        if not node: return 0" },
  { line: 4, text: "        lh = height(node.left)" },
  { line: 5, text: "        if lh == -1: return -1" },
  { line: 6, text: "        rh = height(node.right)" },
  { line: 7, text: "        if rh == -1: return -1" },
  { line: 8, text: "        if abs(lh - rh) > 1: return -1" },
  { line: 9, text: "        return max(lh, rh) + 1" },
  { line: 10, text: "    return height(root) != -1" },
];

function generateSteps(root) {
  const { positions, edges, nodes: allNodes } = binaryTreeLayout(root);
  return traceBalance(root).map(frame => ({ ...frame, positions, edges, allNodes }));
}

const EXAMPLES = getExamples("balanced-binary-tree");

// TreeVisualizationPanel: renders the tree canvas with states
function TreeVisualizationPanel({ step, positions, edges, allNodes }) {
  const reduceMotion = useReducedMotion();
  const canvasWidth = Math.max(320, ...[...positions.values()].map(p => p.x + 48));
  const canvasHeight = Math.max(320, ...[...positions.values()].map(p => p.y + 55));
  return (
    <div className="bbt-viz-panel">
      <div className="bbt-tree-scroll" tabIndex={0} aria-label="Tree diagram; scroll to explore">
      <div className="bbt-canvas" style={{ width: canvasWidth, height: canvasHeight }}>
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
          width={canvasWidth}
          height={canvasHeight}
        >
          {edges.map(({ fromId, toId }) => {
            const from = positions.get(fromId);
            const to = positions.get(toId);
            if (!from || !to) return null;
            return (
              <line
                key={`${fromId}-${toId}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="var(--code-line)"
                strokeWidth={1.5}
              />
            );
          })}
        </svg>
        {allNodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const isActive = step?.activeId === node.id;
          const isUnbal = step?.unbalancedIds?.has(node.id);
          const h = step?.heights?.get(node.id);
          return (
            <motion.div
              key={node.id}
              style={{
                position: "absolute",
                left: pos.x - NODE_R,
                top: pos.y - NODE_R,
              }}
            >
              <motion.div
                className={`bbt-node ${isActive ? "active" : ""} ${isUnbal ? "unbalanced" : h != null ? "balanced" : ""}`}
                animate={isActive && !reduceMotion ? { scale: 1.2 } : { scale: 1 }}
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 20 }}
              >
                {node.val}
              </motion.div>
              {h != null && <div className="bbt-height-badge">{h}</div>}
              {isUnbal && <div className="bbt-height-badge unbal">!</div>}
            </motion.div>
          );
        })}
      </div>
      </div>
      <div className="bbt-status">
        {step?.message || "Press Play to begin."}
      </div>
    </div>
  );
}

// StatePanel: shows active node and final result
function StatePanel({ step, allNodes }) {
  return (
    <div className="bbt-state-panel">
      <h3>Height balance checkpoint</h3>
      <p>Every node must have child heights differing by at most one.</p>
      {step?.left != null && <div className="bbt-height-comparison" aria-label="Child heights">
        {['left', 'right'].map(side => <div key={side}>
          <span>{side} subtree</span>
          <strong>{step[side] === -1 ? 'Failed' : step[side] ?? 'Not visited'}</strong>
          {step[side] >= 0 && step[side] != null && <meter min="0" max={Math.max(1, step.left, step.right ?? 0)} value={step[side]} aria-label={`${side} height`} />}
        </div>)}
        <p>{step.phase === 'propagate' ? 'Propagate failure; no new comparison.' : step.difference != null ? `Difference ${step.difference} / allowed 1` : 'Waiting for the right height.'}</p>
      </div>}
      {step?.firstFailure != null && <p>First failing node: {allNodes.find(n => n.id === step.firstFailure)?.val} (node #{step.firstFailure})</p>}
      <div className="bbt-metric">
        <span className="bbt-label">Active node</span>
        <strong className="bbt-val">
          {step?.activeId != null && step.activeId !== -1
            ? (allNodes.find((n) => n.id === step.activeId)?.val ?? "—")
            : "—"}
        </strong>
      </div>
      <div className="bbt-legend">
        <div className="bbt-legend-item">
          <div className="bbt-dot active" />
          Processing
        </div>
        <div className="bbt-legend-item">
          <div className="bbt-dot balanced" />
          Balanced subtree
        </div>
        <div className="bbt-legend-item">
          <div className="bbt-dot unbalanced" />
          Unbalanced
        </div>
      </div>
      <div
        className={`bbt-result ${step?.phase === "done" ? (step.result ? "ok" : "fail") : ""}`}
      >
        {step?.phase === "done"
          ? step.result
            ? "✓ Balanced"
            : "✗ Not Balanced"
          : "Checking…"}
      </div>
    </div>
  );
}

export default function BalancedBinaryTreeVisualizer() {
  const [arrInput, setArrInput] = useState("[3,9,20,null,null,15,7]");

  const { arr, inputError } = useMemo(() => {
    try {
      return { arr: parseBalancedTree(arrInput), inputError: "" };
    } catch (e) {
      return { arr: null, inputError: e.message };
    }
  }, [arrInput]);

  const steps = useMemo(() => inputError ? [] : generateSteps(arr), [arr, inputError]);
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
  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();

  const applyExample = useCallback(
    (ex) => {
      setArrInput(JSON.stringify(ex.arr));
      handleReset();
    },
    [handleReset],
  );

  const positions = (step ?? steps[0])?.positions ?? new Map();
  const edges = (step ?? steps[0])?.edges ?? [];
  const allNodes = (step ?? steps[0])?.allNodes ?? [];

  // Step 2: Extract panels into consts
  const primaryPanel = (
    <>


      <div className="bbt-panel">
        <TreeVisualizationPanel
          step={step}
          positions={positions}
          edges={edges}
          allNodes={allNodes}
        />
      </div>
    </>
  );

  const statePanel = (
    <div className="bbt-panel">
      <StatePanel step={step} allNodes={allNodes} />
    </div>
  );

  const inputPanel = (
    <div className="bbt-panel">
      <ManualInputPanel
        fields={[{ key: "arr", label: "arr", type: "string" }]}
        values={{ arr: arrInput }}
        onChange={(k, v) => {
          if (k === "arr") setArrInput(v);
          handleReset();
        }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />
    </div>
  );

  const codePanel = (
    <div style={{ position: "relative", height: "100%" }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        onActiveLineDomChange={setActiveLineDom}
        autoScroll={autoScrollCode}
        disableResizer
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
  );

  const statusPanel = (
    <div className="bbt-status">{step?.message || "Press Play to begin."}</div>
  );

  const playbackPanel = (
    <>
      <PlaybackControls
        onReset={handleReset}
        onPrev={stepBack}
        onPlayToggle={togglePlay}
        onNext={stepForward}
        resetDisabled={steps.length === 0}
        prevDisabled={stepIndex < 0}
        nextDisabled={isDone}
        isPlaying={isPlaying}
        isDone={isDone}
        speed={speed}
        onSpeedChange={(e) => setSpeed(Number(e.target.value))}
        speedIndicator={`${speed}ms`}
        autoScroll={autoScrollCode}
        onAutoScrollChange={setAutoScrollCode}
        autoScrollLabel="Auto-scroll code"
        showAutoScroll
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
      )}
    </>
  );

  // Step 3: Add state + config
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: "input", title: "Input", dockMode: "split-right" },
      { id: "state", title: "State", dockMode: "split-right" },
      { id: "primary", title: "Tree Visualization", dockMode: "split-bottom" },
      { id: "code", title: "Code", dockMode: "split-bottom" },
      { id: "status", title: "Status", dockMode: "split-bottom", ratio: 0.08 },
    ],
    [],
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  // Step 5: Replace return with portals
  return (
    <div className="vis-shell bbt-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">
          {playbackPanel}
        </FloatingPanel>,
        document.body,
      )}
    </div>
  );
}
