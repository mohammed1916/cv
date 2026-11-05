import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
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
  ],
}

export default function Problem2150Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <RecordStateTable label="Distinct values in order: count and neighbours" columns={['value', 'occurs', 'neighbourBelow', 'neighbourAbove', 'lonely']} rows={step.rows} activeRow={step.rows.length - 1} />
          <p>Lonely so far: {step.lonely.join(', ') || 'none'}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
