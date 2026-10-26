import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Target', description: 'Choose the target c.' },
    { id: 'try', label: 'Try a', description: 'Check whether c − a² is a perfect square.' },
    { id: 'done', label: 'Complete', description: 'Report the pair or the failure.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Integer c (JSON)',
  url: 'https://leetcode.com/problems/sum-of-square-numbers/',
  complexity: 'O(√c) time with an O(1) perfect-square test per step, and O(1) extra space.',
  examples: [
    { label: 'Five', input: '5' },
    { label: 'Three', input: '3' },
    { label: 'Large', input: '2147483600' },
  ],
}

export default function SumOfSquares() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Search">c = {run.input}{step.phase === 'done' ? ` · result ${String(run.result)}` : ` · trying a = ${step.a}${step.b !== null && step.b !== undefined ? `, b ≈ ${step.b}` : ''}`}</output>
    <div className="algorithm-sequence"><h3>Remainder c − a²</h3>
      <p>{step.rest !== undefined ? `${step.rest} ${step.isSquare ? '(perfect square)' : ''}` : '—'}</p></div>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Bound:</strong> a and b are at most √c, so checking a from 0 to √c covers every candidate.</p>
    <p>Target {run.input}: exactly the pairs (a, b) with a² + b² = c are accepted.</p>
  </>} />
}
