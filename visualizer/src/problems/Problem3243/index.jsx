import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Chain', description: 'Begin with the chain of roads from each city to the next.' },
    { id: 'add', label: 'Add road', description: 'Add one one-way road from the query.' },
    { id: 'search', label: 'Search', description: 'Breadth-first search from city 0 in order of distance.' },
    { id: 'answer', label: 'Record', description: 'Record the distance to the last city.' },
    { id: 'done', label: 'Complete', description: 'Report every recorded distance.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and queries of [u, v] (JSON)',
  url: 'https://leetcode.com/problems/shortest-distance-after-road-addition-queries-i/',
  complexity: 'O(q * (n + q)) time and O(n + q) space. The visualization caps n at 12 and queries at 8.',
  examples: [
    { label: 'Six cities, three queries', input: '{"n":7,"queries":[[0,4],[2,6],[1,5]]}' },
    { label: 'Two roads', input: '{"n":4,"queries":[[0,3],[1,3]]}' },
    { label: 'Smallest graph', input: '{"n":3,"queries":[[0,2]]}' },
    { label: 'Full range', input: '{"n":12,"queries":[[0,11]]}' },
    { label: 'Two far queries', input: '{"n":4,"queries":[[0,2],[1,3]]}' },
    { label: 'Long run: 8 queries on 12 cities', input: '{"n":12,"queries":[[2,9],[1,3],[6,9],[1,6],[0,8],[1,11],[2,8],[0,11]]}' },
  ],
}

export default function RoadDistances() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Distance from city 0 (-1 is unreached)" length={run.input.n} active={step.active}
      valueAt={index => (step.dist ? step.dist[index] : '')}
      roleAt={index => (step.road && (index === step.road[0] || index === step.road[1]) ? 'road' : '')} />
    <output aria-label="Answers so far">{`Road ${step.query >= 0 ? step.query + 1 : 0} added. Answers: [${step.answers.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>Roads only point forward, so after each addition the shortest path from city 0 to the last city is found by breadth-first search.</p>
    <p>Each query is processed in order, and each answer uses every road added so far.</p>
  </>} />
}
