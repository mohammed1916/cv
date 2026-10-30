import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3340",
  phases: [
    { id: "setup", label: "Setup", description: "Start both running sums at zero." },
    { id: "scan", label: "Scan", description: "Read each digit with its index." },
    { id: "add", label: "Add", description: "Add the digit to the sum for its index parity." },
    { id: "done", label: "Result", description: "Compare the two sums." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object: {"num": "1234"}',
  url: "https://leetcode.com/problems/check-balanced-string/",
  complexity: "O(n) time and O(1) extra space for a digit string of length n. The visualization accepts lengths up to 100.",
  examples: [
    { label: "Illustrative: balanced", input: '{"num": "1221"}' },
    { label: "Illustrative: unbalanced", input: '{"num": "1234"}' },
  ],
};

export default function Problem3340Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Digits of num" length={run.input.num.length}
            valueAt={index => run.input.num[index]} active={step.index}
            roleAt={index => (index % 2 === 0 ? "even index" : "odd index")} />
          <p>Even-index sum: {step.even} · Odd-index sum: {step.odd}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
