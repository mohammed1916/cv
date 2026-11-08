import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Plan', description: 'Prepare one answer for each k by k window.' },
    { id: 'window', label: 'Window', description: 'Sort the distinct values and keep the smallest gap.' },
    { id: 'done', label: 'Complete', description: 'Every window has its answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with grid and k',
  url: 'https://leetcode.com/problems/minimum-absolute-difference-in-sliding-submatrix/',
  complexity: 'O((m - k + 1)(n - k + 1) * k^2 log k) time. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,8,3],[5,2,7],[4,6,9]],"k":2}' },
    { label: 'All equal', input: '{"grid":[[4,4],[4,4]],"k":2}' },
    { label: 'Two by two, k 1', input: '{"grid":[[1,2],[3,4]],"k":1}' },
    { label: 'Equal values', input: '{"grid":[[5,5],[5,5]],"k":2}' },
    { label: 'Largest grid and side', input: '{"grid":[[50,50,50,50,50,50],[50,50,50,50,50,50],[50,50,50,50,50,50],[50,50,50,50,50,50],[50,50,50,50,50,50],[50,50,50,50,50,50]],"k":6}' },
    { label: 'Long run: 6 by 6 generated', input: '{"grid":[[8,8,48,20,4,40],[46,43,9,34,15,14],[28,45,5,39,2,46],[12,7,2,3,35,17],[25,14,22,41,28,44],[39,22,30,7,43,41]],"k":3}' },
  ],
}

export default function SlidingMinDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Grid" matrix={run.input.grid} highlightedCells={step.window ? step.window.cells : []}
      activeCell={step.window ? { row: step.window.row, col: step.window.col } : null} />
    <MatrixGrid label="Answer so far" matrix={step.answer.map(row => row.map(v => v))} tone="accent" showRowLabels={false} />
    <output aria-label="Window status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Equal values are one value for this problem: the gap is taken between distinct values in the window, so a window of repeated numbers has a gap of 0.</p>
    <p>Sorting the distinct values puts the closest pair next to each other, so only neighboring gaps need checking.</p>
  </>} />
}
