import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "1115",
  phases: [
    { id: "setup", label: "Setup", description: "Create the two permits." },
    { id: "start", label: "Start", description: "Start both threads." },
    { id: "foo", label: "foo", description: "The foo thread waits for its permit, prints foo, and releases bar." },
    { id: "bar", label: "bar", description: "The bar thread waits for its permit, prints bar, and releases foo." },
    { id: "done", label: "Return", description: "Return the printed text." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON object with n, 1 to 1000 (e.g. {"n":2})',
  url: "https://leetcode.com/problems/print-foobar-alternately/",
  complexity: "O(n) time and O(1) extra space beyond the printed output: each thread prints n times.",
  examples: [
    { label: "n = 1", input: '{"n":1}' },
    { label: "n = 2", input: '{"n":2}' },
  ],
};

export default function PrintFooBarVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Printed output"
            length={run.tokens.length}
            valueAt={(index) => (index < step.printedCount ? run.tokens[index] : "·")}
            active={step.printedCount}
          />
          <dl aria-label="Permits">
            <dt>fooPermit</dt>
            <dd>{step.fooPermit ? "available" : "taken"}</dd>
            <dt>barPermit</dt>
            <dd>{step.barPermit ? "available" : "taken"}</dd>
          </dl>
        </>
      )}
      renderReasoning={({ step }) => (
        <>
          <p>foo() may print only when its permit is available. Each print hands the permit to the other thread, so output strictly alternates foo, bar, foo, bar.</p>
          <p>Playback runs the threads in a fixed order for clarity; the semaphores keep the same output under any real scheduling.</p>
          <p>{step.message}</p>
        </>
      )}
    />
  );
}
