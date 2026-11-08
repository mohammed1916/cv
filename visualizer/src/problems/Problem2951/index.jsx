import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "setup", label: "Setup", description: "Start with an empty list of peaks." },
    { id: "scan", label: "Scan", description: "Visit each interior index." },
    { id: "check", label: "Compare", description: "Compare the value with both neighbours." },
    { id: "record", label: "Record", description: "Store the index of a peak." },
    { id: "done", label: "Result", description: "Return the peak indices." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object: {"mountain": [1, 4, 3, 8, 5]}',
  url: "https://leetcode.com/problems/find-the-peaks/",
  complexity: "O(n) time and O(n) space for the answer. The first and last indices are never peaks. The visualization caps input at 50 values from 1 to 100.",
  examples: [
    { label: "Example 1 (from a community test, not the statement)", input: '{"mountain": [1, 4, 3, 8, 5]}' },
    { label: "Second example", input: '{"mountain": [2, 1, 2, 1, 2]}' },
    { label: 'Smallest peak', input: '{"mountain":[1,2,1]}' },
    { label: 'Flat top', input: '{"mountain":[5,5,5]}' },
    { label: 'Peaks at the bounds', input: '{"mountain":[100,1,100,1,100]}' },
    { label: 'Long run: 50 values', input: '{"mountain":[66,48,90,29,27,56,54,85,6,51,93,49,48,58,76,94,27,84,18,19,99,28,23,29,1,4,52,76,85,80,32,16,35,57,57,94,13,46,48,46,28,5,70,73,18,58,23,49,7,5]}' },
  ],
};

export default function FindThePeaksVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="mountain"
            length={run.input.mountain.length}
            valueAt={(i) => run.input.mountain[i]}
            active={step.index}
            roleAt={(i) => (step.peaks.includes(i) ? "peak" : "")}
          />
          <p>Peaks found so far: [{step.peaks.join(", ")}]</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
