import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "start", label: "Setup", description: "Start with a zero total." },
    { id: "scan", label: "Scan", description: "Take the next number." },
    { id: "encrypt", label: "Encrypt", description: "Replace each digit with the largest digit." },
    { id: "add", label: "Add", description: "Add the encrypted value to the total." },
    { id: "done", label: "Result", description: "Return the total." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON object with nums",
  url: "https://leetcode.com/problems/find-the-sum-of-encrypted-integers/",
  complexity: "O(n * d) time and O(1) extra space for n numbers with d digits each. The visualization caps nums at 50 values.",
  examples: [
    { label: "Search snippet example (not verified against the full statement)", input: '{"nums":[10,21,31]}' },
    { label: "illustrative (not from the statement)", input: '{"nums":[523,7,95]}' },
  ],
};

export default function FindSumOfEncryptedIntegers() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="nums"
            length={run.input.nums.length}
            valueAt={(i) => run.input.nums[i]}
            active={step.index}
            roleAt={(i) => (i < step.encrypted.length ? "read" : "")}
          />
          <p>Encrypted so far: {step.encrypted.join(", ") || "none"} · total {step.total}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
