import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import authoredExamples from "../../config/examples/nqueensii.js";
import { NQueensScene } from "./NQueensIIVisualizer";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./NQueensIIVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Start with an empty board and a count of zero." },
    { id: "check", label: "Check", description: "Test whether the square is attacked by an earlier queen." },
    { id: "skip", label: "Skip", description: "Skip a square that an earlier queen attacks." },
    { id: "place", label: "Place", description: "Place a queen on a safe square and recurse to the next row." },
    { id: "remove", label: "Remove", description: "Take the queen back and try the next column." },
    { id: "solution", label: "Solution", description: "Count a board with a queen in every row." },
    { id: "done", label: "Result", description: "Return the number of distinct solutions." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Board size n from 1 to 6 (e.g. 4)",
  url: "https://leetcode.com/problems/n-queens-ii/",
  complexity: "O(n!) time in the worst case with O(n) set lookups per square, and O(n) extra space for the column and diagonal sets. The visualization accepts n from 1 to 6 and replays at most 12,000 events.",
  examples: authoredExamples.map(example => ({ label: example.label, input: String(example.n) })),
};

export default function NQueensIIWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          {run.truncated && <p role="status">All solutions are counted. Playback shows the first 12,000 events, then the final count; use a smaller n to inspect every event.</p>}
          <NQueensScene n={run.input} step={step} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
