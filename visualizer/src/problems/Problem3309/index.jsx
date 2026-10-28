import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'convert', label: 'Binary', description: 'Write each number in binary.' },
    { id: 'order', label: 'Order', description: 'Place each piece where its join reads largest.' },
    { id: 'join', label: 'Join', description: 'Concatenate the ordered pieces.' },
    { id: 'done', label: 'Complete', description: 'Read the joined string as a value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of exactly 3 integers from 1 to 127 (JSON)',
  url: 'https://leetcode.com/problems/maximum-possible-number-by-binary-concatenation/',
  complexity: 'O(1) for three numbers. The sort compares strings of at most 21 bits.',
  examples: [
    { label: 'Example 1', input: '[1,2,3]' },
    { label: 'Example 2', input: '[1,1,1]' },
  ],
}

export default function BinaryConcatenation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Binary pieces in order" length={step.ordered.length} valueAt={i => step.ordered[i]} />
    <output aria-label="Joined string">{step.joined ? `Joined: ${step.joined}` : 'Not joined yet'}</output>
  </>} renderReasoning={() => <>
    <p>For two pieces a and b, the order matters only through the two joins a plus b and b plus a, so the better order is the one whose join is larger.</p>
    <p>That comparison is consistent across pieces, so sorting with it gives the largest concatenation.</p>
  </>} />
}
