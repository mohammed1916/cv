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
        "Start this call with no completed alternatives and one empty prefix ε.",
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
            "The comma ends this concatenation alternative. Its completed prefixes now belong to the union.",
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
            "Add every completed prefix from this alternative to the union.",
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
          message: "Begin the next alternative with the empty prefix ε.",
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
            "This opening brace contains another expression. Parse it recursively to discover its choices.",
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
            `The nested call returned ${formatSet(sorted(group))}. ` +
            "These returned words are the choices stored in group.",
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
            "Expand every prefix built so far with every choice returned by the nested expression.",
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
        message: `The literal '${char}' gives one current operand choice: {'${char}'}.`,
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
        message: `Append the literal '${char}' to every prefix built so far.`,
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
        "There is no more input in this alternative. Add its final prefixes to the union.",
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
        message:
          "The closing brace marks the end of this recursive expression.",
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
          "Advance beyond the closing brace before returning to the parent call.",
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
      message: `parse(${start}) returns ${formatSet(
        sorted(result),
      )} and cursor i = ${i}.`,
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
      "The outer parse call has returned the complete set of distinct expanded words.",
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
      `Sort and return ${result.length} distinct ` +
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

function SetState({ title, codeName, description, symbol, values, tone }) {
  return (
    <div className={`bei-state ${tone || ""}`}>
      <div className="bei-state-header">
        <div>
          <span>{title}</span>

          {codeName && <code>{codeName}</code>}
        </div>

        <strong>{symbol}</strong>
      </div>

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
      <div className="bei-union-explanation">
        A comma separates alternatives. Completed words from both alternatives
        belong to the same result set.
      </div>

      <div className="bei-union-row">
        <div className="bei-union-side">
          <span>Words already collected</span>

          <SetTokens values={step.leftSet} />
        </div>

        <strong className="bei-union-symbol">∪</strong>

        <div className="bei-union-side">
          <span>Completed current alternative</span>

          <SetTokens values={step.rightSet} />
        </div>

        <strong className="bei-union-symbol">→</strong>

        <div className="bei-union-side bei-union-result">
          <span>All alternatives so far</span>

          <SetTokens values={step.resultSet} />
        </div>
      </div>
    </motion.div>
  );
}

function OperationView({ step }) {
  if (!step?.operation) {
    return (
      <div className="bei-operation-empty">
        When the parser performs a union or expands prefixes with another
        operand, the transformation will appear here.
      </div>
    );
  }

  if (step.operation === "union") {
    return <UnionOperation step={step} />;
  }

  const source = step.groupSource;

  const rightDescription =
    source?.type === "nested"
      ? `Returned by recursive call parse(${source.start}) for "${source.expression}".`
      : source?.type === "literal"
        ? `The current literal '${source.expression}' represents one possible choice.`
        : "Values supplied by the current operand.";

  return (
    <CartesianExpansion
      left={step.leftSet}
      right={step.rightSet}
      result={step.resultSet}
      leftTitle="Prefixes built so far"
      rightTitle="Current operand choices"
      resultTitle="New prefixes"
      leftDescription="product before this operation — partial words already constructed."
      rightDescription={rightDescription}
      leftItemName="prefix"
      rightItemName="choice"
      resultItemName="prefix"
      operationLabel="append"
      combine={(prefix, choice) => prefix + choice}
      emptyLabel="The Cartesian-product expansion will appear when an operand is concatenated."
    />
  );
}

function GroupExplanation({ step }) {
  const values = step?.group ?? [];

  if (!values.length) {
    return (
      <div className="bei-group-empty">
        <strong>What is group?</strong>

        <span>
          <code>group</code> is the set of choices produced by the current
          operand. It can come from one literal or from a completed recursive
          call.
        </span>
      </div>
    );
  }

  const source = step.groupSource;

  return (
    <div className="bei-group-explanation">
      <div className="bei-group-explanation-header">
        <div>
          <strong>Current operand choices</strong>

          <code>group</code>
        </div>

        <SetTokens values={values} />
      </div>

      <div className="bei-group-source">
        {source?.type === "nested" ? (
          <>
            The parser recursively evaluated <code>parse({source.start})</code>{" "}
            for <code>{source.expression}</code>. Its returned words become{" "}
            <code>group</code>.
          </>
        ) : source?.type === "literal" ? (
          <>
            The literal <code>{source.expression}</code> is one operand, so it
            creates the singleton set <code>{formatSet(values)}</code>.
          </>
        ) : (
          <>These are the choices available from the current operand.</>
        )}
      </div>
    </div>
  );
}

/*
 * Compact final-result presentation.
 *
 * The result is deliberately part of the expression
 * visualization instead of owning another Lumino split.
 */
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

      <Section title="Parser state">
        <div className="bei-state-grid">
          <SetState
            title="Completed alternatives"
            codeName="union"
            description="Words completed before or at a comma."
            symbol="∪"
            values={step?.union ?? []}
            tone="union"
          />

          <SetState
            title="Prefixes built so far"
            codeName="product"
            description="Partial words in the current alternative."
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
            ? "Combine alternatives"
            : step?.operation === "product"
              ? "Expand prefixes"
              : "Set operation"
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
          its parent encounters an opening brace. Completed children keep their
          return value so you can follow that value back into the parent.
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
              label: "union",
              values: node.union ?? [],
            },
            {
              label: "product",
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
            {step.frames.map((frame, index) => (
              <div
                key={frame.callId}
                className={`bei-stack-frame ${
                  index === step.frames.length - 1 ? "active" : ""
                }`}
              >
                <div>
                  <strong>parse({frame.start})</strong>

                  <span>depth {frame.depth}</span>
                </div>

                <span>i = {frame.index}</span>
              </div>
            ))}
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

  /*
   * PatternOverlay deliberately does NOT live in
   * this portal anymore.
   *
   * CodeTracePanel can be docked anywhere without
   * forcing the overlay to inherit the code panel's
   * clipping/positioning context.
   */
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
   * │                         │              │
   * ├─────────────────────────┤  Code Trace  │
   * │ Recursive Parser        │              │
   * │                         │              │
   * └─────────────────────────┴──────────────┘
   *
   * Expanded Words is intentionally rendered
   * inside Expression Expansion instead of
   * consuming a third Lumino split.
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

      {/*
       * Workspace-level overlay.
       *
       * activeLineDom still points to the actual
       * line inside the CodeTracePanel portal.
       * getBoundingClientRect() remains valid across
       * portals because all DOM nodes share the same
       * document coordinate system.
       */}
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
