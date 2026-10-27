import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Last index', description: 'The end is reached from itself.' },
    { id: 'fill', label: 'Decide an index', description: 'Look up where its odd and even jumps land, and reuse those answers.' },
    { id: 'done', label: 'Count', description: 'Count the starts whose first jump is odd and reaches the end.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON)',
  url: 'https://leetcode.com/problems/odd-even-jump/',
  complexity: 'O(n^2) time with the scan in this visualization (O(n log n) with sorting). The visualization caps input at 20 values.',
  examples: [
    { label: 'Example 1', input: '[10,13,12,14,15]' },
    { label: 'Example 2', input: '[2,3,1,1,4]' },
  ],
}

export default function OddEvenJump() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.length} active={step.index ?? -1} valueAt={i => run.input[i]}
      roleAt={i => (step.canOdd[i] ? 'read' : '')} />
    <IndexedSequence label="Starts that can finish with an odd jump" length={run.input.length} active={step.index ?? -1}
      valueAt={i => (step.canOdd[i] ? 'yes' : 'no')} />
    <output aria-label="Message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each index has two answers: one for when its next jump is odd, one for when it is even. An odd jump from i leads to a state that asks for the even answer, and vice versa.</p>
    <p>Computing from right to left means every target is already decided when it is needed.</p>
  </>} />
}
