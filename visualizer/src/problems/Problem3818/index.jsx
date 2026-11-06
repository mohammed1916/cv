import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PrefixRemovalView from './PrefixRemovalView'
import { buildTrace, parseInput, code, python } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the last element as the suffix.' },
    { id: 'compare', label: 'Compare', description: 'Check the pair left of the suffix start.' },
    { id: 'extend', label: 'Extend', description: 'The pair is increasing, so the suffix grows left.' },
    { id: 'done', label: 'Result', description: 'Report how many elements were removed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers',
  url: 'https://leetcode.com/problems/minimum-prefix-removal-to-make-array-strictly-increasing/',
  complexity: 'O(n) time and O(1) extra space. The scan walks left once from the end.',
  examples: [
    { label: 'Example', input: '[1, 3, 2, 4]' },
    { label: 'Already increasing', input: '[1, 2, 3]' },
    { label: 'Decreasing', input: '[5, 4, 3]' },
    { label: 'Equal at boundary', input: '[1, 2, 2, 3]' },
  ],
}

export default function MinimumPrefixRemoval() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <><IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} roleAt={i => i === step.left ? 'l' : i === step.right ? 'r' : ''} /><PrefixRemovalView run={run} step={step} /></>} renderReasoning={() => <>
    <p>The retained suffix must be strictly increasing. Starting at the end and moving left, the suffix grows while each pair is strictly increasing: nums[k-1] &lt; nums[k].</p>
    <p>The first pair that is not strictly increasing (including equal values) stops the scan. Its right side becomes the suffix start, and everything before it is the removed prefix. Before the scan finishes, that count is provisional.</p>
  </>} />
}
