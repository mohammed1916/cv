import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2729",
  phases: [
    { id: "build", label: "Write", description: "Write n, 2n and 3n as text, one after another." },
    { id: "join", label: "Join", description: "Join the three texts into one string." },
    { id: "sort", label: "Sort", description: "Sort the characters of the joined string." },
    { id: "done", label: "Result", description: "Compare the sorted characters with 123456789." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'n JSON object (e.g. {"n": 192})',
  url: "https://leetcode.com/problems/check-if-the-number-is-fascinating/",
  complexity: "O(1) time and space: the joined string has at most 11 characters for 100 <= n <= 999.",
  examples: [
    { label: "Example 1", input: '{"n": 192}' },
    { label: "Example 2", input: '{"n": 100}' },
  ],
};

export default function FascinatingNumberVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Joined digits s"
            length={step.text.length}
            valueAt={(index) => step.text[index]}
            active={-1}
            roleAt={(index) => (step.digits ? step.digits[index] : "")}
          />
          {step.digits && <p aria-label="Sorted digits">Sorted: {step.digits}</p>}
          {step.phase === "done" && <output aria-label="Fascinating check result">Fascinating: {String(run.result)}</output>}
        </>
      )}
      renderReasoning={({ step }) => (
        <>
          <p>A fascinating number joins n, 2n and 3n into a string that contains each digit 1 through 9 exactly once and no zeros.</p>
          <p>Sorting the joined characters gives a single canonical order, so the check is an exact comparison with "123456789".</p>
          <p>{step.message}</p>
        </>
      )}
    />
  );
}
