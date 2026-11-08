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
    { label: "Example 1", input: '{"nums":[14,9,302]}' },
    { label: "Example 2", input: '{"nums":[523,7,95]}' },
    { label: 'Single value', input: '{"nums":[1]}' },
    { label: 'Equal values', input: '{"nums":[7,7,7]}' },
    { label: 'Largest values', input: '{"nums":[1000,1000,999]}' },
    { label: 'Long run: 50 numbers', input: '{"nums":[565,606,411,564,81,314,615,24,309,470,619,444,41,866,759,360,869,166,419,988,657,946,7,376,765,678,819,20,145,146,447,888,837,958,843,604,521,642,879,832,653,822,867,740,193,186,455,176,341,982]}' },
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
