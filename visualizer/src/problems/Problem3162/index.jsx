import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import MatrixGrid from "../../components/shared/MatrixGrid";
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
  examples: [{ label: "Illustrative input", input: '{"nums1":[1,3,4],"nums2":[1,3,4],"k":1}' },
    { label: "Single value each", input: "{\"nums1\":[7],\"nums2\":[7],\"k\":1}" },
    { label: "Largest k", input: "{\"nums1\":[50,1],\"nums2\":[1,50],\"k\":50}" },
    { label: "Long run: 20 values each", input: "{\"nums1\":[12,30,5,44,17,8,23,41,3,36,19,50,26,9,33,14,47,6,28,21],\"nums2\":[30,12,44,5,8,17,41,23,36,3,50,19,9,26,47,14,6,33,21,28],\"k\":7}" },
  ],
};

export default function GoodPairsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const { nums1, nums2, k } = run.input;
        const good = (a, b) => nums1[a] % (nums2[b] * k) === 0;
        const matrix = nums1.map((_, a) => nums2.map((_, b) => (good(a, b) ? 1 : 0)));
        const checked = [];
        for (let a = 0; a < nums1.length; a += 1) {
          for (let b = 0; b < nums2.length; b += 1) {
            if (step.i >= 0 && (a < step.i || (a === step.i && b <= Math.max(step.j, 0)))) checked.push({ row: a, col: b });
          }
        }
        const goodSoFar = checked.filter(({ row, col }) => good(row, col));
        return (
          <>
            <MatrixGrid matrix={matrix} label="Pairs (nums1 rows, nums2 columns); 1 marks a good pair"
              activeCell={step.i >= 0 && step.j >= 0 ? { row: step.i, col: step.j } : null}
              highlightedCells={goodSoFar} dimmedCells={checked.filter(({ row, col }) => !good(row, col))} cellWidth={44} cellHeight={40} />
            <IndexedSequence label="nums1" length={nums1.length} valueAt={i => nums1[i]}
              active={step.i} roleAt={i => (i === step.i ? "active" : "")} />
            <IndexedSequence label="nums2" length={nums2.length} valueAt={i => nums2[i]}
              active={step.j} roleAt={i => (i === step.j ? "active" : "")} />
            <p>{`Count so far: ${step.count}`}</p>
          </>
        );
      }}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
