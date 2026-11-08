import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '985',
  title: 'Sum of Even Numbers After Queries',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (up to 10 integers) and queries: [value, index] pairs',
  url: 'https://leetcode.com/problems/sum-of-even-numbers-after-queries/',
  complexity: 'O(n + q) time: one pass to start the total, then constant work for each query.',
  examples: [
    { label: 'Three queries', input: JSON.stringify({ nums: [5, 2, 6, 9], queries: [[3, 0], [4, 2], [-6, 1]] }) },
    { label: 'Parity flips', input: JSON.stringify({ nums: [7, 4, 1], queries: [[1, 0], [2, 1], [-4, 1]] }) },
    { label: 'Negative values', input: JSON.stringify({ nums: [-2, 8, 3], queries: [[5, 0], [-9, 1]] }) },
    { label: 'Smallest: one number, one query', input: '{"nums":[0],"queries":[[0,0]]}' },
    { label: 'Repeated values', input: '{"nums":[2,2,2],"queries":[[2,0],[2,2]]}' },
    { label: 'Values at the limits', input: '{"nums":[100,-100,100,-100],"queries":[[100,0],[-100,3],[0,1]]}' },
    { label: 'Long run: 10 numbers and 10 queries', input: '{"nums":[16,65,32,-18,-37,62,63,-78,79,60],"queries":[[-12,3],[34,4],[45,0],[-77,8],[-43,3],[-5,2],[-39,9],[25,0],[-40,2],[38,8]]}' },
  ],
}

export default function Problem985() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const rows = run.input.queries.map(([value, index], q) => ({
      query: q + 1, add: value, index, answer: step.answer[q] ?? '',
    }))
    const processed = step.answer.length
    return <>
      <IndexedSequence label="Values after the queries so far" length={step.values.length} active={step.index ?? -1}
        valueAt={index => step.values[index]}
        roleAt={index => (index === step.index ? 'changed' : (step.values[index] % 2 === 0 ? 'even' : 'odd'))} />
      <p style={{ margin: 0, color: 'var(--text)' }}>Running even total: <strong>{step.evenSum}</strong></p>
      <RecordStateTable label="Queries" columns={['query', 'add', 'index', 'answer']} rows={rows}
        activeRow={processed === 0 ? -1 : processed - 1} />
    </>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
