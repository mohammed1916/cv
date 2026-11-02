import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SplitScoreView from './SplitScoreView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Length', description: 'Read the length of nums and the number of splits.' },
    { id: 'suffix', label: 'Suffix minima', description: 'Fill suffix_min from right to left, recording the index that supplied each minimum.' },
    { id: 'prefix', label: 'Prefix', description: 'Extend the prefix sum by one value; this moves the split boundary right.' },
    { id: 'score', label: 'Candidate', description: 'Score the current split as prefix minus the suffix minimum, then compare it with the retained optimum.' },
    { id: 'improve', label: 'Improve', description: 'This candidate becomes the retained optimum.' },
    { id: 'done', label: 'Result', description: 'Report the retained optimum and the split that produced it.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers',
  url: 'https://leetcode.com/problems/maximum-score-of-a-split/',
  complexity: 'O(n) time and O(n) space for the solver. The trace stores a copy of the suffix row in every frame, so trace memory is O(n²); the visualization caps the array at 20 values.',
  examples: [
    { label: 'Example 1', input: '[10,-1,3,-4,-5]' },
    { label: 'Example 2', input: '[-7,-5,3]' },
    { label: 'Example 3', input: '[1,1]' },
  ],
}

export default function MaximumScoreOfASplit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <SplitScoreView run={run} step={step} />} renderReasoning={() => <>
    <p>A split after index k leaves the prefix nums[0..k] and the suffix nums[k+1..]. The score subtracts the smallest suffix value, not the suffix sum.</p>
    <p>suffix_min is filled from the right, so each split reads one precomputed cell. The prefix sum grows from the left while the retained optimum keeps the best split seen so far.</p>
    <p>With [10,-1,3,-4,-5] the best split is after index 2 (prefix 12, suffix min -5, score 17). The later split after index 3 scores 13 and does not replace it.</p>
  </>} />
}
