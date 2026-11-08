import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Both groups begin empty.' },
    { id: 'prime', label: 'Prime index', description: 'Elements at prime indices go to A.' },
    { id: 'other', label: 'Other index', description: 'Every other element goes to B.' },
    { id: 'done', label: 'Complete', description: 'Report the absolute difference of the two sums.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers',
  url: 'https://leetcode.com/problems/split-array-by-prime-indices/',
  complexity: 'O(n sqrt(n)) with trial division. A sieve gives O(n log log n).',
  examples: [
    { label: 'Own case 1', input: '[3,4,5]' },
    { label: 'Own case 2', input: '[-2,6,8,1]' },
    { label: 'Single one', input: '[1]' },
    { label: 'Equal values', input: '[4,4]' },
    { label: 'Largest magnitudes', input: '[1000000000,-1000000000]' },
    { label: 'Long run: 20 values', input: '[-584,-404,328,238,-374,201,859,611,-823,-904,113,-765,-157,922,-941,763,-43,-991,942,-29]' },
  ],
}

const isPrimeIndex = i => { if (i < 2) return false; for (let d = 2; d * d <= i; d++) if (i % d === 0) return false; return true }

export default function SplitByPrimeIndices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input
    const roleAt = i => (isPrimeIndex(i) ? 'prime' : '')
    return <>
      <IndexedSequence label="nums" length={nums.length} valueAt={i => nums[i]} active={step.index} roleAt={roleAt} />
      <output aria-label="Sums">{`A (prime indices): ${step.sumA}. B (other indices): ${step.sumB}.`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The index decides the group, not the value. Index 0 and index 1 are not prime, so they go to B.</p>
    <p>The answer is the absolute difference of the two sums, computed in one pass.</p>
  </>} />
}
