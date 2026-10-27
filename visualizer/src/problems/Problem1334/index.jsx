import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DistanceMatrixView from '../../components/shared/DistanceMatrixView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Direct distances', description: 'Fill the matrix with edge weights, 0 on the diagonal and infinity elsewhere.' },
    { id: 'pivot', label: 'Pivot city k', description: 'Let city k be a stepping stone; its row and column are the cells that can improve.' },
    { id: 'relax', label: 'Improve', description: 'Route i to j through k when that is shorter.' },
    { id: 'count', label: 'Count neighbours', description: 'Count the cities within the threshold of each city.' },
    { id: 'done', label: 'Complete', description: 'Report the city with the fewest neighbours (ties to the larger index).' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Graph (JSON with n, edges, threshold)',
  url: 'https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/',
  complexity: 'O(n^3) time and O(n^2) space for Floyd-Warshall. Visualization limited to 8 cities and 12 edges.',
  examples: [
    { label: 'city 3', input: '{"n":4,"edges":[[0,1,3],[1,2,1],[1,3,4],[2,3,1]],"threshold":4}' },
    { label: 'city 0', input: '{"n":5,"edges":[[0,1,2],[0,4,8],[1,2,3],[1,4,2],[2,3,1],[3,4,1]],"threshold":2}' },
  ],
}

export default function CityNeighbours() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DistanceMatrixView label="Shortest distance between each pair of cities" matrix={step.matrix} activeCell={step.target ? { row: step.target[0], col: step.target[1] } : null} highlightedCells={step.highlighted} queueLabel="Neighbour counts" queue={step.queue} />
    <output aria-label="Answer">{step.phase === 'done' ? `City: ${run.result}` : 'Working...'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Floyd-Warshall allows cities 0, 1, 2 and so on as stepping stones one at a time. After the last pivot every entry is the true shortest distance, so each city can be counted against the threshold.</p>
  </>} />
}
