import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Characters of s, with the current index"
            length={run.input.s.length}
            active={step.i ?? -1}
            valueAt={i => run.input.s[i]}
            roleAt={i => (run.input.locked[i] === '1' ? 'fixed' : 'free')}
          />
          <RecordStateTable label="Balance range after each character" columns={['index', 'char', 'locked', 'lo', 'hi', 'note']} rows={step.rows} activeRow={step.rows.length - 1} />
          <p>Current range: {step.lo} to {step.hi}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
