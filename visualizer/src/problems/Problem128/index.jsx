import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import ConsecutiveStory from "./ConsecutiveStory";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./LongestConsecutiveVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Build a set of the numbers for constant-time lookups." },
    { id: "scan", label: "Scan", description: "Visit each number in the set." },
    { id: "start", label: "Start run", description: "This number has no neighbour one below, so it starts a run." },
    { id: "chain", label: "Count", description: "Count upward while the next number is present." },
    { id: "expand", label: "Extend", description: "Extend the current run by one number." },
    { id: "skip", label: "Skip", description: "Skip a number that is inside a run already counted." },
    { id: "update", label: "Update", description: "Keep the longest run seen so far." },
    { id: "done", label: "Result", description: "Report the longest run of consecutive integers." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Numbers (JSON object, e.g. {\"nums\": [100,4,200,1,3,2]})",
  url: "https://leetcode.com/problems/longest-consecutive-sequence/",
  complexity: "O(n) time and O(n) space for n numbers. The visualization caps the input at 40 numbers.",
  examples: getExamples("longest-consecutive-sequence").map(({ label, nums }) => ({ label, input: JSON.stringify({ nums }) })),
};

export default function LongestConsecutiveVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <ConsecutiveStory story={run} step={step} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
