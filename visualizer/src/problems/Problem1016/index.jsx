import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Check each number from 1 to n in turn.' },
    { id: 'check', label: 'Find binary', description: 'The binary form of this number appears in s, shown as a highlighted window.' },
    { id: 'missing', label: 'Missing', description: 'The binary form of this number is not in s.' },
    { id: 'done', label: 'Complete', description: 'Report whether every number was found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary string and n (JSON object with s and n)',
  url: 'https://leetcode.com/problems/binary-string-with-substrings-representing-1-to-n/',
  complexity: 'O(n * s) time with simple substring checks. The visualization caps s at 40 characters and n at 40.',
  examples: [
    { label: 'Example 1', input: '{"s":"0110","n":3}' },
    { label: 'Example 2', input: '{"s":"0110","n":4}' },
    { label: 'Example 3', input: '{"s":"1011","n":3}' },
  ],
}

export default function BinaryStringWithSubstringsRepresenting() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s, n } = run.input
    const window = step.match
    const numbers = Array.from({ length: n }, (_, i) => i + 1)
    return <>
      <IndexedSequence label="Binary string s" length={s.length} valueAt={i => s[i]} active={window ? window[0] : -1}
        roleAt={i => (window && i >= window[0] && i <= window[1] ? 'window' : '')} />
      <IndexedSequence label={`Numbers 1 to ${n} in binary`} length={n} valueAt={i => numbers[i].toString(2)} active={step.x ? step.x - 1 : -1}
        indexOffset={1}
        roleAt={i => (step.x && i + 1 < step.x ? 'read' : '')} />
      <output aria-label="Current number">{step.x ? `Checking ${step.x} = ${step.b}` : `Checking 1 to ${n}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The highlighted window is where the binary text of the current number is found inside s. Numbers already confirmed are marked as read.</p>
    <p>Each number is checked by its binary text, so the same substring test works for every number up to n.</p>
  </>} />
}
