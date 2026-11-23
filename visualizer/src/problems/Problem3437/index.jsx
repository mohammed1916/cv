import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import PathParityView from "./PathParityView";
import RecursiveCallTree from "../../components/shared/RecursiveCallTree";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const definition = {
  number: "3437",
  phases: [
    { id: "start", label: "Setup", description: "Start with an empty path and no results." },
    { id: "enter", label: "Extend", description: "Try every unused value at the next position." },
    { id: "reject", label: "Reject", description: "This value cannot follow the path." },
    { id: "place", label: "Place", description: "Append the value and recurse." },
    { id: "record", label: "Record", description: "The path is full; keep a copy." },
    { id: "undo", label: "Backtrack", description: "Remove the value and try the next one." },
    { id: "done", label: "Result", description: "Report every recorded permutation." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with n (e.g. {"n":4})',
  url: "https://leetcode.com/problems/permutations-iii/",
  complexity: "The search extends one path position at a time, trying each of the n values, so the work grows with the search tree; the result list itself grows factorially. The visualization caps n at 6.",
  question: "Generate permutations of 1 to n in which adjacent values never share the same parity.",
  approaches: [
    { name: "Depth-first search with pruning", intuition: "Build the path one value at a time and skip any value with the same parity as the last.", time: "Output-sensitive", space: "O(n)" },
  ],
  examples: [
    { label: "Three values", input: '{"n":3}' },
    { label: "Four values", input: '{"n":4}' },
    { label: "Five values", input: '{"n":5}' },
    { label: 'Two values', input: '{"n":2}' },
    { label: 'Largest n: 6', input: '{"n":6}' },
    { label: 'One value', input: '{"n":1}' },
  ],
};

export default function Problem3437Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <PathParityView run={run} step={step} />
          <RecursiveCallTree
            nodes={run.tree.slice(0, step.treeCount)}
            activeNodeId={step.nodeId ?? null}
            getTitle={node => node.choice}
            getSubtitle={node => node.subtitle}
            emptyLabel="No placements yet."
          />
        </>
      )}
      renderReasoning={({ run, step }) => (
        <p>
          {step.phase === "done"
            ? `Depth-first search tries values in increasing order, so the ${run.result.length} results come out sorted lexicographically.`
            : "Building left to right with values tried in increasing order keeps the output lexicographic; each dead end is undone before the next value is tried."}
        </p>
      )}
    />
  );
}
