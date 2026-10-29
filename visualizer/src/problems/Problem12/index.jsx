import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import { IntegerToRomanScene } from "./IntegerToRomanVisualizer";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./IntegerToRoman.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Start with an empty output and the ordered value table." },
    { id: "select", label: "Pair", description: "Select the next value and symbol from largest to smallest." },
    { id: "test", label: "Test", description: "Check whether the remaining number is at least the value." },
    { id: "append", label: "Append", description: "Append the symbol to the output." },
    { id: "subtract", label: "Subtract", description: "Subtract the value from the remaining number." },
    { id: "done", label: "Result", description: "Return the Roman numeral." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Integer from 1 to 3999 (e.g. 1994)",
  url: "https://leetcode.com/problems/integer-to-roman/",
  complexity: "O(1) time and O(1) space for the fixed value table; the output has at most 15 symbols for 1 to 3999.",
  examples: getExamples("integer-to-roman").map(example => ({ label: example.label, input: String(example.num) })),
};

export default function IntegerToRomanVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <IntegerToRomanScene num={run.input} step={step} />}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
