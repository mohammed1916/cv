import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'index', label: 'Index', description: 'Extend the plus and minus states ending at this index.' },
    { id: 'done', label: 'Complete', description: 'Report the largest alternating sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers (JSON object with nums)',
  url: 'https://leetcode.com/problems/maximum-alternating-subarray-sum-with-one-deletion/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 12 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[5,-5,1]}' },
    { label: 'Example 2', input: '{"nums":[10,-5,-100]}' },
  ],
}

export default function AlternatingSumOneDeletion() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index} />
    <output aria-label="Best">{`Best alternating sum so far ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Each subarray is scored with signs that start at plus. Deleting an element flips the signs after it, so the states track which sign the next element takes.</p>
    <p>The state with one deletion can skip one element, which is why it looks two indices back.</p>
  </>} />
}
