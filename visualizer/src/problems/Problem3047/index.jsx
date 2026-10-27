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
