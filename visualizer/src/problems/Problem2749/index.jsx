import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import * as model from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Choose the trial counts to test.' },
    { id: 'try', label: 'Try k', description: 'Compute x = num1 - k * num2 for this count.' },
    { id: 'accept', label: 'Works', description: 'Exactly k powers of two can make x.' },
    { id: 'reject', label: 'Rejected', description: 'This count cannot work; try the next one.' },
    { id: 'done', label: 'Result', description: 'The smallest working count, or -1.' },
  ], parse: model.parseInput, build: model.buildTrace, code: model.code, python: model.python,
  inputLabel: 'Object with num1 and num2 (integers)', url: 'https://leetcode.com/problems/minimum-operations-to-make-the-integer-zero/', complexity: 'Each k is tried once, up to 64 trials, and each trial counts set bits. The visualization caps the inputs.',
  examples: [{ label: 'Small positive step', input: '{"num1":17,"num2":-2}' }, { label: 'Zero step', input: '{"num1":9,"num2":0}' }],
}

export default function ProblemVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      // One row per trial count k. The row shows x = num1 - k * num2, its set bits, and the test popcount <= k <= x.
      const tried = run.frames.filter(f => f.phase === 'accept' || f.phase === 'reject')
      const rows = tried.map(f => ({ k: f.k, x: f.x, bits: f.bits ?? '-', verdict: f.phase === 'accept' ? 'works' : 'no' }))
      const current = rows.findIndex(r => r.k === step.k && r.verdict === (step.phase === 'accept' ? 'works' : 'no'))
      return <>
        <AnswerRangeBar title="Operation counts searched" min={0} max={64} low={step.k ?? 0} high={64}
          probe={step.k ?? null} verdict={step.phase === 'accept'} />
        <RecordStateTable label="Trial operation counts" columns={['k', 'x', 'bits', 'verdict']} rows={rows} activeRow={current} />
        <p style={{ color: 'var(--text)' }}>{step.phase === 'done' ? `Result ${run.result}` : 'Each operation subtracts a power of two plus num2. Exactly k operations can remove x only if set bits(x) <= k <= x.'}</p>
      </>
    }}
    renderReasoning={() => <p>Fix k, then num1 - k * num2 must equal a sum of exactly k powers of two. That is possible when its set-bit count is at most k and it is at least k.</p>} />
}
