import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set count and pending to zero.' },
    { id: 'bar', label: 'Bar', description: 'A bar opens or closes a pair.' },
    { id: 'star', label: 'Asterisk', description: 'Count it only outside a pair.' },
    { id: 'done', label: 'Complete', description: 'Return the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "s" (lowercase letters, "*" and "|"), JSON',
  url: 'https://leetcode.com/problems/count-asterisks/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps s at 30 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"yo|uar|e**|b|e***au|tifu|l"}' },
    { label: 'No bars', input: '{"s":"iamprogrammer"}' },
    { label: 'Unpaired bar', input: '{"s":"a*|b*c"}' },
  ],
}

export default function CountAsterisks() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='Characters of s' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>Bars pair up from left to right, so a single flag tracks whether the scan is inside a pair.</p>
    <p>A trailing unpaired bar opens nothing that closes, so the asterisks after it still count.</p>
  </>} />
}
