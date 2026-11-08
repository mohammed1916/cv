import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import GapBudgetView from "./GapBudgetView";
import { buildTrace, code, parseInput, phases, python } from "./algorithm.js";

const definition = {
  number: "2557",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with banned, n and maxSum (e.g. {"banned":[1,4,6],"n":6,"maxSum":4})',
  url: "https://leetcode.com/problems/maximum-number-of-integers-to-choose-from-a-range-ii/description/",
  complexity: "O(b log b + b log n) time for b banned values, since each gap is sized by binary search instead of walking the range. The visualization caps n at 100, banned at 20 values and maxSum at 1000;",
  examples: [
    { label: "Example", input: '{"banned":[1,4,6],"n":6,"maxSum":4}' },
    { label: "Budget limits", input: '{"banned":[4,3,5,7],"n":7,"maxSum":18}' },
    { label: 'Smallest case', input: '{"banned":[],"n":1,"maxSum":1}' },
    { label: 'Repeated banned value', input: '{"banned":[3,3],"n":4,"maxSum":6}' },
    { label: 'Twenty banned, largest limits', input: '{"banned":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],"n":100,"maxSum":1000}' },
    { label: 'Long run: fifteen banned, n 100', input: '{"banned":[83,54,12,77,37,51,36,16,19,2,35,27,66,63,25],"n":100,"maxSum":500}' },
  ],
};

export default function MaxIntegersFromRangeII() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <GapBudgetView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          Smaller numbers cost less, so the best choice takes the smallest allowed numbers first. The allowed numbers form gaps between banned values; in each gap the budget decides how many numbers fit, found by a binary search.
          {run ? ` Final answer: ${run.result}.` : ""} {step.message}
        </p>
      )}
    />
  );
}
