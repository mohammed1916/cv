import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import LargestPartnerView from "./LargestPartnerView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const phases = [
  { id: "start", label: "Top bit", description: "Clear the top bit of n in x." },
  { id: "scan", label: "Scan", description: "Read the next lower bit of n." },
  { id: "set", label: "Set", description: "Set that bit of x to 1." },
  { id: "done", label: "Result", description: "Report the largest x whose range AND is 0." },
];

const definition = {
  number: "3125",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Positive integer n (e.g. 22)",
  url: "https://leetcode.com/problems/maximum-number-that-makes-result-of-bitwise-and-zero/",
  complexity: "O(log n) time and O(1) extra space: one pass over the binary digits of n. The visualization accepts n up to 10^9.",
  examples: [
    { label: "Mixed bits", input: "22" },
    { label: "Power of two", input: "8" },
    { label: "Smallest", input: "1" },
  ],
};

export default function MaximumNumberZeroAndPartner() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <LargestPartnerView run={run} step={step} />}
      renderReasoning={({ run }) => (
        <p>
          Any x that keeps n's top bit shares that bit with n, so the range AND keeps it. Clearing the top bit and setting every lower bit gives x = {run.result}, and the range from x to n then has an AND of 0.
        </p>
      )}
    />
  );
}
