import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Square and sort the values.' },
    { id: 'plus', label: 'Plus', description: 'The largest squares take the plus positions.' },
    { id: 'minus', label: 'Minus', description: 'The rest take the minus positions.' },
    { id: 'done', label: 'Complete', description: 'Report the score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums, for example {"nums":[1,2,3]}',
  url: 'https://leetcode.com/problems/maximum-alternating-sum-of-squares/',
  complexity: 'O(n log n) time. The visualization caps the array at 8 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3]}' },
    { label: 'Example 2', input: '{"nums":[1,-1,2,-2,3,-3]}' },
  ],
}

export default function AlternatingSumSquares() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted squares" length={run.input.nums.length} valueAt={index => run.input.nums.map(x => x * x).sort((a, b) => b - a)[index]} active={step.index} roleAt={index => (index < step.plus ? 'plus' : 'minus')} />
    <output aria-label="Score">{`Plus positions: ${step.plus}. Score so far: ${step.score}`}</output>
  </>} renderReasoning={() => <>
    <p>The plus positions are the even indices, and there are ceil(n / 2) of them. Each square contributes with its sign, so the score is the sum of plus squares minus the sum of minus squares.</p>
    <p>Giving the largest squares to the plus positions maximizes that difference.</p>
  </>} />
}
