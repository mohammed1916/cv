import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import GraphTraversalView from "../../components/shared/GraphTraversalView";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2924",
  phases: [
    { id: "setup", label: "Setup", description: "Start every team with in-degree 0." },
    { id: "edge", label: "Edges", description: "Each edge a -> b gives b one more stronger opponent." },
    { id: "candidates", label: "Candidates", description: "Find the teams with in-degree 0." },
    { id: "result", label: "Result", description: "Report the unique champion or -1." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with keys n and edges (e.g. {"n": 3, "edges": [[0,1],[1,2]]})',
  url: "https://leetcode.com/problems/find-champion-ii/",
  complexity: "O(n + m) time and O(n) space for n teams and m edges. The visualization caps n at 24 teams.",
  examples: [
    { label: "Example 1", input: '{"n": 3, "edges": [[0,1],[1,2]]}' },
    { label: "Example 2", input: '{"n": 4, "edges": [[0,2],[1,3],[1,2]]}' },
  ],
};

export default function Problem2924() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <GraphTraversalView title="Strength graph" n={step.n} edges={step.edges}
      directed tags={step.tags} current={step.current} neighbour={step.neighbour} done={step.done} showFrontier={false} />}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
