import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Same letter', description: 'Score the rule that makes both strings one letter.' },
    { id: 'boundary', label: 'Boundary', description: 'Try a split letter: one string below it, the other at or above it.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest changes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with lowercase strings a and b',
  url: 'https://leetcode.com/problems/change-minimum-characters-to-satisfy-one-of-three-conditions/',
  complexity: 'O(26 * (n + m)) time with letter counts. The visualization caps each string at 20 letters.',
  examples: [
    { label: 'Example 1', input: '{"a":"aba","b":"caa"}' },
    { label: 'Example 2', input: '{"a":"dabadd","b":"cda"}' },
  ],
}

export default function ChangeMinimumCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="String a" length={run.input.a.length} valueAt={index => run.input.a[index]} active={-1} />
    <IndexedSequence label="String b" length={run.input.b.length} valueAt={index => run.input.b[index]} active={-1} />
    <output aria-label="Fewest changes">{`Boundary: ${step.boundary ? String.fromCharCode(96 + step.boundary) : 'none'}, fewest so far: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Two strings satisfy the rules if all letters of one are below all letters of the other, or both are one letter.</p>
    <p>For a split letter, count the characters that sit on the wrong side of it; prefix sums over the 26 letters make each split cheap.</p>
  </>} />
}
