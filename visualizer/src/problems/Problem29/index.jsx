import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import { DivideScene } from "./DivideTwoIntegers";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./DivideTwoIntegers.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Handle the overflow case, the sign, and the magnitudes." },
    { id: "check", label: "Fits?", description: "Check whether the divisor still fits in the remaining magnitude." },
    { id: "build", label: "Double", description: "Double the chunk and its count while the next chunk still fits." },
    { id: "subtract", label: "Subtract", description: "Subtract the largest fitting chunk." },
    { id: "add", label: "Add count", description: "Add the chunk's count to the quotient." },
    { id: "done", label: "Result", description: "Apply the sign and return the quotient." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Object with dividend and divisor (e.g. {"dividend":10,"divisor":3})',
  url: "https://leetcode.com/problems/divide-two-integers/",
  complexity: "O(log^2 n) time and O(1) extra space for quotient magnitude n. Inputs are 32-bit signed integers; the divisor must not be zero.",
  examples: getExamples("divide-two-integers").map(example => ({ label: example.label, input: JSON.stringify({ dividend: Number(example.values.dividend), divisor: Number(example.values.divisor) }) })),
};

export default function DivideTwoIntegers() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DivideScene story={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
