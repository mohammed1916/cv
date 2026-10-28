import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the sum over divisors.' },
    { id: 'skip', label: 'Skip', description: 'Mobius value zero: this divisor contributes nothing.' },
    { id: 'add', label: 'Add', description: 'Add mu(d) times the number of picks divisible by d.' },
    { id: 'done', label: 'Complete', description: 'Report the coprime count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with mat, for example {"mat":[[1,2],[3,4]]}',
  url: 'https://leetcode.com/problems/count-ways-to-choose-coprime-integers-from-rows/',
  complexity: 'O(V * (m * n + sqrt V)) time for largest value V. The visualization caps the matrix at 4 by 4.',
  examples: [
    { label: 'Example 1', input: '{"mat":[[1,2],[3,4]]}' },
    { label: 'Example 2', input: '{"mat":[[2,2],[2,2]]}' },
  ],
}

export default function CoprimeRowChoices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Matrix">{run.input.mat.map(row => `[${row.join(', ')}]`).join(' ')}</output>
    <output aria-label="Divisor">{`d = ${step.d || '-'}, mu = ${step.mu}, picks divisible by d (product): ${step.ways}, running answer: ${step.answer}`}</output>
  </>} renderReasoning={() => <>
    <p>Counting the picks with gcd exactly 1 directly is hard. Counting the picks where every chosen entry is divisible by d is easy: multiply the per-row counts.</p>
    <p>Mobius inversion turns those counts into exact counts by adding mu(d) times the count for each d.</p>
  </>} />
}
