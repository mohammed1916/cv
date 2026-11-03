import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1429',
  phases: [
    { id: 'start', label: 'Empty', description: 'No values have been added.' },
    { id: 'add', label: 'Add', description: 'Count the value and remember its first sighting.' },
    { id: 'first', label: 'Query', description: 'Scan remembered values for the first with count one.' },
    { id: 'done', label: 'Result', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with ops: ["add", value] or ["first"]',
  url: 'https://leetcode.com/problems/first-unique-number/',
  complexity: 'O(1) per add and O(k) per query, where k is the number of distinct values seen. The visualization caps the input at 20 operations.',
  examples: [
    { label: 'Example', input: '{"ops":[["add",7],["first"],["add",4],["first"],["add",7],["first"],["add",9],["first"]]}' },
  ],
}

export default function FirstUniqueNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ul aria-label="Remembered values">{step.state.map((line, index) => <li key={index}>{line}</li>)}</ul>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The order list keeps values in first-seen order, so the first unique value is the first list entry whose count is still one.</p>
    <p>A value that repeats stays in the list but stops qualifying, which the count table records without moving anything.</p>
  </>} />
}
