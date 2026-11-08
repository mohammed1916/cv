import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
    { label: 'Example', input: '{"values":[2,5,9,12,20],"ops":["next","hasNext","next","next","prev","hasPrevious","next","next","hasNext"]}' },
    { label: "Single value", input: "{\"values\":[7],\"ops\":[\"hasNext\",\"next\",\"hasNext\",\"prev\",\"hasPrevious\"]}" },
    { label: "Walk forward and back", input: "{\"values\":[1,2,3],\"ops\":[\"next\",\"next\",\"hasNext\",\"prev\",\"prev\",\"hasPrevious\"]}" },
    { label: "Ten values, twenty calls", input: "{\"values\":[1,2,3,4,5,6,7,8,9,10],\"ops\":[\"next\",\"next\",\"next\",\"prev\",\"next\",\"hasNext\",\"next\",\"next\",\"next\",\"next\",\"hasPrevious\",\"prev\",\"prev\",\"next\",\"hasNext\",\"next\",\"next\",\"prev\",\"hasPrevious\",\"next\"]}" },
    { label: "Long run: 10 values, 20 calls", input: "{\"values\":[3,5,6,7,8,10,12,13,16,17],\"ops\":[\"prev\",\"next\",\"hasNext\",\"hasPrevious\",\"hasNext\",\"hasNext\",\"hasNext\",\"prev\",\"next\",\"hasPrevious\",\"hasNext\",\"next\",\"prev\",\"hasPrevious\",\"hasNext\",\"next\",\"hasNext\",\"hasNext\",\"prev\",\"prev\"]}" },
  ],
}

export default function BinarySearchTreeIteratorII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values in order (the tree read left to right)" length={run.input.values.length}
      active={step.cursor} valueAt={index => run.input.values[index]}
      roleAt={index => (index === step.cursor ? 'cursor' : '')} />
    <p>{step.cursor < 0 ? 'The cursor is before the first value; prev and hasPrevious are false.' : `The cursor is on index ${step.cursor}. next moves right, prev moves left.`}</p>
    <ul aria-label="Iterator state">{step.state.map((line, index) => <li key={index}>{line}</li>)}</ul>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A binary search tree read in order is a sorted sequence, so the iterator is a cursor on that sequence.</p>
    <p>Each query checks the cursor against the ends first, so a call past either end returns null without moving.</p>
  </>} />
}
