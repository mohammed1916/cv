import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2355',
  phases: [
    { id: 'end', label: 'End here', description: 'Start a section at shelf r, taking as many books as it holds.' },
    { id: 'extend', label: 'Extend left', description: 'Move left, taking one fewer book than the shelf to the right.' },
    { id: 'stop', label: 'Stop', description: 'A shelf cannot give a positive count, so the section ends.' },
    { id: 'record', label: 'Record', description: 'Keep the best section total.' },
    { id: 'done', label: 'Result', description: 'Return the best total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"books": [8, 5, 2, 7, 9]}',
  url: 'https://leetcode.com/problems/maximum-number-of-books-you-can-take/',
  complexity: 'O(n^2) time in this walk and O(1) extra space. Each r walks left until the count reaches zero.',
  examples: [
    { label: 'Example', input: '{"books":[8,5,2,7,9]}' },
    { label: 'Rising', input: '{"books":[1,2,3]}' },
  ],
}

export default function MaxBooks() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const b = run.input.books
    return <>
      <IndexedSequence label="books per shelf" length={b.length} valueAt={i => b[i]} active={step.r}
        roleAt={i => (i === step.r ? 'r' : step.l >= 0 && i === step.l ? 'l' : step.l >= 0 && i >= step.l && i <= step.r ? 'window' : '')} />
      <table aria-label="Books taken">
        <tbody><tr>{b.map((_, i) => <td key={i}>{step.taken && step.taken[i] !== null && step.taken[i] !== undefined ? step.taken[i] : (step.l >= 0 && i >= step.l && i <= step.r ? '·' : '')}</td>)}</tr></tbody>
      </table>
      <output aria-label="Section total">{`section total ${step.sum}, best ${step.best}`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>Books taken from consecutive shelves must strictly rise from left to right. For a section ending at shelf r, take as many as possible at r, then go left taking one less than the shelf to its right, or the shelf's own count if that is smaller.</p>
    <p>The section stops when a shelf cannot give a positive count.</p>
  </>} />
}
