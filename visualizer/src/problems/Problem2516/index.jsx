import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count each letter and check that every letter can reach k.' },
    { id: 'extend', label: 'Extend', description: 'Add the next letter to the removed middle window.' },
    { id: 'shrink', label: 'Shrink', description: 'Move the window start forward until no letter is removed too many times.' },
    { id: 'record', label: 'Record', description: 'Keep the longest removable middle window.' },
    { id: 'done', label: 'Complete', description: 'Report the minutes needed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s (letters a, b, c) and k, for example {"s":"abc","k":1}',
  url: 'https://leetcode.com/problems/take-k-of-each-character-from-left-and-right/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps s at 40 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"aabaaaacaabc","k":2}' },
    { label: 'Impossible', input: '{"s":"a","k":1}' },
  ],
}

export default function TakeKOfEachCharacter() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Characters" length={run.input.s.length} valueAt={index => run.input.s[index]} active={step.right}
      roleAt={index => (step.left <= index && index <= step.right ? 'removed' : 'kept')} />
    <output aria-label="Removed window">{`Removed middle: ${step.right < step.left ? 'empty' : `positions ${step.left}–${step.right}`}, longest ${step.longest}`}</output>
  </>} renderReasoning={() => <>
    <p>Taking from the two ends is the same as keeping one contiguous middle block. Minimizing the minutes means maximizing the removed middle.</p>
    <p>The removed middle is valid while, for every letter, the removed part holds no more than total minus k of it.</p>
  </>} />
}
