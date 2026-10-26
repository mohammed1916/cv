import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Describe the special-string property.' },
    { id: 'call', label: 'Enter call', description: 'Start solving a (sub)string.' },
    { id: 'scan', label: 'Scan', description: 'Update the 1/0 balance.' },
    { id: 'split', label: 'Primitive found', description: 'Balance hit zero: a primitive piece ends; recurse into its interior.' },
    { id: 'collect', label: 'Collect', description: 'Wrap the improved interior with 1 and 0.' },
    { id: 'sort', label: 'Sort pieces', description: 'Order pieces descending.' },
    { id: 'return', label: 'Return', description: 'Join the pieces and return to the caller.' },
    { id: 'done', label: 'Complete', description: 'Final largest string.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Special binary string (JSON)',
  url: 'https://leetcode.com/problems/special-binary-string/',
  complexity: 'O(n^2) worst case time from nested recursion and sorting; the visualization caps n at 60.',
  examples: [{ label: 'Example 1', input: '"11011000"' }, { label: 'Example 2', input: '"10"' }, { label: 'Several pieces', input: '"1010110100"' }],
}

export default function SpecialBinaryString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Current substring" length={step.cur.length} active={step.i} indexOffset={step.offset} valueAt={i => step.cur[i]} roleAt={i => i >= step.start && i <= step.i ? 'piece' : ''} />
    <StackLane title="Recursion stack (substrings)" items={step.stack.map(x => x || '(empty)')} />
    <StackLane title="Pieces at this level" items={step.pieces} />
  </>} renderReasoning={() => <>
    <p>Every special string splits uniquely into primitive special strings, and swapping adjacent ones is exactly the allowed move, so the pieces can be arranged in any order. The interior of a primitive piece is itself special and can be optimised independently; a larger interior makes a larger piece.</p>
    <p>Placing the pieces in descending order then gives the lexicographically largest string.</p>
  </>} />
}
