import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'collect', label: 'Find vowels', description: 'Mark the positions that hold vowels; consonants are never moved.' },
    { id: 'sort', label: 'Sort vowels', description: 'Sort the collected vowels by character code, so uppercase comes first.' },
    { id: 'write', label: 'Write back', description: 'Place the sorted vowels into the vowel positions in order.' },
    { id: 'done', label: 'Complete', description: 'Report the rebuilt string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s (English letters)',
  url: 'https://leetcode.com/problems/sort-vowels-in-a-string/',
  complexity: 'O(n log n) time for sorting the vowels, O(n) space for the output.',
  examples: [
    { label: 'Example 1', input: '{"s":"lEetcOde"}' },
    { label: 'Example 2', input: '{"s":"lYmpH"}' },
    { label: 'Single letter', input: '{"s":"a"}' },
    { label: 'Equal letters, two cases', input: '{"s":"AaAa"}' },
    { label: 'Boundary: 30 letters Z and z', input: '{"s":"ZzZzZzZzZzZzZzZzZzZzZzZzZzZzZz"}' },
    { label: 'Long run: 30 letters', input: '{"s":"JjMdRkJySiHyHyYeNqMmSzWjTxXyCp"}' },
  ],
}

const VOWELS = 'aeiouAEIOU'

function SortedPool({ letters, next }) {
  if (!letters) return <p style={{ color: 'var(--text)' }}>Sorted vowels appear here once collected.</p>
  return <ol aria-label="Sorted vowel pool" style={{ display: 'flex', gap: 6, padding: 0, listStyle: 'none', margin: 0 }}>
    {[...letters].map((ch, k) => <li key={k} data-next={k === next} style={{
      minWidth: 34, textAlign: 'center', padding: '4px 6px', borderRadius: 6,
      border: '1px solid var(--border, currentColor)', fontWeight: k === next ? 700 : 400,
      background: k === next ? 'var(--primary)' : k < next ? 'var(--surface2)' : 'transparent',
      color: k === next ? '#fff' : 'var(--text)',
    }}><small>{k}</small><div>{ch}</div></li>)}
  </ol>
}

export default function SortVowels() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="String being rebuilt" length={run.input.s.length} valueAt={i => step.text[i]}
      active={step.at ?? -1} roleAt={i => (VOWELS.includes(run.input.s[i]) ? 'vowel' : 'consonant')} />
    <SortedPool letters={step.sorted} next={step.k ?? -1} />
    <output aria-label="Current string">{`Current string: ${step.text}`}</output>
    <output aria-label="Position being written">{step.at === null ? 'No position being written' : `Writing position ${step.at}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the vowel positions change, so consonants and their places in the string stay fixed.</p>
    <p>Sorting by character code puts every uppercase vowel before every lowercase vowel, which matches the required order.</p>
  </>} />
}
