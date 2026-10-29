import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import LinkedListLane from "../../components/shared/LinkedListLane";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "1721",
  phases: [
    { id: "locate", label: "Locate", description: "Place the first pointer k nodes from the start." },
    { id: "scan", label: "Scan", description: "Advance the tail to the end so second reaches the k-th node from the end." },
    { id: "swap", label: "Swap", description: "Exchange the two node values." },
    { id: "done", label: "Result", description: "Return the list." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Input JSON: {"head": [...], "k": 2}',
  url: "https://leetcode.com/problems/swapping-nodes-in-a-linked-list/",
  complexity: "O(n) time and O(1) extra space for n nodes. The visualization caps the list at 30 nodes.",
  examples: [
    { label: "Example 1", input: JSON.stringify({ head: [1, 2, 3, 4, 5], k: 2 }) },
    { label: "Example 2", input: JSON.stringify({ head: [7, 9, 6, 6, 7, 8, 3, 0, 9, 5], k: 5 }) },
    { label: "Example 3", input: JSON.stringify({ head: [1], k: 1 }) },
    { label: "Example 4", input: JSON.stringify({ head: [1, 2], k: 1 }) },
  ],
};

export default function SwappingNodesVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const values = step.values;
        const nodes = values.map((value, id) => ({ id, value }));
        const pointers = [
          { label: "first", id: step.first, tone: "primary" },
          { label: "tail", id: step.tail, tone: "secondary" },
          { label: "second", id: step.second, tone: "primary" },
        ].filter(pointer => pointer.id !== null && pointer.id !== undefined);
        const roles = step.phase === "swap" || step.phase === "done" ? {} : { [step.tail]: "active" };
        if (step.second !== null && step.phase !== "done") roles[step.second] = "match";
        return <LinkedListLane title={`Linked list (k = ${run.input.k})`} nodes={nodes} pointers={pointers} roles={roles} />;
      }}
      renderReasoning={({ step }) => <p>{`Values at this step: [${step.values.join(", ")}]`}</p>}
    />
  );
}
