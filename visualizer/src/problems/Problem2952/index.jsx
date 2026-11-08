import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the coins from smallest to largest.' },
    { id: 'use', label: 'Use coin', description: 'A coin no larger than reach plus one extends the reachable range.' },
    { id: 'add', label: 'Add coin', description: 'No coin fits, so add the value reach plus one.' },
    { id: 'done', label: 'Complete', description: 'Report how many coins were added.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with coins (array of positive integers) and target',
  url: 'https://leetcode.com/problems/minimum-number-of-coins-to-be-added/',
  complexity: 'O(n log n) time for the sort, plus one step per coin or added coin. The visualization caps input at 8 coins and target 60.',
  examples: [
    { label: 'Three coin values, target 25', input: '{"coins":[3,7,12],"target":25}' },
    { label: 'Repeated coin value four', input: '{"coins":[4,4,9,15],"target":30}' },
    { label: 'Single coin', input: '{"coins":[1],"target":1}' },
    { label: 'Equal coins', input: '{"coins":[2,2],"target":4}' },
    { label: 'Largest coins', input: '{"coins":[60,60,60,60,60,60,60,60],"target":60}' },
    { label: 'Long run: 8 coins', input: '{"coins":[41,23,51,43,24,3,20,10],"target":47}' },
  ],
}

export default function MinimumNumberOfCoinsToBeAdded() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted coins" length={[...run.input.coins].sort((a, b) => a - b).length} valueAt={i => [...run.input.coins].sort((a, b) => a - b)[i]} active={step.index} roleAt={i => (i < step.next ? 'used' : '')} />
    <output aria-label="Reachable range">{`Sums 1 to ${step.reach} are reachable. Added: ${step.added.join(', ') || 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>If every sum from 1 to reach can be made, then a coin no larger than reach plus one extends the range to reach plus that coin.</p>
    <p>When the next coin is too large, the only way to extend the range is to add the value reach plus one, which doubles the range.</p>
  </>} />
}
