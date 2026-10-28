import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Try the longest shared prefix first.' },
    { id: 'skip', label: 'Skip', description: 'This prefix length cannot give a larger permutation.' },
    { id: 'found', label: 'Found', description: 'Raise one letter and sort the rest.' },
    { id: 'done', label: 'Complete', description: 'No permutation is larger than target.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s and target, for example {"s":"abc","target":"bba"}',
  url: 'https://leetcode.com/problems/lexicographically-smallest-permutation-greater-than-target/',
  complexity: 'O(n^2) time with 26 letters. The visualization caps the strings at 8 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"abc","target":"bba"}' },
    { label: 'Example 2', input: '{"s":"leet","target":"code"}' },
  ],
}

export default function NextPermutationAboveTarget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Letters">{`s = ${run.input.s}, target = ${run.input.target}`}</output>
    <output aria-label="Prefix">{`Kept prefix: ${step.prefix || '(none)'}${step.pick ? `, raised letter: ${step.pick}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>A permutation that shares a longer prefix with target and is still larger is smaller overall, so the search starts with the longest prefix.</p>
    <p>At the first position that differs, pick the smallest available letter that is larger than the target letter, then place the remaining letters in sorted order.</p>
  </>} />
}
