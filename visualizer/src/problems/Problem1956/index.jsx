import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SpreadGridView from './SpreadGridView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Range', description: 'Bound the search for the day.' },
    { id: 'probe', label: 'Probe', description: 'Test a middle day.' },
    { id: 'cell', label: 'Cell', description: 'Count the variants that reach a cell.' },
    { id: 'hit', label: 'Hit', description: 'This cell gathers k variants.' },
    { id: 'covered', label: 'Earlier', description: 'The day works, so search earlier.' },
    { id: 'short', label: 'Later', description: 'The day fails, so search later.' },
    { id: 'done', label: 'Result', description: 'The earliest working day.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with points ([x, y] pairs) and k',
  url: 'https://leetcode.com/problems/minimum-time-for-k-virus-variants-to-spread/',
  complexity: 'Each probe scans the cells of the bounding box and counts variants for each cell, so the time is O(W H n log(W + H)) for a box of W by H and n points. The visualization accepts up to 8 points with coordinates from -10 to 10. The official numeric bounds are not verified here.',
  examples: [
    { label: 'Scattered four', input: '{"points":[[0,0],[4,1],[1,3],[2,2]],"k":3}' },
    { label: 'Five seeds', input: '{"points":[[1,1],[3,8],[9,2],[4,4],[0,7]],"k":3}' },
    { label: 'Corners', input: '{"points":[[0,0],[6,0],[0,6],[6,6]],"k":4}' },
    { label: 'Single point', input: '{"points":[[0,0]],"k":1}' },
    { label: 'Repeated points', input: '{"points":[[2,2],[2,2],[5,5]],"k":2}' },
    { label: 'Long run: eight points', input: '{"points":[[-7,1],[-4,5],[10,2],[9,3],[9,7],[-9,8],[6,-10],[2,9]],"k":4}' },
  ],
}

export default function MinimumTimeForKVirusVariants() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <SpreadGridView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A day works when some cell is within that many steps of k variants. Once a day works, every later day works too, so binary search over the day is valid.</p>
  </>} />
}
