import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import Problem1908View from "./Problem1908View";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "1908",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "A JSON list of heap sizes, e.g. [1,2,3]",
  url: "https://leetcode.com/problems/game-of-nim/",
  complexity: "O(h) time for h heaps and O(1) space. The visualization shows up to 6 heaps of size up to 15 so each XOR step fits on screen.",
  examples: [
    { label: "Balanced", input: "[1,2,3]" },
    { label: "Winning", input: "[1,2]" },
    { label: "Single heap", input: "[7]" },
  ],
};

export default function Problem1908() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <Problem1908View run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
