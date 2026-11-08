import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import TreeMarkView from "./TreeMarkView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const definition = {
  number: "3313",
  phases: [
    { id: "start", label: "Adjacency", description: "Turn the edges into neighbour lists." },
    { id: "measure", label: "Measure", description: "Breadth-first search from one source." },
    { id: "pick", label: "Far end", description: "The farthest node becomes one end of a longest path." },
    { id: "assign", label: "Assign", description: "Pick the farther of the two ends for this node." },
    { id: "done", label: "Result", description: "Report the answer for every starting node." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with n and edges (e.g. {"n":4,"edges":[[0,1],[1,2],[1,3]]})',
  url: "https://leetcode.com/problems/find-the-last-marked-nodes-in-tree/",
  complexity: "O(n) time and O(n) space: three breadth-first searches, then one comparison per node. The visualization accepts up to 12 nodes.",
  examples: [
    { label: "Branching tree", input: '{"n":6,"edges":[[0,1],[1,2],[1,3],[3,4],[3,5]]}' },
    { label: "Star", input: '{"n":4,"edges":[[0,1],[0,2],[0,3]]}' },
    { label: "Single edge", input: '{"n":2,"edges":[[1,0]]}' },
    { label: 'Single node', input: '{"n":1,"edges":[]}' },
    { label: 'Path with reversed edges', input: '{"n":4,"edges":[[3,2],[2,1],[1,0]]}' },
    { label: 'Largest star, 12 nodes', input: '{"n":12,"edges":[[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[0,11]]}' },
    { label: 'Long run: random tree of 12 nodes', input: '{"n":12,"edges":[[1,0],[2,1],[3,0],[4,0],[5,0],[6,1],[7,1],[8,3],[9,6],[10,6],[11,6]]}' },
  ],
};

export default function FindTheLastMarkedNodesInTree() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TreeMarkView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Answer: [${run.result.join(", ")}].` : ""}
        </p>
      )}
    />
  );
}
