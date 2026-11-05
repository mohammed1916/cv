import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2131',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Two-letter words as a JSON array',
  url: 'https://leetcode.com/problems/longest-palindrome-by-concatenating-two-letter-words/',
  complexity: 'O(n) time with a count per word; O(n) space.',
  examples: [
    { label: 'Mirror pairs', input: '["ab","ba","ca","ac","zz"]' },
    { label: 'Doubled letters', input: '["qq","qq","qq","rs"]' },
    { label: 'Only middle', input: '["aa"]' },
  ],
}

export default function Problem2131Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <RecordStateTable label="Word counts and pairing" columns={['word', 'count', 'used']} rows={step.rows} activeRow={step.rows.findIndex(r => r.word === step.current)} />
          <p>Length so far: {step.length}{step.middle ? ' · a middle word is available' : ''}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
