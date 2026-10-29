import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import GraphTraversalView from "../../components/shared/GraphTraversalView";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "1591",
  phases: [
    { id: "bounds", label: "Bounds", description: "Find the bounding rectangle of every color." },
    { id: "scan", label: "Scan", description: "Scan each color's rectangle for other colors." },
    { id: "edge", label: "Edges", description: "Record a must-be-painted-before edge." },
    { id: "order", label: "Order", description: "Remove colors with no remaining prerequisite." },
    { id: "done", label: "Result", description: "Report whether every color could be ordered." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Input JSON: {"targetGrid": [[...], ...]}',
  url: "https://leetcode.com/problems/strange-printer-ii/",
  complexity: "O(C * m * n) time for C colors on an m x n grid, plus O(C^2) for the graph. The visualization caps the grid at 12 x 12 and colors at 24.",
  examples: [
    { label: "Example 1", input: JSON.stringify({ targetGrid: [[1, 1, 1, 1], [1, 2, 2, 1], [1, 2, 2, 1], [1, 1, 1, 1]] }) },
    { label: "Example 2", input: JSON.stringify({ targetGrid: [[1, 1, 1, 1], [1, 1, 3, 3], [1, 1, 3, 4], [5, 5, 1, 4]] }) },
    { label: "Example 3", input: JSON.stringify({ targetGrid: [[1, 2, 1], [2, 1, 2], [1, 2, 1]] }) },
  ],
};

export default function StrangePrinterIIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <GraphTraversalView
          title="Must-be-painted-before graph (colors)"
          n={run.colors.length}
          labels={run.colors.map(String)}
          edges={step.edges}
          directed
          current={step.current}
          neighbour={step.neighbour}
          frontier={step.queue}
          frontierKind="stack"
          done={step.done}
          tags={step.tags}
        />
      )}
      renderReasoning={({ run }) => <p>{`Colors: ${run.colors.join(", ")}. The grid is printable exactly when this graph has no cycle.`}</p>}
    />
  );
}
