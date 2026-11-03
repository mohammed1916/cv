import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'flip', label: 'Flip', description: 'An update toggles one letter; no answer is produced.' },
    { id: 'start', label: 'Query', description: 'Start counting inside the range.' },
    { id: 'pair', label: 'Equal pair', description: 'Two neighbours match, so one deletion is needed.' },
    { id: 'skip', label: 'Differ', description: 'Two neighbours differ; nothing to delete here.' },
    { id: 'answer', label: 'Answer', description: 'Record the count for this query.' },
    { id: 'done', label: 'Result', description: 'All recorded answers in query order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (A and B only) and queries ([1, j] flips, [2, l, r] asks)',
  url: 'https://leetcode.com/problems/minimum-deletions-to-make-alternating-substring/',
  complexity: 'O(n) per query in this visualization. Keeping a prefix count of equal neighbours with a Fenwick tree gives O(log n) per query and update.',
  examples: [
    { label: 'Flip then ask', input: '{"s":"ABAB","queries":[[2,0,3],[1,1],[2,0,3]]}' },
    { label: 'Run of A', input: '{"s":"AAAB","queries":[[2,0,3]]}' },
  ],
}

export default function MinimumDeletionsAlternatingSubstring() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => step.text?.[i] ?? run.input.s[i]} active={step.at >= 0 ? step.at : step.lo}
      roleAt={i => (step.lo >= 0 && i >= step.lo && i <= step.hi ? 'window' : '')} />
    <output aria-label="Alternating deletion state">{`range ${step.lo >= 0 ? `${step.lo}..${step.hi}` : '-'}, equal neighbours so far ${step.count ?? '-'}`}</output>
  </>} renderReasoning={() => <>
    <p>A substring needs one deletion for every adjacent pair of equal letters inside it. Keeping the first letter of each run and removing the rest leaves an alternating string.</p>
    <p>Deleting one character can remove at most one equal adjacent pair, so this count is also a lower bound.</p>
  </>} />
}
