import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import HouseCardsView from "./HouseCardsView";
import { buildTrace, parseInput, code, python } from "./algorithm.js";

const definition = {
  phases: [
    { id: "start", label: "Base", description: "Zero cards make one empty house." },
    { id: "total", label: "Card count", description: "Fill the ways for this many cards." },
    { id: "row", label: "Row", description: "Add the houses that end with a row of this size on top." },
    { id: "filled", label: "Filled", description: "This card count is complete." },
    { id: "done", label: "Result", description: "Report the ways for n cards." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with n (e.g. {"n":14})',
  url: "https://leetcode.com/problems/number-of-ways-to-build-house-of-cards/",
  complexity: "O(n^2 / 3) time and O(n) space for n cards, since a row of t triangles costs 3t - 1 cards. Results are taken modulo 1000000007. The visualization caps n at 40; the official bounds are not verified here, and the count follows the draft's row-size rule without extra ordering constraints.",
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
