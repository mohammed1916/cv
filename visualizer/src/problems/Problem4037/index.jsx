import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import SplitGcdView from "./SplitGcdView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "4037",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums (2 to 9 positive integers)',
  url: "https://leetcode.com/problems/maximum-valid-split-positions-ii/",
  complexity: "The straightforward version scores each of the n + 1 candidate arrays with prefix and suffix gcd tables, for O(n^2 log V) time and O(n) extra space per candidate. The visualization caps the array at 9 values; the official bounds are not verified in this draft.",
  examples: [
    { label: "Repeated pairs", input: '{"nums":[5,5,5]}' },
    { label: "Removal helps", input: '{"nums":[2,4,6]}' },
    { label: "Mixed factors", input: '{"nums":[6,3,9,12]}' },
  ],
};

export default function Problem4037Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SplitGcdView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} A split counts when the gcd of everything before it equals the gcd of everything after it.</p>}
    />
  );
}
