import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SquarePairView from './SquarePairView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: "start", label: "Start", description: "Begin with the largest side." },
    { id: "side", label: "Side", description: "List the squares of this side." },
    { id: "pair", label: "Pair", description: "Test two squares for overlap." },
    { id: "found", label: "Found", description: "Two disjoint squares fit." },
    { id: "done", label: "Result", description: "No side works, so the area is 0." },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with grid, a list of rows of 0 and 1, e.g. {\"grid\":[[1,1],[1,1]]}",
  url: "https://leetcode.com/problems/maximum-area-of-two-non-overlapping-square-submatrices/",
  complexity: "O(s * m^2 * s^2) time for the all-one squares of side s in an m by m grid; the visualization caps the grid at 6 by 6.",
  examples: [
    { label: "Corner squares", input: "{\"grid\":[[1,1,0,1],[1,1,0,1],[0,0,1,1],[1,1,1,1]]}" },
    { label: "Scattered ones", input: "{\"grid\":[[1,0,1],[0,1,0],[1,0,1]]}" },
    { label: "Single cell", input: '{"grid":[[1]]}' },
    { label: "All zeros", input: '{"grid":[[0,0],[0,0]]}' },
    { label: "All ones", input: '{"grid":[[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1]]}' },
    { label: "Long run: 6 by 6 grid", input: '{"grid":[[1,1,1,0,1,0],[1,1,1,0,1,1],[1,0,0,1,0,1],[1,0,0,1,0,1],[0,1,0,1,1,1],[0,1,1,1,1,0]]}' },
  ],
}

export default function Problem4016() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <SquarePairView run={run} step={step} />} renderReasoning={({ step }) => <p>{step ? step.message : 'Press Play to start the trace.'}</p>} />
}
