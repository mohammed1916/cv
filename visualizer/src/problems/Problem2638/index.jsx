import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import KFreeView from "./KFreeView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "2638",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums and k (e.g. {"nums":[2,4,5,7],"k":2})',
  url: "https://leetcode.com/problems/count-the-number-of-k-free-subsets/",
  complexity: "O(n log n) time for n values, from the sort; the chain walk visits each value once after that, and the set gives constant-time membership. O(n) extra space. The visualization caps nums at 12 values from 1 to 40 and k at 10. The official modulo and integer-range rules are not restated here, so this trace returns the exact count.",
  examples: [
    { label: "Two chains of two", input: '{"nums":[2,4,5,7],"k":2}' },
    { label: "Three pairs", input: '{"nums":[1,2,3,4,5,6],"k":3}' },
    { label: "No conflicts", input: '{"nums":[1,3,5,7],"k":1}' },
    { label: "Empty input", input: '{"nums":[],"k":4}' },
  ],
};

export default function CountKFreeSubsets() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <KFreeView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <p>
          {step.message} Each chain is counted on its own, then the counts multiply because chains cannot conflict with each other.
        </p>
      )}
    />
  );
}
