import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import PeacefulBoardView from "./PeacefulBoardView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "3189",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with n and rooks (e.g. {"n":3,"rooks":[[0,0],[0,1],[2,2]]})',
  url: "https://leetcode.com/problems/minimum-moves-to-get-a-peaceful-board/",
  complexity: "O(n log n) time for the two sorts and O(n) space for the sorted axes. The visualization caps the board at 8 by 8. Each rook moves one square at a time; the rows and columns are fixed independently, so the total is the sum of the two axis costs.",
  examples: [
    { label: "Two rooks share a row", input: '{"n":3,"rooks":[[0,0],[0,1],[2,2]]}' },
    { label: "Single rook", input: '{"n":1,"rooks":[[0,0]]}' },
    { label: "Stacked row", input: '{"n":5,"rooks":[[4,4],[4,3],[4,2],[4,1],[4,0]]}' },
    { label: "Two rooks share a column", input: "{\"n\": 2, \"rooks\": [[0, 1], [1, 1]]}" },
    { label: "Largest board, diagonal", input: "{\"n\": 8, \"rooks\": [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7]]}" },
    { label: "Long run: eight rooks", input: "{\"n\": 8, \"rooks\": [[0, 3], [5, 1], [2, 7], [7, 0], [3, 3], [6, 5], [1, 6], [4, 2]]}" },
  ],
};

export default function MinimumMovesPeacefulBoard() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PeacefulBoardView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Final answer: ${run.result} move${run.result === 1 ? "" : "s"}.` : ""}
        </p>
      )}
    />
  );
}
