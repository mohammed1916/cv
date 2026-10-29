import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2553",
  phases: [
    { id: "setup", label: "Setup", description: "Start with an empty answer list." },
    { id: "scan", label: "Value", description: "Take the next number from nums." },
    { id: "digit", label: "Digit", description: "Pick the next digit of the current number." },
    { id: "append", label: "Append", description: "Append the digit to the answer." },
    { id: "done", label: "Result", description: "Report the separated digits." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with nums (e.g. {"nums": [13, 25, 83, 77]})',
  url: "https://leetcode.com/problems/separate-the-digits-in-an-array/",
  complexity: "O(n * d) time and O(n * d) space for n numbers with at most d digits each. The visualization caps nums at 20 values.",
  examples: [{ label: "[13,25,83,77]", input: '{"nums": [13, 25, 83, 77]}' }],
};

export default function SeparateDigitsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <IndexedSequence label="nums" length={step.nums.length} active={step.valueIndex}
            valueAt={(index) => step.nums[index]} roleAt={(index) => (index === step.valueIndex ? "current value" : "")} />
          <IndexedSequence label="answer" length={step.answer.length} active={step.answer.length - 1}
            valueAt={(index) => step.answer[index]} roleAt={() => ""} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
