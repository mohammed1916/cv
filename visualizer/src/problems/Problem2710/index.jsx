import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { buildTrace, parseInput, code, python } from "./algorithm";

const definition = {
  number: "2710",
  phases: [
    { id: "start", label: "Start", description: "Set end to the length of the string." },
    { id: "scan", label: "Scan", description: "Look at the character before end." },
    { id: "drop", label: "Drop zero", description: "Move end one step left past a trailing zero." },
    { id: "done", label: "Result", description: "Return the prefix up to end." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with num (e.g. {"num":"51230100"})',
  url: "https://leetcode.com/problems/remove-trailing-zeros-from-a-string/",
  complexity: "O(n) time and O(1) extra space for n digits (the output slice is built once). The visualization accepts up to the stated 1000 characters.",
  examples: [
    { label: "Example 1", input: '{"num":"51230100"}' },
    { label: "Example 2", input: '{"num":"123"}' },
  ],
};

export default function RemoveTrailingZeros() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <IndexedSequence
          label="num"
          length={run.input.num.length}
          valueAt={(i) => run.input.num[i]}
          active={step.index}
          roleAt={(i) => (i >= step.end ? "removed" : "kept")}
        />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
