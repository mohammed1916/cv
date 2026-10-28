import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty stack.' },
    { id: 'push', label: 'Push', description: 'Keep the letter because it does not cancel the top.' },
    { id: 'remove', label: 'Cancel', description: 'The letter and the top letter are consecutive, so both disappear.' },
    { id: 'done', label: 'Complete', description: 'Report what remains on the stack.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (JSON)',
  url: 'https://leetcode.com/problems/resulting-string-after-adjacent-removals/',
  complexity: 'O(n) time and O(n) space. The visualization caps s at 20 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"abc"}' },
    { label: 'Example 2', input: '{"s":"adcb"}' },
    { label: 'Example 3', input: '{"s":"zadb"}' },
  ],
}

export default function AdjacentRemovals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input letters" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.at ?? -1}
      roleAt={i => (i < (step.at ?? -1) ? 'read' : '')} />
    <output aria-label="Stack">{`Stack: ${step.stack.join('') || 'empty'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Removing a consecutive pair can only create a new pair next to the gap, and the stack checks exactly that spot.</p>
  </>} />
}
