import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2562",
  phases: [
    { id: "setup", label: "Setup", description: "Set the total and place the two pointers at the ends." },
    { id: "loop", label: "Compare", description: "Check whether the pointers still have a pair." },
    { id: "concat", label: "Concatenate", description: "Join the two values and add the number to the total." },
    { id: "move", label: "Move", description: "Move both pointers inward." },
    { id: "middle", label: "Middle", description: "Add the lone middle value when the length is odd." },
    { id: "done", label: "Result", description: "Report the concatenation value." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with nums (e.g. {"nums": [7, 52, 2, 4]})',
  url: "https://leetcode.com/problems/find-the-array-concatenation-value/",
  complexity: "O(n) time and O(1) extra space for n = nums.length. The visualization caps nums at 40 values.",
  examples: [
    { label: "[7,52,2,4]", input: '{"nums": [7, 52, 2, 4]}' },
    { label: "[5,14,13,8,12]", input: '{"nums": [5, 14, 13, 8, 12]}' },
    { label: 'Single value', input: '{"nums":[9]}' },
    { label: 'Equal values', input: '{"nums":[6,6,6,6]}' },
    { label: 'Forty values alternating extremes', input: '{"nums":[10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1]}' },
    { label: 'Long run: 40 values', input: '{"nums":[5584,1542,6964,2069,298,5991,6044,4408,2494,4255,3091,1200,552,5226,9222,4728,4020,7235,33,1501,589,8055,7904,9324,2656,4898,8014,5694,7577,1152,3017,4738,3587,5980,8651,2994,2236,8211,48,4827]}' },
  ],
};

export default function ArrayConcatenationVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <IndexedSequence
          label="nums"
          length={step.nums.length}
          active={Math.min(step.left, step.nums.length - 1)}
          valueAt={(index) => step.nums[index]}
          roleAt={(index) => {
            if (index === step.left && index === step.right) return "middle";
            if (index === step.left) return "left";
            if (index === step.right) return "right";
            if (index < step.left || index > step.right) return "taken";
            return "";
          }}
        />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
