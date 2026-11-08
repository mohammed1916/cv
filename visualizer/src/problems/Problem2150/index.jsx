import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2150',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer array as JSON',
  url: 'https://leetcode.com/problems/find-all-lonely-numbers-in-the-array/',
  complexity: 'O(n log n) time with the sorted distinct values; O(n) space for the counts.',
  examples: [
    { label: 'Some lonely', input: '[10,6,5,8]' },
    { label: 'Adjacent pairs', input: '[1,3,5,3]' },
    { label: 'Single value', input: '[0]' },
    { label: 'Repeats are never lonely', input: '[4,4]' },
    { label: 'Edges of the range', input: '[0,40,1]' },
    { label: 'No lonely numbers', input: '[1,2,3]' },
    { label: 'Long run: 40 values', input: '[10,8,3,21,39,10,14,19,2,18,9,14,21,31,22,39,37,10,27,31,4,32,40,28,11,37,1,16,24,11,28,35,19,40,21,12,2,31,24,28]' },
  ],
}

export default function Problem2150Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="nums (input array)" length={run.input.nums.length} valueAt={i => run.input.nums[i]} roleAt={i => step.lonely.includes(run.input.nums[i]) ? 'lonely' : ''} />
          <RecordStateTable label="Distinct values in order: count and neighbours" columns={['value', 'occurs', 'neighbourBelow', 'neighbourAbove', 'lonely']} rows={step.rows} activeRow={step.rows.length - 1} />
          <p>Lonely so far: {step.lonely.join(', ') || 'none'}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
