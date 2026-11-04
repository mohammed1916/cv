import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import WindowCountView from "./WindowCountView";
import { code, python, parseInput, buildTrace, pythonLineMap, phases } from "./algorithm.js";

const definition = {
  number: "2743",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'String, e.g. "abcab" (JSON string or raw text)',
  url: "https://leetcode.com/problems/count-substrings-without-repeating-character/",
  complexity: "O(n) time with a last-seen map, O(alphabet) extra space for the window. The visualization caps the string at 16 characters.",
  examples: [
    { label: "abcab", input: JSON.stringify("abcab") },
    { label: "aaaa", input: JSON.stringify("aaaa") },
    { label: "abc", input: JSON.stringify("abc") },
  ],
};

export default function Problem2743Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <WindowCountView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Answer: ${run.answer}.` : ""}
        </p>
      )}
    />
  );
}
