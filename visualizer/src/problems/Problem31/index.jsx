import authoredExamples0 from '../../config/examples/next-permutation.js';

import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '31', parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array nums (JSON array of 1 to 100 integers from 0 to 100)',
  url: 'https://leetcode.com/problems/next-permutation/',
  complexity: 'O(n) time and O(1) extra space, where n = nums.length.',
  phases: [
    { id: 'find-pivot', label: 'Find pivot', description: 'Scan from the right for the first ascent nums[i] < nums[i+1].' },
    { id: 'found-pivot', label: 'Pivot', description: 'The pivot i is located.' },
    { id: 'found-swap', label: 'Find successor', description: 'Scan from the right for the smallest value larger than the pivot.' },
    { id: 'swapped', label: 'Swap', description: 'Exchange the pivot with its successor.' },
    { id: 'reverse', label: 'Reverse suffix', description: 'Reverse the suffix to its smallest arrangement.' },
    { id: 'done', label: 'Return', description: 'Return the modified array.' },
  ],
  examples: authoredExamples0.map(example => ({ label: example.label, input: JSON.stringify(example.nums) })),
}

function NextPermutation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums (current state)" length={step.nums.length} valueAt={index => step.nums[index]}
      roleAt={index => index === step.i ? 'pivot' : index === step.swapJ || index === step.j ? 'swap' : step.reverseStart >= 0 && index >= step.reverseStart ? 'suffix' : ''} />
    <output aria-label="Next permutation state">{step.phase === 'done' ? `Result: [${run.result.join(', ')}]` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>The rightmost ascent is the pivot. Its successor is the smallest larger value to its right, so the increase is as small as possible.</p>
    <p>If no ascent exists, the array is the largest permutation and the answer wraps to the smallest by reversing the whole array.</p>
    <p>The visualization limits inputs to the official 100 elements; playback keeps one snapshot per step.</p>
  </>} />
}

export default withProblemStory(NextPermutation, storyGuide);
