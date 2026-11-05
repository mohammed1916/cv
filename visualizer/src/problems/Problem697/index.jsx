import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty table', description: 'No value has been recorded yet.' },
    { id: 'record', label: 'Record index', description: 'Update the count and the last index of the current value.' },
    { id: 'done', label: 'Shortest span', description: 'Among values with the top count, take the shortest first-to-last span.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Array (JSON array of integers from 0 to 49,999)',
  url: 'https://leetcode.com/problems/degree-of-an-array/',
  complexity: 'O(n) time and O(d) space for the d distinct values.',
  examples: [
    { label: 'Tie for degree', input: '[3,1,3,2,1,3,4]' },
    { label: 'Single peak', input: '[5,5,2,5,9]' },
    { label: 'All distinct', input: '[4,8,6]' },
  ],
}

export default function DegreeOfArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.length} active={step.index ?? -1} valueAt={i => run.input[i]}
      roleAt={i => (step.index !== null && i === step.index ? 'now' : '')} />
    <RecordStateTable label="Count, first and last index" columns={['value', 'count', 'first', 'last']}
      rows={step.info.map(e => ({ value: e.value, count: e.count, first: e.first, last: e.last }))} />
    <output aria-label="Degree">{step.degree === null ? 'Degree not known yet' : `Degree ${step.degree}; shortest span ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why first and last:</strong> the shortest subarray that keeps every copy of a value runs from its first occurrence to its last.</p>
  </>} />
}
