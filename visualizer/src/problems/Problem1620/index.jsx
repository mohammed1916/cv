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
    { label: 'Three towers, radius four', input: '{"towers":[[1,2,5],[6,3,9],[4,8,2]],"radius":4}' },
    { label: 'Single tower', input: '{"towers":[[12,11,15]],"radius":9}' },
    { label: "Single tower at zero radius", input: "{\"towers\":[[0,0,5]],\"radius\":0}" },
    { label: "Two equal towers", input: "{\"towers\":[[1,1,5],[3,1,5]],\"radius\":2}" },
    { label: "Six towers in the corners, radius 20", input: "{\"towers\":[[0,0,3],[20,0,4],[0,20,5],[20,20,6],[10,10,7],[5,15,8]],\"radius\":20}" },
    { label: "Long run: 6 towers, radius 7", input: "{\"towers\":[[3,12,19],[3,12,20],[1,20,4],[11,16,7],[5,3,16],[14,1,10]],\"radius\":7}" },
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
