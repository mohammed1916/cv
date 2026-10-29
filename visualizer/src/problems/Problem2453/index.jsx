import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2453",
  phases: [
    { id: "setup", label: "Setup", description: "Start with empty tallies for each remainder." },
    { id: "scan", label: "Scan", description: "Visit each target in order." },
    { id: "remainder", label: "Remainder", description: "Find the target's remainder modulo space." },
    { id: "tally", label: "Tally", description: "Add the target to its remainder group." },
    { id: "check", label: "Seed", description: "Check whether this is the smallest target in its group." },
    { id: "seed", label: "Seed", description: "Keep the smallest target as the group's seed." },
    { id: "pick", label: "Choose", description: "Start choosing the best group." },
    { id: "group", label: "Compare", description: "Compare a group with the best so far." },
    { id: "choose", label: "Choose", description: "Make this group the best so far." },
    { id: "done", label: "Result", description: "Return the smallest seed of the best group." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"nums": [3,7,8,1,1,5], "space": 2}',
  url: "https://leetcode.com/problems/destroy-sequential-targets/",
  complexity: "O(n) time and O(n) space for n targets. The visualization caps n at 50 targets with values up to 1000.",
  examples: [{ label: "Example 1", input: '{"nums":[3,7,8,1,1,5],"space":2}' }],
};

export default function DestroySequentialTargetsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="nums"
            length={run.input.nums.length}
            active={step.i ?? -1}
            valueAt={index => run.input.nums[index]}
            roleAt={index => (step.r !== null && step.r !== undefined && run.input.nums[index] % run.input.space === step.r ? "counted" : "")}
          />
          <p>
            Groups so far: {step.groups.map(group => `remainder ${group.remainder}: ${group.count} target(s), seed ${group.smallest}`).join("; ") || "none"}
          </p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
