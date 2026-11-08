import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'expand', label: 'Grow', description: 'Extend the block until its letters are closed.' },
    { id: 'accept', label: 'Keep', description: 'This start gives a special block.' },
    { id: 'reject', label: 'Reject', description: 'This start cannot close into a special block.' },
    { id: 'pick', label: 'Pick', description: 'Take the block if it starts after the last taken one.' },
    { id: 'done', label: 'Result', description: 'Compare the count with k.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters) and k (0 to 26)',
  url: 'https://leetcode.com/problems/select-k-disjoint-special-substrings/',
  complexity: 'O(n) expansion work per candidate start with a greedy pick over the blocks; the visualization caps s at 16 letters.',
  examples: [
    { label: 'Three blocks', input: '{"s":"aabbcc","k":3}' },
    { label: 'Two blocks', input: '{"s":"xyzx","k":2}' },
    { label: 'Smallest string', input: '{"s":"ab","k":0}' },
    { label: 'Repeated letter tie', input: '{"s":"aa","k":1}' },
    { label: 'Longest string, all letters', input: '{"s":"abcdefghijklmnop","k":16}' },
    { label: 'Long run: 16 letters', input: '{"s":"hbfxqncflfqfhvvi","k":5}' },
  ],
}

export default function SelectKDisjointSpecialSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.at}
      roleAt={i => (step.chosen.some(b => i >= b.start && i <= b.end) ? 'window' : (step.start >= 0 && i >= step.start && i <= step.end ? 'set' : ''))} />
    <output aria-label="Blocks taken">{`taken = ${step.chosen.length} of k = ${run.input.k}`}</output>
  </>} renderReasoning={() => <>
    <p>A special block that starts at a letter's first occurrence must contain every occurrence of each letter it holds.</p>
    <p>The smallest closed block from each start is enough: taking the earliest-ending blocks greedily gives the most disjoint ones.</p>
  </>} />
}
