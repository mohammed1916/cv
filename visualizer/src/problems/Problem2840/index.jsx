import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Explain the swap rule.' },
    { id: 'collect', label: 'Position', description: 'Show the letters at each position.' },
    { id: 'compare', label: 'Compare', description: 'Compare sorted parity classes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "s1" and "s2" (lowercase, equal length), JSON',
  url: 'https://leetcode.com/problems/check-if-strings-can-be-made-equal-with-operations-ii/',
  complexity: 'O(n log n) time for sorting each parity class. The visualization caps strings at 12 letters.',
  examples: [
    { label: 'Example 1', input: '{"s1":"abcdba","s2":"cabdab"}' },
    { label: 'Example 2', input: '{"s1":"abe","s2":"bea"}' },
  ],
}

export default function CheckIfStringsCanBeMadeEqualWithOperationsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='Letters of s1' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>Each swap exchanges two letters of the same parity, so the multiset of letters at even positions and at odd positions never changes.</p>
    <p>When both parity classes match as multisets, the swaps can arrange the letters in the target order.</p>
  </>} />
}
