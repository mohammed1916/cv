import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'With no coins, only amount 0 has a way.' },
    { id: 'match', label: 'Match', description: 'The coins so far already explain this amount.' },
    { id: 'coin', label: 'Coin', description: 'One more way is missing, so this amount is a denomination.' },
    { id: 'done', label: 'Complete', description: 'Report the denominations found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with numWays (JSON)',
  url: 'https://leetcode.com/problems/inverse-coin-change/',
  complexity: 'O(n^2) time. The visualization caps the array at 10 entries.',
  examples: [
    { label: 'Example 2', input: '{"numWays":[1,2,2,3,4]}' },
    { label: 'Example 3', input: '{"numWays":[1,2,3,4,15]}' },
  ],
}

export default function InverseCoinChange() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="numWays" length={run.input.numWays.length} valueAt={i => run.input.numWays[i]} active={step.amount ? step.amount - 1 : -1} />
    <output aria-label="Coins">{`Coins found: ${step.coins.join(', ') || 'none'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Coins only add ways at their own amount, so scanning amounts in order decides each denomination exactly once.</p>
  </>} />
}
