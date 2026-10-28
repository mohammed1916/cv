import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare an empty set.' },
    { id: 'scan', label: 'Scan', description: 'Add each letter to the set.' },
    { id: 'done', label: 'Complete', description: 'Return the size of the set.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "s" (lowercase letters), JSON',
  url: 'https://leetcode.com/problems/minimize-string-length/',
  complexity: 'O(n) time and O(1) extra space for 26 letters. The visualization caps s at 20 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"aaabc"}' },
    { label: 'Example 2', input: '{"s":"dddaaa"}' },
  ],
}

export default function MinimizeStringLength() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='Characters of s' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>Each operation keeps the chosen character and removes its nearest equal neighbours, so a letter never disappears while it is present.</p>
    <p>Removing repeats until every letter is unique leaves one copy per distinct letter.</p>
  </>} />
}
