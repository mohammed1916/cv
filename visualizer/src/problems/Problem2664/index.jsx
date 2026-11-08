import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import KnightTourView from "./KnightTourView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "2664",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with rows, cols and start (e.g. {"rows":5,"cols":5,"start":[0,0]})',
  url: "https://leetcode.com/problems/the-knights-tour/",
  complexity: "Backtracking with the fewest-onward-moves ordering (Warnsdorff). Worst case is exponential in the number of squares, so this visualization caps the board at 5 by 5 and stops a search that exceeds 20000 frames. Each placement checks eight moves, so one branch costs O(rows * cols). The statement guarantees a tour, so the empty grid shown for a board with no tour is a teaching case only.",
  examples: [
    { label: "Open tour from a corner", input: '{"rows":5,"cols":5,"start":[0,0]}' },
    { label: "Open tour from the centre", input: '{"rows":5,"cols":5,"start":[2,2]}' },
    { label: "No tour on 3 by 3", input: '{"rows":3,"cols":3,"start":[1,1]}' },
    { label: "Single square", input: '{"rows":1,"cols":1,"start":[0,0]}' },
    { label: 'Two by two from an edge', input: '{"rows":2,"cols":2,"start":[1,0]}' },
    { label: 'Row strip 1 by 5', input: '{"rows":1,"cols":5,"start":[0,2]}' },
    { label: 'Long run: 5 by 5 from the far corner', input: '{"rows":5,"cols":5,"start":[4,4]}' },
  ],
};

export default function TheKnightsTour() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <KnightTourView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <p>
          {step.message} Trying the square with the fewest onward moves first keeps awkward corners from being stranded at the end.
        </p>
      )}
    />
  );
}
