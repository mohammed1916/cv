import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2116',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with s and locked (0 = free, 1 = fixed)',
  url: 'https://leetcode.com/problems/check-if-a-parentheses-string-can-be-valid/',
  complexity: 'O(n) time and O(1) extra space: only the lowest and highest balance are kept.',
  examples: [
    { label: 'Free start fixes it', input: '{"s":"))()","locked":"0100"}' },
    { label: 'Fixed close too early', input: '{"s":"())(","locked":"1111"}' },
    { label: 'Odd length', input: '{"s":"((","locked":"00"}' },
  ],
}

export default function Problem2116Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <RecordStateTable label="Balance range after each character" columns={['index', 'char', 'locked', 'lo', 'hi', 'note']} rows={step.rows} activeRow={step.rows.length - 1} />
          <p>Current range: {step.lo} to {step.hi}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
