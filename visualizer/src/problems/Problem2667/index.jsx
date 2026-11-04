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
