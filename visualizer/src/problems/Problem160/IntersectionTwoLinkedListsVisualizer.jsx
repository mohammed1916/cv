import { useState, useMemo, useCallback } from "react";
import { createPortal } from 'react-dom';
import { motion } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from '../../config/examplesRegistry'
import "./IntersectionTwoLinkedListsVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE_INLINE = [
  { line: 1, text: "def getIntersectionNode(headA, headB):" },
  { line: 2, text: "    a, b = headA, headB" },
  { line: 3, text: "    while a != b:" },
  { line: 4, text: "        a = a.next if a else headB" },
  { line: 5, text: "        b = b.next if b else headA" },
  { line: 6, text: "    return a  # intersection or None" },
];
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('intersection-two-linked-lists');

// Build flat node list for each pointer traversal
// Total nodes: listA + shared, listB + shared (shared pointer is same index >= listA.length)
function buildNodeSequences(ex) {
  // nodeA: listA[0..] then shared[0..]
  // nodeB: listB[0..] then shared[0..]
  // After end of A, redirect to headB (index m in nodeB), etc.
  const A = [...listA, ...shared];
  const B = [...listB, ...shared];
  const intersectIdxA = shared.length > 0 ? listA.length : -1;
  const intersectIdxB = shared.length > 0 ? listB.length : -1;
  return { A, B, intersectIdxA, intersectIdxB };
}

function generateSteps({ listA, listB, shared, intersectVal }) {
  const steps = [];
  const { A, B, intersectIdxA, intersectIdxB } = buildNodeSequences(ex);
  // Simulate two-pointer
  // pA: 0..A.length-1 then null then B[0]..B[intersectIdxB] (or end)
  // We'll track as [list, idx] where list is 'A'|'B'|'null'
  let pA = { list: "A", idx: 0 };
  let pB = { list: "B", idx: 0 };
  const maxSteps = (A.length + B.length + 2) * 2;

  const nodeVal = (p) => {
    if (!p) return null;
    if (p.list === "A") return A[p.idx];
    if (p.list === "B") return B[p.idx];
    return null;
  };

  const isIntersect = (p) => {
    if (!p) return false;
    if (p.list === "A" && p.idx >= intersectIdxA && intersectIdxA >= 0) return true;
    if (p.list === "B" && p.idx >= intersectIdxB && intersectIdxB >= 0) return true;
    return false;
  };

  const isSamePos = (p1, p2) => {
    if (!p1 && !p2) return true;
    if (!p1 || !p2) return false;
    const inA1 = p1.list === "A" && p1.idx >= intersectIdxA && intersectIdxA >= 0;
    const inA2 = p2.list === "A" && p2.idx >= intersectIdxA && intersectIdxA >= 0;
    const inB1 = p1.list === "B" && p1.idx >= intersectIdxB && intersectIdxB >= 0;
    const inB2 = p2.list === "B" && p2.idx >= intersectIdxB && intersectIdxB >= 0;
    const sharedIdx1 = inA1 ? p1.idx - intersectIdxA : inB1 ? p1.idx - intersectIdxB : -99;
    const sharedIdx2 = inA2 ? p2.idx - intersectIdxA : inB2 ? p2.idx - intersectIdxB : -99;
    if (shared.length > 0 && sharedIdx1 >= 0 && sharedIdx2 >= 0) return sharedIdx1 === sharedIdx2;
    if (!p1 && !p2) return true;
    return false;
  };

  const noIntersect = shared.length === 0;

  steps.push({ activeLine: 2, pA: { ...pA }, pB: { ...pB }, message: "Init pA=headA, pB=headB" });

  for (let s = 0; s < maxSteps; s++) {
    if (isSamePos(pA, pB)) {
      const val = nodeVal(pA);
      steps.push({
        activeLine: 6, pA: pA ? { ...pA } : null, pB: pB ? { ...pB } : null, found: true,
        message: val !== undefined && val !== null ? `pA == pB → intersection at node ${val}` : "pA == pB == null → no intersection",
      });
      break;
    }
    // Advance pA
    let nextA;
    if (pA === null) {
      nextA = null;
    } else if (pA.idx + 1 < (pA.list === "A" ? A.length : B.length)) {
      nextA = { list: pA.list, idx: pA.idx + 1 };
    } else {
      // redirect
      nextA = pA.list === "A" ? { list: "B", idx: 0 } : null;
    }
    // Advance pB
    let nextB;
    if (pB === null) {
      nextB = null;
    } else if (pB.idx + 1 < (pB.list === "B" ? B.length : A.length)) {
      nextB = { list: pB.list, idx: pB.idx + 1 };
    } else {
      nextB = pB.list === "B" ? { list: "A", idx: 0 } : null;
    }
    pA = nextA;
    pB = nextB;
    steps.push({
      activeLine: 3, pA: pA ? { ...pA } : null, pB: pB ? { ...pB } : null,
      message: `Advance: pA=${pA ? `${pA.list}[${pA.idx}]=${nodeVal(pA)}` : "null"}, pB=${pB ? `${pB.list}[${pB.idx}]=${nodeVal(pB)}` : "null"}`,
    });
  }
  return steps;
}

function renderList(nodes, label, ptrIdx, ptrList, intersectStart, accent) {
  return (
    <div className="itll-list-block">
      <div className="itll-list-label" style={{ color: accent }}>{label}</div>
      <div className="itll-list-row">
        {nodes.map((v, i) => {
          const isPtr = ptrList === (label === "List A" ? "A" : "B") && ptrIdx === i;
          const isShared = i >= intersectStart && intersectStart >= 0;
          return (
            <div key={i} className="itll-node-wrap">
              <motion.div className={`itll-node ${isShared ? "shared" : ""} ${isPtr ? "ptr" : ""}`}
                animate={{ scale: isPtr ? 1.15 : 1, y: isPtr ? -4 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                {v}
              </motion.div>
              {i < nodes.length - 1 && <span className="itll-arrow">→</span>}
              {isPtr && <div className="itll-ptr-label">p{label.includes("A") ? "A" : "B"}</div>}
            </div>
          );
        })}
        <span className="itll-null">→ null</span>
      </div>
    </div>
  );
}

export default function IntersectionTwoLinkedListsVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [listAInput, setListAInput] = useState("[4,1]");
  const [listBInput, setListBInput] = useState("[5,6,1]");
  const [sharedInput, setSharedInput] = useState("[8,4,5]");
  const [intersectValInput, setIntersectValInput] = useState(8);
  const { listA, listB, shared, intersectVal, inputError } = useMemo(() => {
    try {
      const parsedListA = JSON.parse(listAInput); if (!Array.isArray(parsedListA)) throw new Error('listA must be an array');
      const parsedListB = JSON.parse(listBInput); if (!Array.isArray(parsedListB)) throw new Error('listB must be an array');
      const parsedShared = JSON.parse(sharedInput); if (!Array.isArray(parsedShared)) throw new Error('shared must be an array');
      const parsedIntersectVal = Number(intersectValInput); if (isNaN(parsedIntersectVal)) throw new Error('intersectVal must be a number');
      return { listA: parsedListA, listB: parsedListB, shared: parsedShared, intersectVal: parsedIntersectVal, inputError: '' };
    } catch (e) {
      return { listA: "[4,1]", listB: "[5,6,1]", shared: "[8,4,5]", intersectVal: 8, inputError: e.message };
    }
  }, [listAInput, listBInput, sharedInput, intersectValInput]);
  const steps = useMemo(() => generateSteps(ex), [listA, listB, shared, intersectVal]);
  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); setListAInput(JSON.stringify(e.listA)); setListBInput(JSON.stringify(e.listB)); setSharedInput(JSON.stringify(e.shared)); setIntersectValInput(String(e.intersectVal)); handleReset(); }, [handleReset]);;
  const { A, B, intersectIdxA, intersectIdxB } = buildNodeSequences(ex);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

  // Extract panels
  const primaryPanel = (
    <div className="itll-panel">
      <div className="itll-examples">
        {EXAMPLES.map(e => (
          <button key={e.label} className={`itll-chip ${ex.label === e.label ? "active" : ""}`} onClick={() => applyEx(e)}>{e.label}</button>
        ))}
      </div>
      <div className="itll-panel-label">Linked Lists</div>
      {renderList(A, "List A", step?.pA?.list === "A" ? step.pA.idx : -1, step?.pA?.list, intersectIdxA, "#89b4fa")}
      {renderList(B, "List B", step?.pB?.list === "B" ? step.pB.idx : -1, step?.pB?.list, intersectIdxB, "#fab387")}
      {shared.length > 0 && (
        <div className="itll-shared-note">Shared (intersection): [{shared.join(" → ")}] starting at {intersectVal}</div>
      )}
      {step?.found && (
        <div className={`itll-result ${shared.length > 0 ? "ok" : "none"}`}>
          {shared.length > 0 ? `✓ Intersection at node with value ${intersectVal}` : "✗ No intersection (return null)"}
        </div>
      )}
    </div>
  
    </>)

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
      />
      {showPatternOverlay && <CodePatternAnnotations step={step} linePatternMap={LINE_PATTERN_MAP} activeLineDom={activeLineDom} />}
    </div>
  )

  const statusPanel = (
    <div className="itll-status">{step?.message ?? "Press Play to begin."}</div>
  )

  const playbackPanel = (
      {showPatternOverlay && <PatternLegend patterns={PATTERNS} />}
      <PlaybackControls
        isPlaying={isPlaying} isDone={isDone} speed={speed}
        onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset}
        prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0}
        onSpeedChange={e => setSpeed(Number(e.target.value))}
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
    </>
  )

  // Lumino state
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Linked Lists', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="itll-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  );
}
