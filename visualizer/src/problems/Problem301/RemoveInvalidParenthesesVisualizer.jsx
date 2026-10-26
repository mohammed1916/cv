import authoredExamples0 from "../../config/examples/remove-invalid-parentheses.js";

import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import PointerRail from "../../components/shared/PointerRail";
import RecursiveCallTree from "../../components/shared/RecursiveCallTree";

import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";

import "./RemoveInvalidParenthesesVisualizer.css";

const CODE = [
  { line: 1, text: "class Solution:" },
  { line: 2, text: "    def removeInvalidParentheses(self, s):" },
  { line: 3, text: "        left = 0" },
  { line: 4, text: "        right = 0" },
  { line: 5, text: "" },
  { line: 6, text: "        for char in s:" },
  { line: 7, text: "            if char == '(':" },
  { line: 8, text: "                left += 1" },
  { line: 9, text: "            elif char == ')':" },
  {
    line: 10,
    text: "                right = right + 1 if left == 0 else right",
  },
  {
    line: 11,
    text: "                left = left - 1 if left > 0 else left",
  },
  { line: 12, text: "" },
  { line: 13, text: "        result = {}" },
  {
    line: 14,
    text: "        def recurse(s, index, left_count, right_count, left_rem, right_rem, expr):",
  },
  { line: 15, text: "            if index == len(s):" },
  {
    line: 16,
    text: "                if left_rem == 0 and right_rem == 0:",
  },
  { line: 17, text: '                    ans = "".join(expr)' },
  { line: 18, text: "                    result[ans] = 1" },
  { line: 19, text: "            else:" },
  { line: 20, text: "" },
  {
    line: 21,
    text: "                if (s[index] == '(' and left_rem > 0) or (s[index] == ')' and right_rem > 0):",
  },
  {
    line: 22,
    text: "                    recurse(s, index + 1, left_count, right_count,",
  },
  {
    line: 23,
    text: "                            left_rem - (s[index] == '('),",
  },
  {
    line: 24,
    text: "                            right_rem - (s[index] == ')'), expr)",
  },
  { line: 25, text: "" },
  { line: 26, text: "                expr.append(s[index])" },
  { line: 27, text: "" },
  {
    line: 28,
    text: "                if s[index] != '(' and s[index] != ')':",
  },
  {
    line: 29,
    text: "                    recurse(s, index + 1, left_count, right_count, left_rem, right_rem, expr)",
  },
  { line: 30, text: "                elif s[index] == '(':" },
  {
    line: 31,
    text: "                    recurse(s, index + 1, left_count + 1, right_count, left_rem, right_rem, expr)",
  },
  {
    line: 32,
    text: "                elif s[index] == ')' and left_count > right_count:",
  },
  {
    line: 33,
    text: "                    recurse(s, index + 1, left_count, right_count + 1, left_rem, right_rem, expr)",
  },
  { line: 34, text: "" },
  { line: 35, text: "                expr.pop()" },
  { line: 36, text: "" },
  {
    line: 37,
    text: "        recurse(s, 0, 0, 0, left, right, [])",
  },
  { line: 38, text: "        return list(result.keys())" },
];

const EXAMPLES = authoredExamples0.length ? authoredExamples0 : [];

function parse(raw) {
  try {
    const parsed = JSON.parse(raw);

    if (typeof parsed.s !== "string") {
      throw new Error('Use { "s": "expression" }.');
    }

    return {
      input: parsed,
      inputError: "",
    };
  } catch (error) {
    return {
      input: null,
      inputError: error.message,
    };
  }
}

function calculateRemovals(s) {
  let left = 0;
  let right = 0;

  for (const char of s) {
    if (char === "(") {
      left += 1;
    } else if (char === ")") {
      if (left === 0) {
        right += 1;
      } else {
        left -= 1;
      }
    }
  }

  return {
    leftRem: left,
    rightRem: right,
  };
}

function cloneNodes(nodes) {
  return nodes.map((node) => ({
    ...node,
    children: [...(node.children ?? [])],
    returnValue: [...(node.returnValue ?? [])],
  }));
}

function generateSteps(s) {
  if (typeof s !== "string") {
    return [];
  }

  const steps = [];
  const nodes = [];
  const frames = [];
  const results = new Set();

  let nextNodeId = 0;
  let activeNodeId = null;

  const { leftRem: initialLeftRem, rightRem: initialRightRem } =
    calculateRemovals(s);

  const snapshotNodes = () => cloneNodes(nodes);

  const snapshotFrames = () =>
    frames.map((frame) => ({
      ...frame,
    }));

  const push = ({
    phase,
    activeLine,
    index = null,
    scanIndex = null,
    leftRem = initialLeftRem,
    rightRem = initialRightRem,
    leftCount = 0,
    rightCount = 0,
    expr = "",
    char = null,
    decision = null,
    message,
    nodeId = activeNodeId,
  }) => {
    steps.push({
      phase,
      activeLine,
      relatedLines: [activeLine],

      index,
      scanIndex,
      char,

      leftRem,
      rightRem,
      leftCount,
      rightCount,

      expr,
      decision,

      initialLeftRem,
      initialRightRem,

      nodes: snapshotNodes(),
      frames: snapshotFrames(),
      activeNodeId: nodeId,

      results: [...results],

      message,
    });
  };

  /*
   * First pass:
   *
   * Determine exactly how many '(' and ')' MUST be removed.
   */
  let scanLeft = 0;
  let scanRight = 0;

  push({
    phase: "count-init",
    activeLine: 4,
    scanIndex: 0,
    message:
      "First determine the minimum number of misplaced left and right parentheses.",
  });

  for (let i = 0; i < s.length; i += 1) {
    const char = s[i];

    push({
      phase: "count-scan",
      activeLine: 6,
      scanIndex: i,
      char,
      leftRem: scanLeft,
      rightRem: scanRight,
      message: `Inspect s[${i}] = '${char}'.`,
    });

    if (char === "(") {
      scanLeft += 1;

      push({
        phase: "count-left",
        activeLine: 8,
        scanIndex: i,
        char,
        leftRem: scanLeft,
        rightRem: scanRight,
        message: `This '(' is currently unmatched. Unmatched left count becomes ${scanLeft}.`,
      });
    } else if (char === ")") {
      if (scanLeft === 0) {
        scanRight += 1;

        push({
          phase: "count-right",
          activeLine: 10,
          scanIndex: i,
          char,
          leftRem: scanLeft,
          rightRem: scanRight,
          message:
            `There is no unmatched '(' available for this ')'. ` +
            `Therefore this ')' must eventually be removed. right = ${scanRight}.`,
        });
      } else {
        scanLeft -= 1;

        push({
          phase: "count-match",
          activeLine: 11,
          scanIndex: i,
          char,
          leftRem: scanLeft,
          rightRem: scanRight,
          message:
            `Match this ')' with an earlier unmatched '('. ` +
            `Unmatched left count becomes ${scanLeft}.`,
        });
      }
    }
  }

  push({
    phase: "removal-budget",
    activeLine: 13,
    scanIndex: null,
    leftRem: initialLeftRem,
    rightRem: initialRightRem,
    message:
      `Minimum-removal budget: remove exactly ${initialLeftRem} '(' and ` +
      `${initialRightRem} ')'. Backtracking only explores decisions that respect this budget.`,
  });

  function recurse({
    index,
    leftCount,
    rightCount,
    leftRem,
    rightRem,
    expr,
    parentId = null,
    decision = "start",
  }) {
    const nodeId = `call-${nextNodeId++}`;

    const node = {
      id: nodeId,
      parentId,
      children: [],

      index,
      char: index < s.length ? s[index] : null,

      leftCount,
      rightCount,
      leftRem,
      rightRem,

      expr,
      decision,

      status: "active",
      returnValue: [],
    };

    nodes.push(node);

    if (parentId !== null) {
      const parent = nodes.find((candidate) => candidate.id === parentId);

      if (parent) {
        parent.children.push(nodeId);
        parent.status = "waiting";
      }
    }

    activeNodeId = nodeId;

    frames.push({
      nodeId,
      index,
      expr,
      leftCount,
      rightCount,
      leftRem,
      rightRem,
      decision,
    });

    push({
      phase: "recurse",
      activeLine: 14,
      index,
      leftRem,
      rightRem,
      leftCount,
      rightCount,
      expr,
      decision,
      nodeId,
      message:
        index < s.length
          ? `Explore index ${index} with expr="${expr}". ` +
            `Need to remove ${leftRem} '(' and ${rightRem} ')' more.`
          : `Reached the end with expr="${expr}".`,
    });

    if (index === s.length) {
      push({
        phase: "base-case",
        activeLine: 15,
        index,
        leftRem,
        rightRem,
        leftCount,
        rightCount,
        expr,
        decision,
        nodeId,
        message: `Reached the end of the input. Check whether the required removals were completed.`,
      });

      if (leftRem === 0 && rightRem === 0) {
        results.add(expr);

        node.status = "accepted";
        node.returnValue = [expr];

        push({
          phase: "accept",
          activeLine: 18,
          index,
          leftRem,
          rightRem,
          leftCount,
          rightCount,
          expr,
          decision,
          nodeId,
          message:
            `"${expr}" used the exact removal budget and never created an invalid prefix. ` +
            `Add it to the result set.`,
        });
      } else {
        node.status = "pruned";

        push({
          phase: "reject-budget",
          activeLine: 16,
          index,
          leftRem,
          rightRem,
          leftCount,
          rightCount,
          expr,
          decision,
          nodeId,
          message:
            `Reject this branch. The input ended while ${leftRem} '(' and ` +
            `${rightRem} ')' still needed to be removed.`,
        });
      }

      frames.pop();

      if (parentId !== null) {
        const parent = nodes.find((candidate) => candidate.id === parentId);

        if (parent) {
          parent.status = "active";
        }

        activeNodeId = parentId;
      } else {
        activeNodeId = null;
      }

      return;
    }

    const char = s[index];

    /*
     * DISCARD BRANCH
     *
     * We only discard a parenthesis if our precomputed minimum-removal
     * budget says that type still needs to be removed.
     */
    const canDiscardLeft = char === "(" && leftRem > 0;
    const canDiscardRight = char === ")" && rightRem > 0;

    if (canDiscardLeft || canDiscardRight) {
      push({
        phase: "discard-choice",
        activeLine: 21,
        index,
        char,
        leftRem,
        rightRem,
        leftCount,
        rightCount,
        expr,
        decision: "discard",
        nodeId,
        message:
          `Discard '${char}' at index ${index}. ` +
          `This consumes one required ${char === "(" ? "left" : "right"}-parenthesis removal.`,
      });

      recurse({
        index: index + 1,
        leftCount,
        rightCount,
        leftRem: leftRem - (char === "(" ? 1 : 0),
        rightRem: rightRem - (char === ")" ? 1 : 0),
        expr,
        parentId: nodeId,
        decision: `discard '${char}'`,
      });

      activeNodeId = nodeId;

      node.status = "active";
    } else if (char === "(" || char === ")") {
      push({
        phase: "discard-pruned",
        activeLine: 21,
        index,
        char,
        leftRem,
        rightRem,
        leftCount,
        rightCount,
        expr,
        decision: "discard-pruned",
        nodeId,
        message:
          `Do not create a discard branch for '${char}'. ` +
          `The required removal count for this parenthesis type is already zero.`,
      });
    }

    /*
     * KEEP BRANCH
     */
    const keptExpr = expr + char;

    push({
      phase: "keep",
      activeLine: 26,
      index,
      char,
      leftRem,
      rightRem,
      leftCount,
      rightCount,
      expr: keptExpr,
      decision: "keep",
      nodeId,
      message: `Try keeping '${char}'. The partial expression becomes "${keptExpr}".`,
    });

    if (char !== "(" && char !== ")") {
      push({
        phase: "keep-character",
        activeLine: 28,
        index,
        char,
        leftRem,
        rightRem,
        leftCount,
        rightCount,
        expr: keptExpr,
        decision: "keep",
        nodeId,
        message: `'${char}' is not a parenthesis, so it is always safe to keep.`,
      });

      recurse({
        index: index + 1,
        leftCount,
        rightCount,
        leftRem,
        rightRem,
        expr: keptExpr,
        parentId: nodeId,
        decision: `keep '${char}'`,
      });

      activeNodeId = nodeId;
      node.status = "active";
    } else if (char === "(") {
      push({
        phase: "keep-left",
        activeLine: 30,
        index,
        char,
        leftRem,
        rightRem,
        leftCount,
        rightCount,
        expr: keptExpr,
        decision: "keep",
        nodeId,
        message:
          `Keep '('. The kept prefix now has ${leftCount + 1} opening ` +
          `parenthesis${leftCount + 1 === 1 ? "" : "es"} and ${rightCount} closing parentheses.`,
      });

      recurse({
        index: index + 1,
        leftCount: leftCount + 1,
        rightCount,
        leftRem,
        rightRem,
        expr: keptExpr,
        parentId: nodeId,
        decision: "keep '('",
      });

      activeNodeId = nodeId;
      node.status = "active";
    } else if (leftCount > rightCount) {
      push({
        phase: "keep-right",
        activeLine: 32,
        index,
        char,
        leftRem,
        rightRem,
        leftCount,
        rightCount,
        expr: keptExpr,
        decision: "keep",
        nodeId,
        message: `Keep ')'. There is an unmatched kept '(' available, so the prefix remains valid.`,
      });

      recurse({
        index: index + 1,
        leftCount,
        rightCount: rightCount + 1,
        leftRem,
        rightRem,
        expr: keptExpr,
        parentId: nodeId,
        decision: "keep ')'",
      });

      activeNodeId = nodeId;
      node.status = "active";
    } else {
      push({
        phase: "invalid-prefix-pruned",
        activeLine: 32,
        index,
        char,
        leftRem,
        rightRem,
        leftCount,
        rightCount,
        expr,
        decision: "keep-pruned",
        nodeId,
        message:
          `Prune the keep branch for ')'. Keeping it would make the prefix invalid because ` +
          `right_count would exceed left_count.`,
      });
    }

    push({
      phase: "backtrack",
      activeLine: 35,
      index,
      char,
      leftRem,
      rightRem,
      leftCount,
      rightCount,
      expr,
      decision: "backtrack",
      nodeId,
      message:
        `Backtrack from index ${index}. Remove '${char}' from the working expression ` +
        `before returning to the previous decision.`,
    });

    node.status = "returned";

    frames.pop();

    if (parentId !== null) {
      const parent = nodes.find((candidate) => candidate.id === parentId);

      if (parent) {
        parent.status = "active";
      }

      activeNodeId = parentId;
    } else {
      activeNodeId = null;
    }
  }

  push({
    phase: "start-backtracking",
    activeLine: 37,
    index: 0,
    leftRem: initialLeftRem,
    rightRem: initialRightRem,
    leftCount: 0,
    rightCount: 0,
    expr: "",
    message:
      `Start backtracking with removal budget left_rem=${initialLeftRem}, ` +
      `right_rem=${initialRightRem}.`,
  });

  recurse({
    index: 0,
    leftCount: 0,
    rightCount: 0,
    leftRem: initialLeftRem,
    rightRem: initialRightRem,
    expr: "",
  });

  const finalResults = [...results];

  steps.push({
    phase: "done",
    activeLine: 38,
    relatedLines: [38],

    index: s.length,
    scanIndex: null,
    char: null,

    leftRem: 0,
    rightRem: 0,
    leftCount: 0,
    rightCount: 0,

    expr: "",
    decision: null,

    initialLeftRem,
    initialRightRem,

    nodes: snapshotNodes(),
    frames: [],
    activeNodeId: null,

    results: finalResults,

    message:
      `Return ${finalResults.length} distinct minimum-removal ` +
      `expression${finalResults.length === 1 ? "" : "s"}.`,
  });

  return steps;
}

function PanelBody({ children, className = "" }) {
  return (
    <div className={`remove-invalid-parentheses-panel-body ${className}`}>
      {children}
    </div>
  );
}

function Stat({ label, value, tone = "" }) {
  return (
    <div className={`remove-invalid-parentheses-stat ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DecisionBadge({ decision }) {
  if (!decision) {
    return null;
  }

  let label = decision;
  let tone = "";

  if (decision === "keep") {
    label = "KEEP";
    tone = "keep";
  } else if (decision === "discard") {
    label = "DISCARD";
    tone = "discard";
  } else if (decision === "backtrack") {
    label = "BACKTRACK";
    tone = "backtrack";
  } else if (decision.includes("pruned")) {
    label = "PRUNED";
    tone = "pruned";
  }

  return (
    <span className={`remove-invalid-parentheses-decision ${tone}`}>
      {label}
    </span>
  );
}

function InputPanel({
  raw,
  setRaw,
  input,
  inputError,
  step,
  applyExample,
  handleReset,
}) {
  const value = input?.s ?? "";

  const pointerIndex =
    step?.scanIndex !== null && step?.scanIndex !== undefined
      ? step.scanIndex
      : step?.index;

  const validPointer =
    Number.isInteger(pointerIndex) &&
    pointerIndex >= 0 &&
    pointerIndex < value.length;

  return (
    <PanelBody>
      <div className="remove-invalid-parentheses-input-card">
        <div className="remove-invalid-parentheses-examples">
          {EXAMPLES.map((example, index) => (
            <button
              type="button"
              className="remove-invalid-parentheses-example-btn"
              key={example.label ?? index}
              onClick={() => applyExample(example)}
            >
              {example.label ?? `Example ${index + 1}`}
            </button>
          ))}
        </div>

        <label className="remove-invalid-parentheses-field">
          <span>Input</span>

          <textarea
            className="remove-invalid-parentheses-textarea"
            value={raw}
            spellCheck={false}
            onChange={(event) => {
              setRaw(event.target.value);
              handleReset();
            }}
          />
        </label>

        {inputError && (
          <div className="remove-invalid-parentheses-error">{inputError}</div>
        )}
      </div>

      <section className="remove-invalid-parentheses-section">
        <div className="remove-invalid-parentheses-section-head">
          <strong>Expression scan</strong>

          <span>{validPointer ? `index = ${pointerIndex}` : "—"}</span>
        </div>

        <PointerRail
          values={value.split("")}
          pointers={
            validPointer
              ? [
                  {
                    id: "index",
                    label:
                      step?.scanIndex !== null && step?.scanIndex !== undefined
                        ? "scan"
                        : "index",
                    index: pointerIndex,
                    tone: "primary",
                  },
                ]
              : []
          }
        />
      </section>

      <div className="remove-invalid-parentheses-status">
        <DecisionBadge decision={step?.decision} />

        <span>
          {step?.message ??
            "Press Play or Step to calculate the removal budget and begin backtracking."}
        </span>
      </div>

      <section className="remove-invalid-parentheses-section">
        <div className="remove-invalid-parentheses-section-head">
          <strong>Minimum removal budget</strong>
          <span>computed before recursion</span>
        </div>

        <div className="remove-invalid-parentheses-stats">
          <Stat
            label="Remove '('"
            value={step?.initialLeftRem ?? "—"}
            tone="left"
          />

          <Stat
            label="Remove ')'"
            value={step?.initialRightRem ?? "—"}
            tone="right"
          />

          <Stat label="'(' remaining" value={step?.leftRem ?? "—"} />

          <Stat label="')' remaining" value={step?.rightRem ?? "—"} />
        </div>
      </section>

      <section className="remove-invalid-parentheses-section">
        <div className="remove-invalid-parentheses-section-head">
          <strong>Current partial expression</strong>
          <span>expr</span>
        </div>

        <div className="remove-invalid-parentheses-expression">
          {step?.expr || <span>ε</span>}
        </div>

        <div className="remove-invalid-parentheses-balance">
          <div>
            <span>kept '('</span>
            <strong>{step?.leftCount ?? 0}</strong>
          </div>

          <div>
            <span>kept ')'</span>
            <strong>{step?.rightCount ?? 0}</strong>
          </div>

          <div>
            <span>available unmatched '('</span>
            <strong>{(step?.leftCount ?? 0) - (step?.rightCount ?? 0)}</strong>
          </div>
        </div>
      </section>
    </PanelBody>
  );
}

function SearchTreePanel({ step, s }) {
  const nodes = step?.nodes ?? [];

  return (
    <PanelBody>
      <div className="remove-invalid-parentheses-tree-help">
        <strong>How to read the tree</strong>

        <span>
          Each node is one recursive call. For a parenthesis, recursion may
          branch into <b>discard</b> and <b>keep</b>. Invalid keep branches and
          unnecessary discard branches are pruned.
        </span>
      </div>

      <RecursiveCallTree
        nodes={nodes}
        activeNodeId={step?.activeNodeId}
        getTitle={(node) => {
          if (node.index >= s.length) {
            return "end";
          }

          return `index ${node.index}`;
        }}
        getSubtitle={(node) => {
          if (node.index >= s.length) {
            return `expr="${node.expr || "ε"}"`;
          }

          return `${node.decision} · '${s[node.index]}'`;
        }}
        getState={(node) => [
          {
            label: "expr",
            values: [node.expr || "ε"],
          },
          {
            label: "remove",
            values: [`(:${node.leftRem}`, `):${node.rightRem}`],
          },
          {
            label: "balance",
            values: [`L:${node.leftCount}`, `R:${node.rightCount}`],
          },
        ]}
        getReturnValue={(node) => node.returnValue ?? []}
        emptyLabel="The recursive decision tree appears after the initial removal budget is calculated."
      />
    </PanelBody>
  );
}

function StackPanel({ step }) {
  const frames = step?.frames ?? [];

  return (
    <PanelBody>
      <div className="remove-invalid-parentheses-stack-help">
        The top frame is the recursive call currently being executed.
      </div>

      {!frames.length ? (
        <div className="remove-invalid-parentheses-empty">
          No recursive call is currently active.
        </div>
      ) : (
        <div className="remove-invalid-parentheses-stack">
          {frames.map((frame, index) => {
            const active = index === frames.length - 1;

            return (
              <motion.div
                layout
                key={frame.nodeId}
                className={`remove-invalid-parentheses-frame ${
                  active ? "active" : ""
                }`}
              >
                <div className="remove-invalid-parentheses-frame-head">
                  <strong>recurse(index={frame.index})</strong>

                  {active && <span>TOP</span>}
                </div>

                <div className="remove-invalid-parentheses-frame-expression">
                  expr = "{frame.expr || "ε"}"
                </div>

                <div className="remove-invalid-parentheses-frame-grid">
                  <span>
                    left_count
                    <strong>{frame.leftCount}</strong>
                  </span>

                  <span>
                    right_count
                    <strong>{frame.rightCount}</strong>
                  </span>

                  <span>
                    left_rem
                    <strong>{frame.leftRem}</strong>
                  </span>

                  <span>
                    right_rem
                    <strong>{frame.rightRem}</strong>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </PanelBody>
  );
}

function ResultsPanel({ step }) {
  const results = step?.results ?? [];

  return (
    <PanelBody>
      <div className="remove-invalid-parentheses-result-summary">
        <div>
          <span>Distinct answers found</span>
          <strong>{results.length}</strong>
        </div>

        <div>
          <span>Required removals</span>
          <strong>
            {(step?.initialLeftRem ?? 0) + (step?.initialRightRem ?? 0)}
          </strong>
        </div>
      </div>

      <div className="remove-invalid-parentheses-result-help">
        An expression reaches this panel only when it reaches the end after
        using the exact minimum-removal budget. The result map removes
        duplicates produced by different decision paths.
      </div>

      {!results.length ? (
        <div className="remove-invalid-parentheses-empty">
          No complete answer has been accepted yet.
        </div>
      ) : (
        <div className="remove-invalid-parentheses-results">
          <AnimatePresence initial={false}>
            {results.map((answer) => (
              <motion.div
                layout
                key={answer}
                className="remove-invalid-parentheses-answer"
                initial={{
                  opacity: 0,
                  y: 6,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                }}
              >
                <span>✓</span>

                <code>{answer || '""'}</code>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </PanelBody>
  );
}

export default function RemoveInvalidParenthesesVisualizer() {
  const initialExample = EXAMPLES[0] ?? {
    s: "()())()",
  };

  const [raw, setRaw] = useState(JSON.stringify(initialExample));

  const { input, inputError } = useMemo(() => parse(raw), [raw]);

  const steps = useMemo(() => (input ? generateSteps(input.s) : []), [input]);

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

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  });

  const applyExample = useCallback(
    (example) => {
      setRaw(JSON.stringify(example));
      handleReset();
    },
    [handleReset],
  );

  const [panelDivs, setPanelDivs] = useState(null);

  const panels = useMemo(
    () => [
      {
        id: "input",
        title: "Backtracking State",
      },
      {
        id: "tree",
        title: "Decision Tree",
        dockMode: "split-right",
        ratio: 0.56,
      },
      {
        id: "code",
        title: "Python Code",
        dockMode: "split-right",
        ratio: 0.64,
      },
      {
        id: "stack",
        title: "Call Stack",
        dockMode: "split-bottom",
        ratio: 0.68,
      },
      {
        id: "results",
        title: "Minimum-Removal Answers",
        dockMode: "split-bottom",
        ratio: 0.72,
      },
    ],
    [],
  );

  const inputPanel = (
    <InputPanel
      raw={raw}
      setRaw={setRaw}
      input={input}
      inputError={inputError}
      step={step}
      applyExample={applyExample}
      handleReset={handleReset}
    />
  );

  const treePanel = <SearchTreePanel step={step} s={input?.s ?? ""} />;

  const codePanel = (
    <div className="remove-invalid-parentheses-code">
      <CodeTracePanel
        step={step}
        codeLines={CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
      />
    </div>
  );

  const stackPanel = <StackPanel step={step} />;

  const resultsPanel = <ResultsPanel step={step} />;

  return (
    <div className="remove-invalid-parentheses-shell">
      <LuminoDockPanel panels={panels} onPanelReady={setPanelDivs} />

      {panelDivs && (
        <>
          {panelDivs.input && createPortal(inputPanel, panelDivs.input)}

          {panelDivs.tree && createPortal(treePanel, panelDivs.tree)}

          {panelDivs.code && createPortal(codePanel, panelDivs.code)}

          {panelDivs.stack && createPortal(stackPanel, panelDivs.stack)}

          {panelDivs.results && createPortal(resultsPanel, panelDivs.results)}
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
            onSpeedChange={(event) => setSpeed(Number(event.target.value))}
          />
        </FloatingPanel>,
        document.body,
      )}
    </div>
  );
}
