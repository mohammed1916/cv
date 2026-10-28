import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'pair', label: 'Pair', description: 'Score this pair by its product divided by the square of its gcd.' },
    { id: 'done', label: 'Complete', description: 'Report the best pair strength.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers (JSON object with nums)',
  url: 'https://leetcode.com/problems/maximize-pair-strength-using-gcd/',
  complexity: 'O(n² log M) time and O(1) extra space. The visualization caps input at 8 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,3,5]}' },
    { label: 'Example 2', input: '{"nums":[4,6,8]}' },
  ],
}

export default function MaximizePairStrength() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.i}
      roleAt={i => (i === step.j ? 'pair' : '')} />
    <output aria-label="Best strength">{`Best so far: ${step.best ?? '(none)'}`}</output>
  </>} renderReasoning={() => <>
    <p>The strength of a pair is the product divided by the square of its gcd, so each pair is scored once.</p>
    <p>Since the gcd divides both numbers, the score equals (a / g) times (b / g), which stays an integer.</p>
  </>} />
}
