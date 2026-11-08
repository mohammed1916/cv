import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import SwitcherView from "./SwitcherView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "3237",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with windows and activations (e.g. {"windows":4,"activations":[2,1,2,3]})',
  url: "https://leetcode.com/problems/alt-and-tab-simulation/",
  complexity: "O(n * m) time for n windows and m activations, because each activation searches and moves within a list of n windows. The visualization caps windows at 10 and activations at 30. Windows start as 1 to n in order, since the source gives no starting list.",
  examples: [
    { label: "Repeat and switch", input: '{"windows":4,"activations":[2,1,2,3]}' },
    { label: "Single window", input: '{"windows":1,"activations":[1,1]}' },
    { label: "Cycle", input: '{"windows":3,"activations":[3,2,1]}' },
    { label: 'One window, repeated', input: '{"windows":1,"activations":[1,1]}' },
    { label: 'No activations', input: '{"windows":3,"activations":[]}' },
    { label: 'Every window once', input: '{"windows":10,"activations":[1,2,3,4,5,6,7,8,9,10]}' },
    { label: 'Long run: 30 activations', input: '{"windows":10,"activations":[2,5,5,10,3,5,6,4,4,4,5,6,2,9,7,5,7,2,9,7,4,3,9,9,7,7,7,1,4,4]}' },
  ],
};

export default function AltAndTabSimulation() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SwitcherView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Final order: ${run.result.join(", ")}.` : ""}
        </p>
      )}
    />
  );
}
