import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "setup", label: "Setup", description: "Start with count 0 and the vowel set." },
    { id: "start", label: "Start", description: "Fix the start index of the substring." },
    { id: "extend", label: "Extend", description: "Extend the substring to the end index j." },
    { id: "measure", label: "Count", description: "Count vowels and consonants in s[i..j]." },
    { id: "check", label: "Check", description: "Test the equal-count and divisibility rule." },
    { id: "record", label: "Record", description: "Add a beautiful substring to the total." },
    { id: "done", label: "Result", description: "Return the total count." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object: {"s": "abba", "k": 1}',
  url: "https://leetcode.com/problems/count-beautiful-substrings-i/",
  complexity: "O(n^2) time and O(1) extra space for string length n. The visualization caps s at 50 letters.",
  examples: [
    { label: "Example 1", input: '{"s": "abba", "k": 1}' },
    { label: "Example 2", input: '{"s": "bcdf", "k": 1}' },
  ],
};

export default function CountBeautifulSubstringsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="s"
            length={run.input.s.length}
            valueAt={(index) => run.input.s[index]}
            active={step.j}
            roleAt={(index) => (step.i >= 0 && index >= step.i && index <= step.j ? "window" : "")}
          />
          <p>
            k = {run.input.k} · window s[{step.i}..{step.j}] · count so far: {step.count}
          </p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
