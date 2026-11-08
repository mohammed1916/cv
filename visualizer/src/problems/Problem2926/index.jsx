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
    { label: 'Mixed signs, six values', input: '[8,-3,5,-5,0,-9]' },
    { label: 'All negative values', input: '[-7,-2,-6,-1]' },
    { label: 'Single positive', input: '[7]' },
    { label: 'Equal values', input: '[4,4,4,4]' },
    { label: 'Alternating extremes', input: '[10,-10,10,-10,10,-10,10,-10,10,-10]' },
    { label: 'All negative', input: '[-5,-2,-9]' },
    { label: 'Long run: 10 values', input: '[-8,7,-8,9,-4,0,3,-8,1,-7]' },
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
