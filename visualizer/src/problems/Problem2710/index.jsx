import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The end pointer starts after the last character.' },
    { id: 'scan', label: 'Scan', description: 'Look at the character just before the end pointer.' },
    { id: 'drop', label: 'Drop', description: 'A trailing zero moves the end pointer left.' },
    { id: 'done', label: 'Result', description: 'Keep the characters before the end pointer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with num (a string of digits, at most 20 characters)',
  url: 'https://leetcode.com/problems/remove-trailing-zeros-from-a-string/',
  complexity: 'O(n) time. The end pointer only moves left, and the string is never rebuilt until the end.',
  examples: [
    { label: 'Trailing zeros', input: '{"num":"5020700"}' },
    { label: 'Zeros in the middle only', input: '{"num":"1009"}' },
  ],
}

export default function RemoveTrailingZeros() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const num = run.input.num
    const end = step.end ?? num.length
    // Characters before the end pointer are kept; the ones at or after it are dropped.
    return <>
      <IndexedSequence label="Digits of num" length={num.length} valueAt={i => num[i]} active={step.index ?? -1}
        roleAt={i => (i >= end ? 'dropped' : i === end - 1 ? 'end (kept)' : 'kept')} />
      <p style={{ color: 'var(--text)' }}>End pointer after index {end - 1}. Result: <code>{step.phase === 'done' ? JSON.stringify(run.result) : 'not yet'}</code></p>
    </>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
