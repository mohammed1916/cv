import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import { RomanToIntegerScene } from "./RomanToIntegerVisualizer";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./RomanToIntegerVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Start the running total at zero." },
    { id: "value", label: "Current", description: "Read the value of the current symbol." },
    { id: "next", label: "Lookahead", description: "Read the value of the following symbol." },
    { id: "check", label: "Compare", description: "Compare the current value with the next value." },
    { id: "subtract", label: "Subtract", description: "Subtract a value that precedes a larger symbol." },
    { id: "add", label: "Add", description: "Add a value that does not precede a larger symbol." },
    { id: "done", label: "Result", description: "Return the total." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Roman numeral from I to MMMCMXCIX (e.g. MCMXCIV)",
  url: "https://leetcode.com/problems/roman-to-integer/",
  complexity: "O(n) time and O(1) extra space for a numeral of n symbols.",
  examples: getExamples("roman-to-integer").map(example => ({ label: example.label, input: example.s })),
};

export default function RomanToIntegerVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RomanToIntegerScene s={run.input} step={step} />}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
