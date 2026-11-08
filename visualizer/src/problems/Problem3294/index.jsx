import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RecoverHeadView from "./RecoverHeadView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const definition = {
  number: "3294",
  phases: [
    { id: "start", label: "Given node", description: "Begin at the node that was supplied." },
    { id: "climb", label: "Climb prev", description: "Follow prev pointers until none is left." },
    { id: "head", label: "Head", description: "This node has no prev, so it is the head." },
    { id: "collect", label: "Read", description: "Append the current node's value." },
    { id: "advance", label: "Next", description: "Follow the next pointer." },
    { id: "done", label: "Result", description: "Return the complete list in order." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with values (list order) and node (position of the given node), e.g. {"values":[5,8,2,6],"node":2}',
  url: "https://leetcode.com/problems/convert-doubly-linked-list-to-array-ii/",
  complexity: "O(n) time and O(n) space: one pass back to the head and one pass forward. The visualization accepts up to 10 nodes.",
  examples: [
    { label: "Middle node", input: '{"values":[5,8,2,6],"node":2}' },
    { label: "Head given", input: '{"values":[1,2,3],"node":0}' },
    { label: "Tail given", input: '{"values":[7,-3,4,9,0],"node":4}' },
    { label: 'Single node', input: '{"values":[5],"node":0}' },
    { label: 'Equal values', input: '{"values":[2,2,2],"node":1}' },
    { label: 'Ten nodes, last given', input: '{"values":[-99,99,-99,99,-99,99,-99,99,-99,99],"node":9}' },
    { label: 'Long run: ten generated values', input: '{"values":[47,-95,98,-20,17,40,-70,-90,-74,-16],"node":5}' },
  ],
};

export default function ConvertDoublyLinkedListToArrayII() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RecoverHeadView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Output length: ${run.result.length}.` : ""}
        </p>
      )}
    />
  );
}
