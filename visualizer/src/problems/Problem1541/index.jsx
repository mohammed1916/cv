import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No open brackets are waiting yet.' },
    { id: 'open', label: 'Open', description: 'An open bracket needs two close brackets later.' },
    { id: 'pair', label: 'Close pair', description: 'Two close brackets are read together.' },
    { id: 'single', label: 'Single close', description: 'One close bracket is missing its partner.' },
    { id: 'done', label: 'Complete', description: 'Add the insertions still owed to open brackets.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s made of ( and ) (JSON)',
  url: 'https://leetcode.com/problems/minimum-insertions-to-balance-a-parentheses-string/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"s":"(()))"}' },
    { label: 'Example 2', input: '{"s":"())"}' },
  ],
}

export default function BalanceParentheses() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.i} roleAt={i => (i < step.i ? 'read' : '')} />
    <output aria-label="Counts">{`Open brackets waiting: ${step.open}. Insertions so far: ${step.ans}.`}</output>
  </>} renderReasoning={() => <>
    <p>A bracket opened once needs two close brackets, so the scan pairs close brackets two at a time.</p>
    <p>A close bracket with no open bracket waiting costs one insertion for its missing open bracket.</p>
  </>} />
}
