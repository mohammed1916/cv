import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import CoinWaysView from "./CoinWaysView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const phases = [
  { id: "start", label: "Start", description: "One way to make amount 0." },
  { id: "coin", label: "Coin", description: "Add one unlimited coin type." },
  { id: "extend", label: "Extend", description: "Count the ways that end in this coin." },
  { id: "fours", label: "4-coins", description: "Add the cases with 0, 1 or 2 coins of 4." },
  { id: "done", label: "Result", description: "Report the total modulo 1000000007." },
];

const definition = {
  number: "3183",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Target amount n (e.g. 10)",
  url: "https://leetcode.com/problems/the-number-of-ways-to-make-the-sum/",
  complexity: "O(n) time and O(n) space for amount n: one pass per unlimited coin type, then three lookups for the 4-coins. The visualization accepts amounts from 0 to 200; the bounds shown are this visualization's own limits.",
  examples: [
    { label: "Mixed sum", input: "10" },
    { label: "Single big coin", input: "6" },
    { label: "Zero", input: "0" },
    { label: "Smallest amount", input: "1" },
    { label: "Largest amount", input: "200" },
    { label: "Long run: amount 137", input: "137" },
  ],
};

export default function CoinWaysVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <CoinWaysView run={run} step={step} />}
      renderReasoning={({ run }) => (
        <p>
          The unlimited coins are counted first as a strip of amounts. The 4-coins are then limited to two, so only three remainders are added. The answer for this amount is {run.result}, modulo 1000000007.
        </p>
      )}
    />
  );
}
