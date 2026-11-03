import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1586',
  phases: [
    { id: 'start', label: 'Start', description: 'The cursor sits before the first value.' },
    { id: 'next', label: 'Next', description: 'Move forward when a value remains.' },
    { id: 'prev', label: 'Prev', description: 'Move back when a value remains.' },
    { id: 'query', label: 'Query', description: 'Report whether a move is possible.' },
    { id: 'done', label: 'Result', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with values (strictly increasing, in-order) and ops: next, prev, hasNext, hasPrevious',
  url: 'https://leetcode.com/problems/binary-search-tree-iterator-ii/',
  complexity: 'O(1) per call in this array model, where the in-order values stand in for the tree walk.',
  examples: [
    { label: 'Example', input: '{"values":[2,5,9,12,20],"ops":["next","next","hasNext","prev","next","next","next","next","hasPrevious"]}' },
  ],
}

export default function BinarySearchTreeIteratorII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ul aria-label="Iterator state">{step.state.map((line, index) => <li key={index}>{line}</li>)}</ul>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A binary search tree read in order is a sorted sequence, so the iterator is a cursor on that sequence.</p>
    <p>Each query checks the cursor against the ends first, so a call past either end returns null without moving.</p>
  </>} />
}
