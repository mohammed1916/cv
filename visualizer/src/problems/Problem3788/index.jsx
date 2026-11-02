import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Length', description: 'Read the length of nums.' },
    { id: 'suffix', label: 'Suffix minima', description: 'Track the smallest value from each index to the end.' },
    { id: 'prefix', label: 'Prefix', description: 'Extend the prefix sum by one value.' },
    { id: 'score', label: 'Score', description: 'Subtract the smallest suffix value from the prefix sum.' },
    { id: 'improve', label: 'Improve', description: 'This split is the best seen so far.' },
    { id: 'done', label: 'Result', description: 'Report the greatest score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers',
  url: 'https://leetcode.com/problems/maximum-score-of-a-split/',
  complexity: 'O(n) time and O(n) space. The visualization caps the array at 20 values.',
  examples: [
    { label: 'Example 1', input: '[10,-1,3,-4,-5]' },
    { label: 'Example 2', input: '[-7,-5,3]' },
    { label: 'Example 3', input: '[1,1]' },
  ],
}

export default function MaximumScoreOfASplit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (step.split >= 0 ? (i <= step.split ? 'prefix' : 'suffix') : (step.suffixFrom >= 0 && i >= step.suffixFrom ? 'suffix' : ''))} />
    <output aria-label="Split score">{`split after ${step.split >= 0 ? step.split : 'none'}, prefix ${step.prefix ?? '-'}, suffix min ${step.suffixMin ?? '-'}, score ${step.score ?? '-'}, best ${step.best ?? '-'}`}</output>
  </>} renderReasoning={() => <>
    <p>Every split point k leaves a prefix nums[0..k] and a suffix nums[k+1..]. The score subtracts the suffix minimum, not its sum.</p>
    <p>Suffix minima are precomputed from the right, so each split is evaluated in constant time while the prefix sum grows from the left.</p>
  </>} />
}
