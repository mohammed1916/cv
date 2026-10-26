import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Search range', description: 'Compute lcm and the initial bounds.' },
    { id: 'probe', label: 'Count up to mid', description: 'Inclusion-exclusion count of magical numbers at most mid.' },
    { id: 'shrink', label: 'Shrink', description: 'Keep the half that still contains the n-th number.' },
    { id: 'done', label: 'Complete', description: 'lo equals hi is the answer (mod 1e9+7).' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Input [n, a, b] (JSON)',
  url: 'https://leetcode.com/problems/nth-magical-number/',
  complexity: 'O(log(n * min(a, b))) time and O(1) space.',
  examples: [
    { label: 'n=3, a=2, b=3', input: '[3,2,3]' },
    { label: 'n=4, a=2, b=3', input: '[4,2,3]' },
    { label: 'Large', input: '[1000000000,40000,39999]' },
  ],
}

export default function NthMagicalNumber() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const vals = [step.lo, step.mid === null ? '–' : step.mid, step.hi]
      const names = ['lo', 'mid', 'hi']
      return <>
        <IndexedSequence label="Binary search window (lo, mid, hi)" length={3} valueAt={i => vals[i]} active={step.mid === null ? -1 : 1} roleAt={i => names[i]} />
        <output aria-label="Count at mid">{step.count === null ? `Looking for the ${run.input.n}-th multiple of ${run.input.a} or ${run.input.b}.` : `count(${step.mid}) = ${step.count} vs target n = ${run.input.n}`}</output>
        {step.phase === 'done' && <output aria-label="Result">Answer {run.answer}, mod 1e9+7 = {run.result}</output>}
      </>
    }}
    renderReasoning={({ run, step }) => <>
      <p>{step.message}</p>
      <p><strong>Counting:</strong> numbers up to x divisible by a or b are x//a + x//b minus x//lcm, since multiples of lcm were counted twice (lcm = {run.lcm}).</p>
      <p>The count is monotone in x, so binary search finds the smallest x whose count reaches n; that x is itself magical.</p>
    </>} />
}
