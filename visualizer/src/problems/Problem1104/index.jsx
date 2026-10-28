import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Row', description: 'Find the row that holds the label.' },
    { id: 'climb', label: 'Climb', description: 'Move to the parent, undoing the zigzag in odd rows.' },
    { id: 'done', label: 'Complete', description: 'Report the path from the root.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with label from 1 to 1000000, for example {"label":14}',
  url: 'https://leetcode.com/problems/path-in-zigzag-labelled-binary-tree/',
  complexity: 'O(log label) time and space, one step per row.',
  examples: [
    { label: 'Example 1', input: '{"label":14}' },
    { label: 'Example 2', input: '{"label":26}' },
  ],
}

export default function ZigzagPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Path from the root" length={step.path.length} valueAt={index => step.path[index]} active={step.path.length - 1} />
    <output aria-label="Current row">{`Row: ${step.row}`}</output>
  </>} renderReasoning={() => <>
    <p>In a zigzag tree, odd rows run right to left. Undoing that reversal turns each row into ordinary heap numbering, where the parent of label x is x divided by two.</p>
    <p>Each step climbs one row, converts the parent back to its zigzag label, and repeats until the root.</p>
  </>} />
}
