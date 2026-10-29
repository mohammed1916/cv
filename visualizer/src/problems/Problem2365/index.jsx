import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2365",
  phases: [
    { id: "setup", label: "Setup", description: "Start on day 0 with no task types recorded." },
    { id: "scan", label: "Scan", description: "Take the next task in order." },
    { id: "advance", label: "Day", description: "Advance the calendar by one day." },
    { id: "check", label: "Cooldown", description: "Check whether the same task type must wait." },
    { id: "wait", label: "Wait", description: "Insert idle days until the task is allowed." },
    { id: "record", label: "Record", description: "Record the day this task type ran." },
    { id: "done", label: "Result", description: "Report the total number of days." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON {"tasks": [1,2,1,2,3,1], "space": 3}',
  url: "https://leetcode.com/problems/task-scheduler-ii/",
  complexity: "O(n) time and O(n) space for n tasks. The visualization caps n at 50 and space at 20.",
  examples: [{ label: "Example 1", input: '{"tasks":[1,2,1,2,3,1],"space":3}' }],
};

export default function TaskSchedulerIIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="tasks"
            length={run.input.length}
            active={step.i ?? -1}
            valueAt={index => run.input[index]}
            roleAt={index => (index < (step.i ?? 0) ? "done" : "")}
          />
          <p>Current day: {step.day}</p>
          <p>Last day each task type ran: {Object.entries(step.last).map(([t, d]) => `${t}→${d}`).join(", ") || "none yet"}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
