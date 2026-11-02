import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No row or column has been measured.' },
    { id: 'extremes', label: 'Extremes', description: 'Record the outermost buildings of each row and column.' },
    { id: 'check', label: 'Check', description: 'Test whether a building lies strictly inside both extremes.' },
    { id: 'count', label: 'Covered', description: 'The building has neighbours on all four sides.' },
    { id: 'done', label: 'Result', description: 'Report the covered count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and buildings ([x, y] pairs, 1 to 30 buildings)',
  url: 'https://leetcode.com/problems/count-covered-buildings/',
  complexity: 'O(b) time and O(b) space for b buildings, using row and column extremes. The visualization caps the grid at 12 and the buildings at 30.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"buildings":[[1,2],[2,2],[3,2],[2,1],[2,3]]}' },
    { label: 'Example 2', input: '{"n":3,"buildings":[[1,1],[1,2],[2,1],[2,2]]}' },
    { label: 'Example 3', input: '{"n":5,"buildings":[[1,3],[3,2],[3,3],[3,5],[5,3]]}' },
  ],
}

export default function CountCoveredBuildings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ol aria-label="Buildings">
      {run.input.buildings.map(([x, y], index) => <li key={index} data-role={step.at === index ? 'current' : step.covered.includes(index) ? 'covered' : ''}>
        {`(${x}, ${y})`}{step.at === index ? ' checked' : ''}{step.covered.includes(index) ? ' covered' : ''}</li>)}
    </ol>
    <output aria-label="Covered count">{`covered = ${step.covered.length}`}</output>
  </>} renderReasoning={() => <>
    <p>A building is covered only if it has a building to its left and right in its row, and one below and one above in its column.</p>
    <p>Those four facts are checked against the outermost buildings of its row and column, so no pair of buildings has to be compared.</p>
  </>} />
}
