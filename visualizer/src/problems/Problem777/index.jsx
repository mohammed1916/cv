import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Place a pointer at the start of each string.' },
    { id: 'skip', label: 'Skip X', description: 'Move both pointers past blank X cells.' },
    { id: 'compare', label: 'Compare', description: 'Check that the letters and their allowed directions agree.' },
    { id: 'match', label: 'Match', description: 'The letters can be paired; advance both pointers.' },
    { id: 'done', label: 'Complete', description: 'Report whether start can become end.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Object {start, end} (JSON, up to 60 characters each)',
  url: 'https://leetcode.com/problems/swap-adjacent-in-lr-string/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'RXXLRXRXL -> XRLXXRRLX', input: '{"start":"RXXLRXRXL","end":"XRLXXRRLX"}' },
    { label: 'X -> L (false)', input: '{"start":"X","end":"L"}' },
    { label: 'XXRXLX -> XRXXXL (false)', input: '{"start":"XXRXLX","end":"XRXXXL"}' },
    { label: 'Identical strings (true)', input: '{"start":"LXXR","end":"LXXR"}' },
  ],
}
export default function SwapAdjacentLR() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="start" length={run.input.start.length} active={step.i} valueAt={i => run.input.start[i]} />
    <IndexedSequence label="end" length={run.input.end.length} active={step.j} valueAt={i => run.input.end[i]} />
    <output aria-label="Pointers">i = {step.i}, j = {step.j}{step.phase === 'done' ? ` | can transform: ${run.result}` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Invariant:</strong> XL becomes LX and RX becomes XR. So L drifts left, R drifts right, they never overtake each other, and the sequence of L and R letters never changes.</p>
  </>} />
}
