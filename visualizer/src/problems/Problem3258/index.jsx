import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty window and no substrings counted.' },
    { id: 'extend', label: 'Extend', description: 'Add the character at the right end of the window.' },
    { id: 'shrink', label: 'Shrink', description: 'Drop characters from the left while both counts exceed k.' },
    { id: 'count', label: 'Count', description: 'Every start from left to right ends at this right edge and is valid.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of valid substrings.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a binary string s and k, for example {"s":"10101","k":1}',
  url: 'https://leetcode.com/problems/count-substrings-that-satisfy-k-constraint-i/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps s at 40 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"10101","k":1}' },
    { label: 'Example 2', input: '{"s":"1010101","k":2}' },
  ],
}

export default function CountKConstraintSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Binary string" length={run.input.s.length} valueAt={index => run.input.s[index]} active={step.right}
      roleAt={index => (step.right >= 0 && step.left <= index && index <= step.right ? 'window' : '')} />
    <output aria-label="Window counts">{`Window zeros ${step.window.zeros}, ones ${step.window.ones}, k = ${run.input.k}. Valid substrings so far: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>A substring is valid when it has at most k zeros or at most k ones. Shrinking a valid substring keeps it valid, so the valid starts for each end form a block that ends at that end.</p>
    <p>A left pointer that only moves forward finds the first valid start for each right edge, and the block size is added to the count.</p>
  </>} />
}
