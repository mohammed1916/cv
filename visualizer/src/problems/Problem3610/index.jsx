import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CoinRowView from './CoinRowView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3610',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Target integer (e.g. 27)',
  url: 'https://leetcode.com/problems/minimum-number-of-primes-to-sum-to-target/',
  complexity: 'O(target × π(target)) time and O(target) space, where π(target) counts primes up to the target. The visualization caps the target at 60; the official numeric bounds are not verified here.',
  examples: [
    { label: 'Three primes', input: '27' },
    { label: 'Small target', input: '4' },
    { label: 'Impossible', input: '1' },
    { label: 'Two', input: '2' },
    { label: 'Thirty', input: '30' },
    { label: 'Largest target', input: '60' },
    { label: 'Long run: target 59', input: '59' },
  ],
}

export default function Problem3610Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <CoinRowView run={run} step={step} />}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
