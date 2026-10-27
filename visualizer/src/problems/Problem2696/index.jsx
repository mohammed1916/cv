import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty stack.' },
    { id: 'push', label: 'Push', description: 'Add the next letter to the top of the stack.' },
    { id: 'remove', label: 'Remove pair', description: 'The top two letters form AB or CD and are removed.' },
    { id: 'done', label: 'Complete', description: 'Report the length of the stack.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with string s of uppercase letters (JSON)',
  url: 'https://leetcode.com/problems/minimum-string-length-after-removing-substrings/',
  complexity: 'O(n) time and O(n) space.',
  examples: [
    { label: 'Example 1', input: '{"s":"ABFCACDB"}' },
    { label: 'Example 2', input: '{"s":"ACBBD"}' },
  ],
}

export default function MinimumStringLength() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.i} roleAt={i => (i < step.i ? 'seen' : '')} />
    <IndexedSequence label="Stack" length={step.stack.length} valueAt={i => step.stack[i]} active={step.stack.length - 1} />
  </>} renderReasoning={() => <>
    <p>Removing AB or CD never creates a new pattern that conflicts with another, so a stack that removes pairs as they form gives the final length.</p>
  </>} />
}
