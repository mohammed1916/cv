import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CoinBarsView from './CoinBarsView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Zero heads is certain before any toss.' },
    { id: 'coin', label: 'Coin', description: 'Bring the next coin into the calculation.' },
    { id: 'update', label: 'Update', description: 'Rewrite the chance of one head count.' },
    { id: 'done', label: 'Result', description: 'Read the chance of the asked head count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with prob (heads chances) and target ({"prob":[0.25,0.75],"target":1})',
  url: 'https://leetcode.com/problems/toss-strange-coins/',
  complexity: 'O(n^2) time and O(n) space for n coins. The visualization caps the coins at 8; the official limit is 10.',
  examples: [
    { label: 'Biased trio', input: '{"prob":[0.25,0.75,0.5],"target":2}' },
    { label: 'Mostly tails', input: '{"prob":[0.9,0.1],"target":0}' },
    { label: 'Mixed odds', input: '{"prob":[0.3,0.6,0.8,0.2],"target":3}' },
  ],
}

export default function TossStrangeCoins() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <CoinBarsView run={run} step={step} />}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
