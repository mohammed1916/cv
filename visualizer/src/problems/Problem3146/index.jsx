import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: 3146,
  phases: [
    { id: "setup", label: "Setup", description: "Prepare an empty index map." },
    { id: "index", label: "Index s", description: "Record where each character of s sits." },
    { id: "sum", label: "Sum", description: "Add the index gap for each character of t." },
    { id: "done", label: "Result", description: "Return the total difference." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON: {"s": "abc", "t": "bac"}',
  url: "https://leetcode.com/problems/permutation-difference-between-two-strings/",
  complexity: "O(n) time and O(1) extra space, since the alphabet has at most 26 letters.",
  examples: [{ label: "Example 1", input: '{"s":"abc","t":"bac"}' },
    { label: "Single letter", input: "{\"s\":\"a\",\"t\":\"a\"}" },
    { label: "Reversed order", input: "{\"s\":\"abc\",\"t\":\"cba\"}" },
    { label: "Whole alphabet, reversed", input: "{\"s\":\"abcdefghijklmnopqrstuvwxyz\",\"t\":\"zyxwvutsrqponmlkjihgfedcba\"}" },
  ],
};

export default function PermutationDifferenceVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const { s: word, t: other } = run.input;
        const j = step.phase === "sum" ? step.index ?? -1 : -1;
        const sIndexOf = ch => word.indexOf(ch);
        return (
          <>
            <IndexedSequence label="String s (position of each letter)" length={word.length}
              valueAt={i => word[i]} active={j >= 0 ? sIndexOf(other[j]) : step.phase === "index" ? step.index ?? -1 : -1}
              roleAt={i => (j >= 0 && i === sIndexOf(other[j]) ? "matched" : "")} />
            <IndexedSequence label="String t (current letter in the sum)" length={other.length}
              valueAt={i => other[i]} active={j} roleAt={i => (i === j ? "active" : "")} />
            <p>Index map: {Object.entries(step.pos).map(([ch, i]) => `${ch}→${i}`).join(", ") || "empty"}</p>
            <p>Running total: {step.total}</p>
          </>
        );
      }}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
