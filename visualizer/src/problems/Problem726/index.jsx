import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Outer group', description: 'Counts for the whole formula.' },
    { id: 'open', label: 'Open group', description: 'Start counting a parenthesised group.' },
    { id: 'atom', label: 'Atom', description: 'Add the element with its count.' },
    { id: 'close', label: 'Close group', description: 'Multiply the group and add it to its parent.' },
    { id: 'done', label: 'Complete', description: 'Print atoms in sorted order.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Formula (JSON string)',
  url: 'https://leetcode.com/problems/number-of-atoms/',
  complexity: 'O(n log n) time with n characters: each atom is counted once, and the final sort is over distinct atoms.',
  examples: [
    { label: 'Water', input: '"H2O"' },
    { label: 'Magnesium hydroxide', input: '"Mg(OH)2"' },
    { label: 'Nested', input: '"K4(ON(SO3)2)2"' },
  ],
}

export default function NumberOfAtoms() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StackLane title={`Counts (depth ${step.depth})`} items={Object.entries(step.counts).map(([a, c]) => `${a}${c === 1 ? '' : c}`)} note={step.phase === 'done' ? 'sorted' : 'open group'} />
    <output aria-label="Result">{step.phase === 'done' ? step.result : `Depth ${step.depth}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Groups:</strong> a parenthesised group’s counts multiply by the number that follows it before merging into the enclosing group.</p>
  </>} />
}
