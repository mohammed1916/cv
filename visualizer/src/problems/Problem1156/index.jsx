import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Lowercase letters',
  complexity: 'O(26 × n) time with O(26) counts. The trace accepts up to 40 letters.',
  examples: [
    { label: 'One misplaced letter', input: 'aabaa' },
    { label: 'All distinct', input: 'abcdef' },
    { label: 'Two runs', input: 'aaabbb' },
    { label: 'Single letter', input: 'a' },
    { label: 'Equal runs of two', input: 'aabbcc' },
    { label: 'Alternating letters', input: 'abababab' },
    { label: 'Long run: 40 letters', input: 'acbaacbaaabbacaacbbabcbababaaabaabbcbbba' },
  ],
}

export default function RepeatedRunWorkspace() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const chars = [...s.s]
    const marks = {}
    if (s.r >= 0) for (let i = s.l; i <= s.r; i++) marks[i] = 'window'
    const pointers = s.r >= 0 ? { l: s.l, r: s.r } : {}
    return <>
      <Sequence label={`Target letter ${s.letter ?? '-'}; window shows at most one other letter`} values={chars} pointers={pointers} marks={marks} />
      <Vars vars={{ letter: s.letter, 'l': s.r >= 0 ? s.l : null, 'r': s.r >= 0 ? s.r : null, 'differing letters': s.bad, 'best so far': s.best, copies: s.letter ? s.tot[s.letter] : null }} />
      <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result}` : step.message}</output>
    </>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
