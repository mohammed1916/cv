import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the count to zero.' },
    { id: 'scan', label: 'Scan', description: 'Compare each character with the letter.' },
    { id: 'done', label: 'Complete', description: 'Return the rounded-down percentage.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "s" (string) and "letter" (one lowercase letter), JSON',
  url: 'https://leetcode.com/problems/percentage-of-letter-in-string/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps s at 30 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"foobar","letter":"o"}' },
    { label: 'Example 2', input: '{"s":"jjjj","letter":"k"}' },
  ],
}

export default function PercentageOfLetterInString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='Characters of s' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>Counting matches and then multiplying by 100 before dividing keeps the arithmetic in whole numbers.</p>
    <p>Math.floor and integer division both round toward zero for these non-negative values.</p>
  </>} />
}
