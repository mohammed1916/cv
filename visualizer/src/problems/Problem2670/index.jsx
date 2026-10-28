import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare the suffix counts.' },
    { id: 'suffix', label: 'Suffix pass', description: 'Count distinct values from the right.' },
    { id: 'prefix', label: 'Prefix pass', description: 'Subtract the suffix count.' },
    { id: 'done', label: 'Complete', description: 'Return the difference array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'List of integers from 1 to 50, JSON',
  url: 'https://leetcode.com/problems/find-the-distinct-difference-array/',
  complexity: 'O(n) time and O(n) space with hash sets. The visualization caps input at 20 values.',
  examples: [
    { label: 'Example 1', input: '[1,2,3,4,5]' },
    { label: 'Example 2', input: '[3,2,3,4,2]' },
  ],
}

export default function FindTheDistinctDifferenceArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='nums' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>A distinct count for each prefix can grow only as the scan moves right, so one pass from each side builds both arrays.</p>
    <p>Suffix counts are computed first so the prefix pass can read them without a second scan.</p>
  </>} />
}
