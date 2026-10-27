import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Corners', description: 'Try each point as the corner of a rectangle.' },
    { id: 'rectangle', label: 'Right angle', description: 'Two perpendicular arms whose fourth corner is a point.' },
    { id: 'done', label: 'Smallest', description: 'Report the smallest rectangle found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Points (JSON array of [x, y])',
  url: 'https://leetcode.com/problems/minimum-area-rectangle-ii/',
  complexity: 'O(n^3) time with a set lookup. The visualization caps input at 12 points.',
  examples: [
    { label: 'Tilted square', input: '[[1,2],[2,1],[1,0],[0,1]]' },
    { label: 'Axis aligned', input: '[[0,1],[2,1],[1,1],[1,0],[2,0]]' },
  ],
}

export default function MinimumAreaRectangleII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Points" length={run.input.length} valueAt={i => run.input[i].join(', ')} />
    <output aria-label="Best area">
      {step.best === null ? step.message : `Best so far: ${step.best === Infinity ? 'none' : step.best.toFixed(3)}`}
    </output>
  </>} renderReasoning={() => <>
    <p>Any rectangle has a corner with two perpendicular arms, and the fourth corner is the first arm’s end plus the second arm. Checking every corner and pair of arms finds all rectangles, tilted or not.</p>
    <p>Each rectangle is found several times, once per corner, which does not change the minimum.</p>
  </>} />
}
