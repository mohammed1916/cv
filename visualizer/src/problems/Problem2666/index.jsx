import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import OnceGateView from "./OnceGateView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "2666",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with calls, a list of argument lists (e.g. {"calls":[[1,2],[3],[]]})',
  url: "https://leetcode.com/problems/allow-one-function-call/",
  complexity: "O(c) time for c calls, with O(1) extra state beyond the recorded results. The visualization caps calls at 6 with up to 4 integer arguments each; the page caps calls at 6 for teaching. fn is a stand-in that sums its arguments.",
  examples: [
    { label: "Example", input: '{"calls":[[1,2],[3],[]]}' },
    { label: "Single call", input: '{"calls":[[4]]}' },
    { label: "No arguments", input: '{"calls":[[],[7]]}' },
  ],
};

export default function Problem2666Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <OnceGateView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Result: ${run.result.filter((r) => r.returned).length} real call(s), others undefined.` : ""}
        </p>
      )}
    />
  );
}
