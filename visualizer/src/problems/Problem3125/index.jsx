import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import LargestPartnerView from "./LargestPartnerView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const phases = [
  { id: "start", label: "Width", description: "Count the binary digits of n." },
  { id: "scan", label: "Scan", description: "Look at one bit of n." },
  { id: "set", label: "Set", description: "An open bit of n can carry a 1 in x." },
  { id: "skip", label: "Skip", description: "A set bit of n must stay 0 in x." },
  { id: "done", label: "Result", description: "Report the largest partner." },
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
  complexity: "O(log n) time and O(1) extra space: one pass over the binary digits of n. The visualization accepts n up to 10^9; the official bound is not verified here.",
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
          Every bit of n that is 0 (below its top bit) can be 1 in x without sharing a set bit with n. Setting all of them gives x = {run.result}, the largest such value below n.
        </p>
      )}
    />
  );
}
