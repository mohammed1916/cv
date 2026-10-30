import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "start", label: "Setup", description: "Read the time with its ? placeholders." },
    { id: "hour-tens", label: "Hour tens", description: "Choose the first hour digit." },
    { id: "hour-units", label: "Hour units", description: "Choose the second hour digit." },
    { id: "minute-tens", label: "Minute tens", description: "Choose the first minute digit." },
    { id: "minute-units", label: "Minute units", description: "Choose the last minute digit." },
    { id: "done", label: "Result", description: "Return the latest valid time." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with s (e.g. {"s":"1?:?4"})',
  url: "https://leetcode.com/problems/latest-time-you-can-obtain-after-replacing-characters/",
  complexity: "O(1) time and O(1) space because the time has a fixed five characters.",
  examples: [
    { label: "Search snippet example (not verified against the full statement)", input: '{"s":"1?:?4"}' },
    { label: "Search snippet example (not verified against the full statement)", input: '{"s":"0?:5?"}' },
    { label: "illustrative (not from the statement)", input: '{"s":"?2:??"}' },
  ],
};

export default function LatestTimeReplacingCharacters() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <IndexedSequence
          label="time"
          length={run.input.s.length}
          valueAt={(i) => step.chars[i]}
          active={step.index}
          roleAt={(i) => (step.filled.includes(i) ? "read" : "")}
        />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
