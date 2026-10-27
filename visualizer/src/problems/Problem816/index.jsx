import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Strip the parentheses.' },
    { id: 'split', label: 'Place comma', description: 'Choose the split between the two numbers.' },
    { id: 'make', label: 'Place decimal', description: 'List the legal numbers each half can form.' },
    { id: 'combine', label: 'Combine', description: 'Pair every left option with every right option.' },
    { id: 'done', label: 'Complete', description: 'Return all coordinates.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'String s (JSON)',
  url: 'https://leetcode.com/problems/ambiguous-coordinates/',
  complexity: 'O(n^3) for the splits, decimal positions and string building; the output itself is the dominant cost.',
  examples: [
    { label: 'Example 1', input: '"(123)"' },
    { label: 'Example 2', input: '"(0123)"' },
    { label: 'Example 3', input: '"(00011)"' },
    { label: 'Trailing zeros', input: '"(100)"' },
  ],
}
export default function AmbiguousCoordinates() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Digits (comma goes before the highlighted split)" length={step.digits.length} active={step.split} valueAt={i => step.digits[i]} roleAt={i => step.split > 0 ? (i < step.split ? 'left' : 'right') : ''} />
    <IndexedSequence label="Left options" length={step.leftOpts.length} active={-1} valueAt={i => step.leftOpts[i]} />
    <IndexedSequence label="Right options" length={step.rightOpts.length} active={-1} valueAt={i => step.rightOpts[i]} />
    <IndexedSequence label="Coordinates so far" length={step.res.length} active={step.res.length - 1} valueAt={i => step.res[i]} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Rules:</strong> the integer part cannot start with 0 unless it is exactly "0", and the fractional part cannot end with 0. Those two checks exclude every non-canonical spelling.</p>
  </>} />
}
