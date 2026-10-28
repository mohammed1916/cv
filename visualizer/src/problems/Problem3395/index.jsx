import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No subsequence has been counted yet.' },
    { id: 'middle', label: 'Middle', description: 'Fix a middle position and try the pairs on each side of it.' },
    { id: 'count', label: 'Count', description: 'The middle value is the single most frequent value, so the subsequence counts.' },
    { id: 'done', label: 'Complete', description: 'Report the number of qualifying subsequences.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of 5 to 12 positive integers up to 100 (JSON)',
  url: 'https://leetcode.com/problems/subsequences-with-a-unique-middle-mode-i/',
  complexity: 'O(n^5) time in this visualization, which caps the array at 12 values. The known solution is faster.',
  examples: [
    { label: 'Example 1', input: '[1,1,1,1,1,1]' },
    { label: 'Example 2', input: '[1,2,2,3,3,4]' },
  ],
}

export default function UniqueMiddleMode() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roleAt = index => {
      if (index === step.middle) return 'middle'
      return step.picked.includes(index) ? 'picked' : ''
    }
    return <>
      <IndexedSequence label="nums" length={run.input.length} valueAt={index => run.input[index]} active={step.middle} roleAt={roleAt} />
      <output aria-label="Total">{`Qualifying subsequences so far: ${step.total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A subsequence of size 5 has its middle element at position 2. That element must be the only value that appears most often among the five.</p>
    <p>The visualization fixes each middle position, then tries every pair before it and every pair after it.</p>
  </>} />
}
