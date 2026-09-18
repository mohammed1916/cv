import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";

import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";

import { getExamplesOr } from "../../config/examplesRegistry";

import "./InsertionSortListVisualizer.css";

// ─── Pattern annotations ───────────────────────────────────────────────────

const LINE_PATTERN_MAP = {};
const PATTERNS = [];

const EXAMPLES = getExamplesOr("insertion-sort-list", [
  {
    label: "Example 1",
    head: [4, 2, 1, 3],
  },
  {
    label: "Example 2",
    head: [-1, 5, 3, 4, 0],
  },
]);

const SOLUTION_CODE = [
  { line: 1, text: "def insertionSortList(head):" },
  {
    line: 2,
    text: "    if not head or not head.next: return head",
  },
  {
    line: 3,
    text: "    dummy = ListNode(0)",
  },
  {
    line: 4,
    text: "    dummy.next = head",
  },
  {
    line: 5,
    text: "    cur = head.next",
  },
  {
    line: 6,
    text: "    prev = head",
  },
  {
    line: 7,
    text: "    while cur:",
  },
  {
    line: 8,
    text: "        if cur.val >= prev.val:",
  },
  {
    line: 9,
    text: "            prev = cur",
  },
  {
    line: 10,
    text: "        else:",
  },
  {
    line: 11,
    text: "            pos = dummy",
  },
  {
    line: 12,
    text: "            while pos.next.val < cur.val:",
  },
  {
    line: 13,
    text: "                pos = pos.next",
  },
  {
    line: 14,
    text: "            prev.next = cur.next",
  },
  {
    line: 15,
    text: "            cur.next = pos.next",
  },
  {
    line: 16,
    text: "            pos.next = cur",
  },
  {
    line: 17,
    text: "        cur = prev.next",
  },
  {
    line: 18,
    text: "    return dummy.next",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function parseHeadInput(value) {
  const text = String(value ?? "").trim();

  if (!text) {
    return [];
  }

  const parsed = JSON.parse(text);

  if (!Array.isArray(parsed)) {
    throw new Error("head must be an array.");
  }

  const values = parsed.map((item) => Number(item));

  if (values.some((item) => !Number.isFinite(item))) {
    throw new Error("head must contain only numbers.");
  }

  return values;
}

function createNodes(values) {
  return values.map((value, index) => ({
    id: index,
    val: value,
  }));
}

function cloneNodes(nodes) {
  return nodes.map((node) => ({ ...node }));
}

function valuesFromNodes(nodes) {
  return nodes.map((node) => node.val);
}

// ─── Step generation ───────────────────────────────────────────────────────

function generateSteps(values) {
  const steps = [];

  if (!Array.isArray(values) || values.length === 0) {
    steps.push({
      activeLine: 2,
      nodes: [],
      prevId: null,
      curId: null,
      posId: null,
      dummyVisible: false,
      sortedThrough: -1,
      message: "The list is empty. Return head.",
      relatedLines: [2],
      done: true,
    });

    return steps;
  }

  let nodes = createNodes(values);

  const pushStep = ({
    activeLine,
    message,
    prevId = null,
    curId = null,
    posId = null,
    dummyVisible = true,
    sortedThrough = 0,
    movingId = null,
    insertionTargetId = null,
    phase = "",
    done = false,
    relatedLines,
  }) => {
    steps.push({
      activeLine,
      nodes: cloneNodes(nodes),
      values: valuesFromNodes(nodes),
      prevId,
      curId,
      posId,
      dummyVisible,
      sortedThrough,
      movingId,
      insertionTargetId,
      phase,
      message,
      done,
      relatedLines: relatedLines ?? (activeLine ? [activeLine] : []),
    });
  };

  pushStep({
    activeLine: 1,
    dummyVisible: false,
    sortedThrough: -1,
    message: `Start insertion sort on ${values.join(" → ")}.`,
    relatedLines: [1],
  });

  if (nodes.length === 1) {
    pushStep({
      activeLine: 2,
      dummyVisible: false,
      sortedThrough: 0,
      prevId: nodes[0].id,
      message: `The list contains one node (${nodes[0].val}), so it is already sorted.`,
      done: true,
      relatedLines: [2],
    });

    return steps;
  }

  const dummyId = "dummy";

  let prevId = nodes[0].id;
  let curId = nodes[1].id;

  pushStep({
    activeLine: 3,
    dummyVisible: true,
    prevId,
    curId,
    sortedThrough: 0,
    phase: "create-dummy",
    message: "Create the dummy node before the head.",
    relatedLines: [3, 4],
  });

  pushStep({
    activeLine: 5,
    dummyVisible: true,
    prevId,
    curId,
    sortedThrough: 0,
    phase: "initialize-pointers",
    message: `Set prev = ${nodes[0].val} and cur = ${nodes[1].val}.`,
    relatedLines: [5, 6],
  });

  while (curId !== null) {
    let curIndex = nodes.findIndex((node) => node.id === curId);
    let prevIndex = nodes.findIndex((node) => node.id === prevId);

    if (curIndex === -1 || prevIndex === -1) {
      break;
    }

    const curNode = nodes[curIndex];
    const prevNode = nodes[prevIndex];

    pushStep({
      activeLine: 7,
      prevId,
      curId,
      sortedThrough: prevIndex,
      phase: "loop",
      message: `Process cur = ${curNode.val}.`,
      relatedLines: [7],
    });

    if (curNode.val >= prevNode.val) {
      pushStep({
        activeLine: 8,
        prevId,
        curId,
        sortedThrough: prevIndex,
        phase: "compare-in-order",
        message: `${curNode.val} >= ${prevNode.val}, so cur is already in sorted order.`,
        relatedLines: [8],
      });

      prevId = curId;

      pushStep({
        activeLine: 9,
        prevId,
        curId,
        sortedThrough: curIndex,
        phase: "advance-prev",
        message: `Move prev forward to ${curNode.val}.`,
        relatedLines: [9],
      });

      const newPrevIndex = nodes.findIndex((node) => node.id === prevId);

      curId =
        newPrevIndex + 1 < nodes.length ? nodes[newPrevIndex + 1].id : null;

      pushStep({
        activeLine: 17,
        prevId,
        curId,
        sortedThrough: newPrevIndex,
        phase: "advance-cur",
        message:
          curId !== null
            ? `Set cur = prev.next (${nodes[newPrevIndex + 1].val}).`
            : "Set cur = prev.next = null.",
        relatedLines: [17],
      });

      continue;
    }

    pushStep({
      activeLine: 10,
      prevId,
      curId,
      sortedThrough: prevIndex,
      phase: "needs-insert",
      message: `${curNode.val} < ${prevNode.val}, so cur must be moved earlier in the list.`,
      relatedLines: [10],
    });

    let posIndex = -1;
    let posId = dummyId;

    pushStep({
      activeLine: 11,
      prevId,
      curId,
      posId,
      sortedThrough: prevIndex,
      phase: "pos-dummy",
      message: "Set pos = dummy and search for the insertion point.",
      relatedLines: [11],
    });

    while (
      posIndex + 1 < nodes.length &&
      nodes[posIndex + 1].id !== curId &&
      nodes[posIndex + 1].val < curNode.val
    ) {
      const nextNode = nodes[posIndex + 1];

      pushStep({
        activeLine: 12,
        prevId,
        curId,
        posId,
        sortedThrough: prevIndex,
        insertionTargetId: nextNode.id,
        phase: "scan-position",
        message: `${nextNode.val} < ${curNode.val}, so pos moves forward.`,
        relatedLines: [12],
      });

      posIndex += 1;
      posId = nodes[posIndex].id;

      pushStep({
        activeLine: 13,
        prevId,
        curId,
        posId,
        sortedThrough: prevIndex,
        phase: "advance-pos",
        message: `Move pos to node ${nodes[posIndex].val}.`,
        relatedLines: [13],
      });
    }

    const insertionIndex = posIndex + 1;

    const insertionTargetId =
      insertionIndex < nodes.length ? nodes[insertionIndex].id : null;

    pushStep({
      activeLine: 12,
      prevId,
      curId,
      posId,
      sortedThrough: prevIndex,
      movingId: curId,
      insertionTargetId,
      phase: "position-found",
      message:
        insertionTargetId !== null
          ? `Insertion point found before node ${nodes[insertionIndex].val}.`
          : "Insertion point found at the end of the sorted region.",
      relatedLines: [12],
    });

    /*
     * prev.next = cur.next
     *
     * Visually remove cur from its current position.
     */
    const movingNode = nodes[curIndex];

    nodes.splice(curIndex, 1);

    pushStep({
      activeLine: 14,
      prevId,
      curId,
      posId,
      sortedThrough: Math.max(0, prevIndex - 1),
      movingId: curId,
      insertionTargetId,
      phase: "detach",
      message: `Detach ${movingNode.val}: prev.next now skips over cur.`,
      relatedLines: [14],
    });

    /*
     * cur.next = pos.next
     *
     * The node is now positioned to point at the insertion target.
     */
    let actualInsertIndex;

    if (posId === dummyId) {
      actualInsertIndex = 0;
    } else {
      const actualPosIndex = nodes.findIndex((node) => node.id === posId);

      actualInsertIndex = actualPosIndex + 1;
    }

    pushStep({
      activeLine: 15,
      prevId,
      curId,
      posId,
      sortedThrough: Math.max(0, prevIndex - 1),
      movingId: curId,
      insertionTargetId,
      phase: "redirect-cur",
      message:
        insertionTargetId !== null
          ? `Point ${movingNode.val}.next to the node at the insertion position.`
          : `Set ${movingNode.val}.next to the next node after pos.`,
      relatedLines: [15],
    });

    /*
     * pos.next = cur
     *
     * Insert the node into its new location.
     */
    nodes.splice(actualInsertIndex, 0, movingNode);

    const movedIndex = nodes.findIndex((node) => node.id === movingNode.id);

    const updatedPrevIndex = nodes.findIndex((node) => node.id === prevId);

    pushStep({
      activeLine: 16,
      prevId,
      curId,
      posId,
      sortedThrough: updatedPrevIndex,
      movingId: curId,
      phase: "insert",
      message: `Insert ${movingNode.val} at its correct sorted position.`,
      relatedLines: [16],
    });

    /*
     * Important:
     *
     * prev does NOT move when cur was repositioned.
     *
     * cur becomes prev.next.
     */
    const finalPrevIndex = nodes.findIndex((node) => node.id === prevId);

    curId =
      finalPrevIndex + 1 < nodes.length ? nodes[finalPrevIndex + 1].id : null;

    pushStep({
      activeLine: 17,
      prevId,
      curId,
      sortedThrough: finalPrevIndex,
      phase: "advance-cur",
      message:
        curId !== null
          ? `Keep prev at ${
              nodes[finalPrevIndex].val
            } and set cur = prev.next (${nodes[finalPrevIndex + 1].val}).`
          : "Set cur = prev.next = null.",
      relatedLines: [17],
    });
  }

  pushStep({
    activeLine: 18,
    dummyVisible: true,
    prevId,
    curId: null,
    sortedThrough: nodes.length - 1,
    phase: "done",
    done: true,
    message: `Sorted list: ${nodes.map((node) => node.val).join(" → ")}.`,
    relatedLines: [18],
  });

  return steps;
}

// ─── Graph ─────────────────────────────────────────────────────────────────

function PointerBadge({ label, x, y, className = "" }) {
  return (
    <g className={className}>
      <rect
        x={x - 22}
        y={y - 16}
        width={44}
        height={22}
        rx={5}
        className="isl-pointer-badge-bg"
      />

      <text
        x={x}
        y={y - 2}
        textAnchor="middle"
        className="isl-pointer-badge-text"
      >
        {label}
      </text>

      <line x1={x} y1={y + 6} x2={x} y2={y + 22} className="isl-pointer-line" />

      <polygon
        points={`${x - 4},${y + 18} ${x + 4},${y + 18} ${x},${y + 25}`}
        className="isl-pointer-arrow"
      />
    </g>
  );
}

function LinkedListGraph({ step }) {
  const nodes = step?.nodes ?? [];

  const nodeWidth = 74;
  const nodeHeight = 52;
  const gap = 54;
  const startX = step?.dummyVisible ? 120 : 50;
  const nodeY = 105;

  const graphWidth = Math.max(
    560,
    startX + nodes.length * (nodeWidth + gap) + 100,
  );

  const graphHeight = 230;

  const getNodeX = (index) => startX + index * (nodeWidth + gap);

  const getNodeCenter = (index) => getNodeX(index) + nodeWidth / 2;

  const nodeIndexById = (id) => nodes.findIndex((node) => node.id === id);

  const prevIndex = nodeIndexById(step?.prevId);
  const curIndex = nodeIndexById(step?.curId);

  const posIndex = step?.posId === "dummy" ? -1 : nodeIndexById(step?.posId);

  return (
    <div className="isl-graph-scroll">
      <svg
        className="isl-graph"
        width={graphWidth}
        height={graphHeight}
        viewBox={`0 0 ${graphWidth} ${graphHeight}`}
      >
        <defs>
          <marker
            id="isl-link-arrow"
            markerWidth="9"
            markerHeight="9"
            refX="8"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L0,8 L8,4 z" className="isl-link-arrow-fill" />
          </marker>

          <filter id="isl-node-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dummy node */}
        {step?.dummyVisible && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <rect
              x={24}
              y={nodeY}
              width={64}
              height={nodeHeight}
              rx={8}
              className="isl-dummy-node"
            />

            <text
              x={56}
              y={nodeY + 22}
              textAnchor="middle"
              className="isl-dummy-title"
            >
              dummy
            </text>

            <text
              x={56}
              y={nodeY + 39}
              textAnchor="middle"
              className="isl-dummy-value"
            >
              0
            </text>

            {nodes.length > 0 && (
              <line
                x1={88}
                y1={nodeY + nodeHeight / 2}
                x2={getNodeX(0) - 8}
                y2={nodeY + nodeHeight / 2}
                className="isl-link-line"
                markerEnd="url(#isl-link-arrow)"
              />
            )}

            {step.posId === "dummy" && (
              <PointerBadge
                label="pos"
                x={56}
                y={46}
                className="isl-pos-pointer"
              />
            )}
          </motion.g>
        )}

        <AnimatePresence>
          {nodes.map((node, index) => {
            const x = getNodeX(index);

            const isCur = node.id === step?.curId;
            const isPrev = node.id === step?.prevId;
            const isPos = node.id === step?.posId;
            const isMoving = node.id === step?.movingId;

            const isSorted =
              step?.sortedThrough !== undefined && index <= step.sortedThrough;

            return (
              <motion.g
                key={node.id}
                layout
                initial={{
                  opacity: 0,
                  y: -20,
                }}
                animate={{
                  opacity: 1,
                  y: isMoving ? -8 : 0,
                }}
                exit={{
                  opacity: 0,
                  y: 20,
                }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 24,
                }}
              >
                {index < nodes.length - 1 && (
                  <line
                    x1={x + nodeWidth}
                    y1={nodeY + nodeHeight / 2}
                    x2={getNodeX(index + 1) - 8}
                    y2={nodeY + nodeHeight / 2}
                    className="isl-link-line"
                    markerEnd="url(#isl-link-arrow)"
                  />
                )}

                <rect
                  x={x}
                  y={nodeY}
                  width={nodeWidth}
                  height={nodeHeight}
                  rx={8}
                  className={[
                    "isl-graph-node",
                    isSorted ? "isl-graph-node-sorted" : "",
                    isCur ? "isl-graph-node-cur" : "",
                    isMoving ? "isl-graph-node-moving" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  filter={isCur ? "url(#isl-node-glow)" : undefined}
                />

                <line
                  x1={x + 49}
                  y1={nodeY}
                  x2={x + 49}
                  y2={nodeY + nodeHeight}
                  className="isl-node-divider"
                />

                <text
                  x={x + 24}
                  y={nodeY + 32}
                  textAnchor="middle"
                  className="isl-node-value"
                >
                  {node.val}
                </text>

                <text
                  x={x + 61}
                  y={nodeY + 31}
                  textAnchor="middle"
                  className="isl-node-next"
                >
                  next
                </text>

                {isPrev && (
                  <PointerBadge
                    label="prev"
                    x={getNodeCenter(index)}
                    y={48}
                    className="isl-prev-pointer"
                  />
                )}

                {isCur && (
                  <PointerBadge
                    label="cur"
                    x={getNodeCenter(index)}
                    y={188}
                    className="isl-cur-pointer"
                  />
                )}

                {isPos && (
                  <PointerBadge
                    label="pos"
                    x={getNodeCenter(index)}
                    y={18}
                    className="isl-pos-pointer"
                  />
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* null */}
        {nodes.length > 0 && (
          <>
            <line
              x1={getNodeX(nodes.length - 1) + nodeWidth}
              y1={nodeY + nodeHeight / 2}
              x2={getNodeX(nodes.length - 1) + nodeWidth + 30}
              y2={nodeY + nodeHeight / 2}
              className="isl-link-line"
            />

            <text
              x={getNodeX(nodes.length - 1) + nodeWidth + 52}
              y={nodeY + 31}
              className="isl-null-label"
            >
              null
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

// ─── Visualization panel ───────────────────────────────────────────────────

function VisualizationPanel({ step }) {
  if (!step) {
    return <div className="isl-ready">Press Next or Play to begin.</div>;
  }

  const sortedValues =
    step.sortedThrough >= 0
      ? step.nodes.slice(0, step.sortedThrough + 1).map((node) => node.val)
      : [];

  const remainingValues =
    step.sortedThrough + 1 < step.nodes.length
      ? step.nodes.slice(step.sortedThrough + 1).map((node) => node.val)
      : [];

  return (
    <div className="isl-visualization">
      <div className="isl-info-banner">
        <div className="isl-info-title">Linked-list insertion sort</div>

        <div className="isl-info-text">
          The sorted region grows from left to right. When cur is smaller than
          prev, the node is detached and reinserted using pos.
        </div>
      </div>

      <div className="isl-graph-card">
        <div className="isl-card-header">
          <span className="isl-card-title">Linked List Graph</span>

          <div className="isl-legend">
            <span className="isl-legend-item">
              <span className="isl-dot sorted" />
              sorted
            </span>

            <span className="isl-legend-item">
              <span className="isl-dot current" />
              cur
            </span>
          </div>
        </div>

        <LinkedListGraph step={step} />
      </div>

      <div className="isl-state-grid">
        <div className="isl-state-card">
          <span className="isl-state-label">Sorted prefix</span>

          <div className="isl-value-row">
            {sortedValues.length > 0 ? (
              sortedValues.map((value, index) => (
                <span
                  key={`sorted-${index}-${value}`}
                  className="isl-value-chip sorted"
                >
                  {value}
                </span>
              ))
            ) : (
              <span className="isl-state-empty">none</span>
            )}
          </div>
        </div>

        <div className="isl-state-card">
          <span className="isl-state-label">Remaining</span>

          <div className="isl-value-row">
            {remainingValues.length > 0 ? (
              remainingValues.map((value, index) => (
                <span
                  key={`remaining-${index}-${value}`}
                  className="isl-value-chip remaining"
                >
                  {value}
                </span>
              ))
            ) : (
              <span className="isl-state-empty">none</span>
            )}
          </div>
        </div>
      </div>

      <motion.div
        key={`${step.activeLine}-${step.phase}-${step.message}`}
        className="isl-step-message"
        initial={{
          opacity: 0,
          y: 5,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <span className="isl-step-line">line {step.activeLine}</span>

        <span>{step.message}</span>
      </motion.div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function InsertionSortListVisualizer() {
  const [headInput, setHeadInput] = useState(JSON.stringify([4, 2, 1, 3]));

  const { head, inputError } = useMemo(() => {
    try {
      return {
        head: parseHeadInput(headInput),
        inputError: "",
      };
    } catch (error) {
      return {
        head: [],
        inputError: error.message || "Enter an array such as [4, 2, 1, 3].",
      };
    }
  }, [headInput]);

  const steps = useMemo(() => generateSteps(head), [head]);

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

  const applyExample = useCallback(
    (example) => {
      setHeadInput(JSON.stringify(example.head ?? []));

      handleReset();
    },
    [handleReset],
  );

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  });

  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();

  // ─── Code panel ────────────────────────────────────────────────────────

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
        <CodePatternAnnotations step={step} activeLineDom={activeLineDom} />
      )}
    </div>
  );

  // ─── Visualization panel ───────────────────────────────────────────────

  const vizPanel = (
    <>
      <ManualInputPanel
        fields={[
          {
            key: "head",
            label: "head",
            type: "array",
          },
        ]}
        values={{
          head: headInput,
        }}
        onChange={(key, value) => {
          if (key === "head") {
            setHeadInput(value);
          }

          handleReset();
        }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

      <div className="isl-panel">
        <VisualizationPanel step={step} />
      </div>
    </>
  );

  // ─── Status panel ──────────────────────────────────────────────────────

  const statusPanel = (
    <div className="isl-status">
      <div className="isl-status-message">
        {step?.message || "Ready to sort the linked list."}
      </div>
    </div>
  );

  // ─── Playback panel ────────────────────────────────────────────────────

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
        <PatternLegend patterns={PATTERNS} linePatternMap={LINE_PATTERN_MAP} />
      )}
    </>
  );

  // ─── Dock configuration ────────────────────────────────────────────────

  const [panelDivs, setPanelDivs] = useState(null);

  const panelConfigs = useMemo(
    () => [
      {
        id: "code",
        title: "Code",
        dockMode: "split-right",
      },
      {
        id: "viz",
        title: "🔗 Insertion Sort List",
        dockMode: "split-right",
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
    <div className="isl-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />

      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}

          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}

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
