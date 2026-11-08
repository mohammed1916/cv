import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Fence1924View from './Fence1924View'
import './Fence1924View.css'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Seed', description: 'Start with the first point.' },
    { id: 'seed', label: 'Seed', description: 'The first point is a circle of radius 0.' },
    { id: 'inside', label: 'Keep', description: 'The point already lies inside the circle.' },
    { id: 'outside', label: 'Outside', description: 'The point must lie on the new boundary.' },
    { id: 'reset', label: 'Reset', description: 'Rebuild the circle from this point alone.' },
    { id: 'inside-pair', label: 'Keep', description: 'An earlier point is already inside.' },
    { id: 'pair', label: 'Pair', description: 'Try the circle with two boundary points.' },
    { id: 'inside-triple', label: 'Keep', description: 'A third point is already inside.' },
    { id: 'triple', label: 'Triple', description: 'Use the circle through three boundary points.' },
    { id: 'done', label: 'Result', description: 'Report the center and radius.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON list of [x, y] points',
  url: 'https://leetcode.com/problems/erect-the-fence-ii/',
  complexity: 'O(n^3) time and O(1) extra space for n points, using the incremental boundary rule. The visualization caps the input at 8 points with integer coordinates from -100 to 100; results are shown to 3 decimals.',
  examples: [
    { label: 'Acute triangle', input: '[[0,0],[4,0],[2,3]]' },
    { label: 'Obtuse triangle', input: '[[0,0],[6,0],[1,1]]' },
    { label: 'Interior point', input: '[[0,0],[4,0],[2,3],[2,1]]' },
    { label: 'Single point', input: '[[0,0]]' },
    { label: 'Repeated points', input: '[[1,1],[1,1],[1,1]]' },
    { label: 'Corners of the coordinate range', input: '[[-100,-100],[100,100],[100,-100],[-100,100]]' },
    { label: 'Long run: 8 generated points', input: '[[-39,-86],[22,33],[-66,65],[53,-61],[-53,25],[78,-36],[-81,34],[19,-47]]' },
  ],
}

export default function ErectFenceIIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <Fence1924View run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
