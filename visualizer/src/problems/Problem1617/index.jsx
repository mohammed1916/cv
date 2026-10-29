import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import TreeDiagram from "../../components/shared/TreeDiagram";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "1617",
  phases: [
    { id: "enumerate", label: "Subset", description: "Choose the next subset of cities as a bitmask." },
    { id: "connect", label: "Connect", description: "Check that the subset is connected and measure its largest distance." },
    { id: "count", label: "Count", description: "Add the subtree to the count for its max distance." },
    { id: "done", label: "Result", description: "Return the counts for every diameter." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Input JSON: {"n", "edges"} with 1-based cities',
  url: "https://leetcode.com/problems/count-subtrees-with-max-distance-between-cities/",
  complexity: "O(2^n * n^2) time and O(n) space for n cities. The visualization caps n at 10.",
  examples: [
    { label: "Example 1", input: JSON.stringify({ n: 4, edges: [[1, 2], [2, 3], [2, 4]] }) },
    { label: "Example 2", input: JSON.stringify({ n: 2, edges: [[1, 2]] }) },
    { label: "Example 3", input: JSON.stringify({ n: 3, edges: [[1, 2], [2, 3]] }) },
  ],
};

function circleLayout(n) {
  const cx = 220, cy = 150, radius = 110;
  return new Map(Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return [i, { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }];
  }));
}

export default function CountSubtreesVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const n = run.input.n;
        const nodes = Array.from({ length: n }, (_, i) => ({ id: i, val: i + 1 }));
        const edges = run.input.edges.map(([u, v]) => ({ fromId: u - 1, toId: v - 1 }));
        return <TreeDiagram positions={circleLayout(n)} nodes={nodes} edges={edges} activeIds={new Set(step.members)} />;
      }}
      renderReasoning={({ step }) => (
        <>
          <p>{`Subsets tried: ${step.tried}. Counts by max distance: [${step.answer.join(", ")}].`}</p>
        </>
      )}
    />
  );
}
