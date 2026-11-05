import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2151',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Statement matrix as JSON (0 bad, 1 good, 2 none; diagonal 2)',
  url: 'https://leetcode.com/problems/maximum-good-people-based-on-statements/',
  complexity: 'O(2^n n^2) time for n people by trying every subset; O(n) extra space.',
  examples: [
    { label: 'Two good people', input: '[[2,1,2],[1,2,0],[2,1,2]]' },
    { label: 'Contradiction', input: '[[2,0],[0,2]]' },
  ],
}

export default function Problem2151Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <RecordStateTable label="Recent assumptions (G good, b bad)" columns={['assumption', 'good', 'verdict']} rows={step.rows} activeRow={step.rows.length - 1} />
          <p>Best so far: {step.best}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
