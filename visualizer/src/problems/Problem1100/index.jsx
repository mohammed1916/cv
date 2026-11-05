import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

export default function WindowVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const chars = [...s.text]
    const marks = {}
    if (s.right >= 0) for (let i = s.left; i <= s.right; i++) marks[i] = 'window'
    const pointers = s.right >= 0 ? { l: s.left, r: s.right } : { l: 0 }
    const size = s.right >= 0 ? s.right - s.left + 1 : 0
    return <>
      <Sequence label={`Window of size ${size} (k = ${s.k})`} values={chars} pointers={pointers} marks={marks} />
      <Vars vars={{ left: s.left, right: s.right, 'window size': size, 'distinct letters': Object.keys(s.counts).length, 'qualifying so far': s.good }} />
      <p>Counts in window: {Object.entries(s.counts).map(([ch, n]) => `${ch}×${n}`).join(' ') || 'none'}</p>
      <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result}` : step.message}</output>
    </>
  }} renderReasoning={() => <p>The window slides right one letter at a time. A window of exactly k letters qualifies only when its counts hold k distinct keys, so any repeated letter removes it from the count.</p>} />
}
