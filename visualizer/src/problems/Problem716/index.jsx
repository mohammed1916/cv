import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'Start with an empty stack.' },
    { id: 'push', label: 'Push', description: 'Add a value to the top.' },
    { id: 'pop', label: 'Pop', description: 'Remove the top value.' },
    { id: 'top', label: 'Top', description: 'Read the top value without removing it.' },
    { id: 'peekMax', label: 'Peek max', description: 'Find the largest value without removing it.' },
    { id: 'popMax', label: 'Pop max', description: 'Remove the largest value, the most recent if tied.' },
    { id: 'done', label: 'Complete', description: 'All operations are done.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Operations (JSON array)',
  url: 'https://leetcode.com/problems/max-stack/',
  complexity: 'O(n) per popMax with a plain array, which the visualization uses. The visualization caps input at 30 operations.',
  examples: [
    { label: 'Example 1', input: '[["push",5],["push",1],["push",5],["top"],["popMax"],["top"],["peekMax"],["pop"],["top"]]' },
    { label: 'Tied maxima', input: '[["push",2],["push",2],["popMax"],["top"]]' },
  ],
}

export default function MaxStack() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StackLane title="Stack (bottom to top)" items={step.stack.map(String)} note={step.index === null ? undefined : `removing index ${step.index}`} />
    <output aria-label="Result">{step.result === null ? step.message : `Result: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>A plain stack cannot find its largest value quickly. Here popMax scans the stack for the maximum and removes the most recent one, so the stack keeps its order.</p>
    <p>The visualization uses this simple scan. Production solutions keep a second sorted structure for faster popMax.</p>
  </>} />
}
