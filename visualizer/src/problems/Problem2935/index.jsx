import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort the numbers and start an empty window.' },
    { id: 'add', label: 'Add', description: 'Add the next number to the window and the trie.' },
    { id: 'shrink', label: 'Shrink', description: 'Drop numbers that are more than half the newest value.' },
    { id: 'query', label: 'Query', description: 'Find the best xor partner inside the window.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum strong pair xor.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers from 1 to 30, for example [1,2,3,4,5]',
  url: 'https://leetcode.com/problems/maximum-strong-pair-xor-ii/',
  complexity: 'O(n log n + n * B) time for B = 5 bits. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Example', input: '[1,2,3,4,5]' },
    { label: 'Pair', input: '[10,20]' },
  ],
}

export default function MaxStrongPairXor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const sorted = [...run.input].sort((a, b) => a - b)
    return <>
      <IndexedSequence label="Sorted numbers (window in brackets)" length={sorted.length} valueAt={index => sorted[index]}
        active={step.right} roleAt={index => (index >= step.left && index <= step.right ? 'window' : 'outside')} />
      <output aria-label="Window">{`Window: ${step.right >= step.left ? `${sorted[step.left]} to ${sorted[step.right] ?? ''}` : 'empty'} · best xor: ${step.best}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A pair (x, y) with x at most y is strong when y is at most 2x. Sorted order makes the valid partners of each new value a sliding window.</p>
    <p>A trie of the window answers the best xor partner in B steps, and removing a number from the trie only decrements counts.</p>
  </>} />
}
