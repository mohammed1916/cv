import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '997',
  title: 'Find the Town Judge',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (people from 1 to n) and trust: a list of [a, b] pairs meaning a trusts b',
  url: 'https://leetcode.com/problems/find-the-town-judge/',
  complexity: 'O(n + t) for n people and t trust pairs, with two counters per person.',
  examples: [
    { label: 'Everyone trusts four', input: JSON.stringify({ n: 4, trust: [[1, 4], [2, 4], [3, 4]] }) },
    { label: 'Two trust each other', input: JSON.stringify({ n: 3, trust: [[1, 2], [2, 1], [3, 2]] }) },
    { label: 'Judge is trusted by one', input: JSON.stringify({ n: 2, trust: [[2, 1]] }) },
    { label: 'Smallest: one person', input: '{"n":1,"trust":[]}' },
    { label: 'Mutual trust, no judge', input: '{"n":2,"trust":[[1,2],[2,1]]}' },
    { label: 'Largest n with a clear judge', input: '{"n":8,"trust":[[1,8],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[1,2]]}' },
    { label: 'Long run: twenty trust pairs', input: '{"n":8,"trust":[[5,8],[6,3],[8,2],[3,1],[4,3],[4,8],[6,2],[3,6],[1,8],[7,6],[1,3],[1,4],[2,5],[6,5],[1,5],[3,4],[3,5],[6,8],[5,4],[8,4]]}' },
  ],
}

export default function Problem997() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RecordStateTable label="Trust counts per person" columns={['person', 'trusts', 'trusted']}
      rows={step.rows}
      activeRow={step.current === null ? -1 : step.current - 1} />
    <p style={{ margin: 0, color: 'var(--text)' }}>
      Pairs read: {run.input.trust.map(([a, b]) => `${a} → ${b}`).join(', ') || 'none'}.
    </p>
    <p style={{ margin: 0, color: 'var(--text-muted)' }}>
      The judge has trusts = 0 and trusted = {run.input.n - 1}. Every other person fails one of those.
    </p>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
