import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare an empty set of pairs.' },
    { id: 'collect', label: 'Collect', description: 'Record each adjacent pair.' },
    { id: 'check', label: 'Check', description: 'Is the reverse of the pair in the set?' },
    { id: 'done', label: 'Complete', description: 'Return true or false.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "s" (lowercase letters), JSON',
  url: 'https://leetcode.com/problems/existence-of-a-substring-in-a-string-and-its-reverse/',
  complexity: 'O(n) time and O(n) space for the pair set. The visualization caps s at 20 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"leetcode"}' },
    { label: 'Example 2', input: '{"s":"abcba"}' },
    { label: 'No match', input: '{"s":"abcd"}' },
  ],
}

export default function ExistenceOfASubstringInAStringAndItsReverse() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='Characters of s' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>A two-letter substring whose reverse also appears is found by looking up each pair in a set of pairs.</p>
    <p>Reversing the whole string is equivalent, so the check reduces to comparing adjacent pairs.</p>
  </>} />
}
