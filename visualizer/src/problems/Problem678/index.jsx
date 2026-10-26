import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'No brackets', description: 'The open count starts at zero.' },
    { id: 'step', label: 'Read symbol', description: 'Update the minimum and maximum open counts.' },
    { id: 'reject', label: 'Too many closes', description: 'Even the most generous reading fails.' },
    { id: 'done', label: 'Complete', description: 'Valid when zero opens remain possible.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'String s (JSON string of (, ) and *)',
  url: 'https://leetcode.com/problems/valid-parenthesis-string/',
  complexity: 'O(n) time and O(1) extra space: two counters.',
  examples: [
    { label: 'Star closes', input: '"()"' },
    { label: 'Star as open', input: '"(*)"' },
    { label: 'Star both ways', input: '"(*))"' },
    { label: 'Invalid', input: '"(((("' },
  ],
}

export default function ValidParentheses() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Symbols" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => (i === step.index ? 'current' : '')} />
    <output aria-label="Open count range">Open count between {step.lo} and {step.hi}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Range, not a guess:</strong> each star widens the set of possible open counts by one in each direction, and the range is clipped at zero because an extra close is never useful.</p>
  </>} />
}
