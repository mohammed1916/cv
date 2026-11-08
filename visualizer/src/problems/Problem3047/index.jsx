import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CoordinatePlane from '../../components/shared/CoordinatePlane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the best area to zero.' },
    { id: 'pair', label: 'Pair', description: 'Intersect two rectangles and take the shorter side of the overlap.' },
    { id: 'done', label: 'Complete', description: 'Report the largest square area.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Rectangles as JSON [[x1, y1, x2, y2], ...]',
  url: 'https://leetcode.com/problems/find-the-largest-area-of-square-inside-two-rectangles/',
  complexity: 'O(k^2) time for k rectangles, O(1) extra space. The visualization caps input at 8 rectangles.',
  examples: [
    { label: 'Overlap', input: '[[1,1,3,3],[2,2,4,4]]' },
    { label: 'Wide strip', input: '[[0,0,10,2],[1,0,9,10]]' },
    { label: 'Disjoint', input: '[[1,1,2,2],[3,3,4,4]]' },
    { label: 'Touching edges', input: '[[0,0,2,2],[2,0,4,2]]' },
    { label: 'Identical rectangles', input: '[[1,1,5,5],[1,1,5,5]]' },
    { label: 'Full canvas', input: '[[0,0,20,20],[0,0,20,20],[5,5,6,6]]' },
    { label: 'Long run: 8 rectangles', input: '[[15,1,18,7],[13,7,16,19],[12,8,16,11],[15,12,18,19],[4,12,18,14],[9,9,16,17],[9,18,18,19],[15,5,18,9]]' },
  ],
}

export default function LargestSquareInTwoRectangles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const rects = run.input.map(([x1, y1, x2, y2], i) => ({
      x1, y1, x2, y2, label: `R${i}`,
      role: step.pair && step.pair.includes(i) ? 'active' : undefined,
    }))
    return <>
      <CoordinatePlane title="Rectangles" rects={rects} />
      <output aria-label="Overlap">{step.overlap ? `Overlap ${step.overlap.w} by ${step.overlap.h}, square side ${Math.max(0, step.overlap.side)}` : 'No pair under test'}</output>
      <p>{`Best area so far: ${step.best}`}</p>
    </>
  }} renderReasoning={() => <>
    <p>A square that fits inside two rectangles must fit inside their overlap, which is itself a box.</p>
    <p>The largest square in a box is the square of its shorter side, so only the pair's overlap sizes matter.</p>
  </>} />
}
