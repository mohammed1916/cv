import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import GraphTraversalView from "../../components/shared/GraphTraversalView";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3244",
  phases: [
    { id: "setup", label: "Setup", description: "Start with the base chain of roads." },
    { id: "query", label: "Query", description: "Take the next added road." },
    { id: "edge", label: "Add road", description: "Record the road in the incoming list." },
    { id: "chain", label: "Relax", description: "Recompute distances from the new road onward." },
    { id: "store", label: "Store", description: "Save the recomputed distance." },
    { id: "record", label: "Record", description: "Record the distance to the last city." },
    { id: "done", label: "Result", description: "Return all answers." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Cities n and queries (JSON, e.g. {"n": 4, "queries": [[0,3],[0,2]]})',
  url: "https://leetcode.com/problems/shortest-distance-after-road-addition-queries-ii/",
  complexity: "This reference recomputes distances from v onward for each query: O(n * q) time and O(n + q) space. The official limits are larger, so this is not the optimized solution. The visualization accepts n up to 12 and 12 queries.",
  examples: [
    { label: "Four cities (from search summary)", input: '{"n": 4, "queries": [[0,3],[0,2]]}' },
    { label: "Five cities (illustrative)", input: '{"n": 5, "queries": [[0,2],[1,4],[2,4]]}' },
  ],
};

export default function RoadAdditionVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const tags = {}
        step.dist.forEach((value, index) => { tags[index] = `d=${value}` })
        return (
          <GraphTraversalView title="Roads and shortest distances from 0" n={run.input.n}
            edges={[...step.edges.map(([u, v]) => [u, v]), ...Array.from({ length: run.input.n - 1 }, (_, i) => [i, i + 1])]}
            directed
            current={step.x >= 0 ? step.x : null} neighbour={step.from >= 0 ? step.from : null}
            tags={tags} />
        )
      }}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
