import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'Zero open brackets is the only count.' },
    { id: 'step', label: 'Read a character', description: 'Each character moves the lowest and highest possible open counts.' },
    { id: 'fail', label: 'Too many closes', description: 'If even the highest count is negative, the prefix cannot be closed.' },
    { id: 'done', label: 'Decide', description: 'Valid when zero open brackets remains possible.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Pattern (JSON string of (, ) and *)',
  url: 'https://leetcode.com/problems/valid-parenthesis-string/',
  complexity: 'O(n) time and O(1) extra space for the two counters.',
  examples: [
    { label: 'Star closes', input: '"(*)"' },
    { label: 'Extra close', input: '"*)(*"' },
    { label: 'Star needed', input: '"(()*"' },
    { label: 'Single star', input: '"*"' },
    { label: 'Only stars', input: '"**"' },
    { label: 'Longest balanced pairs', input: '"(((((((((((((((((((((((((((((((((((((((((((((((((())))))))))))))))))))))))))))))))))))))))))))))))))"' },
    { label: 'Closing only', input: '")"' },
    { label: 'Long run: 100 characters', input: '")*)()(*((****(*)*)))***(****)*(((()(())(()***)()(**()(*)((*(()((*(()(**)((()()(***(*(()(**(*(()*()**"' },
  ],
}

export default function ValidParenthesisString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Characters" length={run.input.length} active={step.index ?? -1}
      valueAt={i => run.input[i]}
      roleAt={i => (i === step.index ? 'reading' : i < (step.index ?? -1) ? 'read' : '')} />
    <AnswerRangeBar title="Possible open counts" min={0} max={Math.max(run.input.length, 1)} low={step.lo} high={Math.max(step.hi, step.lo)} />
    <output aria-label="Range">{`lo ${step.lo} · hi ${step.hi}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why a range:</strong> a star hides three choices, so the open count is not one number but every value from lo to hi.</p>
  </>} />
}
