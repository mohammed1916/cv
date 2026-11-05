import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2119',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Whole number from 0 to 1000000',
  url: 'https://leetcode.com/problems/a-number-after-a-double-reversal/',
  complexity: 'O(d) time for d digits; O(1) extra space.',
  examples: [
    { label: 'No trailing zero', input: '1234' },
    { label: 'Trailing zero lost', input: '4090' },
    { label: 'Zero', input: '9009' },
  ],
}

export default function Problem2119Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <RecordStateTable label="Reversal stages" columns={['stage', 'input', 'output', 'digits read']} rows={[{ stage: 'original', input: step.stage === 'first' || step.stage === 'second' || step.stage === 'compare' || step.stage === 'done' ? step.input : '', output: '', 'digits read': '' }, { stage: 'reversed once', input: step.stage === 'second' || step.stage === 'compare' || step.stage === 'done' ? step.input : step.stage === 'first' ? step.input : '', output: step.stage === 'second' || step.stage === 'compare' || step.stage === 'done' ? step.input : step.output, 'digits read': step.steps.map(s => s.digit).join(' ') }]} />
          <p>Compare: {step.output} with the original {step.input}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
