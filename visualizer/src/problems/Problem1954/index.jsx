import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1954',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Needed apples (1 to 1000000000)',
  url: 'https://leetcode.com/problems/minimum-garden-perimeter-to-collect-enough-apples/',
  complexity: 'O(log K) probes for a search over half-sides up to K = 100000, each probe a constant-time formula.',
  examples: [
    { label: 'Thirteen apples', input: '13' },
    { label: 'One apple', input: '1' },
  ],
}

export default function Problem1954Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <AnswerRangeBar title="Half-side search (k)" min={1} max={100000} low={step.lo} high={step.hi}
        probe={step.mid} verdict={step.verdict} />
      <p>Apples inside the plot with half-side k: <strong>{step.total ?? '-'}</strong>. The plot's perimeter is 8k.</p>
      {step.result !== undefined && <output aria-label="Perimeter">Perimeter: {step.result}</output>}
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
