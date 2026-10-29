import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2566",
  phases: [
    { id: "setup", label: "Setup", description: "Split num into digits and start the high candidate." },
    { id: "scan", label: "Scan", description: "Find the first digit that is not 9." },
    { id: "raise", label: "Maximize", description: "Remap that digit to 9 to get the largest value." },
    { id: "lower", label: "Minimize", description: "Remap the first digit to 0 to get the smallest value." },
    { id: "done", label: "Result", description: "Report the difference between the two values." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with num (e.g. {"num": 11891})',
  url: "https://leetcode.com/problems/maximum-difference-by-remapping-a-digit/",
  complexity: "O(d) time and O(d) space for d digits. The visualization caps num at 8 digits.",
  examples: [{ label: "11891", input: '{"num": 11891}' }],
};

export default function RemapDigitVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <IndexedSequence
          label="Digits of num"
          length={step.text.length}
          active={step.scanIndex}
          valueAt={(index) => step.text[index]}
          roleAt={(index) => (index === step.foundIndex ? "remapped to 9" : "")}
        />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
