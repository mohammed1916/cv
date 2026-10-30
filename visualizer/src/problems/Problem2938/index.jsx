import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2938",
  phases: [
    { id: "setup", label: "Setup", description: "Start with no black balls seen and no swaps." },
    { id: "scan", label: "Scan", description: "Read each ball; a white ball adds one swap per black ball before it." },
    { id: "result", label: "Result", description: "Report the total number of swaps." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with key s (e.g. {"s": "101"})',
  url: "https://leetcode.com/problems/separate-black-and-white-balls/",
  complexity: "O(n) time and O(1) extra space for string length n. The visualization caps s at 50 characters.",
  examples: [
    { label: "Example 1", input: '{"s": "101"}' },
    { label: "Example 2", input: '{"s": "100"}' },
    { label: "Example 3", input: '{"s": "0111"}' },
  ],
};

export default function Problem2938() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <IndexedSequence label="balls" length={step.values.length} valueAt={i => (step.values[i] === '1' ? 'black' : 'white')}
        active={step.active} roleAt={i => step.marks[i] || ""} />
      <p>{step.summary}</p>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
