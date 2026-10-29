import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import CloneGraphStory from "./CloneGraphStory";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./CloneGraphVisualizer.css";

const definition = {
  phases: [
    { id: "start", label: "Start", description: "Begin with the starting node." },
    { id: "check-null", label: "Null check", description: "An empty graph returns nothing to clone." },
    { id: "init-map", label: "Map", description: "Create the map from original to clone." },
    { id: "init-queue", label: "Queue", description: "Queue the starting node." },
    { id: "clone-start", label: "Clone", description: "Clone the starting node." },
    { id: "check-queue", label: "Queue check", description: "Continue while nodes are queued." },
    { id: "pop", label: "Pop", description: "Take the next node from the queue." },
    { id: "next-neighbor", label: "Neighbour", description: "Visit the next neighbour." },
    { id: "check-neighbor", label: "Check", description: "Is the neighbour already cloned?" },
    { id: "clone-node", label: "Clone", description: "Create a clone for the neighbour." },
    { id: "enqueue", label: "Enqueue", description: "Queue the neighbour for processing." },
    { id: "clone-edge", label: "Link", description: "Link the clone to its neighbour." },
    { id: "queue-empty", label: "Queue empty", description: "Every reachable node has been cloned." },
    { id: "done", label: "Result", description: "Return the clone of the starting node." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Adjacency list (JSON object, e.g. {\"adj_list\": [[2,4],[1,3],[2,4],[1,3]]})",
  url: "https://leetcode.com/problems/clone-graph/",
  complexity: "O(V + E) time and space for V nodes and E edges. The visualization caps the graph at 100 nodes.",
  examples: getExamples("clone-graph").map(({ label, input }) => ({ label, input: JSON.stringify({ adj_list: JSON.parse(input) }) })),
};

export default function CloneGraphVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <CloneGraphStory story={run} step={step} stepIndex={Math.max(0, run.frames.indexOf(step))} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
