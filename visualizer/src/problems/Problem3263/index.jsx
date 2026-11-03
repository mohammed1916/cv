import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import DoublyListWalkView from "./DoublyListWalkView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const definition = {
  number: "3263",
  phases: [
    { id: "start", label: "Head", description: "Begin at the head of the list." },
    { id: "check", label: "Check", description: "Is there still a node under the cursor?" },
    { id: "append", label: "Append", description: "Copy the current value to the output." },
    { id: "advance", label: "Next", description: "Follow the next pointer." },
    { id: "done", label: "Result", description: "Return the values in forward order." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON array of values in list order (e.g. [4,1,7,3])",
  url: "https://leetcode.com/problems/convert-doubly-linked-list-to-array-i/",
  complexity: "O(n) time and O(n) space for the output array. The visualization accepts up to 10 nodes.",
  examples: [
    { label: "Four nodes", input: "[4,1,7,3]" },
    { label: "Negative values", input: "[-2,0,5]" },
    { label: "Single node", input: "[9]" },
    { label: "Empty list", input: "[]" },
  ],
};

export default function ConvertDoublyLinkedListToArrayI() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DoublyListWalkView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Output length: ${run.result.length}.` : ""}
        </p>
      )}
    />
  );
}
