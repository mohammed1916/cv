import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty tables', description: 'Start with no indices filled.' },
    { id: 'change', label: 'Change', description: 'Move the index into the set for its new number.' },
    { id: 'find', label: 'Find', description: 'Return the smallest index in the number’s set.' },
    { id: 'done', label: 'Complete', description: 'Every operation has been answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Operations as JSON: {"operations": [["change", index, number], ["find", number], ...]}',
  url: 'https://leetcode.com/problems/design-a-number-container-system/',
  complexity: 'O(1) time for change and O(k) time for find, where k is the number of indices holding that number. The visualization caps input at 30 operations.',
  examples: [
    { label: 'Example 1', input: '{"operations":[["find",10],["change",2,10],["change",1,10],["change",3,10],["change",5,10],["find",10],["change",1,20],["find",10]]}' },
  ],
}

export default function NumberContainers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Latest find">{step.result === null ? 'No find answer in this step' : `Find answer: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Each index is stored under its current number, and each number keeps the set of indices holding it. A change only moves one index between two sets.</p>
    <p>Find reads the set for its number and returns the smallest index; the set is small here, so the minimum is taken directly.</p>
  </>} />
}
