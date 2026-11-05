import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2145',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with differences, lower and upper',
  url: 'https://leetcode.com/problems/count-the-hidden-sequences/',
  complexity: 'O(n) time for n differences; O(1) extra space (the trace keeps every offset for display).',
  examples: [
    { label: 'Span fits twice', input: '{"differences":[2,-1,3],"lower":0,"upper":6}' },
    { label: 'Too wide', input: '{"differences":[5,5],"lower":0,"upper":4}' },
  ],
}

export default function Problem2145Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <IndexedSequence label="Offsets from the first value (lowest and highest mark the span)" length={step.offsets.length} valueAt={i => step.offsets[i]} active={-1} roleAt={i => (step.offsets[i] === step.high ? 'highest' : step.offsets[i] === step.low ? 'lowest' : '')} />
          <RecordStateTable label="Span of offsets" columns={['lowest', 'highest', 'count']} rows={[{ lowest: step.low, highest: step.high, count: step.count ?? '–' }]} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
