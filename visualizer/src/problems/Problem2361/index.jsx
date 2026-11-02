import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import LaneCostView from "./LaneCostView";
import { buildTrace, code, parseInput, phases, python } from "./algorithm.js";

const definition = {
  number: "2361",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Object with regular, express (equal-length cost lists) and expressCost",
  url: "https://leetcode.com/problems/minimum-costs-using-the-train-line/description/",
  complexity: "O(n) time and O(n) output for n stops. The visualization caps n at 20 and each cost at 100; the official bounds are not verified in this draft.",
  examples: [
    { label: "Example", input: '{"regular":[1,6,9,5],"express":[5,2,3,10],"expressCost":8}' },
    { label: "Switch once", input: '{"regular":[9,9,1],"express":[1,1,9],"expressCost":2}' },
  ],
};

export default function MinimumCostsTrainLine() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <LaneCostView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          Each stop keeps two numbers: the cheapest cost to stand on the regular line and the cheapest cost to stand on the express line.
          {run ? ` Final answer: ${run.result.join(", ")}.` : ""} {step.costs.length ? `Known so far: ${step.costs.length} stop${step.costs.length === 1 ? "" : "s"}.` : ""}
        </p>
      )}
    />
  );
}
