import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no ones counted.' },
    { id: 'count', label: 'Count one', description: 'A 1 joins the group that can move right.' },
    { id: 'zero', label: 'Zero after one', description: 'Each counted 1 moves past this 0.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of operations.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary string (JSON object with s)',
  url: 'https://leetcode.com/problems/maximum-number-of-operations-to-move-ones-to-the-end/',
  complexity: 'O(n) time and O(1) space. The visualization caps input at 40 characters.',
  question: "Find the maximum number of moves that push every one in a binary string to the end, where a one can only move right past zeros.",
  approaches: [
    { name: "Count zeros after each one", intuition: "Each zero that follows a one can be passed by every one counted before it, so the scan adds these up.", time: "O(n)", space: "O(1)" },
  ],
  examples: [
    { label: 'Example 1', input: '{"s":"1001101"}' },
    { label: 'No zero after one', input: '{"s":"00111"}' },
    { label: 'Single zero', input: '{"s":"0"}' },
    { label: 'Single one', input: '{"s":"1"}' },
    { label: 'All zeros at maximum length', input: '{"s":"0000000000000000000000000000000000000000"}' },
    { label: 'Long run: 40 bits', input: '{"s":"1001001110000010010010110000111000111000"}' },
  ],
}

export default function MoveOnesToEnd() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label="Binary string" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.cursor}
        roleAt={i => (run.input.s[i] === '1' && i <= step.cursor ? 'one' : '')} />
      <output aria-label="Operations">{`Ones counted: ${step.ones}, operations: ${step.operations}`}</output>
    </>
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A 1 can only move right past zeros, and each zero that follows a 1 can be passed by every 1 counted before it.</p>
  </>} />
}
