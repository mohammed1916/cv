import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Index the dead ends and start BFS at 0000.' },
    { id: 'pop', label: 'Dequeue', description: 'Take the oldest queued lock state.' },
    { id: 'expand', label: 'Expand', description: 'Try the 8 single-wheel turns, skipping dead ends and seen states.' },
    { id: 'done', label: 'Complete', description: 'Return the number of moves, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Deadends and target (JSON)',
  url: 'https://leetcode.com/problems/open-the-lock/',
  complexity: 'O(10^4 * 8) at worst; one dequeue frame and one expand frame per state (up to ~20,000 frames).',
  examples: [
    { label: 'Own case 1', input: '{"deadends":["1312","1212","1213","2323","3113"],"target":"1313"}' },
    { label: 'Own case 2', input: '{"deadends":["9999"],"target":"1110"}' },
    { label: 'Walled off', input: '{"deadends": ["8887","8889","8878","8898","8788","8988","7888","9888"], "target": "8888"}' },
    { label: 'Start blocked', input: '{"deadends":["0000"],"target":"0001"}' },
    { label: 'One turn', input: '{"deadends":[],"target":"0001"}' },
    { label: 'Largest digits wrap', input: '{"deadends":[],"target":"9999"}' },
    { label: 'Long run: 60 dead ends', input: '{"deadends":["5275","4877","7201","5041","5667","9003","4835","5870","0615","7830","9984","7163","2134","6519","7084","0183","8797","7423","9193","5037","2222","7889","4152","1726","2955","5073","6774","4527","4625","3523","2211","6741","7817","3839","8164","5325","7531","3173","6085","7459","0662","0858","4029","3554","2391","4941","6312","3760","2899","7914","7631","7485","8311","2404","1810","7961","2274","0128","7811","6393"],"target":"0001"}' },
  ],
}

export default function OpenTheLock() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Current state">Current: {step.node || '-'} | moves {step.steps} | queue {step.queueSize} | seen {step.seen}</output>
    <StackLane title="Newly queued" items={step.fresh} note="neighbours added" />
    <StackLane title="Blocked by dead ends" items={step.blocked} />
    <StackLane title="Shortest path" items={step.path} note={run.result < 0 && step.phase === 'done' ? 'unreachable' : undefined} />
  </>} renderReasoning={({ run }) => <>
    <p>All moves cost 1, so BFS finds the fewest moves. Dead ends are removed from the graph by never queuing them.</p>
    <p>Dead ends given: {run.input.deadends.length}; target {run.input.target}.</p>
  </>} />
}
