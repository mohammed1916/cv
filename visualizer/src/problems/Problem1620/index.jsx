import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Origin', description: 'Begin with the origin as the best point.' },
    { id: 'scan', label: 'Scan', description: 'Sum the damped quality of towers in range at this point.' },
    { id: 'improve', label: 'Improve', description: 'Replace the best point when this quality is larger.' },
    { id: 'done', label: 'Complete', description: 'Report the best coordinate.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with towers [x, y, quality] and radius (JSON)',
  url: 'https://leetcode.com/problems/coordinate-with-maximum-network-quality/',
  complexity: 'O(X * Y * towers) time for the scan. The visualization caps coordinates and qualities at 20.',
  examples: [
    { label: 'Example 1', input: '{"towers":[[1,2,5],[2,1,7],[3,1,9]],"radius":2}' },
    { label: 'Single tower', input: '{"towers":[[12,11,15]],"radius":9}' },
  ],
}

export default function NetworkQuality() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Network quality by coordinate (row = x, column = y)" matrix={run.grid}
      activeCell={{ row: step.x, col: step.y }}
      highlightedCells={[{ row: step.best[0], col: step.best[1] }]} />
    <output aria-label="Best so far">{`Best so far: (${step.best[0]}, ${step.best[1]})`}</output>
  </>} renderReasoning={() => <>
    <p>The best point must be an integer coordinate, and a point beyond the largest tower coordinate only gets farther from every tower.</p>
    <p>Each tower adds floor(quality / (1 + distance)) when it is within the radius, and ties keep the first point in lexicographic order.</p>
  </>} />
}
