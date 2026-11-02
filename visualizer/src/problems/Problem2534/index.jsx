import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import DoorTimelineView from "./DoorTimelineView";
import { buildTrace, code, parseInput, phases, python } from "./algorithm.js";

const definition = {
  number: "2534",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with arrival (arrival times) and state (0 enter, 1 exit) per person',
  url: "https://leetcode.com/problems/time-taken-to-cross-the-door/description/",
  complexity: "O(T * n) time for T simulated seconds and n people, O(n) space. The visualization caps people at 10 and arrival times at 0 to 20; the official bounds are not verified in this draft.",
  examples: [
    { label: "Example", input: '{"arrival":[0,1,1],"state":[0,1,0]}' },
    { label: "Idle gap", input: '{"arrival":[0,3,3],"state":[1,0,1]}' },
  ],
};

export default function TimeTakenCrossDoor() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DoorTimelineView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          The door handles one person per second. When both directions wait, the door keeps its last direction if it was used in the previous second; otherwise exiting goes first. Within a direction the earliest input index goes first.
          {run ? ` Final answer: ${run.result.join(", ")}.` : ""} {step.message}
        </p>
      )}
    />
  );
}
