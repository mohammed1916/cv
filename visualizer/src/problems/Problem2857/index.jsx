import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import FrequencyCountTable from '../../components/shared/FrequencyCountTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up an empty count of seen points.' },
    { id: 'scan', label: 'Look up', description: 'Find earlier points that complete a pair at distance k.' },
    { id: 'record', label: 'Record', description: 'Add the current point to the seen counts.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with points and integer k (JSON)',
  url: 'https://leetcode.com/problems/count-pairs-of-points-with-distance-k/',
  complexity: 'O(n * k) time and O(n) space. The visualization caps input at 30 points and k at 100.',
  examples: [
    { label: 'Four points', input: '{"points":[[1,2],[4,2],[1,3],[5,2]],"k":1}' },
    { label: 'Identical points', input: '{"points":[[0,0],[0,0],[0,0]],"k":0}' },
    { label: "Single point", input: "{\"points\":[[50,50]],\"k\":0}" },
    { label: "Collinear points", input: "{\"points\":[[0,0],[10,0],[20,0]],\"k\":10}" },
    { label: "Opposite corners", input: "{\"points\":[[0,0],[100,100]],\"k\":100}" },
    { label: "Long run: 30 seeded points", input: "{\"points\":[[99,50],[20,66],[9,31],[43,84],[32,66],[84,61],[63,57],[35,37],[19,57],[80,97],[91,33],[45,60],[93,35],[64,74],[91,8],[51,9],[36,80],[68,100],[59,14],[66,55],[29,6],[23,75],[54,49],[26,56],[67,73],[89,92],[46,70],[42,46],[87,19],[42,27]],\"k\":40}" },
  ],
}

export default function PairsAtDistanceK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { points } = run.input
    return <>
      <IndexedSequence label="Points" length={points.length} valueAt={i => `${points[i][0]},${points[i][1]}`} active={step.index}
        roleAt={i => (step.index >= 0 && i <= step.index ? 'seen' : '')} />
      <FrequencyCountTable title="Seen points" entries={step.seen} active={step.key} emptyText="No points recorded yet." />
      <output aria-label="Pairs so far">{`Pairs so far: ${step.total}${step.added ? ` (+${step.added} for this point)` : ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Since XOR undoes itself, a partner for the current point is found at (x XOR a, y XOR b) for each split a + b = k.</p>
    <p>Looking up partners before recording the current point counts each unordered pair once.</p>
  </>} />
}
