import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The running balance begins at zero.' },
    { id: 'scan', label: 'Scan', description: 'Each a adds one and each b subtracts one.' },
    { id: 'done', label: 'Result', description: 'The leftover letters are the absolute balance.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String of letters a and b (1 to 40 characters), or a JSON string',
  url: 'https://leetcode.com/problems/minimum-string-length-after-balanced-removals/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Mixed', input: 'aabbab' },
    { label: 'All a', input: 'aaaa' },
  ],
}

export default function MinimumStringLengthAfterBalancedRemovals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.at}
      roleAt={i => (i === step.at ? 'window' : '')} />
    <output aria-label="Balance check">{`a minus b = ${step.balance}`}</output>
  </>} renderReasoning={() => <>
    <p>Removing a substring with equal a and b counts never changes the difference between the two totals.</p>
    <p>Whatever remains can only be the surplus of one letter, so the final length is the absolute value of that surplus.</p>
  </>} />
}
