import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { code, python, parseInput, buildTrace } from "./algorithm.js";
import BitOracleView from "./BitOracleView";

const definition = {
  number: "3064",
  phases: [
    { id: "start", label: "Setup", description: "Start with an empty answer." },
    { id: "probe", label: "Probe", description: "Ask about one bit; the reply is 0." },
    { id: "set", label: "Set", description: "Ask about one bit; the reply is 1." },
    { id: "done", label: "Result", description: "Return the recovered number." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Hidden integer n as JSON (1 to 2^30 - 1)",
  url: "https://leetcode.com/problems/guess-the-number-using-bitwise-questions-i/",
  complexity: "O(1) oracle calls per bit, 30 calls in total, and O(1) extra space. The visualization draws the hidden number from the presets; the algorithm reads it only through the oracle replies.",
  examples: [
    { label: "Bits 0, 2 and 5", input: "37" },
    { label: "Single bit", input: "1024" },
    { label: "All thirty bits", input: "1073741823" },
  ],
};

export default function Problem3064Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BitOracleView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
