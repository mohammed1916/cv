import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CoordinatePlane from '../../components/shared/CoordinatePlane'
import { buildTrace, parseInput, code, python } from './algorithm'

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
  ],
}

export default function MaximumTriangleArea() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <CoordinatePlane points={run.input.coords} />
    <output aria-label="Best">{`Best twice-area: ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Twice the area of a triangle is the base times the height, so a side on a grid line makes the height a single coordinate difference.</p>
  </>} />
}
