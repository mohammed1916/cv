import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with an integer n from 0 to 37 (JSON)',
  url: 'https://leetcode.com/problems/n-th-tribonacci-number/',
  complexity: 'O(n) time and O(1) extra space with a three-term window. The visualization caps n at 37.',
  examples: [
    { label: 'Term 6', input: '{"n":6}' },
    { label: 'Term 10', input: '{"n":10}' },
    { label: 'Start', input: '{"n":0}' },
    { label: 'First term', input: '{"n":1}' },
    { label: 'Second term', input: '{"n":2}' },
    { label: 'Long run: n = 37', input: '{"n":37}' },
  ],
}

// Terms T0..T(last) so the row shows every term the window has passed.
function termsUpTo(last) {
  const terms = [0, 1, 1]
  for (let i = 3; i <= last; i++) terms.push(terms[i - 1] + terms[i - 2] + terms[i - 3])
  return terms.slice(0, Math.max(last + 1, 1))
}

export default function NthTribonacci() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { window, index, n } = step.snapshot
    const last = Math.max(index, 0)
    const terms = termsUpTo(Math.max(last, n))
    const marks = {}
    for (let i = Math.max(0, last - 2); i <= last && i < terms.length; i++) marks[i] = 'window'
    return <>
      <Sequence label={`Terms T0 to T${Math.min(n, last)} (window = last three)`} values={terms.slice(0, last + 1)} pointers={last >= 2 ? { l: last - 2, r: last } : { r: last }} marks={marks} />
      <Vars vars={{ 'window': window.join(', '), 'i (current term)': index, 'target n': n }} />
      <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result}` : step.message}</output>
    </>
  }} renderReasoning={() => <p>Each term is the sum of the previous three, so a window of three terms slides forward and never needs the whole history.</p>} />
}
