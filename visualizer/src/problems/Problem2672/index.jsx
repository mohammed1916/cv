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
    { label: 'Single element', input: '{"n":1,"queries":[[0,1]]}' },
    { label: 'Largest color value', input: '{"n":2,"queries":[[0,100000],[1,100000]]}' },
    { label: 'Long run: n = 50, 40 queries', input: '{"n":50,"queries":[[41,15906],[48,26512],[38,37118],[45,47725],[1,81115],[8,91722],[48,2328],[4,35719],[11,46325],[17,56931],[8,67538],[14,928],[21,11535],[27,22141],[17,32748],[24,66138],[30,76744],[37,87351],[27,97957],[34,31348],[40,41954],[46,52561],[37,63167],[43,96557],[0,7164],[6,17770],[46,28377],[3,61767],[9,72374],[16,82980],[6,93586],[13,26977],[19,37583],[9,48190],[16,58796],[22,92187],[29,2793],[19,13399],[26,24006],[32,57396]]}' },
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
            roleAt={(i) => (i === step.index ? 'changed' : i === step.neighbor ? 'neighbour checked' : step.colors[i] !== 0 && step.colors[i] === step.colors[i + 1] ? 'pair' : '')}
          />
          <p>Equal neighbours shown as pairs: {Array.from({ length: Math.max(0, run.input.n - 1) }, (_, i) => i).filter((i) => step.colors[i] !== 0 && step.colors[i] === step.colors[i + 1]).map((i) => `${i}-${i + 1}`).join(', ') || 'none'}</p>
          <output aria-label="Adjacent equal pairs">count = {step.count}</output>
          <p>Answer so far: [{step.answer.join(", ")}]</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
