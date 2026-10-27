import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the first letter of str2 still needed.' },
    { id: 'scan', label: 'Scan str1', description: 'Check the next letter of str1 as is or after one cyclic step.' },
    { id: 'match', label: 'Match', description: 'The letter works for the next needed letter of str2.' },
    { id: 'done', label: 'Complete', description: 'Report whether all of str2 was matched.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with lowercase str1 and str2 (JSON)',
  url: 'https://leetcode.com/problems/make-string-a-subsequence-using-cyclic-increments/',
  complexity: 'O(|str1|) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"str1":"abc","str2":"ad"}' },
    { label: 'Example 2', input: '{"str1":"ab","str2":"d"}' },
  ],
}

export default function CyclicSubsequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="str1" length={run.input.str1.length} valueAt={i => run.input.str1[i]} active={step.i} roleAt={i => (i < step.i ? 'seen' : '')} />
    <IndexedSequence label="str2" length={run.input.str2.length} valueAt={i => run.input.str2[i]} active={step.j} roleAt={i => (i < step.j ? 'matched' : '')} />
    <output aria-label="Matched">{`Matched ${step.j} of ${run.input.str2.length} letters of str2.`}</output>
  </>} renderReasoning={() => <>
    <p>Each letter of str1 may be used as is or after one cyclic increment, so a single greedy pass is enough.</p>
    <p>Matching the earliest possible letter keeps the most of str1 available for the rest of str2.</p>
  </>} />
}
