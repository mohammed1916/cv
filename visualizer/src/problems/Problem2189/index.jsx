import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import HouseCardsView from "./HouseCardsView";
import { buildTrace, parseInput, code, python } from "./algorithm.js";

const definition = {
  phases: [
    { id: "start", label: "Base", description: "Zero cards make one empty house." },
    { id: "row", label: "Row size", description: "A row of this many triangles costs 3t - 1 cards and can be used once." },
    { id: "total", label: "Card count", description: "Add the houses that leave this many cards for the smaller rows." },
    { id: "done", label: "Result", description: "Report the ways for n cards." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with n (e.g. {"n":14})',
  url: "https://leetcode.com/problems/number-of-ways-to-build-house-of-cards/",
  complexity: "O(n * sqrt(n)) time and O(n) space for n cards: there are about sqrt(2n / 3) row sizes, and each one updates n totals. Results are taken modulo 1000000007. The visualization caps n at 40.",
  examples: [
    { label: "Eight cards", input: '{"n":8}' },
    { label: "Fourteen cards", input: '{"n":14}' },
  ],
};

export default function NumberOfWaysToBuildHouseOfCards() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <HouseCardsView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run && step.phase === "done" ? `Answer: ${run.result}.` : ""}
        </p>
      )}
    />
  );
}
