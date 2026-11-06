import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2136',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with plantTime and growTime',
  url: 'https://leetcode.com/problems/earliest-possible-day-of-full-bloom/',
  complexity: 'O(n log n) time for sorting by growth time; O(n) space.',
  examples: [
    { label: 'Long growth goes first', input: '{"plantTime":[3,1,6],"growTime":[4,2,1]}' },
    { label: 'Equal growth', input: '{"plantTime":[2,2],"growTime":[5,5]}' },
  ],
}

export default function Problem2136Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="plantTime (input array)" length={run.input.plantTime.length} valueAt={i => run.input.plantTime[i]} active={step.current} roleAt={i => step.rows.some(r => r.seed === i) ? 'planted' : ''} />
          <IndexedSequence label="growTime (input array)" length={run.input.growTime.length} valueAt={i => run.input.growTime[i]} active={step.current} roleAt={i => step.rows.some(r => r.seed === i) ? 'planted' : ''} />
          <RecordStateTable label="Planting schedule (longest growth first)" columns={['seed', 'plant', 'grow', 'planted', 'blooms']} rows={step.rows} activeRow={step.rows.length - 1} />
          <p>Latest bloom so far: {step.best}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
