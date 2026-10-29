import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import GraphTraversalView from "../../components/shared/GraphTraversalView";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2836",
  phases: [
    { id: "setup", label: "Setup", description: "Read the input." },
    { id: "table", label: "Jump table", description: "Build the 2^j pass tables." },
    { id: "search", label: "Try each start", description: "Walk the bits of k from each start." },
    { id: "result", label: "Result", description: "Report the best total." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "receiver and k (e.g. {\"receiver\": [2,0,1], \"k\": 4})",
  url: "https://leetcode.com/problems/maximize-value-of-function-in-a-ball-passing-game/",
  complexity: "O(n log k) time and O(n log k) space. The visualization caps n at 24 players.",
  examples: [
    { label: "Example 1", input: "{\"receiver\": [2, 0, 1], \"k\": 4}" },
    { label: "Example 2", input: "{\"receiver\": [1, 1, 1, 2, 3], \"k\": 3}" },
  ],
};

export default function Problem2836Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <GraphTraversalView
          title="Ball passing graph"
          n={step.n}
          edges={step.edges}
          directed={step.directed}
          current={step.current}
          visited={step.visited}
          done={step.done}
          tags={step.tags}
          notes={step.notes}
          showFrontier={false}
        />
      )}
      renderReasoning={({ step }) => <p>{step.detail}</p>}
    />
  );
}
