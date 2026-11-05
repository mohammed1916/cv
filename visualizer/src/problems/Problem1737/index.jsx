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
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const countOf = (text, i) => [...text].filter(ch => ch.charCodeAt(0) - 97 === i).length
    // Letters below the boundary go to one string, letters at or above it to the other; both rules cost the same kind of change.
    const roleAt = i => (step.boundary === null || step.boundary === undefined ? '' : i < step.boundary ? 'below' : 'at or above')
    return <>
      <IndexedSequence label="String a" length={run.input.a.length} valueAt={index => run.input.a[index]} active={-1} />
      <IndexedSequence label="String b" length={run.input.b.length} valueAt={index => run.input.b[index]} active={-1} />
      <IndexedSequence label="Letters: count in a / count in b" length={26}
        valueAt={i => `${String.fromCharCode(97 + i)} ${countOf(run.input.a, i)}/${countOf(run.input.b, i)}`}
        active={step.boundary ?? -1} roleAt={roleAt} />
      <output aria-label="Fewest changes">{`Boundary: ${step.boundary ? String.fromCharCode(96 + step.boundary) : 'none'}, fewest so far: ${step.best}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Two strings satisfy the rules if all letters of one are below all letters of the other, or both are one letter.</p>
    <p>For a split letter, count the characters that sit on the wrong side of it; prefix sums over the 26 letters make each split cheap.</p>
  </>} />
}
