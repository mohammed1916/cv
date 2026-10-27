import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Letters', description: 'Every letter starts as its own group.' },
    { id: 'merge', label: 'Merge', description: 'Join the letters from one position of s1 and s2; the smaller letter becomes the representative.' },
    { id: 'done', label: 'Complete', description: 'Replace each letter of the base string with its representative.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"s1": "...", "s2": "...", "baseStr": "..."} (lowercase letters)',
  url: 'https://leetcode.com/problems/lexicographically-smallest-equivalent-string/',
  complexity: 'O((|s1| + |baseStr|) * alpha) time with a union-find over 26 letters.',
  examples: [
    { label: 'Example 1', input: '{"s1":"parker","s2":"morris","baseStr":"parser"}' },
    { label: 'Example 2', input: '{"s1":"hello","s2":"world","baseStr":"hold"}' },
  ],
}

export default function SmallestEquivalentString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Letters and their representatives" length={26} valueAt={i => String.fromCharCode(97 + i)}
      roleAt={i => `represented by ${step.roots[i]}`} />
    <p>{step.pair ? `Merging ${step.pair[0]} and ${step.pair[1]}.` : 'No merge in this step.'}</p>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each merge joins two groups of letters. Always keeping the smaller letter as the root means every group is represented by its smallest letter.</p>
    <p>Replacing each letter of the base string by its group representative gives the lexicographically smallest equivalent string.</p>
  </>} />
}
