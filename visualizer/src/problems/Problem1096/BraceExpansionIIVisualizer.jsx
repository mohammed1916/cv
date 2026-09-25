import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import PointerRail from "../../components/shared/PointerRail";

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

  for (const a of left) {
    for (const b of right) {
      result.add(a + b);
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

function generateSteps(expression) {
  if (!expression) return [];

  const steps = [];
  const frames = [];

  const snapshotFrames = () =>
    frames.map((frame) => ({
      depth: frame.depth,
      start: frame.start,
      index: frame.index,
      union: sorted(frame.union),
      product: sorted(frame.product),
    }));

  const push = ({
    phase,
    activeLine,
    index,
    depth,
    union,
    product,
    group = new Set(),
    operation = null,
    leftSet = new Set(),
    rightSet = new Set(),
    resultSet = new Set(),
    message,
    result = null,
  }) => {
    steps.push({
      phase,
      activeLine,
      index,
      depth,
      union: sorted(union),
      product: sorted(product),
      group: sorted(group),
      operation,
      leftSet: sorted(leftSet),
      rightSet: sorted(rightSet),
      resultSet: sorted(resultSet),
      frames: snapshotFrames(),
      message,
      result: result ? sorted(result) : null,
    });
  };

  function parse(start, depth) {
    let i = start;
    let union = new Set();
    let product = new Set([""]);

    const frame = {
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
    };

    sync();

    push({
      phase: "enter",
      activeLine: 2,
      index: i,
      depth,
      union,
      product,
      message:
        depth === 0
          ? "Start parsing the complete expression."
          : `Enter nested expression at recursion depth ${depth}.`,
    });

    push({
      phase: "initialize",
      activeLine: 4,
      index: i,
      depth,
      union,
      product,
      message: "Initialize union = ∅ and product = {ε}.",
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
          message: "Comma ends the current concatenation branch.",
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
          message: "Merge the completed branch into the union.",
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
          message: "Reset product to {ε} for the next alternative.",
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
          message: "Advance past the comma.",
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
          message: "Opening brace starts a nested expression.",
        });

        const oldProduct = copySet(product);
        const nested = parse(i + 1, depth + 1);
        const group = nested.values;

        i = nested.index;
        sync();

        push({
          phase: "group-return",
          activeLine: 13,
          index: Math.max(0, i - 1),
          depth,
          union,
          product,
          group,
          message: `Nested expression returns ${formatSet(sorted(group))}.`,
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
          operation: "product",
          leftSet: oldProduct,
          rightSet: group,
          resultSet: product,
          message: "Concatenate every current word with every nested result.",
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
        message: `'${char}' represents the singleton set {'${char}'}.`,
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
        message: "Advance to the next character.",
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
        operation: "product",
        leftSet: oldProduct,
        rightSet: group,
        resultSet: product,
        message: `Append '${char}' to every word in the current product.`,
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
      message: "Merge the final product into this expression’s union.",
    });

    if (i < expression.length && expression[i] === "}") {
      push({
        phase: "close-brace",
        activeLine: 23,
        index: i,
        depth,
        union,
        product,
        message: "The closing brace finishes this nested expression.",
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
        message: "Advance past the closing brace.",
      });
    }

    const result = copySet(union);

    push({
      phase: "return",
      activeLine: 26,
      index: Math.min(i, expression.length),
      depth,
      union,
      product,
      group: result,
      resultSet: result,
      message: `Return ${formatSet(sorted(result))} from depth ${depth}.`,
    });

    frames.pop();

    return {
      values: result,
      index: i,
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
    operation: null,
    leftSet: [],
    rightSet: [],
    resultSet: result,
    frames: [],
    result,
    message: "The complete expression has been evaluated.",
  });

  steps.push({
    phase: "done",
    activeLine: 29,
    index: expression.length,
    depth: 0,
    union: result,
    product: [],
    group: result,
    operation: null,
    leftSet: [],
    rightSet: [],
    resultSet: result,
    frames: [],
    result,
    message: `Return ${result.length} distinct word${result.length === 1 ? "" : "s"} in sorted order.`,
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
        {values.map((value) => (
          <motion.span
            layout
            key={value === "" ? "__epsilon__" : value}
            className="bei-set-token"
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.86 }}
            transition={{ duration: 0.16 }}
          >
            {displayWord(value)}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

function SetState({ title, symbol, values, tone }) {
  return (
    <div className={`bei-state ${tone || ""}`}>
      <div className="bei-state-header">
        <span>{title}</span>
        <strong>{symbol}</strong>
      </div>

      <SetTokens values={values} />
    </div>
  );
}

function OperationView({ step }) {
  if (!step?.operation) {
    return (
      <div className="bei-operation-empty">
        Set union and concatenation will appear here when performed.
      </div>
    );
  }

  const isUnion = step.operation === "union";

  return (
    <motion.div
      key={`${step.phase}-${step.index}-${step.depth}`}
      className="bei-operation"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bei-operation-row">
        <div className="bei-operation-set">
          <span>Left</span>
          <SetTokens values={step.leftSet} />
        </div>

        <strong className="bei-operation-symbol">{isUnion ? "∪" : "×"}</strong>

        <div className="bei-operation-set">
          <span>Right</span>
          <SetTokens values={step.rightSet} />
        </div>

        <strong className="bei-operation-symbol">→</strong>

        <div className="bei-operation-set bei-operation-result">
          <span>Result</span>
          <SetTokens values={step.resultSet} />
        </div>
      </div>

      {!isUnion && step.leftSet?.length > 0 && step.rightSet?.length > 0 && (
        <div className="bei-product-pairs">
          {step.leftSet.flatMap((left) =>
            step.rightSet.map((right) => (
              <span key={`${left}:${right}`} className="bei-product-pair">
                {displayWord(left)}
                <span>+</span>
                {displayWord(right)}
                <span>→</span>
                <strong>{displayWord(left + right)}</strong>
              </span>
            )),
          )}
        </div>
      )}
    </motion.div>
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
            const value = example.expression ?? example.input ?? "";

            return (
              <button
                key={example.label ?? `${value}-${index}`}
                type="button"
                className={`bei-example-chip ${
                  expression === value ? "active" : ""
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
            title="Union"
            symbol="∪"
            values={step?.union ?? []}
            tone="union"
          />

          <SetState
            title="Product"
            symbol="×"
            values={step?.product ?? []}
            tone="product"
          />

          <SetState
            title="Group"
            symbol="{ }"
            values={step?.group ?? []}
            tone="group"
          />
        </div>
      </Section>

      <Section
        title={
          step?.operation === "union"
            ? "Set union"
            : step?.operation === "product"
              ? "Cartesian-product concatenation"
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
    </PanelBody>
  );
}

function ParserPanel({ step }) {
  const frames = step?.frames ?? [];

  return (
    <PanelBody>
      <Section
        title="Call stack"
        meta={`${frames.length} frame${frames.length === 1 ? "" : "s"}`}
      >
        {!frames.length ? (
          <div className="bei-empty">No active recursive call.</div>
        ) : (
          <div className="bei-frame-list">
            <AnimatePresence initial={false}>
              {frames.map((frame, index) => {
                const active = index === frames.length - 1;

                return (
                  <motion.div
                    layout
                    key={`${frame.depth}-${frame.start}`}
                    className={`bei-frame ${active ? "active" : ""}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <div className="bei-frame-header">
                      <strong>parse({frame.start})</strong>

                      <span>depth {frame.depth}</span>
                    </div>

                    <div className="bei-frame-index">
                      <span>cursor</span>
                      <strong>i = {frame.index}</strong>
                    </div>

                    <div className="bei-frame-values">
                      <div>
                        <span className="bei-mini-label">union</span>
                        <SetTokens values={frame.union} />
                      </div>

                      <div>
                        <span className="bei-mini-label">product</span>
                        <SetTokens values={frame.product} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </Section>
    </PanelBody>
  );
}

function ResultPanel({ step }) {
  const complete = step?.phase === "parsed" || step?.phase === "done";

  const result = complete ? (step?.result ?? []) : [];

  return (
    <PanelBody>
      <Section
        title="Expanded words"
        meta={complete ? `${result.length} distinct` : "waiting"}
      >
        {complete ? (
          <SetTokens values={result} className="bei-result-set" />
        ) : (
          <div className="bei-empty">
            The sorted expansion appears after parsing completes.
          </div>
        )}
      </Section>

      {step?.phase === "done" && (
        <Section title="Return value">
          <div className="bei-answer">
            [{result.map((word) => `"${word}"`).join(", ")}]
          </div>
        </Section>
      )}
    </PanelBody>
  );
}

export default function BraceExpansionIIVisualizer() {
  const initialExpression = EXAMPLES[0]?.expression ?? EXAMPLES[0]?.input ?? "";

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

  const parserPanel = <ParserPanel step={step} />;

  const resultPanel = <ResultPanel step={step} />;

  const codePanel = (
    <CodeTracePanel
      step={step}
      codeLines={SOLUTION_CODE}
      onActiveLineDomChange={setActiveLineDom}
      autoScroll={autoScrollCode}
    />
  );

  const [panelDivs, setPanelDivs] = useState(null);

  const panelConfigs = useMemo(
    () => [
      {
        id: "code",
        title: "Code Trace",
      },
      {
        id: "expression",
        title: "Expression Expansion",
        dockMode: "split-right",
        ratio: 0.38,
      },
      {
        id: "parser",
        title: "Recursive Parser",
        dockMode: "split-bottom",
        ratio: 0.6,
      },
      {
        id: "result",
        title: "Expanded Words",
        dockMode: "split-bottom",
        ratio: 0.72,
      },
    ],
    [],
  );

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />

      {panelDivs && (
        <>
          {panelDivs.expression &&
            createPortal(expressionPanel, panelDivs.expression)}

          {panelDivs.parser && createPortal(parserPanel, panelDivs.parser)}

          {panelDivs.result && createPortal(resultPanel, panelDivs.result)}

          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
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

      {showPatternOverlay && step && (
        <PatternOverlay step={step} activeLineDom={activeLineDom} />
      )}
    </div>
  );
}
