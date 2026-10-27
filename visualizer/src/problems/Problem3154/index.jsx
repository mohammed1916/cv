import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'state', label: 'States', description: 'Count the ways from one state: stair, jump and whether a down move is allowed.' },
    { id: 'done', label: 'Complete', description: 'Report the ways to finish on stair k.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with k (JSON)',
  url: 'https://leetcode.com/problems/find-number-of-ways-to-reach-the-k-th-stair/',
  complexity: 'O(log k) distinct jump values with memoised states. The visualization caps k at 30.',
  examples: [
    { label: 'k = 0', input: '{"k":0}' },
    { label: 'k = 1', input: '{"k":1}' },
  ],
}

export default function KthStair() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Stairs 0 to k + 1" length={run.k + 2} valueAt={i => i}
      active={Math.min(step.stair, run.k + 1)} roleAt={i => (i === run.k ? 'target' : '')} />
    <output aria-label="State">{`Stair ${step.stair}, jump ${step.jump}, down ${step.canDown ? 'allowed' : 'not allowed'}, ways ${step.ways}`}</output>
  </>} renderReasoning={() => <>
    <p>A down move cannot follow another down move, and an up move by 2^jump only grows the stair, so a state above k + 1 can never return to k.</p>
    <p>The state (stair, jump, down allowed) fully determines the future, so memoising on it avoids recounting the same continuations.</p>
  </>} />
}
