import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RemotenessGridView from './RemotenessGridView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid as a JSON list of rows; -1 is blocked, other cells hold 0 to 9',
  url: 'https://leetcode.com/problems/sum-of-remoteness-of-all-cells/',
  complexity: 'O(R * C) time and space for an R x C grid: one flood fill labels every component once. The visualization caps the grid at 6 x 6.',
  examples: [
    { label: 'Two islands', input: '[[1, -1], [-1, 3]]' },
    { label: 'One pocket', input: '[[4, 0, -1], [2, 7, -1], [-1, -1, 5]]' },
    { label: "Single cell", input: "[[5]]" },
    { label: "All blocked", input: "[[-1,-1],[-1,-1]]" },
    { label: "Equal values", input: "[[3,3,3],[3,3,3],[3,3,3]]" },
    { label: "Long run: 6 by 6 seeded grid", input: "[[0,4,9,8,8,-1],[6,5,9,7,1,0],[3,4,9,8,7,-1],[9,5,9,7,0,9],[6,4,9,6,4,-1],[1,5,9,5,8,9]]" },
  ],
}

export default function Problem2852Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <RemotenessGridView run={run} step={step} />}
    renderReasoning={({ run, step }) => <>
      <p>Cells reachable from each other have identical remoteness, so one flood fill per component is enough. Each component adds its cell count times the value of everything outside it.</p>
      <p>{run ? `Sum of remoteness: ${run.result}.` : ''}</p>
    </>} />
}
