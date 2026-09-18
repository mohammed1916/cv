import LinkedListGraph from "../../components/shared/LinkedListGraph";
import { createPortal } from "react-dom";
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";

import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";

import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";

import { getExamples } from "../../config/examplesRegistry";

import "./SortListVisualizer.css";

const LINE_PATTERN_MAP = {};
const PATTERNS = [];

const SOLUTION_CODE = [
  { line: 1, text: "def sortList(head):" },
  {
    line: 2,
    text: "    if not head or not head.next: return head",
  },
  { line: 3, text: "    # Find middle" },
  {
    line: 4,
    text: "    slow, fast = head, head.next",
  },
  {
    line: 5,
    text: "    while fast and fast.next:",
  },
  {
    line: 6,
    text: "        slow = slow.next; fast = fast.next.next",
  },
  {
    line: 7,
    text: "    mid = slow.next; slow.next = None",
  },
  {
    line: 8,
    text: "    left = sortList(head)",
  },
  {
    line: 9,
    text: "    right = sortList(mid)",
  },
  {
    line: 10,
    text: "    # Merge sorted halves",
  },
  {
    line: 11,
    text: "    dummy = ListNode(0); cur = dummy",
  },
  {
    line: 12,
    text: "    while left and right:",
  },
  {
    line: 13,
    text: "        if left.val <= right.val:",
  },
  {
    line: 14,
    text: "            cur.next = left; left = left.next",
  },
  {
    line: 15,
    text: "        else:",
  },
  {
    line: 16,
    text: "            cur.next = right; right = right.next",
  },
  {
    line: 17,
    text: "        cur = cur.next",
  },
  {
    line: 18,
    text: "    cur.next = left or right",
  },
  {
    line: 19,
    text: "    return dummy.next",
  },
];

const EXAMPLES = getExamples("sort-list");

function makeNodes(values, prefix = "n") {
  return values.map((value, index) => ({
    id: `${prefix}-${index}-${value}`,
    val: value,
  }));
}

function cloneNodes(nodes) {
  return nodes.map((node) => ({ ...node }));
}

function values(nodes) {
  return nodes.map((node) => node.val);
}

function generateSteps(initial) {
  const steps = [];
  let frameId = 0;

  function pushStep({
    activeLine,
    phase,
    message,
    current = [],
    left = [],
    right = [],
    merged = [],
    leftIndex = null,
    rightIndex = null,
    curIndex = null,
    depth = 0,
    done = false,
  }) {
    steps.push({
      id: frameId++,
      activeLine,
      relatedLines: [activeLine],
      phase,
      message,
      current: cloneNodes(current),
      left: cloneNodes(left),
      right: cloneNodes(right),
      merged: cloneNodes(merged),
      leftIndex,
      rightIndex,
      curIndex,
      depth,
      done,
    });
  }

  function mergeSort(nodes, depth = 0) {
    if (nodes.length <= 1) {
      pushStep({
        activeLine: 2,
        phase: "base",
        current: nodes,
        depth,
        message:
          nodes.length === 1
            ? `Base case: node ${nodes[0].val} is already sorted.`
            : "Base case: empty list.",
      });

      return cloneNodes(nodes);
    }

    pushStep({
      activeLine: 4,
      phase: "find-middle",
      current: nodes,
      depth,
      message: `Find the middle of [${values(nodes).join(" → ")}].`,
    });

    const mid = Math.floor(nodes.length / 2);

    const leftHalf = cloneNodes(nodes.slice(0, mid));
    const rightHalf = cloneNodes(nodes.slice(mid));

    pushStep({
      activeLine: 7,
      phase: "split",
      current: nodes,
      left: leftHalf,
      right: rightHalf,
      depth,
      message: `Split into [${values(leftHalf).join(
        " → ",
      )}] and [${values(rightHalf).join(" → ")}].`,
    });

    pushStep({
      activeLine: 8,
      phase: "recurse-left",
      current: nodes,
      left: leftHalf,
      right: rightHalf,
      depth,
      message: "Recursively sort the left half.",
    });

    const sortedLeft = mergeSort(leftHalf, depth + 1);

    pushStep({
      activeLine: 9,
      phase: "recurse-right",
      current: nodes,
      left: sortedLeft,
      right: rightHalf,
      depth,
      message: "Recursively sort the right half.",
    });

    const sortedRight = mergeSort(rightHalf, depth + 1);

    const merged = [];
    let l = 0;
    let r = 0;

    pushStep({
      activeLine: 11,
      phase: "merge-init",
      current: nodes,
      left: sortedLeft,
      right: sortedRight,
      merged,
      leftIndex: 0,
      rightIndex: 0,
      curIndex: -1,
      depth,
      message: `Create dummy and begin merging [${values(sortedLeft).join(
        " → ",
      )}] with [${values(sortedRight).join(" → ")}].`,
    });

    while (l < sortedLeft.length && r < sortedRight.length) {
      pushStep({
        activeLine: 12,
        phase: "compare",
        current: nodes,
        left: sortedLeft.slice(l),
        right: sortedRight.slice(r),
        merged,
        leftIndex: 0,
        rightIndex: 0,
        curIndex: merged.length - 1,
        depth,
        message: `Compare left=${sortedLeft[l].val} and right=${sortedRight[r].val}.`,
      });

      if (sortedLeft[l].val <= sortedRight[r].val) {
        const picked = sortedLeft[l];

        pushStep({
          activeLine: 13,
          phase: "choose-left",
          current: nodes,
          left: sortedLeft.slice(l),
          right: sortedRight.slice(r),
          merged,
          leftIndex: 0,
          rightIndex: 0,
          curIndex: merged.length - 1,
          depth,
          message: `${picked.val} <= ${sortedRight[r].val}, so take the left node.`,
        });

        merged.push({ ...picked });
        l += 1;

        pushStep({
          activeLine: 14,
          phase: "append-left",
          current: nodes,
          left: sortedLeft.slice(l),
          right: sortedRight.slice(r),
          merged,
          leftIndex: l < sortedLeft.length ? 0 : null,
          rightIndex: r < sortedRight.length ? 0 : null,
          curIndex: merged.length - 1,
          depth,
          message: `Append ${picked.val} to the merged list.`,
        });
      } else {
        const picked = sortedRight[r];

        pushStep({
          activeLine: 15,
          phase: "choose-right",
          current: nodes,
          left: sortedLeft.slice(l),
          right: sortedRight.slice(r),
          merged,
          leftIndex: 0,
          rightIndex: 0,
          curIndex: merged.length - 1,
          depth,
          message: `${sortedLeft[l].val} > ${picked.val}, so take the right node.`,
        });

        merged.push({ ...picked });
        r += 1;

        pushStep({
          activeLine: 16,
          phase: "append-right",
          current: nodes,
          left: sortedLeft.slice(l),
          right: sortedRight.slice(r),
          merged,
          leftIndex: l < sortedLeft.length ? 0 : null,
          rightIndex: r < sortedRight.length ? 0 : null,
          curIndex: merged.length - 1,
          depth,
          message: `Append ${picked.val} to the merged list.`,
        });
      }

      pushStep({
        activeLine: 17,
        phase: "advance-cur",
        current: nodes,
        left: sortedLeft.slice(l),
        right: sortedRight.slice(r),
        merged,
        leftIndex: l < sortedLeft.length ? 0 : null,
        rightIndex: r < sortedRight.length ? 0 : null,
        curIndex: merged.length - 1,
        depth,
        message: "Move cur to the newly appended node.",
      });
    }

    const remainingLeft = sortedLeft.slice(l);
    const remainingRight = sortedRight.slice(r);

    merged.push(
      ...remainingLeft.map((node) => ({ ...node })),
      ...remainingRight.map((node) => ({ ...node })),
    );

    pushStep({
      activeLine: 18,
      phase: "append-rest",
      current: nodes,
      left: [],
      right: [],
      merged,
      curIndex: merged.length - 1,
      depth,
      message:
        remainingLeft.length > 0
          ? `Attach the remaining left nodes: ${values(remainingLeft).join(
              " → ",
            )}.`
          : remainingRight.length > 0
            ? `Attach the remaining right nodes: ${values(remainingRight).join(
                " → ",
              )}.`
            : "Both halves are exhausted.",
    });

    pushStep({
      activeLine: 19,
      phase: "return-merged",
      current: merged,
      merged,
      curIndex: merged.length - 1,
      depth,
      message: `Return merged list [${values(merged).join(" → ")}].`,
    });

    return cloneNodes(merged);
  }

  const initialNodes = makeNodes(initial, "root");

  pushStep({
    activeLine: 1,
    phase: "start",
    current: initialNodes,
    message: `Sort linked list [${initial.join(" → ")}].`,
  });

  const result = mergeSort(initialNodes);

  pushStep({
    activeLine: 19,
    phase: "done",
    current: result,
    merged: result,
    curIndex: result.length - 1,
    done: true,
    message: `Sorted list: [${values(result).join(" → ")}].`,
  });

  return steps;
}

function GraphRow({ title, nodes = [], tone = "main", pointerIndex = null, pointerLabel = "", emptyText = "empty" }) {
  const active = nodes[pointerIndex];
  return <div className="sl-graph-section">
    {title && <div className="sl-graph-title">{title}</div>}
    <LinkedListGraph nodes={nodes} tone={tone} label={title || "Linked list"} emptyText={emptyText}
      highlightedIds={active ? [active.id] : []}
      pointers={pointerLabel ? [{ label: pointerLabel, nodeId: active?.id ?? null }] : []} />
  </div>;
}

function SortListVisualization({ step }) {
  if (!step) {
    return <div className="sl-ready">Press Play or Next to begin.</div>;
  }

  const phaseLabel = {
    start: "START",
    base: "BASE CASE",
    "find-middle": "FIND MIDDLE",
    split: "SPLIT",
    "recurse-left": "RECURSE LEFT",
    "recurse-right": "RECURSE RIGHT",
    "merge-init": "MERGE",
    compare: "COMPARE",
    "choose-left": "TAKE LEFT",
    "append-left": "APPEND LEFT",
    "choose-right": "TAKE RIGHT",
    "append-right": "APPEND RIGHT",
    "advance-cur": "ADVANCE CUR",
    "append-rest": "APPEND REST",
    "return-merged": "RETURN MERGED",
    done: "DONE",
  }[step.phase];

  const showSplit = step.left?.length > 0 || step.right?.length > 0;

  const showMerged = step.merged?.length > 0;

  return (
    <div className="sl-visualization">
      <div className="sl-topbar">
        <div>
          <div className="sl-phase-label">{phaseLabel || step.phase}</div>

          <div className="sl-phase-description">Depth: {step.depth ?? 0}</div>
        </div>

        <div className="sl-line-pill">Line {step.activeLine}</div>
      </div>

      <div className="sl-graph-card">
        <GraphRow title="Current Sublist" nodes={step.current} tone="main" />
      </div>

      {showSplit && (
        <div className="sl-halves-grid">
          <div className="sl-graph-card">
            <GraphRow
              title="Left"
              nodes={step.left}
              tone="left"
              pointerIndex={step.leftIndex}
              pointerLabel={step.leftIndex !== null ? "left" : ""}
            />
          </div>

          <div className="sl-graph-card">
            <GraphRow
              title="Right"
              nodes={step.right}
              tone="right"
              pointerIndex={step.rightIndex}
              pointerLabel={step.rightIndex !== null ? "right" : ""}
            />
          </div>
        </div>
      )}

      {showMerged && (
        <div className="sl-graph-card merged">
          <GraphRow
            title="Merged List"
            nodes={step.merged}
            tone="merged"
            pointerIndex={step.curIndex}
            pointerLabel={step.curIndex !== null ? "cur" : ""}
          />
        </div>
      )}

      <div className="sl-telemetry-grid">
        <div className="sl-telemetry-card">
          <span className="sl-telemetry-label">Left pointer</span>

          <strong>
            {step.leftIndex !== null && step.left?.[step.leftIndex]
              ? step.left[step.leftIndex].val
              : "—"}
          </strong>
        </div>

        <div className="sl-telemetry-card">
          <span className="sl-telemetry-label">Right pointer</span>

          <strong>
            {step.rightIndex !== null && step.right?.[step.rightIndex]
              ? step.right[step.rightIndex].val
              : "—"}
          </strong>
        </div>

        <div className="sl-telemetry-card">
          <span className="sl-telemetry-label">Merged size</span>

          <strong>{step.merged?.length ?? 0}</strong>
        </div>
      </div>
    </div>
  );
}

export default function SortListVisualizer() {
  const defaultArray = EXAMPLES?.[0]?.arr ?? [4, 2, 1, 3];

  const [arrInput, setArrInput] = useState(JSON.stringify(defaultArray));

  const [activeLabel, setActiveLabel] = useState(EXAMPLES?.[0]?.label ?? "");

  const { arr, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(arrInput);

      if (!Array.isArray(parsed)) {
        throw new Error("arr must be an array.");
      }

      const numeric = parsed.map(Number);

      if (numeric.some((value) => !Number.isFinite(value))) {
        throw new Error("arr must contain only numbers.");
      }

      return {
        arr: numeric,
        inputError: "",
      };
    } catch (error) {
      return {
        arr: defaultArray,
        inputError: error.message || "Enter an array like [4, 2, 1, 3].",
      };
    }
  }, [arrInput, defaultArray]);

  const steps = useMemo(() => generateSteps(arr), [arr]);

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

  const applyExample = useCallback(
    (example) => {
      setActiveLabel(example.label);

      setArrInput(JSON.stringify(example.arr ?? []));

      handleReset();
    },
    [handleReset],
  );

  const codePanel = (
    <div
      style={{
        position: "relative",
        height: "100%",
      }}
    >
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
      />

      {showPatternOverlay && (
        <CodePatternAnnotations
          linePatterns={LINE_PATTERN_MAP}
          currentPhase={step?.phase}
          activeLine={step?.activeLine}
          activeLineDom={activeLineDom}
        />
      )}
    </div>
  );

  const vizPanel = (
    <>
      <ManualInputPanel
        fields={[
          {
            key: "arr",
            label: "head",
            type: "array",
          },
        ]}
        values={{
          arr: arrInput,
        }}
        onChange={(key, value) => {
          if (key === "arr") {
            setArrInput(value);
            setActiveLabel("");
          }

          handleReset();
        }}
        examples={EXAMPLES}
        activeLabel={activeLabel}
        applyExample={applyExample}
        inputError={inputError}
      />

      <SortListVisualization step={step} />
    </>
  );

  const statusPanel = (
    <div
      className={[
        "sl-status",
        step?.phase === "done"
          ? "success"
          : step?.phase?.includes("merge")
            ? "merge"
            : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="sl-status-main">
        <span className="sl-status-phase">
          {step?.phase ? step.phase.replaceAll("-", " ") : "ready"}
        </span>

        <span className="sl-status-message">
          {step?.message || "Press Play or Next to begin merge sort."}
        </span>
      </div>

      {step && <span className="sl-status-line">line {step.activeLine}</span>}
    </div>
  );

  const playbackPanel = (
    <>
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
        onSpeedChange={(event) => setSpeed(Number(event.target.value))}
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />

      {showPatternOverlay && (
        <PatternLegend usedPatterns={PATTERNS} currentPhase={step?.phase} />
      )}
    </>
  );

  const [panelDivs, setPanelDivs] = useState(null);

  const panelConfigs = useMemo(
    () => [
      {
        id: "viz",
        title: "🔀 Sort List",
        dockMode: "split-right",
        ratio: 0.6,
      },
      {
        id: "code",
        title: "Code",
        dockMode: "split-right",
        ratio: 0.4,
      },
      {
        id: "status",
        title: "Status",
        dockMode: "split-bottom",
        ratio: 0.08,
      },
    ],
    [],
  );

  const handlePanelReady = useCallback((divs) => {
    setPanelDivs(divs);
  }, []);

  return (
    <div className="sl-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />

      {panelDivs && (
        <>
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}

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
