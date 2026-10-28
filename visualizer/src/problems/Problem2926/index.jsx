import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Single picks', description: 'Each index alone is a starting subsequence.' },
    { id: 'index', label: 'Extend', description: 'Attach this index to an earlier balanced chain.' },
    { id: 'done', label: 'Complete', description: 'Report the largest balanced sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers from -10 to 10 (JSON)',
  url: 'https://leetcode.com/problems/maximum-balanced-subsequence-sum/',
  complexity: 'O(n^2) time and O(n) space for this direct version. The visualization caps input at 10 numbers.',
  examples: [
    { label: 'Example 1', input: '[3,3,5,6]' },
    { label: 'Example 2', input: '[5,-1,-3,8]' },
  ],
}

export default function BalancedSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Keys nums[i] - i" length={step.key.length} valueAt={index => step.key[index]} active={step.i} />
    <IndexedSequence label="Best balanced sum ending at each index" length={step.best.length} valueAt={index => step.best[index]} active={step.i} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The rule that consecutive picks satisfy nums[b] - nums[a] at least b - a is the same as key[a] at most key[b], with key[i] = nums[i] - i.</p>
    <p>So the best balanced subsequence ending at i extends the best one ending at an earlier index with a smaller or equal key.</p>
  </>} />
}
