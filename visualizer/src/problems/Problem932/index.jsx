import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Seed', description: 'Start from [1].' },
    { id: 'expand', label: 'Double', description: 'Map to odds and evens and concatenate.' },
    { id: 'filter', label: 'Filter', description: 'Discard values larger than n.' },
    { id: 'done', label: 'Complete', description: 'Return the beautiful array.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'n (JSON integer)',
  url: 'https://leetcode.com/problems/beautiful-array/',
  complexity: 'O(n) time and space (the array doubles each round). The visualization caps n at 200.',
  examples: [{ label: 'Example 1', input: '4' }, { label: 'Example 2', input: '5' }, { label: 'n = 11', input: '11' }],
}

export default function BeautifulArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Current array" length={step.res.length} valueAt={i => step.res[i]}
      roleAt={i => step.phase === 'expand' ? (i < step.odds ? 'left' : 'right') : step.phase === 'filter' ? (step.res[i] <= run.input ? 'match' : 'dropped') : ''} />
    <output aria-label="Round">Round {step.round}; length {step.res.length}</output>
  </>} renderReasoning={() => <>
    <p>A triple i&lt;k&lt;j breaks beauty when nums[k]*2 = nums[i]+nums[j]. The sum of two numbers is even only if both have equal parity, while the needed 2*nums[k] is always even.</p>
    <p>Putting all odd numbers before all even numbers means any endpoints pair from different parities has an odd sum, which can never equal an even 2*nums[k]. Within each half the same argument recurses, since affine maps x to 2x-1 or 2x preserve the mean property.</p>
  </>} />
}
