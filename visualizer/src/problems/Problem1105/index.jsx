import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import DPDependencyView from '../../components/shared/DPDependencyView'
import { Sequence, Vars } from './SeqKit'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

export default function BookshelfVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    const end = s.end ?? 0
    const sources = s.start ? [{ cell: [0, s.start - 1], note: `last shelf holds books ${s.start}..${end}`, chosen: step.phase === 'improve' }] : []
    return <>
      <DPDependencyView title="Cheapest total height for the first books" shape="linear" values={s.dp} target={[0, end]} sources={sources}
        recurrence="dp[end] = min over start of dp[start-1] + tallest(start..end)"
        why="The last shelf takes books start..end. Each start is tried while the shelf width still fits, and the cheapest total wins." />
      <Sequence label="Books as thickness/height" values={s.books.map(([thickness, height]) => `${thickness}/${height}`)}
        pointers={s.start ? { start: s.start - 1, end: end - 1 } : {}} />
      <Vars vars={{ 'books placed': end, 'last shelf width': s.width ?? null, 'tallest on last shelf': s.tallest ?? null, 'shelf width limit': s.shelfWidth }} />
      <output aria-label="Result">{step.message}</output>
    </>
  }} renderReasoning={() => <p>Books keep their order, so the last shelf is always a run of consecutive books. Each prefix is priced from the cheaper prefixes before it.</p>} />
}
