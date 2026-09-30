import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import LuminoDockPanel from "../../components/LuminoDockPanel";

import FloatingPanel from "../../components/shared/FloatingPanel";
import PointerRail from "../../components/shared/PointerRail";
import RecursiveCallTree from "../../components/shared/RecursiveCallTree";
import CartesianExpansion from "../../components/shared/CartesianExpansion";
import AlgorithmNarrative from "../../components/shared/AlgorithmNarrative";
import { braceNarrative } from "./braceNarrative";

import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { getExamples } from "../../config/examplesRegistry";

import "./BraceExpansionIIVisualizer.css";

const SOLUTION_CODE_INLINE = [
  { line: 1, text: "def braceExpansionII(expression):" },
  { line: 2, text: "    def parse(i):" },
  { line: 3, text: "        union = set()" },
  { line: 4, text: '        product = {""}' },
  { line: 5, text: "" },
  {
    line: 6,
    text: '        while i < len(expression) and expression[i] != "}":',
  },
  { line: 7, text: '            if expression[i] == ",":' },
  { line: 8, text: "                union |= product" },
  { line: 9, text: '                product = {""}' },
  { line: 10, text: "                i += 1" },
  { line: 11, text: "" },
  { line: 12, text: '            elif expression[i] == "{":' },
  { line: 13, text: "                group, i = parse(i + 1)" },
  {
    line: 14,
    text: "                product = {a + b for a in product for b in group}",
  },
  { line: 15, text: "" },
  { line: 16, text: "            else:" },
  { line: 17, text: "                group = {expression[i]}" },
  { line: 18, text: "                i += 1" },
  {
    line: 19,
    text: "                product = {a + b for a in product for b in group}",
  },
  { line: 20, text: "" },
  { line: 21, text: "        union |= product" },
  { line: 22, text: "" },
  {
    line: 23,
    text: '        if i < len(expression) and expression[i] == "}":',
  },
  { line: 24, text: "            i += 1" },
  { line: 25, text: "" },
  { line: 26, text: "        return union, i" },
  { line: 27, text: "" },
  { line: 28, text: "    result, _ = parse(0)" },
  { line: 29, text: "    return sorted(result)" },
];

const SOLUTION_CODE = SOLUTION_CODE_INLINE;

const EXAMPLES = getExamples("brace-expansion-ii");

const MAX_LEN = 60;

function sorted(values) {
  return [...values].sort();
}

function copySet(values) {
  return new Set(values);
}

function concatenate(left, right) {
  const result = new Set();

  for (const prefix of left) {
    for (const choice of right) {
      result.add(prefix + choice);
    }
  }

  return result;
}

function displayWord(word) {
  return word === "" ? "ε" : word;
}

function formatSet(values) {
  if (!values?.length) return "∅";

  return `{${values.map(displayWord).join(", ")}}`;
}

function getCallSlice(expression, start) {
  if (start >= expression.length) return "";

  let depth = 0;
  let end = start;

  while (end < expression.length) {
    const char = expression[end];

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      if (depth === 0) break;
      depth -= 1;
    }

    end += 1;
  }

  return expression.slice(start, end);
}

function cloneCallNodes(nodes) {
  return nodes.map((node) => ({
    ...node,
    children: [...(node.children ?? [])],
    union: [...(node.union ?? [])],
    product: [...(node.product ?? [])],
    returnValue: [...(node.returnValue ?? [])],
  }));
}

function generateSteps(expression) {
  if (!expression) return [];

  const steps = [];
  const frames = [];
  const calls = [];

  let nextCallId = 0;
  let activeCallId = null;

  const snapshotFrames = () =>
    frames.map((frame) => ({
      callId: frame.callId,
      depth: frame.depth,
      start: frame.start,
      index: frame.index,
      union: sorted(frame.union),
      product: sorted(frame.product),
    }));

  const snapshotCalls = () => cloneCallNodes(calls);

  const updateCall = (id, updates) => {
    const call = calls.find((candidate) => candidate.id === id);

    if (!call) return;

    Object.assign(call, updates);
  };

  const push = ({
    phase,
    activeLine,
    index,
    depth,
    union,
    product,
    group = new Set(),
    groupSource = null,
    operation = null,
    leftSet = new Set(),
    rightSet = new Set(),
    resultSet = new Set(),
    message,
    result = null,
    callId = activeCallId,
  }) => {
    steps.push({
      phase,
      activeLine,
      index,
      depth,

      union: sorted(union),
      product: sorted(product),
      group: sorted(group),

      groupSource,

      operation,
      leftSet: sorted(leftSet),
      rightSet: sorted(rightSet),
      resultSet: sorted(resultSet),

      frames: snapshotFrames(),
      calls: snapshotCalls(),
      activeCallId: callId,

      message,

      result: result ? sorted(result) : null,
    });
  };

  function parse(start, depth, parentCallId = null) {
    let i = start;

    let union = new Set();
    let product = new Set([""]);

    const callId = `call-${nextCallId++}`;

    const call = {
      id: callId,
      parentId: parentCallId,
      children: [],
      depth,
      start,
      index: i,
      source: getCallSlice(expression, start),
      union: [],
      product: [""],
      returnValue: [],
      status: "active",
    };

    calls.push(call);

    if (parentCallId !== null) {
      const parent = calls.find((candidate) => candidate.id === parentCallId);

      if (parent) {
        parent.children.push(callId);
        parent.status = "waiting";
      }
    }

    activeCallId = callId;

    const frame = {
      callId,
      depth,
      start,
      index: i,
      union: copySet(union),
      product: copySet(product),
    };

    frames.push(frame);

    const sync = () => {
      frame.index = i;
      frame.union = copySet(union);
      frame.product = copySet(product);

      updateCall(callId, {
        index: i,
        union: sorted(union),
        product: sorted(product),
      });
    };

    sync();

    push({
      phase: "enter",
      activeLine: 2,
      index: i,
      depth,
      union,
      product,
      callId,
      message:
        depth === 0
          ? "Start parse(0) for the complete expression."
          : `Enter parse(${start}) for the nested expression starting at index ${start}.`,
    });

    push({
      phase: "initialize",
      activeLine: 4,
      index: i,
      depth,
      union,
      product,
      callId,
      message:
        "Start this alternative with ε. ε is the neutral starting prefix: appending any operand to ε gives that operand.",
    });

    while (i < expression.length && expression[i] !== "}") {
      sync();

      const char = expression[i];

      push({
        phase: "inspect",
        activeLine: 6,
        index: i,
        depth,
        union,
        product,
        callId,
        message: `Inspect expression[${i}] = '${char}'.`,
      });

      if (char === ",") {
        push({
          phase: "comma",
          activeLine: 7,
          index: i,
          depth,
          union,
          product,
          callId,
          message:
            "Comma means OR. The current concatenation alternative is complete, so merge it into union.",
        });

        const oldUnion = copySet(union);
        const oldProduct = copySet(product);

        union = new Set([...union, ...product]);

        sync();

        push({
          phase: "union",
          activeLine: 8,
          index: i,
          depth,
          union,
          product,
          operation: "union",
          leftSet: oldUnion,
          rightSet: oldProduct,
          resultSet: union,
          callId,
          message:
            "OR / union: keep every word already collected and every word from the completed alternative.",
        });

        product = new Set([""]);

        sync();

        push({
          phase: "reset-product",
          activeLine: 9,
          index: i,
          depth,
          union,
          product,
          callId,
          message: "Start the next comma-separated alternative from ε.",
        });

        i += 1;

        sync();

        push({
          phase: "advance",
          activeLine: 10,
          index: i,
          depth,
          union,
          product,
          callId,
          message: "Move the parser past the comma.",
        });

        continue;
      }

      if (char === "{") {
        push({
          phase: "open-brace",
          activeLine: 12,
          index: i,
          depth,
          union,
          product,
          callId,
          message:
            "A brace is one operand. Recursively evaluate everything inside it to obtain all choices produced by that operand.",
        });

        const oldProduct = copySet(product);
        const nestedStart = i + 1;

        updateCall(callId, {
          status: "waiting",
        });

        const nested = parse(nestedStart, depth + 1, callId);

        const group = nested.values;

        i = nested.index;

        activeCallId = callId;

        updateCall(callId, {
          status: "active",
        });

        sync();

        push({
          phase: "group-return",
          activeLine: 13,
          index: Math.max(0, i - 1),
          depth,
          union,
          product,
          group,
          groupSource: {
            type: "nested",
            start: nestedStart,
            callId: nested.callId,
            expression: getCallSlice(expression, nestedStart),
          },
          callId,
          message:
            `The nested operand produced ${formatSet(sorted(group))}. ` +
            "Those choices are stored in group.",
        });

        product = concatenate(product, group);

        sync();

        push({
          phase: "concatenate",
          activeLine: 14,
          index: Math.max(0, i - 1),
          depth,
          union,
          product,
          group,
          groupSource: {
            type: "nested",
            start: nestedStart,
            callId: nested.callId,
            expression: getCallSlice(expression, nestedStart),
          },
          operation: "product",
          leftSet: oldProduct,
          rightSet: group,
          resultSet: product,
          callId,
          message:
            "Adjacency means AND: concatenate every prefix already built with every choice from this operand.",
        });

        continue;
      }

      const group = new Set([char]);

      push({
        phase: "literal",
        activeLine: 17,
        index: i,
        depth,
        union,
        product,
        group,
        groupSource: {
          type: "literal",
          index: i,
          expression: char,
        },
        callId,
        message: `The literal '${char}' is one operand with one choice, so group = {'${char}'}.`,
      });

      const oldProduct = copySet(product);

      i += 1;

      sync();

      push({
        phase: "advance",
        activeLine: 18,
        index: i,
        depth,
        union,
        product,
        group,
        groupSource: {
          type: "literal",
          index: i - 1,
          expression: char,
        },
        callId,
        message: `Move past the literal '${char}'.`,
      });

      product = concatenate(product, group);

      sync();

      push({
        phase: "concatenate",
        activeLine: 19,
        index: Math.max(0, i - 1),
        depth,
        union,
        product,
        group,
        groupSource: {
          type: "literal",
          index: i - 1,
          expression: char,
        },
        operation: "product",
        leftSet: oldProduct,
        rightSet: group,
        resultSet: product,
        callId,
        message: `Adjacency means AND: append '${char}' to every prefix in product.`,
      });
    }

    const oldUnion = copySet(union);
    const oldProduct = copySet(product);

    union = new Set([...union, ...product]);

    sync();

    push({
      phase: "final-union",
      activeLine: 21,
      index: Math.min(i, expression.length),
      depth,
      union,
      product,
      operation: "union",
      leftSet: oldUnion,
      rightSet: oldProduct,
      resultSet: union,
      callId,
      message:
        "This alternative has ended. Merge its completed words into the OR / union result.",
    });

    if (i < expression.length && expression[i] === "}") {
      push({
        phase: "close-brace",
        activeLine: 23,
        index: i,
        depth,
        union,
        product,
        callId,
        message: "The closing brace ends this recursive operand.",
      });

      i += 1;

      sync();

      push({
        phase: "leave-brace",
        activeLine: 24,
        index: i,
        depth,
        union,
        product,
        callId,
        message:
          "Move past the closing brace. The complete set can now be returned to the parent as one group of choices.",
      });
    }

    const result = copySet(union);

    updateCall(callId, {
      index: i,
      union: sorted(union),
      product: sorted(product),
      returnValue: sorted(result),
      status: "returned",
    });

    push({
      phase: "return",
      activeLine: 26,
      index: Math.min(i, expression.length),
      depth,
      union,
      product,
      group: result,
      resultSet: result,
      result,
      callId,
      message:
        `parse(${start}) returns ${formatSet(sorted(result))} ` +
        `and cursor i = ${i}. The parent treats this returned set as one operand's choices.`,
    });

    frames.pop();

    if (parentCallId !== null) {
      activeCallId = parentCallId;

      updateCall(parentCallId, {
        status: "active",
      });
    } else {
      activeCallId = null;
    }

    return {
      values: result,
      index: i,
      callId,
    };
  }

  const parsed = parse(0, 0);

  const result = sorted(parsed.values);

  steps.push({
    phase: "parsed",
    activeLine: 28,
    index: expression.length,
    depth: 0,

    union: result,
    product: [],
    group: result,

    groupSource: null,

    operation: null,
    leftSet: [],
    rightSet: [],
    resultSet: result,

    frames: [],
    calls: snapshotCalls(),
    activeCallId: null,

    result,

    message:
      "The complete expression has been reduced using only two ideas: comma = OR / union, adjacency = AND / concatenation.",
  });

  steps.push({
    phase: "done",
    activeLine: 29,
    index: expression.length,
    depth: 0,

    union: result,
    product: [],
    group: result,

    groupSource: null,

    operation: null,
    leftSet: [],
    rightSet: [],
    resultSet: result,

    frames: [],
    calls: snapshotCalls(),
    activeCallId: null,

    result,

    message:
      `Remove duplicates naturally with sets, sort, and return ${result.length} distinct ` +
      `word${result.length === 1 ? "" : "s"}.`,
  });

  return steps;
}

function PanelBody({ children, className = "" }) {
  return <div className={`bei-panel-body ${className}`}>{children}</div>;
}

function Section({ title, meta, children, className = "" }) {
  return (
    <section className={`bei-section ${className}`}>
      <div className="bei-section-header">
        <span className="bei-section-title">{title}</span>

        {meta !== undefined && meta !== null && (
          <span className="bei-section-meta">{meta}</span>
        )}
      </div>

      {children}
    </section>
  );
}

function SetTokens({ values = [], emptyLabel = "∅", className = "" }) {
  if (!values.length) {
    return (
      <div className={`bei-set bei-set-empty ${className}`}>{emptyLabel}</div>
    );
  }

  return (
    <div className={`bei-set ${className}`}>
      <AnimatePresence initial={false}>
        {values.map((value, index) => (
          <motion.span
            layout
            key={`${value === "" ? "__epsilon__" : value}-${index}`}
            className="bei-set-token"
            initial={{
              opacity: 0,
              scale: 0.86,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.86,
            }}
            transition={{
              duration: 0.16,
            }}
          >
            {displayWord(value)}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

/*
 * The conceptual layer.
 *
 * This deliberately comes before the implementation-state cards.
 * A learner should understand:
 *
 * comma      -> OR  -> union
 * adjacency  -> AND -> Cartesian concatenation -> product
 * operand    -> choices -> group
 *
 * before being asked to understand the Python variable names.
 */
function ConceptModel({ step }) {
  const operation = step?.operation;

  const isUnion =
    operation === "union" ||
    step?.phase === "comma" ||
    step?.phase === "final-union" ||
    step?.phase === "reset-product";

  const isProduct =
    operation === "product" ||
    step?.phase === "literal" ||
    step?.phase === "group-return";

  let headline = "Two operations solve the expression";
  let explanation =
    "A comma means choose either alternative. Adjacent operands mean combine every choice from both sides.";

  if (isUnion) {
    headline = "Comma means OR";
    explanation =
      "The current alternative is finished. Keep its words together with all previously completed alternatives.";
  } else if (isProduct) {
    headline = "Adjacency means AND";
    explanation =
      "The next operand continues the same alternative. Combine every prefix already built with every choice from that operand.";
  } else if (step?.phase === "open-brace") {
    headline = "A brace becomes one operand";
    explanation =
      "First solve the expression inside the brace. The complete returned set then becomes the choices of one operand.";
  } else if (step?.phase === "return") {
    headline = "Return choices to the parent";
    explanation =
      "This recursive expression is finished. Its complete union becomes one group that the parent can concatenate.";
  } else if (step?.phase === "done" || step?.phase === "parsed") {
    headline = "OR + AND produced the answer";
    explanation =
      "Union handled comma-separated alternatives; Cartesian concatenation handled adjacent operands.";
  }

  return (
    <div className="bei-concept-model">
      <div className="bei-concept-intro">
        <div>
          <span className="bei-concept-kicker">Core intuition</span>
          <strong>{headline}</strong>
        </div>

        <span className="bei-concept-depth">
          {step ? `recursive depth ${step.depth ?? 0}` : "before parsing"}
        </span>
      </div>

      <p className="bei-concept-explanation">{explanation}</p>

      <div className="bei-concept-rules">
        <motion.div
          className={`bei-concept-rule bei-concept-rule--or ${
            isUnion ? "active" : ""
          }`}
          animate={{
            scale: isUnion ? 1.015 : 1,
          }}
        >
          <div className="bei-concept-symbol">,</div>

          <div className="bei-concept-rule-copy">
            <strong>OR</strong>
            <span>Choose alternatives</span>
            <code>union</code>
          </div>

          <div className="bei-concept-rule-example">{"{a,b} → {a,b}"}</div>
        </motion.div>

        <motion.div
          className={`bei-concept-rule bei-concept-rule--and ${
            isProduct ? "active" : ""
          }`}
          animate={{
            scale: isProduct ? 1.015 : 1,
          }}
        >
          <div className="bei-concept-symbol">×</div>

          <div className="bei-concept-rule-copy">
            <strong>AND</strong>
            <span>Concatenate adjacent operands</span>
            <code>product</code>
          </div>

          <div className="bei-concept-rule-example">
            {"{a,b}{c,d} → {ac,ad,bc,bd}"}
          </div>
        </motion.div>
      </div>

      <div className="bei-concept-translation">
        <div className="bei-concept-translation-item">
          <span>one operand</span>
          <strong>→</strong>
          <code>group</code>
          <small>choices produced by that operand</small>
        </div>

        <div className="bei-concept-translation-item">
          <span>same alternative</span>
          <strong>→</strong>
          <code>product</code>
          <small>prefixes built by concatenation</small>
        </div>

        <div className="bei-concept-translation-item">
          <span>different alternatives</span>
          <strong>→</strong>
          <code>union</code>
          <small>completed choices joined by OR</small>
        </div>
      </div>
    </div>
  );
}

function SetState({
  title,
  codeName,
  description,
  symbol,
  values,
  tone,
  concept,
}) {
  return (
    <div className={`bei-state ${tone || ""}`}>
      <div className="bei-state-header">
        <div>
          <span>{title}</span>

          {codeName && <code>{codeName}</code>}
        </div>

        <strong>{symbol}</strong>
      </div>

      {concept && <div className="bei-state-concept">{concept}</div>}

      {description && (
        <div className="bei-state-description">{description}</div>
      )}

      <SetTokens values={values} />
    </div>
  );
}

function UnionOperation({ step }) {
  return (
    <motion.div
      key={`${step.phase}-${step.index}-${step.depth}`}
      className="bei-union-operation"
      initial={{
        opacity: 0,
        y: 5,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      <div className="bei-operation-concept-label">
        <strong>OR</strong>
        <span>
          The comma separates alternatives, so we keep the results from both
          sides.
        </span>
      </div>

      <div className="bei-union-explanation">
        A comma does not concatenate these words. It says that words from either
        alternative are valid answers.
      </div>

      <div className="bei-union-row">
        <div className="bei-union-side">
          <span>Previous alternatives</span>

          <SetTokens values={step.leftSet} />
        </div>

        <strong className="bei-union-symbol">∪</strong>

        <div className="bei-union-side">
          <span>Current alternative</span>

          <SetTokens values={step.rightSet} />
        </div>

        <strong className="bei-union-symbol">→</strong>

        <div className="bei-union-side bei-union-result">
          <span>All valid alternatives</span>

          <SetTokens values={step.resultSet} />
        </div>
      </div>

      <div className="bei-operation-code-map">
        Concept: <strong>OR</strong>
        <span>→</span>
        Code: <code>union |= product</code>
      </div>
    </motion.div>
  );
}

function ProductOperation({ step }) {
  const source = step.groupSource;

  const rightDescription =
    source?.type === "nested"
      ? `The recursive operand returned ${formatSet(step.rightSet)}. Every returned word is one possible choice.`
      : source?.type === "literal"
        ? `The literal '${source.expression}' is one operand with one possible choice.`
        : "These are the choices supplied by the current operand.";

  return (
    <div className="bei-product-operation">
      <div className="bei-operation-concept-label">
        <strong>AND</strong>
        <span>
          These operands are adjacent, so every existing prefix must be combined
          with every current choice.
        </span>
      </div>

      <CartesianExpansion
        left={step.leftSet}
        right={step.rightSet}
        result={step.resultSet}
        leftTitle="Prefixes built so far"
        rightTitle="Current operand choices"
        resultTitle="New prefixes"
        leftDescription={
          "product before this operand — every partial word built in the current alternative."
        }
        rightDescription={rightDescription}
        leftItemName="prefix"
        rightItemName="choice"
        resultItemName="prefix"
        operationLabel="append"
        combine={(prefix, choice) => prefix + choice}
        emptyLabel="The Cartesian-product expansion appears when two operands are concatenated."
      />

      <div className="bei-operation-code-map">
        Concept: <strong>AND / concatenate</strong>
        <span>→</span>
        Code: <code>{"{a + b for a in product for b in group}"}</code>
      </div>
    </div>
  );
}

function OperationView({ step }) {
  if (!step?.operation) {
    return (
      <div className="bei-operation-empty">
        <strong>No set operation on this step.</strong>

        <span>
          When a comma completes an alternative, you will see OR / union here.
          When another operand continues the same alternative, you will see AND
          / Cartesian concatenation.
        </span>
      </div>
    );
  }

  if (step.operation === "union") {
    return <UnionOperation step={step} />;
  }

  return <ProductOperation step={step} />;
}

function GroupExplanation({ step }) {
  const values = step?.group ?? [];

  if (!values.length) {
    return (
      <div className="bei-group-empty">
        <div className="bei-group-empty-symbol">?</div>

        <div>
          <strong>
            <code>group</code> means one operand&apos;s choices
          </strong>

          <span>
            It is not a special part of the brace syntax. It is simply the
            temporary set produced by whatever operand we just read.
          </span>

          <div className="bei-group-examples">
            <span>
              literal <code>a</code>
              {" → "}
              <code>{"{a}"}</code>
            </span>

            <span>
              brace <code>{"{b,c}"}</code>
              {" → "}
              <code>{"{b,c}"}</code>
            </span>
          </div>
        </div>
      </div>
    );
  }

  const source = step.groupSource;

  return (
    <motion.div
      key={`${source?.type}-${source?.index ?? source?.start}-${values.join("-")}`}
      className="bei-group-explanation"
      initial={{
        opacity: 0,
        y: 4,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      <div className="bei-group-explanation-header">
        <div>
          <span className="bei-group-concept-label">ONE OPERAND</span>
          <strong>Choices produced by this operand</strong>
          <code>group</code>
        </div>

        <SetTokens values={values} />
      </div>

      <div className="bei-group-source">
        {source?.type === "nested" ? (
          <>
            The brace was evaluated recursively.{" "}
            <code>parse({source.start})</code> returned{" "}
            <code>{formatSet(values)}</code>. The parent now treats that entire
            returned set as the choices of <strong>one operand</strong>.
          </>
        ) : source?.type === "literal" ? (
          <>
            The operand is the literal <code>{source.expression}</code>. A
            literal has exactly one choice, so{" "}
            <code>group = {formatSet(values)}</code>.
          </>
        ) : (
          <>These values are all choices produced by the current operand.</>
        )}
      </div>

      <div className="bei-group-next">
        <span>Next question:</span>

        <strong>
          Should these choices be concatenated with the current{" "}
          <code>product</code>?
        </strong>

        <span>
          Yes — if this operand is adjacent to the previous operand in the same
          alternative.
        </span>
      </div>
    </motion.div>
  );
}

function InlineResult({ step }) {
  const complete = step?.phase === "parsed" || step?.phase === "done";

  if (!complete) {
    return null;
  }

  const result = step?.result ?? [];

  return (
    <Section
      title="Expanded words"
      meta={`${result.length} distinct`}
      className="bei-inline-result"
    >
      <div className="bei-final-explanation">
        All comma-separated alternatives have been unioned, all adjacent
        operands have been concatenated, and duplicate words have been removed
        by the sets.
      </div>

      <SetTokens values={result} className="bei-result-set" />

      {step.phase === "done" && (
        <div className="bei-answer">
          [{result.map((word) => `"${word}"`).join(", ")}]
        </div>
      )}
    </Section>
  );
}

function ExpressionPanel({
  expression,
  step,
  setExpression,
  applyExample,
  handleReset,
}) {
  const pointerIndex =
    step?.index >= 0 && step.index < expression.length ? step.index : null;

  return (
    <PanelBody>
      <div className="bei-input-panel">
        <div className="bei-example-row">
          {EXAMPLES.map((example, index) => {
            const exampleValue = example.expression ?? example.input ?? "";

            return (
              <button
                key={example.label ?? `${exampleValue}-${index}`}
                type="button"
                className={`bei-example-chip ${
                  expression === exampleValue ? "active" : ""
                }`}
                onClick={() => applyExample(example)}
              >
                {example.label ?? `Example ${index + 1}`}
              </button>
            );
          })}
        </div>

        <label className="bei-field">
          <div className="bei-field-header">
            <span>expression</span>

            <span>
              {expression.length}/{MAX_LEN}
            </span>
          </div>

          <input
            className="bei-input"
            value={expression}
            maxLength={MAX_LEN}
            spellCheck={false}
            onChange={(event) => {
              const next = event.target.value
                .toLowerCase()
                .replace(/[^a-z{},]/g, "")
                .slice(0, MAX_LEN);

              setExpression(next);
              handleReset();
            }}
          />
        </label>
      </div>

      <AlgorithmNarrative {...braceNarrative(step, expression)} />

      <Section title="How to read the expression" meta="OR vs AND">
        <ConceptModel step={step} />
      </Section>

      <Section
        title="Expression scan"
        meta={pointerIndex === null ? "—" : `i = ${pointerIndex}`}
      >
        <PointerRail
          values={expression.split("")}
          pointers={
            pointerIndex === null
              ? []
              : [
                  {
                    id: "i",
                    label: "i",
                    index: pointerIndex,
                    tone: step?.phase === "close-brace" ? "warning" : "primary",
                  },
                ]
          }
        />
      </Section>

      <div className="bei-status">
        <span className="bei-status-phase">
          {step?.phase?.replaceAll("-", " ") ?? "ready"}
        </span>

        <span>
          {step?.message ?? "Press play or step forward to begin parsing."}
        </span>
      </div>

      <Section title="Algorithm state" meta="concept → code">
        <div className="bei-state-grid">
          <SetState
            title="OR results"
            codeName="union"
            concept="Different comma-separated alternatives"
            description="Completed words from alternatives we have already finished."
            symbol="∪"
            values={step?.union ?? []}
            tone="union"
          />

          <SetState
            title="AND combinations"
            codeName="product"
            concept="Adjacent operands in the current alternative"
            description="Partial words currently being constructed by concatenation."
            symbol="×"
            values={step?.product ?? []}
            tone="product"
          />
        </div>
      </Section>

      <Section title="Current operand" meta="group">
        <GroupExplanation step={step} />
      </Section>

      <Section
        title={
          step?.operation === "union"
            ? "OR — combine alternatives"
            : step?.operation === "product"
              ? "AND — expand combinations"
              : "Current operation"
        }
        meta={
          step?.operation === "union"
            ? "∪"
            : step?.operation === "product"
              ? "×"
              : "—"
        }
      >
        <OperationView step={step} />
      </Section>

      <InlineResult step={step} />
    </PanelBody>
  );
}

function ParserPanel({ step, expression }) {
  const calls = step?.calls ?? [];

  return (
    <PanelBody className="bei-parser-panel">
      <Section title="Why recursion?" meta="nested braces">
        <div className="bei-recursion-intuition">
          <div className="bei-recursion-flow">
            <span className="bei-recursion-box">see {"{"}</span>
            <strong>→</strong>
            <span className="bei-recursion-box">parse inside</span>
            <strong>→</strong>
            <span className="bei-recursion-box">get choices</span>
            <strong>→</strong>
            <span className="bei-recursion-box">
              use as <code>group</code>
            </span>
          </div>

          <p>
            A nested brace is itself a complete brace-expansion problem. Solve
            it first, then return all of its possible words to the parent as one
            operand&apos;s choices.
          </p>
        </div>
      </Section>

      <Section
        title="Recursive call tree"
        meta={
          calls.length
            ? `${calls.length} call${calls.length === 1 ? "" : "s"}`
            : "waiting"
        }
      >
        <div className="bei-call-tree-help">
          Each box is one <code>parse(start)</code> call. A child appears when
          its parent encounters an opening brace. The child&apos;s return value
          becomes the parent&apos;s <code>group</code>.
        </div>

        <RecursiveCallTree
          nodes={calls}
          activeNodeId={step?.activeCallId}
          getTitle={(node) => `parse(${node.start})`}
          getSubtitle={(node) => {
            const source = node.source || getCallSlice(expression, node.start);

            return source ? `"${source}"` : "end of expression";
          }}
          getState={(node) => [
            {
              label: "OR · union",
              values: node.union ?? [],
            },
            {
              label: "AND · product",
              values: node.product ?? [],
            },
          ]}
          getReturnValue={(node) => node.returnValue ?? []}
          emptyLabel="Step forward to create the first parse(0) call."
        />
      </Section>

      <Section
        title="Active stack"
        meta={`${step?.frames?.length ?? 0} active`}
      >
        {!step?.frames?.length ? (
          <div className="bei-empty">
            No recursive calls are currently executing.
          </div>
        ) : (
          <div className="bei-stack-path">
            {step.frames.map((frame, index) => {
              const active = index === step.frames.length - 1;

              return (
                <div
                  key={frame.callId}
                  className={`bei-stack-frame ${active ? "active" : ""}`}
                >
                  <div>
                    <strong>parse({frame.start})</strong>

                    <span>
                      depth {frame.depth}
                      {active ? " · executing" : " · waiting"}
                    </span>
                  </div>

                  <div className="bei-stack-frame-state">
                    <span>i = {frame.index}</span>

                    <span>union = {formatSet(frame.union)}</span>

                    <span>product = {formatSet(frame.product)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </PanelBody>
  );
}

export default function BraceExpansionIIVisualizer() {
  const initialExpression =
    EXAMPLES[0]?.expression ?? EXAMPLES[0]?.input ?? "{a,b}{c,{d,e}}";

  const [expression, setExpression] = useState(initialExpression);

  const value = expression.slice(0, MAX_LEN);

  const steps = useMemo(() => generateSteps(value), [value]);

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
    (example) => {
      setExpression(example.expression ?? example.input ?? "");

      handleReset();
    },
    [handleReset],
  );

  const expressionPanel = (
    <ExpressionPanel
      expression={value}
      step={step}
      setExpression={setExpression}
      applyExample={applyExample}
      handleReset={handleReset}
    />
  );

  const parserPanel = <ParserPanel step={step} expression={value} />;

  const codePanel = (
    <div className="bei-code-panel">
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        onActiveLineDomChange={setActiveLineDom}
        autoScroll={autoScrollCode}
      />
    </div>
  );

  const [panelDivs, setPanelDivs] = useState(null);

  /*
   * Main workspace:
   *
   * ┌─────────────────────────┬──────────────┐
   * │ Expression Expansion    │              │
   * │ OR / AND intuition      │              │
   * │ live operation          │  Code Trace  │
   * ├─────────────────────────┤              │
   * │ Recursive Parser        │              │
   * │ call tree + stack       │              │
   * └─────────────────────────┴──────────────┘
   *
   * Code stays on the right.
   * Results remain inline so they never consume
   * a large independent panel.
   */
  const panelConfigs = useMemo(
    () => [
      {
        id: "expression",
        title: "Expression Expansion",
      },
      {
        id: "parser",
        title: "Recursive Parser",
        dockMode: "split-bottom",
        ratio: 0.54,
      },
      {
        id: "code",
        title: "Code Trace",
        dockMode: "split-left",
        ratio: 0.62,
      },
    ],
    [],
  );

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="problem-shell bei-problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />

      {panelDivs && (
        <>
          {panelDivs.expression &&
            createPortal(expressionPanel, panelDivs.expression)}

          {panelDivs.parser && createPortal(parserPanel, panelDivs.parser)}

          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
        </>
      )}

      {showPatternOverlay && step && activeLineDom && (
        <div className="bei-pattern-overlay-host">
          <PatternOverlay step={step} activeLineDom={activeLineDom} />
        </div>
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
            showPatternOverlay={showPatternOverlay}
            onShowPatternOverlayChange={setShowPatternOverlay}
            patternOverlayLabel="Show pattern overlay"
            showPatternOverlayToggle
            autoScroll={autoScrollCode}
            onAutoScrollChange={setAutoScrollCode}
            autoScrollLabel="Auto-scroll code"
            showAutoScroll
          />
        </FloatingPanel>,
        document.body,
      )}
    </div>
  );
}
