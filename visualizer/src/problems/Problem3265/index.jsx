import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3265",
  phases: [
    { id: "setup", label: "Setup", description: "Pad the numbers to a common width." },
    { id: "reach", label: "Reach", description: "Collect every word reachable by one digit swap." },
    { id: "count", label: "Count", description: "Count an earlier number that is almost equal." },
    { id: "check", label: "Check", description: "Test an earlier number against the reach set." },
    { id: "done", label: "Result", description: "Return the count." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Numbers (JSON, e.g. {"nums": [123, 231]})',
  url: "https://leetcode.com/problems/count-almost-equal-pairs-i/",
  complexity: "O(n^2 * d^3) for n numbers with d digits: each number's one-swap reach is built and checked against earlier numbers. The visualization accepts 12 numbers up to 999999.",
  examples: [
    { label: "From statement example 3", input: '{"nums": [123, 231]}' },
    { label: "Leading zero case (illustrative, not from the statement)", input: '{"nums": [100, 1]}' },
  ],
};

export default function AlmostEqualPairsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <div>
          <IndexedSequence label="nums (padded to a common width)" length={run.input.nums.length}
            active={Math.max(0, step.j)} valueAt={index => step.texts[index]}
            roleAt={index => (index === step.i ? "candidate" : step.pairs.some(([a, b]) => a === index || b === index) ? "paired" : "")} />
          <p>Almost equal pairs so far: {step.count}</p>
        </div>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
