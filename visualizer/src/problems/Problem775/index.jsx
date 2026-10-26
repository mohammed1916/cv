import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read the permutation.' },
    { id: 'check', label: 'Check', description: 'Confirm the value is within one slot of its index.' },
    { id: 'violation', label: 'Violation', description: 'A value is two or more slots from home.' },
    { id: 'done', label: 'Complete', description: 'Report whether global equals local inversions.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Permutation nums of 0..n-1 (JSON, up to 300)',
  url: 'https://leetcode.com/problems/global-and-local-inversions/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: '[1,0,2] -> true', input: '[1,0,2]' },
    { label: '[1,2,0] -> false', input: '[1,2,0]' },
    { label: 'Swapped pairs', input: '[1,0,3,2,5,4]' },
  ],
}
export default function GlobalAndLocalInversions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => (step.offenders.includes(i) ? 'violation' : '')} />
    <IndexedSequence label="Distance |nums[i] - i|" length={run.input.length} active={step.index} valueAt={i => (i <= step.index ? Math.abs(run.input[i] - i) : '?')} />
    <output aria-label="Verdict">{step.phase === 'done' ? `Ideal permutation: ${run.result}` : 'Scanning...'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Proof sketch:</strong> if some value is two or more away from its index, a smaller or larger value must be displaced past an element not adjacent to it, giving a non-adjacent inversion. Conversely if every value is within 1, only adjacent swaps can exist.</p>
  </>} />
}
