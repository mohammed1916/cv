import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1952',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer n from 1 to 100',
  url: 'https://leetcode.com/problems/three-divisors/',
  complexity: 'O(n) trial division for the visualization. A square-root bound works for larger n.',
  examples: [
    { label: 'Square of a prime (9)', input: '9' },
    { label: 'Not three divisors (12)', input: '12' },
  ],
}

export default function Problem1952Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label={`Candidates 1 to ${run.input.n}`} length={run.input.n} valueAt={i => i + 1}
        active={step.d > 0 ? step.d - 1 : -1}
        roleAt={i => (step.found.includes(i + 1) ? 'written' : '')} />
      <output aria-label="Divisors found">Divisors so far: {step.found.join(', ') || 'none'}</output>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
