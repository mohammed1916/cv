import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import ArgumentCounterView from "./ArgumentCounterView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "2703",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with args; null stands for an explicit undefined (e.g. {"args":[1,null,"x"]})',
  url: "https://leetcode.com/problems/return-length-of-arguments-passed/",
  complexity: "O(k) time for k arguments and O(1) extra space for the count. The visualization caps args at 10 entries; the draft does not verify official limits.",
  examples: [
    { label: "Example", input: '{"args":[1,null,"x"]}' },
    { label: "No arguments", input: '{"args":[]}' },
  ],
};

export default function Problem2703Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ArgumentCounterView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
