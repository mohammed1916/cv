import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty answer.' },
    { id: 'restore', label: 'Restore', description: 'Each value is the xor of two neighboring prefix values.' },
    { id: 'done', label: 'Complete', description: 'Report the original array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with pref (values 0 to 15), for example {"pref":[5,2,0,3,1]}',
  url: 'https://leetcode.com/problems/find-the-original-array-of-prefix-xor/',
  complexity: 'O(n) time and O(n) space for the answer.',
  examples: [
    { label: 'Example 1', input: '{"pref":[5,2,0,3,1]}' },
    { label: 'Single value', input: '{"pref":[13]}' },
  ],
}

export default function RestorePrefixXor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Prefix xor (given)" length={run.input.pref.length} valueAt={i => run.input.pref[i]} active={step.index} roleAt={i => (i < step.index ? 'done' : '')} />
    <IndexedSequence label="Original (restored so far)" length={step.answer.length} valueAt={i => step.answer[i]} active={step.index} />
  </>} renderReasoning={() => <>
    <p>Let p be the prefix xors. Then p[i] xor p[i-1] is exactly the original value at index i, because xor cancels the shared prefix.</p>
    <p>The first original value is p[0] itself.</p>
  </>} />
}
