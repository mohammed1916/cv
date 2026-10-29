import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2481",
  phases: [
    { id: "check", label: "Check", description: "Check special cases and parity of n." },
    { id: "even", label: "Parity", description: "Decide whether n is even." },
    { id: "done", label: "Result", description: "Return the number of cuts." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"n": 4}',
  url: "https://leetcode.com/problems/minimum-cuts-to-divide-a-circle/",
  complexity: "O(1) time and O(1) space. The visualization accepts n from 1 to 100.",
  examples: [
    { label: "Example 1", input: '{"n":4}' },
    { label: "Example 2", input: '{"n":3}' },
  ],
};

export default function MinimumCutsCircleVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run }) => (
        <>
          <IndexedSequence
            label="slices"
            length={run.input.n}
            active={-1}
            valueAt={index => index + 1}
          />
          <p>Slices to make: {run.input.n}. Cuts needed: {run.result}.</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
