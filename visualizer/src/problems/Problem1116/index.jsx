import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "1116",
  phases: [
    { id: "start", label: "Start", description: "Start the zero, odd and even threads." },
    { id: "zero", label: "zero", description: "zero() waits for its permit and prints 0." },
    { id: "odd", label: "odd", description: "odd() prints the next odd number when released." },
    { id: "even", label: "even", description: "even() prints the next even number when released." },
    { id: "done", label: "Return", description: "Return the full sequence." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON object with n, 1 to 1000 (e.g. {"n":5})',
  url: "https://leetcode.com/problems/print-zero-even-odd/",
  complexity: "O(n) time and O(1) extra space beyond the output: each number is printed once, with one permit handoff.",
  examples: [
    { label: "n = 2", input: '{"n":2}' },
    { label: "n = 5", input: '{"n":5}' },
  ],
};

export default function PrintZeroEvenOddVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Printed sequence"
            length={run.tokens.length}
            valueAt={(index) => (index < step.printedCount ? run.tokens[index] : "·")}
            active={step.printedCount}
          />
          <dl aria-label="Permits">
            <dt>zeroPermit</dt>
            <dd>{step.zeroPermit ? "available" : "taken"}</dd>
            <dt>oddPermit</dt>
            <dd>{step.oddPermit ? "available" : "taken"}</dd>
            <dt>evenPermit</dt>
            <dd>{step.evenPermit ? "available" : "taken"}</dd>
          </dl>
        </>
      )}
      renderReasoning={({ step }) => (
        <>
          <p>zero() prints a 0 and then hands the turn to odd() or even(), depending on whether the next number is odd or even. That thread prints its number and hands the turn back to zero().</p>
          <p>The permits enforce the pattern 0, 1, 0, 2, 0, 3, and so on for any ordering of the threads.</p>
          <p>{step.message}</p>
        </>
      )}
    />
  );
}
