import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2492',
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at city 1 with the queue holding only city 1.' },
    { id: 'pop', label: 'Visit', description: 'Take the next city from the queue.' },
    { id: 'edge', label: 'Road', description: 'Look at a road leaving the current city.' },
    { id: 'done', label: 'Result', description: 'Return the lightest road reached.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": 5, "roads": [[1,2,8],[2,3,4]]}',
  url: 'https://leetcode.com/problems/minimum-score-of-a-path-between-two-cities/',
  complexity: 'O(n + m) time for a breadth-first walk over m roads. The visualization caps the city count at 8.',
  examples: [
    { label: 'Light road off the path', input: '{"n":5,"roads":[[1,2,8],[2,3,4],[3,5,6],[2,4,3],[4,5,9]]}' },
    { label: 'Detour to a light road', input: '{"n":3,"roads":[[1,2,12],[2,3,5],[1,3,11]]}' },
  ],
}

export default function MinimumScorePath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, roads } = run.input
    const labels = Array.from({ length: n }, (_, i) => String(i + 1))
    const toIndex = city => city - 1
    return <>
      <GraphTraversalView title="Roads and visited cities" n={n} edges={roads.map(([a, b]) => [toIndex(a), toIndex(b)])} labels={labels}
        current={step.current === null ? null : toIndex(step.current)} neighbour={step.neighbour === null ? null : toIndex(step.neighbour)}
        visited={step.visited.map(toIndex)} frontier={step.queue.map(toIndex)} frontierKind="queue" frontierTitle="Queue"
        tags={{}} />
      <RecordStateTable label="Roads" columns={['from', 'to', 'distance']} rows={roads.map(([a, b, d]) => ({ from: a, to: b, distance: d }))}
        activeRow={roads.findIndex(([a, b]) => step.current !== null && step.neighbour !== null && ((a === step.current && b === step.neighbour) || (b === step.current && a === step.neighbour)))} />
      <output aria-label="Lightest road so far">{step.best === null ? 'No road examined yet' : `Lightest so far: ${step.best}`}</output>
      <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>A walk may reuse roads and cities, so from city 1 you can detour to every city in its connected component and come back. The answer is the lightest road in that component.</p>
    <p>The breadth-first walk visits each reachable city once; each road it touches lowers the running minimum.</p>
  </>} />
}
