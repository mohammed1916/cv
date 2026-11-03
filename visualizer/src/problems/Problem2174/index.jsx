import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import ClearingGridView from "./ClearingGridView";
import { buildTrace, parseInput, code, python } from "./algorithm.js";

const definition = {
  phases: [
    { id: "start", label: "Start", description: "The full grid, nothing cleared yet." },
    { id: "expand", label: "Expand", description: "Take the oldest state and try each remaining one." },
    { id: "queue", label: "Queue", description: "A new cleared state joins the queue." },
    { id: "seen", label: "Seen", description: "This state was already queued." },
    { id: "done", label: "Result", description: "A state with no ones is the minimum." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with a grid of 0 and 1 rows (e.g. {"grid":[[1,0],[0,1]]})',
  url: "https://leetcode.com/problems/remove-all-ones-with-row-and-column-flips-ii/",
  complexity: "O(2^(R+C) * R * C) time and space for an R by C grid, because each state is a pair of cleared row and column sets. The visualization caps the grid at 4 by 4. The draft's rule is clearing (set to 0), not toggling; the official bounds are not verified here.",
  examples: [
    { label: "Three by three", input: '{"grid":[[1,0,1],[0,1,0],[1,1,1]]}' },
    { label: "Four by four", input: '{"grid":[[1,1,1,1],[1,0,0,1],[0,1,1,0],[1,0,1,1]]}' },
  ],
};

export default function RemoveAllOnesWithFlips() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ClearingGridView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
