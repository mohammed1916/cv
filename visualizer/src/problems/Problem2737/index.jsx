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
  complexity: "Dijkstra: O((V + E) log V) with a heap in the Python solution; the trace uses a scan for the smallest open vertex, so it runs in O(V^2 + E). The visualization caps the graph at 12 vertices and 30 edges, and it requires non-negative integer weights (Dijkstra's requirement).",
  examples: [
    { label: "Two marked targets", input: JSON.stringify({ n: 4, edges: [[0, 1, 2], [1, 2, 3], [0, 2, 9], [2, 3, 1]], s: 0, marked: [2, 3] }) },
    { label: "Start is marked", input: JSON.stringify({ n: 3, edges: [[0, 1, 4]], s: 1, marked: [1] }) },
    { label: "Unreachable mark", input: JSON.stringify({ n: 3, edges: [[0, 1, 4]], s: 0, marked: [2] }) },
    { label: 'Single vertex marked', input: '{"n":1,"edges":[],"s":0,"marked":[0]}' },
    { label: 'Equal weight paths', input: '{"n":3,"edges":[[0,1,2],[0,2,2],[1,2,0]],"s":0,"marked":[1,2]}' },
    { label: 'No marked vertices', input: '{"n":2,"edges":[[0,1,5]],"s":1,"marked":[]}' },
    { label: 'Long run: 12 vertices', input: '{"n":12,"edges":[[0,3,3],[1,8,8],[2,1,5],[3,6,2],[4,11,7],[5,4,4],[6,9,9],[7,2,6],[8,7,1],[9,0,8],[10,5,3],[11,10,0],[0,3,5],[1,8,2],[2,1,7],[3,6,4],[4,11,9],[5,4,6],[6,9,1],[7,2,8],[8,7,3],[9,0,0],[10,5,5],[11,10,2],[0,3,7],[1,8,4],[2,1,9],[3,6,6],[4,11,1],[5,4,8]],"s":0,"marked":[11,6]}' },
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
