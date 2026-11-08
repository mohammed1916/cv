import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import HelloCallView from "./HelloCallView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "2667",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with calls, a list of argument lists (e.g. {"calls":[[1,2],[],["x"]]})',
  url: "https://leetcode.com/problems/create-hello-world-function/",
  complexity: "O(1) work for each call, so O(c) for c calls. The visualization caps calls at 6 with up to 4 arguments each; the page caps calls at 6 for teaching.",
  examples: [
    { label: "Example", input: '{"calls":[[1,2],[],["x"]]}' },
    { label: "No arguments", input: '{"calls":[[]]}' },
    { label: 'Single empty call', input: '{"calls":[[]]}' },
    { label: 'Four arguments of mixed types', input: '{"calls":[[1,"a",true,null]]}' },
    { label: 'Six calls, mixed sizes', input: '{"calls":[[1],[2],[],["x","y"],[3,4],[5,6,7]]}' },
    { label: 'Long run: 6 calls, 16 arguments', input: '{"calls":[[1,2,3,4],[5,6,7,8],[],[9],[10,11],[12,13,14,15]]}' },
  ],
};

export default function Problem2667Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <HelloCallView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
