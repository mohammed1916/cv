import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: 3162,
  phases: [
    { id: "setup", label: "Setup", description: "Start with zero good pairs." },
    { id: "outer", label: "nums1", description: "Take the next element of nums1." },
    { id: "inner", label: "nums2", description: "Pair it with the next element of nums2." },
    { id: "check", label: "Check", description: "Test divisibility by nums2[j] * k." },
    { id: "done", label: "Result", description: "Return the number of good pairs." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON: {"nums1": [1,3,4], "nums2": [1,3,4], "k": 1}',
  url: "https://leetcode.com/problems/find-the-number-of-good-pairs-i/",
  complexity: "O(m * n) time and O(1) space for arrays of length m and n. The visualization caps each array at 20 values.",
  examples: [{ label: "Illustrative input", input: '{"nums1":[1,3,4],"nums2":[1,3,4],"k":1}' }],
};

export default function GoodPairsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="nums1" length={run.input.nums1.length} valueAt={i => run.input.nums1[i]}
            active={step.i} roleAt={i => (i === step.i ? "active" : "")} />
          <IndexedSequence label="nums2" length={run.input.nums2.length} valueAt={i => run.input.nums2[i]}
            active={step.j} roleAt={i => (i === step.j ? "active" : "")} />
          <p>Good pairs so far: {step.count}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
