import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Dominoes (JSON array of [a, b] pairs)',
  url: 'https://leetcode.com/problems/number-of-equivalent-domino-pairs/',
  complexity: 'O(n) expected time and O(n) space for n dominoes. The visualization caps n at 40.',
  examples: [
    { label: 'Turned copies', input: '[[2,3],[3,2],[4,4],[2,3]]' },
    { label: 'All equal', input: '[[4,4],[4,4],[4,4]]' },
    { label: 'No matches', input: '[[1,2],[3,4],[5,6]]' },
  ],
}

export default function EquivalentDominoPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const dominoes = run.input.map(([a, b]) => `${a}-${b}`)
    const pointers = s.index >= 0 && s.index < dominoes.length ? { domino: s.index } : {}
    const rows = s.counts.map(c => ({ key: c.key, seen: c.n }))
    const activeRow = rows.findIndex(row => row.key === s.key)
    return <>
      <Sequence label="Dominoes, each shown as its sorted key" values={dominoes} pointers={pointers} />
      <RecordStateTable label="Keys seen so far" columns={['key', 'seen']} rows={rows} activeRow={activeRow} />
      <Vars vars={{ 'current key': s.key, 'earlier matches': s.matches, 'pairs so far': s.pairs }} />
      <output aria-label="Result">{step.message}</output>
    </>
  }} renderReasoning={() => <p>Each domino is written with its smaller end first, so a turned copy gets the same key. Every earlier domino with the same key forms one new pair.</p>} />
}
