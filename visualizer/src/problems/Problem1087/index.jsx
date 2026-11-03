import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import BraceExpansionView from "./BraceExpansionView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const definition = {
  phases: [
    { id: "start", label: "Start", description: "Begin the walk from the first group." },
    { id: "parse", label: "Groups", description: "Read each group and sort its letters." },
    { id: "enter", label: "Choose", description: "Pick the letters for the next group." },
    { id: "try", label: "Try", description: "Extend the prefix with one letter." },
    { id: "emit", label: "Emit", description: "A full prefix is one expansion." },
    { id: "done", label: "Result", description: "Return the sorted results." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Brace string (e.g. p{q,r}{s,t}z)",
  url: "https://leetcode.com/problems/brace-expansion/",
  complexity: "O(k * n) time for k expansions of length n, plus sorting the k results. Space is O(k * n) for the results and the recursion depth n. Repeated letters inside one group collapse to one option. The visualization caps the input at 30 characters and 64 expansions; these are visualization limits, not official bounds.",
  examples: [
    { label: "Two groups", input: "p{q,r}{s,t}z" },
    { label: "Sorted groups", input: "{x,w}yz{b,a}" },
    { label: "No braces", input: "kite" },
  ],
};

export default function Problem1087Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BraceExpansionView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <>
          <p>{step.message}</p>
          <p>Each group offers its letters in sorted order, so walking the groups left to right produces the results already sorted.</p>
        </>
      )}
    />
  );
}
