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
  complexity: "O(n) time and O(n) output for n stops. The visualization caps n at 20 and each cost at 100.",
  examples: [
    { label: "Example", input: '{"regular":[4,2,8,3],"express":[1,6,2,9],"expressCost":5}' },
    { label: "Switch once", input: '{"regular":[3,9,2],"express":[8,1,4],"expressCost":2}' },
    { label: 'One stop', input: '{"regular":[5],"express":[3],"expressCost":1}' },
    { label: 'Equal lines', input: '{"regular":[2,2,2],"express":[2,2,2],"expressCost":2}' },
    { label: 'Largest input: 20 stops', input: '{"regular":[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],"express":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"expressCost":100}' },
    { label: 'Long run: 20 stops', input: '{"regular":[16,44,42,7,92,97,3,68,59,22,5,58,99,13,9,97,31,20,35,34],"express":[19,39,82,56,19,39,100,68,52,61,68,27,76,7,20,24,99,92,21,50],"expressCost":37}' },
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
