import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CoordinatePlane from '../../components/shared/CoordinatePlane'
import { buildTrace, parseInput, code, python } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No triangle is known yet.' },
    { id: 'pair', label: 'Pair', description: 'Use two points on one axis line as the base and measure the third point.' },
    { id: 'done', label: 'Complete', description: 'Report the largest twice-area.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with coords (JSON array of [x, y])',
  url: 'https://leetcode.com/problems/find-maximum-area-of-a-triangle/',
  complexity: 'O(n^3) time in this direct form. The visualization caps the points at 8.',
  examples: [
    { label: 'Example 1', input: '{"coords":[[1,1],[1,2],[3,2],[3,3]]}' },
    { label: 'Example 2', input: '{"coords":[[1,1],[2,2],[3,3]]}' },
    { label: 'Single point', input: '{"coords":[[5,5]]}' },
    { label: 'Points on one line', input: '{"coords":[[2,1],[2,4],[2,9]]}' },
    { label: 'Corners of the grid', input: '{"coords":[[1,1],[20,20],[1,20],[20,1]]}' },
    { label: 'Long run: 8 points', input: '{"coords":[[6,14],[16,20],[1,12],[12,15],[12,5],[15,15],[15,1],[8,4]]}' },
  ],
}

export default function MaximumTriangleArea() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="points" length={run.input.coords.length} valueAt={i => `(${run.input.coords[i][0]}, ${run.input.coords[i][1]})`} roleAt={i => step.triple && step.triple.includes(i) ? 'triangle' : ''} />
    <CoordinatePlane points={run.input.coords} />
    <output aria-label="Best">{`Best twice-area: ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Twice the area of a triangle is the base times the height, so a side on a grid line makes the height a single coordinate difference.</p>
  </>} />
}
