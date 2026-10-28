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
    { label: 'Example 1', input: '[51,71,17,24,42]' },
    { label: 'Example 2', input: '[1,2,3,4]' },
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
