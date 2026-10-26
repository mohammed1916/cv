import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Index triples', description: 'Group allowed triples by their base pair.' },
    { id: 'row', label: 'Start row', description: 'Begin building the row above the current one.' },
    { id: 'place', label: 'Choose block', description: 'Choose an allowed top block for the next pair.' },
    { id: 'dead', label: 'Dead end', description: 'A pair has no allowed top block.' },
    { id: 'memo', label: 'Memo hit', description: 'A previously failed row is skipped.' },
    { id: 'fail', label: 'Row fails', description: 'All options for this row failed; memoise it.' },
    { id: 'top', label: 'Top reached', description: 'A one-block row completes the pyramid.' },
    { id: 'done', label: 'Complete', description: 'Return whether the pyramid can be built.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Bottom row and allowed triples (JSON)',
  url: 'https://leetcode.com/problems/pyramid-transition-matrix/',
  complexity: 'Exponential in the worst case, reduced by memoising failed rows. The visualization caps the bottom row at 6 letters and 40 triples.',
  examples: [
    { label: 'Example 1', input: '{"bottom": "BCD", "allowed": ["BCC","CDE","CEA","FFF"]}' },
    { label: 'Example 2', input: '{"bottom": "AAAA", "allowed": ["AAB","AAC","BCD","BBE","DEF"]}' },
    { label: 'Backtracking', input: '{"bottom": "ABC", "allowed": ["ABD","ABE","BCD","DEF","DDF"]}' },
  ],
}

export default function PyramidTransitionMatrix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const base = step.rows[step.rows.length - 1] || ''
    return <>
      <IndexedSequence label="Row being covered" length={base.length} active={step.i} valueAt={i => base[i]} roleAt={i => i === step.i + 1 ? 'right' : ''} />
      <IndexedSequence label="Partial row above" length={step.cur.length} active={step.cur.length - 1} valueAt={i => step.cur[i]} />
      <StackLane title="Rows on the current path (bottom first)" items={step.rows} />
      <output aria-label="Memo">Failed rows remembered: {step.failed}</output>
    </>
  }} renderReasoning={() => <>
    <p>The same row can be reached by many different choices below it; if it cannot be completed once it never can, so memoising failed rows prunes repeats.</p>
  </>} />
}
