import { getExamples as getInitialExamples } from "../../config/examplesRegistry";

const AUTHORED_INITIAL = getInitialExamples("kill-process")[0];

import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

import LuminoDockPanel from "../../components/LuminoDockPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";

import ManualInputPanel from "../../components/shared/ManualInputPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";

import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { useParsedInput } from "../../hooks/useParsedInput";
import { useApplyExample } from "../../hooks/useApplyExample";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";

import { getExamplesOr } from "../../config/examplesRegistry";

import "./KillProcessVisualizer.css";

/* =========================================================
   Pattern annotations
   ========================================================= */

const LINE_PATTERN_MAP = {
  2: "init",
  3: "init",
  4: "init",
  5: "init",
  6: "traverse",
  7: "kill",
  8: "cascade",
  9: "cascade",
  10: "traverse",
  11: "done",
};

const PATTERNS = ["init", "traverse", "kill", "cascade", "done"];

/* =========================================================
   Solution shown in Code Trace

   Important:
   children maps PROCESS ID -> PROCESS IDs.

   It does not map array index -> array index.
   ========================================================= */

const SOLUTION_CODE = [
  { line: 1, text: "def killProcess(pid, ppid, kill):" },
  { line: 2, text: "    children = defaultdict(list)" },
  { line: 3, text: "    for child, parent in zip(pid, ppid):" },
  { line: 4, text: "        children[parent].append(child)" },
  { line: 5, text: "    killed = []" },
  { line: 6, text: "    def dfs(process):" },
  { line: 7, text: "        killed.append(process)" },
  { line: 8, text: "        for child in children[process]:" },
  { line: 9, text: "            dfs(child)" },
  { line: 10, text: "    dfs(kill)" },
  { line: 11, text: "    return killed" },
];

const EXAMPLES = getExamplesOr("kill-process", []);

/* =========================================================
   Helpers
   ========================================================= */

function normalizeNumberArray(values) {
  return values.map((value) => Number(value));
}

function buildProcessTree(pid, ppid) {
  const children = new Map();
  const parentByPid = new Map();

  for (const processId of pid) {
    children.set(processId, []);
  }

  for (let i = 0; i < pid.length; i += 1) {
    const child = pid[i];
    const parent = ppid[i];

    parentByPid.set(child, parent);

    if (!children.has(parent)) {
      children.set(parent, []);
    }

    children.get(parent).push(child);
  }

  for (const list of children.values()) {
    list.sort((a, b) => a - b);
  }

  const roots = pid.filter((processId) => {
    const parent = parentByPid.get(processId);

    return parent === 0 || parent === -1 || !pid.includes(parent);
  });

  return {
    children,
    parentByPid,
    roots,
  };
}

function cloneSet(set) {
  return new Set(set);
}

function snapshotChildren(children) {
  return Array.from(children.entries()).map(([parent, childList]) => ({
    parent,
    children: [...childList],
  }));
}

function formatProcessList(values) {
  if (!values?.length) return "—";

  return values.join(", ");
}

/* =========================================================
   Generate animation steps
   ========================================================= */

function generateSteps(pid, ppid, killPid) {
  const steps = [];

  if (!pid?.length || !ppid?.length) {
    return [
      {
        phase: "done",
        activeLine: 11,
        relatedLines: [11],
        message: "There are no processes to traverse.",
        killed: new Set(),
        killedOrder: [],
        callStack: [],
        done: true,
      },
    ];
  }

  if (pid.length !== ppid.length) {
    return [
      {
        phase: "done",
        activeLine: 11,
        relatedLines: [11],
        message: "pid and ppid must contain the same number of entries.",
        killed: new Set(),
        killedOrder: [],
        callStack: [],
        done: true,
      },
    ];
  }

  const { children, roots } = buildProcessTree(pid, ppid);

  if (!pid.includes(killPid)) {
    return [
      {
        phase: "done",
        activeLine: 11,
        relatedLines: [11],
        message: `Process ${killPid} does not exist.`,
        killed: new Set(),
        killedOrder: [],
        callStack: [],
        childrenSnapshot: snapshotChildren(children),
        roots,
        done: true,
      },
    ];
  }

  const killed = new Set();
  const killedOrder = [];
  const callStack = [];

  const push = ({
    phase,
    activeLine,
    relatedLines,
    message,
    currentProcess = null,
    parentProcess = null,
    nextChild = null,
    childrenToVisit = [],
    returningFrom = null,
    done = false,
  }) => {
    steps.push({
      phase,
      activeLine,
      relatedLines:
        relatedLines ??
        (activeLine !== undefined && activeLine !== null ? [activeLine] : []),

      message,

      currentProcess,
      parentProcess,
      nextChild,

      childrenToVisit: [...childrenToVisit],

      killed: cloneSet(killed),
      killedOrder: [...killedOrder],
      callStack: callStack.map((frame) => ({
        ...frame,
        children: [...frame.children],
      })),

      returningFrom,

      childrenSnapshot: snapshotChildren(children),
      roots: [...roots],

      done,
    });
  };

  push({
    phase: "init",
    activeLine: 2,
    relatedLines: [2],
    message:
      "Create children, an adjacency list that maps each parent process ID to its direct child process IDs.",
  });

  for (let i = 0; i < pid.length; i += 1) {
    const processId = pid[i];
    const parentId = ppid[i];

    push({
      phase: "init",
      activeLine: 3,
      relatedLines: [3, 4],
      currentProcess: processId,
      parentProcess: parentId,
      message:
        `Read process ${processId} with parent ${parentId}. ` +
        `Add ${processId} to children[${parentId}].`,
    });
  }

  push({
    phase: "init",
    activeLine: 5,
    relatedLines: [5],
    message:
      "Create the result list. Every process reached by DFS from the requested process will be added here.",
  });

  function dfs(processId, parentProcess = null) {
    const childList = children.get(processId) ?? [];

    callStack.push({
      processId,
      parentProcess,
      children: [...childList],
      childIndex: 0,
      state: "entered",
    });

    push({
      phase: "traverse",
      activeLine: 6,
      relatedLines: [6],
      currentProcess: processId,
      parentProcess,
      childrenToVisit: childList,
      message:
        parentProcess === null
          ? `Start dfs(${processId}). This is the process explicitly requested for termination.`
          : `Enter dfs(${processId}) from parent process ${parentProcess}.`,
    });

    killed.add(processId);
    killedOrder.push(processId);

    callStack[callStack.length - 1] = {
      ...callStack[callStack.length - 1],
      state: "killed",
    };

    push({
      phase: "kill",
      activeLine: 7,
      relatedLines: [7],
      currentProcess: processId,
      parentProcess,
      childrenToVisit: childList,
      message:
        `Kill process ${processId}. ` +
        `The killed processes are now [${killedOrder.join(", ")}].`,
    });

    if (childList.length === 0) {
      push({
        phase: "cascade",
        activeLine: 8,
        relatedLines: [8],
        currentProcess: processId,
        parentProcess,
        childrenToVisit: [],
        message: `Process ${processId} has no children, so this DFS branch cannot cascade any further.`,
      });
    }

    for (let childIndex = 0; childIndex < childList.length; childIndex += 1) {
      const child = childList[childIndex];

      callStack[callStack.length - 1] = {
        ...callStack[callStack.length - 1],
        childIndex,
        state: "visiting-child",
      };

      push({
        phase: "cascade",
        activeLine: 8,
        relatedLines: [8, 9],
        currentProcess: processId,
        parentProcess,
        nextChild: child,
        childrenToVisit: childList.slice(childIndex),
        message:
          `Process ${processId} owns child ${child}. ` +
          `Because killing a process also kills all descendants, recurse into dfs(${child}).`,
      });

      push({
        phase: "traverse",
        activeLine: 9,
        relatedLines: [9],
        currentProcess: processId,
        parentProcess,
        nextChild: child,
        childrenToVisit: childList.slice(childIndex),
        message: `Call dfs(${child}) from dfs(${processId}).`,
      });

      dfs(child, processId);

      if (callStack.length > 0) {
        callStack[callStack.length - 1] = {
          ...callStack[callStack.length - 1],
          childIndex: childIndex + 1,
          state: "resumed",
        };
      }

      push({
        phase: "return",
        activeLine: 8,
        relatedLines: [8, 9],
        currentProcess: processId,
        parentProcess,
        returningFrom: child,
        childrenToVisit: childList.slice(childIndex + 1),
        message: `dfs(${child}) finished. Resume dfs(${processId}) and check whether another child remains.`,
      });
    }

    callStack[callStack.length - 1] = {
      ...callStack[callStack.length - 1],
      state: "returning",
    };

    push({
      phase: "return",
      activeLine: 6,
      relatedLines: [6, 8, 9],
      currentProcess: processId,
      parentProcess,
      childrenToVisit: [],
      returningFrom: processId,
      message: `All descendants of process ${processId} have been handled. Return from dfs(${processId}).`,
    });

    callStack.pop();
  }

  push({
    phase: "traverse",
    activeLine: 10,
    relatedLines: [10],
    currentProcess: killPid,
    message: `Begin the cascade from process ${killPid} by calling dfs(${killPid}).`,
  });

  dfs(killPid);

  push({
    phase: "done",
    activeLine: 11,
    relatedLines: [11],
    message: `DFS is complete. Return every killed process: [${killedOrder.join(", ")}].`,
    done: true,
  });

  return steps;
}

/* =========================================================
   Small presentation helpers
   ========================================================= */

function PhaseBadge({ phase }) {
  return (
    <span className={`kp-phase-badge ${phase || "ready"}`}>
      {(phase || "ready").replaceAll("-", " ")}
    </span>
  );
}

function ProcessLegend() {
  return (
    <div className="kp-legend">
      <div className="kp-legend-item">
        <span className="kp-legend-dot current" />
        <span>Current DFS process</span>
      </div>

      <div className="kp-legend-item">
        <span className="kp-legend-dot killed" />
        <span>Killed</span>
      </div>

      <div className="kp-legend-item">
        <span className="kp-legend-dot next" />
        <span>Next child</span>
      </div>
    </div>
  );
}

/* =========================================================
   Process tree
   ========================================================= */

function ProcessNode({ processId, step, children, visited = new Set() }) {
  if (visited.has(processId)) {
    return null;
  }

  const nextVisited = new Set(visited);
  nextVisited.add(processId);

  const childList = children.get(processId) ?? [];

  const isCurrent = step?.currentProcess === processId;
  const isKilled = step?.killed?.has(processId);
  const isNext = step?.nextChild === processId;

  return (
    <div className="kp-tree-branch">
      <motion.div
        layout
        className={[
          "kp-process-node",
          isKilled ? "killed" : "",
          isCurrent ? "current" : "",
          isNext ? "next" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        animate={
          isCurrent
            ? {
                scale: 1.08,
              }
            : {
                scale: 1,
              }
        }
        transition={{
          duration: 0.18,
        }}
      >
        <span className="kp-process-label">PID</span>
        <strong>{processId}</strong>

        {isCurrent && (
          <span className="kp-process-state">
            {step?.phase === "kill"
              ? "kill"
              : step?.phase === "cascade"
                ? "scan children"
                : "active"}
          </span>
        )}
      </motion.div>

      {childList.length > 0 && (
        <div className="kp-tree-children">
          {childList.map((child) => (
            <div className="kp-tree-child" key={child}>
              <span className="kp-tree-edge" />

              <ProcessNode
                processId={child}
                step={step}
                children={children}
                visited={nextVisited}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProcessTreeVisualization({ pid, ppid, step }) {
  const { children, roots } = useMemo(
    () => buildProcessTree(pid, ppid),
    [pid, ppid],
  );

  if (!pid.length) {
    return <div className="kp-empty-state">No processes are available.</div>;
  }

  const effectiveRoots = roots.length > 0 ? roots : [pid[0]];

  return (
    <div className="kp-tree-viewport">
      <div className="kp-tree">
        {effectiveRoots.map((root) => (
          <ProcessNode
            key={root}
            processId={root}
            step={step}
            children={children}
          />
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   Children adjacency map
   ========================================================= */

function ChildrenMap({ pid, ppid, step }) {
  const { children } = useMemo(() => buildProcessTree(pid, ppid), [pid, ppid]);

  const rows = useMemo(() => {
    const processIds = new Set(pid);

    return Array.from(children.entries())
      .filter(([parent]) => processIds.has(parent))
      .sort(([a], [b]) => a - b);
  }, [children, pid]);

  return (
    <div className="kp-map">
      <div className="kp-section-heading">
        <div>
          <strong>Children map</strong>
          <span>parent PID → direct child PIDs</span>
        </div>

        <code>children</code>
      </div>

      <div className="kp-map-list">
        {rows.map(([parent, childList]) => {
          const active = step?.currentProcess === parent;

          return (
            <div
              key={parent}
              className={`kp-map-row ${active ? "active" : ""}`}
            >
              <code>{parent}</code>

              <span className="kp-map-arrow">→</span>

              <div className="kp-map-values">
                {childList.length > 0 ? (
                  childList.map((child) => (
                    <span
                      key={child}
                      className={step?.nextChild === child ? "next" : ""}
                    >
                      {child}
                    </span>
                  ))
                ) : (
                  <em>none</em>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   Main visualization panel
   ========================================================= */

function ProcessTreePanel({ pid, ppid, killPid, step, inputError }) {
  return (
    <div className="kp-panel-body">
      <div className="kp-hero">
        <div>
          <span className="kp-eyebrow">Cascade starts at</span>

          <strong className="kp-kill-target">
            PID {Number.isFinite(killPid) ? killPid : "—"}
          </strong>
        </div>

        <div className="kp-hero-result">
          <span>Killed</span>

          <strong>{step?.killed?.size ?? 0}</strong>

          <span>/ {pid.length}</span>
        </div>
      </div>

      {inputError && <div className="kp-error-box">{inputError}</div>}

      <div className="kp-status-card">
        <PhaseBadge phase={step?.phase} />

        <span>
          {step?.message ??
            "Press Play or Step Forward to begin the DFS cascade."}
        </span>
      </div>

      <ProcessLegend />

      <section className="kp-section">
        <div className="kp-section-heading">
          <div>
            <strong>Process hierarchy</strong>
            <span>Parent → child relationships from ppid</span>
          </div>
        </div>

        <ProcessTreeVisualization pid={pid} ppid={ppid} step={step} />
      </section>

      <ChildrenMap pid={pid} ppid={ppid} step={step} />

      <section className="kp-section">
        <div className="kp-section-heading">
          <div>
            <strong>Killed processes</strong>
            <span>DFS discovery order</span>
          </div>

          <span className="kp-section-count">
            {step?.killedOrder?.length ?? 0}
          </span>
        </div>

        <div className="kp-killed-list">
          <AnimatePresence initial={false}>
            {(step?.killedOrder ?? []).map((processId, index) => (
              <motion.span
                layout
                key={processId}
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                }}
                className="kp-killed-chip"
              >
                <small>{index + 1}</small>
                PID {processId}
              </motion.span>
            ))}
          </AnimatePresence>

          {!step?.killedOrder?.length && (
            <span className="kp-muted">No process has been killed yet.</span>
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   Call stack
   ========================================================= */

function StackFrame({ frame, index, total, step }) {
  const isTop = index === total - 1;

  const remainingChildren = frame.children.slice(frame.childIndex ?? 0);

  return (
    <motion.div
      layout
      className={`kp-stack-frame ${isTop ? "top" : ""}`}
      initial={{
        opacity: 0,
        y: -8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -8,
      }}
    >
      <div className="kp-stack-frame-header">
        <div>
          <span className="kp-stack-depth">depth {index}</span>

          <strong>dfs({frame.processId})</strong>
        </div>

        {isTop && <span className="kp-stack-active">executing</span>}
      </div>

      <div className="kp-stack-details">
        <div>
          <span>process</span>
          <strong>{frame.processId}</strong>
        </div>

        <div>
          <span>parent</span>
          <strong>{frame.parentProcess ?? "root call"}</strong>
        </div>

        <div>
          <span>children</span>
          <strong>
            {frame.children.length ? `[${frame.children.join(", ")}]` : "[]"}
          </strong>
        </div>

        <div>
          <span>remaining</span>
          <strong>
            {remainingChildren.length
              ? `[${remainingChildren.join(", ")}]`
              : "[]"}
          </strong>
        </div>
      </div>

      <div className="kp-stack-state">
        {frame.state === "entered" && "The DFS call has just been entered."}

        {frame.state === "killed" &&
          `PID ${frame.processId} has been added to the killed result.`}

        {frame.state === "visiting-child" &&
          step?.nextChild !== null &&
          step?.nextChild !== undefined &&
          `Preparing recursive call dfs(${step.nextChild}).`}

        {frame.state === "resumed" &&
          "A child call returned. Continue scanning this process’s remaining children."}

        {frame.state === "returning" &&
          "All children are complete. This frame is about to return."}
      </div>
    </motion.div>
  );
}

function CallStackPanel({ step, killPid }) {
  const stack = step?.callStack ?? [];

  return (
    <div className="kp-panel-body kp-call-panel">
      <div className="kp-call-intro">
        <strong>What does the stack mean?</strong>

        <span>
          Every <code>dfs(process)</code> call stays here while its descendants
          are being processed. The newest call is the active frame.
        </span>
      </div>

      <section className="kp-section">
        <div className="kp-section-heading">
          <div>
            <strong>Active DFS calls</strong>
            <span>Recursive path from PID {killPid}</span>
          </div>

          <span className="kp-section-count">{stack.length}</span>
        </div>

        <div className="kp-stack">
          <AnimatePresence initial={false}>
            {stack.map((frame, index) => (
              <StackFrame
                key={`${frame.processId}-${index}`}
                frame={frame}
                index={index}
                total={stack.length}
                step={step}
              />
            ))}
          </AnimatePresence>

          {!stack.length && (
            <div className="kp-empty-state compact">
              {step?.phase === "done"
                ? "DFS has returned completely. The call stack is empty."
                : "No DFS call is active yet."}
            </div>
          )}
        </div>
      </section>

      <section className="kp-section">
        <div className="kp-section-heading">
          <div>
            <strong>Current action</strong>
            <span>What the top frame is doing</span>
          </div>
        </div>

        <div className="kp-action-card">
          {step?.currentProcess !== null &&
          step?.currentProcess !== undefined ? (
            <>
              <div className="kp-action-main">
                <span>Current process</span>
                <strong>PID {step.currentProcess}</strong>
              </div>

              {step.nextChild !== null && step.nextChild !== undefined && (
                <div className="kp-action-arrow">
                  <span>next recursive child</span>

                  <strong>
                    PID {step.currentProcess}
                    {" → "}
                    PID {step.nextChild}
                  </strong>
                </div>
              )}

              {step.returningFrom !== null &&
                step.returningFrom !== undefined && (
                  <div className="kp-action-arrow">
                    <span>returning from</span>

                    <strong>dfs({step.returningFrom})</strong>
                  </div>
                )}

              {!!step.childrenToVisit?.length && (
                <div className="kp-action-remaining">
                  <span>Children still to inspect</span>

                  <div>
                    {step.childrenToVisit.map((processId) => (
                      <code key={processId}>{processId}</code>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <span className="kp-muted">Waiting for DFS to begin.</span>
          )}
        </div>
      </section>

      <section className="kp-section">
        <div className="kp-section-heading">
          <div>
            <strong>Result being built</strong>
            <span>Processes discovered by DFS</span>
          </div>
        </div>

        <div className="kp-result-box">
          <code>[{(step?.killedOrder ?? []).join(", ")}]</code>

          {step?.phase === "done" && (
            <span className="kp-result-complete">returned</span>
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   Main visualizer
   ========================================================= */

export default function KillProcessVisualizer() {
  const [pidInput, setPidInput] = useState(
    JSON.stringify(AUTHORED_INITIAL.pid),
  );

  const [ppidInput, setPpidInput] = useState(
    JSON.stringify(AUTHORED_INITIAL.ppid),
  );

  const [killInput, setKillInput] = useState(String(AUTHORED_INITIAL.kill));

  /* -------------------------------------------------------
     Input parsing
     ------------------------------------------------------- */

  const { value: pidRaw, error: pidError } = useParsedInput(
    pidInput,
    (source) => {
      const parsed = JSON.parse(source);

      if (!Array.isArray(parsed)) {
        throw new Error("pid must be an array");
      }

      if (
        parsed.some(
          (value) => typeof value !== "number" || !Number.isFinite(value),
        )
      ) {
        throw new Error("Every pid value must be a number");
      }

      if (new Set(parsed).size !== parsed.length) {
        throw new Error("Process IDs in pid must be unique");
      }

      return normalizeNumberArray(parsed);
    },
    [],
  );

  const { value: ppidRaw, error: ppidError } = useParsedInput(
    ppidInput,
    (source) => {
      const parsed = JSON.parse(source);

      if (!Array.isArray(parsed)) {
        throw new Error("ppid must be an array");
      }

      if (
        parsed.some(
          (value) => typeof value !== "number" || !Number.isFinite(value),
        )
      ) {
        throw new Error("Every ppid value must be a number");
      }

      return normalizeNumberArray(parsed);
    },
    [],
  );

  const pid = pidRaw ?? [];
  const ppid = ppidRaw ?? [];

  const killPid = useMemo(() => {
    const value = Number(killInput);

    return Number.isFinite(value) ? value : NaN;
  }, [killInput]);

  const structuralError = useMemo(() => {
    if (pid.length !== ppid.length) {
      return "pid and ppid must have the same length";
    }

    if (killInput.trim() && !Number.isFinite(killPid)) {
      return "kill must be a number";
    }

    return "";
  }, [pid.length, ppid.length, killInput, killPid]);

  const inputError = pidError || ppidError || structuralError;

  /* -------------------------------------------------------
     Steps
     ------------------------------------------------------- */

  const steps = useMemo(() => {
    if (inputError) {
      return [];
    }

    return generateSteps(pid, ppid, killPid);
  }, [pid, ppid, killPid, inputError]);

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

  /* -------------------------------------------------------
     Examples
     ------------------------------------------------------- */

  const applyExample = useApplyExample((example) => {
    setPidInput(JSON.stringify(example.pid));

    setPpidInput(JSON.stringify(example.ppid));

    setKillInput(String(example.kill));
  }, handleReset);

  /* -------------------------------------------------------
     Code connectivity
     ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     Input changes
     ------------------------------------------------------- */

  const handleInputChange = useCallback(
    (key, value) => {
      if (key === "pid") {
        setPidInput(value);
      }

      if (key === "ppid") {
        setPpidInput(value);
      }

      if (key === "kill") {
        setKillInput(value);
      }

      handleReset();
    },
    [handleReset],
  );

  /* -------------------------------------------------------
     Panels
     ------------------------------------------------------- */

  const panelConfigs = useMemo(
    () => [
      {
        id: "tree",
        title: "Process Tree",
      },
      {
        id: "stack",
        title: "Call Stack",
        dockMode: "split-right",
        ratio: 0.68,
      },
      {
        id: "code",
        title: "Code Trace",
        dockMode: "split-right",
        ratio: 0.7,
      },
    ],
    [],
  );

  const treePanel = (
    <ProcessTreePanel
      pid={pid}
      ppid={ppid}
      killPid={killPid}
      step={step}
      inputError={inputError}
    />
  );

  const stackPanel = <CallStackPanel step={step} killPid={killPid} />;

  const codePanel = (
    <div className="kp-code-panel">
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
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

  const [panelDivs, setPanelDivs] = useState(null);

  const handlePanelReady = useCallback((divs) => {
    setPanelDivs(divs);
  }, []);

  /* -------------------------------------------------------
     Render
     ------------------------------------------------------- */

  return (
    <div className="kp-shell">
      <ManualInputPanel
        fields={[
          {
            key: "pid",
            label: "pid",
            type: "string",
          },
          {
            key: "ppid",
            label: "ppid",
            type: "string",
          },
          {
            key: "kill",
            label: "kill",
            type: "string",
          },
        ]}
        values={{
          pid: pidInput,
          ppid: ppidInput,
          kill: killInput,
        }}
        onChange={handleInputChange}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

      <div className="kp-workspace">
        <LuminoDockPanel
          panels={panelConfigs}
          onPanelReady={handlePanelReady}
        />

        {panelDivs && (
          <>
            {panelDivs.tree && createPortal(treePanel, panelDivs.tree)}

            {panelDivs.stack && createPortal(stackPanel, panelDivs.stack)}

            {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          </>
        )}
      </div>

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
          nextDisabled={isDone || steps.length === 0}
          resetDisabled={stepIndex < 0}
          onSpeedChange={(event) => setSpeed(Number(event.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />

        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
      </FloatingPanel>
    </div>
  );
}
