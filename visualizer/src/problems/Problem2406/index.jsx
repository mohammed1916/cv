import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the intervals by start time.' },
    { id: 'assign', label: 'Assign', description: 'Place the interval in the earliest-finishing free group, or open a new group.' },
    { id: 'done', label: 'Complete', description: 'Report the number of groups.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Intervals [left, right] (JSON)',
  url: 'https://leetcode.com/problems/divide-intervals-into-minimum-number-of-groups/',
  complexity: 'O(n log n) time. The visualization caps input at 10 intervals with endpoints up to 30.',
  examples: [
    { label: 'Overlapping', input: '{"intervals":[[4,9],[7,12],[2,5],[10,11],[1,3]]}' },
    { label: 'Chain', input: '{"intervals":[[1,3],[5,6],[8,10],[11,13]]}' },
    { label: 'Single point interval', input: '{"intervals":[[4,4]]}' },
    { label: 'Identical intervals', input: '{"intervals":[[3,8],[3,8],[3,8]]}' },
    { label: 'Full-span interval', input: '{"intervals":[[1,30],[1,1],[30,30]]}' },
    { label: 'Long run: 10 intervals', input: '{"intervals":[[11,16],[5,30],[9,21],[16,19],[28,28],[5,28],[27,28],[6,13],[8,29],[2,5]]}' },
  ],
}

// Interval timeline: one row per group, each interval drawn at its own span.
function GroupTimeline({ groups, sorted, placed, horizon }) {
  const span = Math.max(1, horizon)
  return <section className="algorithm-sequence" aria-label="Group timeline">
    <h3>Group timeline</h3>
    {Array.from({ length: groups }, (_, g) => <div key={g} className="algorithm-sequence__cells" style={{ position: 'relative', height: 26, marginBottom: 4 }}>
      <span style={{ position: 'absolute', left: 0, top: 4 }}>Group {g + 1}</span>
      <div style={{ position: 'absolute', left: 80, right: 0, top: 0, bottom: 0 }}>
        {placed.map((group, i) => group === g ? <div key={i} title={`[${sorted[i][0]}, ${sorted[i][1]}]`}
          style={{ position: 'absolute', top: 2, bottom: 2, left: `${(sorted[i][0] / span) * 100}%`, width: `${((sorted[i][1] - sorted[i][0]) / span) * 100}%`, background: 'var(--primary)', color: 'var(--surface2)', borderRadius: 4, fontSize: 12, overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {sorted[i][0]}-{sorted[i][1]}
        </div> : null)}
      </div>
    </div>)}
  </section>
}

export default function IntervalGroups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <GroupTimeline groups={step.ends.length} sorted={step.sorted} placed={step.placed} horizon={Math.max(...step.sorted.map(([, r]) => r), 1)} />
    <IndexedSequence label="Intervals in sorted order" length={step.sorted.length} active={step.index}
      valueAt={i => `[${step.sorted[i][0]}, ${step.sorted[i][1]}]`} roleAt={i => (step.placed[i] !== undefined ? `group ${step.placed[i] + 1}` : '')} />
    <IndexedSequence label="Groups (last end time)" length={step.ends.length} active={step.group}
      valueAt={i => step.ends[i]} roleAt={i => `group ${i + 1}`} />
    <output aria-label="Groups">{`Groups open: ${step.ends.length}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Intervals in the same group must not overlap, so each group behaves like a timeline. Reusing the earliest-finishing free group is always at least as good as any other choice.</p>
  </>} />
}
