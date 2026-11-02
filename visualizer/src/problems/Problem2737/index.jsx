import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import ClosestMarkedView from "./ClosestMarkedView";
import { code, python, parseInput, buildTrace, pythonLineMap, phases } from "./algorithm.js";

const definition = {
  number: "2737",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Graph JSON, e.g. {"n":4,"edges":[[0,1,2],[1,2,3]],"s":0,"marked":[2]}',
  url: "https://leetcode.com/problems/find-the-closest-marked-node/",
  complexity: "Dijkstra: O((V + E) log V) with a heap in the Python solution; the trace uses a scan for the smallest open vertex, so it runs in O(V^2 + E). The draft's numeric bounds are unverified, so the visualization caps the graph at 12 vertices and 30 edges, and it requires non-negative integer weights (Dijkstra's requirement).",
  examples: [
    { label: "Two marked targets", input: JSON.stringify({ n: 4, edges: [[0, 1, 2], [1, 2, 3], [0, 2, 9], [2, 3, 1]], s: 0, marked: [2, 3] }) },
    { label: "Start is marked", input: JSON.stringify({ n: 3, edges: [[0, 1, 4]], s: 1, marked: [1] }) },
    { label: "Unreachable mark", input: JSON.stringify({ n: 3, edges: [[0, 1, 4]], s: 0, marked: [2] }) },
  ],
};

export default function Problem2737Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ClosestMarkedView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Answer: ${run.answer}.` : ""}
        </p>
      )}
    />
  );
}
