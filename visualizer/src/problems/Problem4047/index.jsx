import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import XorStateView from "./XorStateView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "4047",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums (1 to 4 values from 0 to 7)',
  url: "https://leetcode.com/problems/minimum-operations-to-make-xor-of-all-elements-zero/",
  complexity: "Breadth-first search over sorted arrays: the number of reachable multisets is bounded by the value range raised to the array length, so this is exponential in the worst case. The visualization caps the array at 4 values from 0 to 7; the official bounds are not verified in this draft.",
  examples: [
    { label: "Already zero", input: '{"nums":[1,2,3]}' },
    { label: "Unreachable", input: '{"nums":[1,2]}' },
    { label: "Needs steps", input: '{"nums":[4,6,7]}' },
  ],
};

export default function Problem4047Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <XorStateView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Replacing a value by its XOR with a different value changes the total XOR to the XOR with the value that was kept, so the search tracks the array itself.</p>}
    />
  );
}
