import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Check each number from 1 to n in turn.' },
    { id: 'check', label: 'Find binary', description: 'The binary form of this number appears in s.' },
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
  ],
}

export default function BinaryStringWithSubstringsRepresenting() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Binary string" length={run.input.s.length} valueAt={i => run.input.s[i]} active={-1} />
    <output aria-label="Current number">{step.x ? `Checking ${step.x} = ${step.b}` : `Checking 1 to ${run.input.n}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each number is checked by its binary text, so the same test works for every number up to n.</p>
  </>} />
}
