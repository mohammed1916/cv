import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the answer to -1.' },
    { id: 'scan', label: 'Scan', description: 'Pair with the best earlier number.' },
    { id: 'done', label: 'Complete', description: 'Return the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'List of integers from 1 to 9999, JSON',
  url: 'https://leetcode.com/problems/max-pair-sum-in-an-array/',
  complexity: 'O(n times d) time for n values with d digits, and O(10) extra space. The visualization caps input at 12 values.',
  examples: [
    { label: 'Six values, mixed sizes', input: '[88,31,7,52,9,64]' },
    { label: 'Example 2', input: '[1,2,3,4]' },
    { label: "Single value", input: "[42]" },
    { label: "Equal values", input: "[7,7,7,7]" },
    { label: "Largest values", input: "[9999,9998,9997,9996,9995,9994,9993,9992,9991,9990,9989,9988]" },
    { label: "Long run: 12 seeded values", input: "[5431,4748,6358,5592,7154,3215,6379,3866,903,4550,1124,2454]" },
  ],
}

export default function MaxPairSumInAnArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='nums' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>For a fixed largest digit, the best pair uses the two largest numbers with that digit.</p>
    <p>Keeping only the largest earlier number per digit is enough, because it is the best partner for any later number.</p>
  </>} />
}
