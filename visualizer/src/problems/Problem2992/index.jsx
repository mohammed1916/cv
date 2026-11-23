import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import PermutationGridView from "./PermutationGridView";
import RecursiveCallTree from "../../components/shared/RecursiveCallTree";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const phases = [
  { id: "start", label: "Setup", description: "Start with an empty count." },
  { id: "place", label: "Place", description: "Fill the next position." },
  { id: "assign", label: "Assign", description: "The gcd is 1, so keep the value." },
  { id: "reject", label: "Reject", description: "The gcd is above 1." },
  { id: "count", label: "Count", description: "A full permutation qualifies." },
  { id: "backtrack", label: "Backtrack", description: "Undo the choice and try another value." },
  { id: "done", label: "Result", description: "Report the total." },
];

const definition = {
  number: "2992",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Integer n from 1 to 6 (e.g. 4)",
  url: "https://leetcode.com/problems/number-of-self-divisible-permutations/",
  complexity: "Backtracking visits at most n! complete arrangements, so it runs in O(n! * n) time with O(n) space for the recursion. The visualization caps n at 6; the trace checks each value against the position with gcd.",
  question: "Count the permutations of 1 to n where each position is divisible by its value or by the value at that position.",
  approaches: [
    { name: "Backtracking with pruning", intuition: "Place values position by position and reject any value that breaks the divisibility rule.", time: "O(n!) pruned", space: "O(n)" },
  ],
  examples: [
    { label: "Small", input: "3" },
    { label: "Five positions", input: "5" },
    { label: "Smallest n", input: '1' },
    { label: "Two positions", input: '2' },
    { label: "Largest n", input: '6' },
  ],
};

export default function Problem2992Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <PermutationGridView run={run} step={step} />
          <RecursiveCallTree
            nodes={run.tree.slice(0, step.treeCount)}
            activeNodeId={step.nodeId ?? null}
            getTitle={node => node.choice}
            getSubtitle={node => node.subtitle}
            emptyLabel="No placements yet."
          />
        </>
      )}
      renderReasoning={({ step }) => (
        <p>{step.message}</p>
      )}
    />
  );
}
