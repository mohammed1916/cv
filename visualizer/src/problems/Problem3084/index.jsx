import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "start", label: "Setup", description: "Start with a zero count." },
    { id: "scan", label: "Scan", description: "Visit each character of s." },
    { id: "check", label: "Check", description: "Compare the character with c." },
    { id: "count", label: "Count", description: "Count one more occurrence of c." },
    { id: "done", label: "Result", description: "Apply the pair formula to the count." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with s and c (e.g. {"s":"abada","c":"a"})',
  url: "https://leetcode.com/problems/count-substrings-starting-and-ending-with-given-character/",
  complexity: "O(n) time and O(1) extra space. The visualization caps s at 50 characters.",
  examples: [
    { label: "Search snippet example (not verified against the full statement)", input: '{"s":"abada","c":"a"}' },
    { label: "Search snippet example (not verified against the full statement)", input: '{"s":"zzz","c":"z"}' },
    { label: "illustrative (not from the statement)", input: '{"s":"xbxxbx","c":"x"}' },
  ],
};

export default function CountSubstringsStartingAndEnding() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label={`s (c = "${run.input.c}")`}
            length={run.input.s.length}
            valueAt={(i) => run.input.s[i]}
            active={step.index}
            roleAt={(i) => (step.matches.includes(i) ? "read" : "")}
          />
          <p>Occurrences of c: {step.count}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
