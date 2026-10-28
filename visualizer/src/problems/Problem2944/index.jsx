import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'End', description: 'Nothing remains after the last fruit.' },
    { id: 'fruit', label: 'Buy fruit', description: 'Buying fruit i frees fruits i+1 to 2i; choose the cheapest next purchase in that reach.' },
    { id: 'done', label: 'Complete', description: 'Report the cost from fruit 1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with prices (JSON, 1-indexed fruits)',
  url: 'https://leetcode.com/problems/minimum-number-of-coins-for-fruits/',
  complexity: 'O(n^2) time for the direct scan of each reach, O(n) space. The visualization caps n at 10.',
  examples: [
    { label: 'Example 1', input: '{"prices":[3,1,2]}' },
    { label: 'Example 2', input: '{"prices":[1,10,1,1]}' },
  ],
}

export default function MinimumCoinsForFruits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Cost to finish from each fruit" length={run.input.prices.length} valueAt={i => step.values[i]}
      active={step.fruit - 1} roleAt={i => (step.lo > 0 && i + 1 >= step.lo && i + 1 <= Math.min(step.hi, run.input.prices.length) ? 'reach' : '')} />
    <output aria-label="Fruit">{step.fruit <= run.input.prices.length ? `Fruit ${step.fruit} price ${run.input.prices[step.fruit - 1]}` : 'Past the last fruit'}</output>
  </>} renderReasoning={() => <>
    <p>Buying fruit i gives fruits i+1 through 2i for free, so the next purchase must fall inside that reach or immediately after it.</p>
    <p>Working backward from the last fruit means each cost is already known when it is needed.</p>
  </>} />
}
