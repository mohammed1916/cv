import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import CircularSplitView from "./CircularSplitView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "2674",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with values in ring order, starting at the head (e.g. {"values":[7,3,9,4,8,2]})',
  url: "https://leetcode.com/problems/split-a-circular-linked-list/",
  complexity: "O(n) time: one walk counts the nodes, a second walk of about n / 2 steps finds the cut, and a third walk closes the second list. O(1) extra space, since the nodes are rewired in place. The visualization caps the ring at 12 nodes. For a single node, the first list keeps it and the second list is reported as empty, which is the reading used here.",
  examples: [
    { label: "Even count", input: '{"values":[7,3,9,4,8,2]}' },
    { label: "Odd count", input: '{"values":[5,1,6,2,9]}' },
    { label: "Single node", input: '{"values":[42]}' },
    { label: 'Two equal values', input: '{"values":[4,4]}' },
    { label: 'Largest values: 12 entries', input: '{"values":[99,0,99,0,99,0,99,0,99,0,99,0]}' },
    { label: 'Long run: 12 values', input: '{"values":[38,47,98,67,52,63,29,77,47,42,95,60]}' },
  ],
};

export default function SplitCircularLinkedList() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <CircularSplitView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <p>
          {step.message} The first list takes the ceiling of half the nodes, so an odd ring gives its extra node to the first list.
        </p>
      )}
    />
  );
}
