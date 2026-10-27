import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Start with an empty border and a table of zeros.' },
    { id: 'scan', label: 'Next character', description: 'Try to extend the current border with this character.' },
    { id: 'fall', label: 'Fall back', description: 'Use a shorter border, which was already computed, after a mismatch.' },
    { id: 'match', label: 'Compare', description: 'Extend the border on a match, or leave it at zero.' },
    { id: 'done', label: 'Complete', description: 'Report the longest prefix that is also a suffix.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lowercase string as JSON, 1 to 40 characters',
  url: 'https://leetcode.com/problems/longest-happy-prefix/',
  complexity: 'O(n) time and O(n) space for the prefix function.',
  examples: [
    { label: 'Example 1', input: '"level"' },
    { label: 'Example 2', input: '"ababab"' },
    { label: 'Repeated letters', input: '"aaaa"' },
  ],
}

export default function LongestHappyPrefix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = run.input
    const i = step.i ?? -1
    const k = step.k ?? 0
    const charRole = index => {
      if (index === i) return 'scanning'
      if (i >= 0 && index >= i - k && index < i) return 'border (suffix)'
      if (index < k) return 'border (prefix)'
      return ''
    }
    return <>
      <IndexedSequence label="Characters of s" length={s.length} valueAt={index => s[index]} active={i} roleAt={charRole} />
      <IndexedSequence label="pi (border length at each index)" length={s.length} valueAt={index => step.pi[index]} active={i} roleAt={() => ''} />
      <output aria-label="Border length">{`Current border length k = ${k}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A border is a prefix that is also a suffix. If the border ending at position i-1 has length k, the next character can extend it only when it equals s[k].</p>
    <p>On a mismatch, the prefix function gives the next shorter border without rescanning the string, so each character is compared a bounded number of times.</p>
  </>} />
}
