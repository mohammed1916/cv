import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty result.' },
    { id: 'read', label: 'Read', description: 'Take the character k places ahead, wrapping around.' },
    { id: 'done', label: 'Complete', description: 'Report the encrypted string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s (1 to 12 lowercase letters) and k (1 to 20)',
  url: 'https://leetcode.com/problems/find-the-encrypted-string/',
  complexity: 'O(n) time for a string of length n. The visualization caps s at 12 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"dart","k":3}' },
    { label: 'Repeats', input: '{"s":"aaa","k":1}' },
  ],
}

export default function EncryptedString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Source string s" length={run.input.s.length} valueAt={index => run.input.s[index]} active={step.source} />
    <output aria-label="Result">{`Encrypted so far: ${step.result || '(empty)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Position i reads position (i + k) modulo n, so the string is read as a cyclic shift.</p>
    <p>Each output character depends only on the original string, so one pass is enough.</p>
  </>} />
}
