import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import CompactDecisionView from "./CompactDecisionView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "2705",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON object or array to compact (JSON has no undefined, so omit those)",
  url: "https://leetcode.com/problems/compact-object/",
  complexity: "O(s) time for s entries in the value, since every entry is visited once, with recursion depth equal to the nesting. The visualization caps nesting at 4 levels and 30 entries; the page keeps the value small for teaching.",
  examples: [
    { label: "Example", input: '[null,0,5,"a",false,[],{"x":0,"y":[false,2]}]' },
    { label: "Object", input: '{"a":1,"b":null,"c":{"d":""},"e":[0,{}]}' },
  ],
};

export default function Problem2705Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <CompactDecisionView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
