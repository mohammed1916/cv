import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "setup", label: "Setup", description: "Measure the array and prepare to scan for descents." },
    { id: "scan", label: "Scan", description: "Compare each neighbouring pair in order." },
    { id: "check", label: "Check", description: "Decide whether the descents can be fixed by one rotation." },
    { id: "done", label: "Result", description: "Report the number of right shifts, or -1." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'nums (JSON object with nums, distinct integers 1 to 100)',
  url: "https://leetcode.com/problems/minimum-right-shifts-to-sort-the-array/",
  complexity: "O(n) time and O(n) space for the list of descents. The visualization caps the array at 100 elements.",
  examples: [
    { label: "Rotated", input: '{"nums":[3,4,5,1,2]}' },
    { label: "Sorted", input: '{"nums":[1,3,5]}' },
    { label: "Impossible", input: '{"nums":[2,1,4]}' },
  ],
};

export default function MinimumRightShifts() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <IndexedSequence
          label="nums"
          length={run.input.nums.length}
          valueAt={(i) => run.input.nums[i]}
          active={step.cursor}
          roleAt={(i) => (step.breaks.includes(i) ? "break" : "")}
        />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
