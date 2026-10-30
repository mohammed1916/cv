import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3272",
  phases: [
    { id: "setup", label: "Setup", description: "Start the set of good digit multisets." },
    { id: "palindrome", label: "Palindromes", description: "Build each palindrome with a nonzero first digit." },
    { id: "keep", label: "Keep", description: "Keep palindromes divisible by k." },
    { id: "skip", label: "Skip", description: "Skip palindromes that fail divisibility." },
    { id: "arrange", label: "Arrange", description: "Count arrangements of each good multiset." },
    { id: "leading", label: "No zero first", description: "Remove arrangements that start with 0." },
    { id: "add", label: "Add", description: "Add the arrangements to the total." },
    { id: "done", label: "Result", description: "Return the total." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Digit count n and divisor k (JSON, e.g. {"n": 3, "k": 5})',
  url: "",
  complexity: "Enumerates about 9 * 10^(ceil(n/2)-1) palindromes, then counts arrangements per distinct digit multiset. The visualization accepts n up to 6 and k up to 9. Official constraints were not obtained.",
  examples: [
    { label: "n 3, k 5 (search summary, not official)", input: '{"n": 3, "k": 5}' },
    { label: "n 1, k 4 (search summary, not official)", input: '{"n": 1, "k": 4}' },
  ],
};

export default function GoodIntegersVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <div>
          <IndexedSequence label="Palindromes with n digits" length={step.candidates.length}
            active={Math.max(0, step.index)} valueAt={index => step.candidates[index].text}
            roleAt={index => (step.candidates[index].divisible ? "divisible" : "")} />
          <p>Good digit multisets: distinct sorted keys of divisible palindromes. Total so far {step.total}. k = {run.input.k}.</p>
        </div>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
