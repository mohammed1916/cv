import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty stack.' },
    { id: 'push', label: 'Push', description: 'Push the next letter onto the stack.' },
    { id: 'pop', label: 'Remove abc', description: 'The top three letters form abc, so remove them.' },
    { id: 'done', label: 'Complete', description: 'The word is valid only if the stack is empty.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Word (JSON object with s)',
  url: 'https://leetcode.com/problems/check-if-word-is-valid-after-substitutions/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 20 letters.',
  examples: [
    { label: 'Valid', input: '{"s":"aabcbc"}' },
    { label: 'Nested', input: '{"s":"abcabcababcc"}' },
    { label: 'Invalid', input: '{"s":"abccba"}' },
  ],
}

export default function ValidWordAfterSubstitutions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Word" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.cursor}
      roleAt={i => (i < step.consumed ? 'read' : '')} />
    <StackLane title="Stack" items={step.stack} dropped={step.removed} note={step.phase === 'pop' ? 'abc removed' : undefined} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Every abc that forms on top of the stack can be deleted without changing whether the word is valid, so the stack only keeps letters that are not yet part of a removable block.</p>
  </>} />
}
