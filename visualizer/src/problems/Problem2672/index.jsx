import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2672",
  phases: [
    { id: "init", label: "Setup", description: "Start with uncolored positions and count 0." },
    { id: "query", label: "Query", description: "Read the next [index, color] query." },
    { id: "remove", label: "Remove", description: "Remove pairs created by the old color." },
    { id: "set", label: "Color", description: "Write the new color into the array." },
    { id: "add", label: "Add", description: "Add pairs created by the new color." },
    { id: "record", label: "Record", description: "Append the current pair count to the answer." },
    { id: "done", label: "Return", description: "Return the answer array." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with n and queries (e.g. {"n": 4, "queries": [[0, 2], [1, 2]]})',
  url: "https://leetcode.com/problems/number-of-adjacent-elements-with-the-same-color/",
  complexity: "O(q) time and O(n) space for q queries. The visualization caps n and q at 50.",
  examples: [
    { label: "n = 5, six queries", input: '{"n": 5, "queries": [[0, 3], [1, 3], [2, 4], [1, 4], [0, 4], [3, 3]]}' },
    { label: "n = 3, repeated color", input: '{"n": 3, "queries": [[1, 7], [1, 7], [0, 7], [2, 7]]}' },
  ],
};

export default function AdjacentSameColorVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="colors (0 = uncolored)"
            length={run.input.n}
            valueAt={(i) => step.colors[i]}
            active={step.index ?? -1}
          />
          <output aria-label="Adjacent equal pairs">count = {step.count}</output>
          <p>Answer so far: [{step.answer.join(", ")}]</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
