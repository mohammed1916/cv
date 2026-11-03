import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'push', label: 'Push', description: 'Add the next character to the stack.' },
    { id: 'remove', label: 'Remove', description: 'Delete a k-balanced block at the top.' },
    { id: 'done', label: 'Result', description: 'The stack after all characters.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (parentheses) and k',
  url: 'https://leetcode.com/problems/remove-k-balanced-substrings/',
  complexity: 'O(n * k) time: each push compares the top 2k symbols.',
  examples: [
    { label: 'Example', input: '{"s":"(()())((","k":1}' },
    { label: 'Nested', input: '{"s":"(((())))","k":2}' },
  ],
}

export default function RemoveKBalancedSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="stack" length={step.stack.length} valueAt={i => step.stack[i]} active={step.stack.length - 1}
      roleAt={() => ''} />
    <output aria-label="Stack contents">{`stack: ${step.stack.join('') || '(empty)'}`}</output>
  </>} renderReasoning={() => <>
    <p>A k-balanced block can only be completed when its last closing parenthesis arrives. So checking the top of the stack after each push finds every block that forms.</p>
    <p>Removing a block exposes an earlier stack state that already had no block, so the stack stays clean.</p>
  </>} />
}
