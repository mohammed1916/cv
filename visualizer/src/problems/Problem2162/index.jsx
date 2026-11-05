import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2162',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with startAt, moveCost, pushCost and targetSeconds',
  url: 'https://leetcode.com/problems/minimum-cost-to-set-cooking-time/',
  complexity: 'O(100) candidates, each with at most four digits; O(1) time and space.',
  examples: [
    { label: 'Ten minutes', input: '{"startAt":1,"moveCost":2,"pushCost":1,"targetSeconds":600}' },
    { label: 'Ninety seconds', input: '{"startAt":4,"moveCost":3,"pushCost":2,"targetSeconds":90}' },
  ],
}

export default function Problem2162Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <RecordStateTable label="Ways to show the target time" columns={['minutes', 'seconds', 'digits', 'cost']} rows={step.rows} activeRow={step.rows.length - 1} />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
