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
    { label: 'One second', input: '{"startAt":0,"moveCost":1,"pushCost":1,"targetSeconds":1}' },
    { label: 'Equal move and push costs', input: '{"startAt":5,"moveCost":4,"pushCost":4,"targetSeconds":60}' },
    { label: 'Largest target time', input: '{"startAt":9,"moveCost":100,"pushCost":100,"targetSeconds":6039}' },
    { label: 'Long run: mixed digits', input: '{"startAt":7,"moveCost":37,"pushCost":23,"targetSeconds":4321}' },
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
