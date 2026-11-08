import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bounds', description: 'Set the search interval.' },
    { id: 'probe', label: 'Probe mid', description: 'Count trailing zeros of mid factorial.' },
    { id: 'shrink', label: 'Move hi', description: 'Enough zeros: search lower.' },
    { id: 'raise', label: 'Move lo', description: 'Too few zeros: search higher.' },
    { id: 'done', label: 'Complete', description: 'Check whether the first candidate hits k exactly.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Integer k (JSON)',
  url: 'https://leetcode.com/problems/preimage-size-of-factorial-zeroes-function/',
  complexity: 'O(log^2 k) time: about log k binary search steps, each counting zeros in O(log x).',
  examples: [
    { label: 'k = 0 (answer 5)', input: '0' },
    { label: 'k = 5 (answer 0)', input: '5' },
    { label: 'k = 3 (answer 5)', input: '3' },
    { label: 'k = 1000000000', input: '1000000000' }, { label: 'k = 1', input: '1' }, { label: 'k = 24', input: '24' }, { label: 'Long run: k = 999999999', input: '999999999' },
  ],
}
export default function PreimageSizeFactorialZeroes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Search state" length={4} valueAt={i => [`lo ${step.lo}`, step.mid < 0 ? 'mid -' : `mid ${step.mid}`, `hi ${step.hi}`, `target k ${run.input}`][i]} active={step.mid < 0 ? -1 : 1} roleAt={i => i === 0 ? 'low' : i === 2 ? 'high' : ''} />
    <IndexedSequence label="floor(mid / 5^i) terms (sum = zeros)" length={Math.max(step.terms.length, 1)} valueAt={i => step.terms[i] ?? ' '} indexOffset={1} />
    <AnswerRangeBar title="Candidate search for mid" min={0} max={5 * (run.input + 1)} low={step.lo} high={step.hi} probe={step.mid >= 0 ? step.mid : null} verdict={step.z >= run.input} />
    <output aria-label="Zeros">Trailing zeros of mid!: {step.z < 0 ? '-' : step.z}{step.phase === 'done' ? `. Answer: ${run.result}` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Trailing zeros of x! equal the number of factors of 5, i.e. floor(x/5) + floor(x/25) + .... The count is monotone and only increases at multiples of 5, so each reachable k has exactly five preimages and every other k has none.</p>
  </>} />
}
