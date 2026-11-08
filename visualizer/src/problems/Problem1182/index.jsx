import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with colors and queries (JSON)',
  url: 'https://leetcode.com/problems/shortest-distance-to-target-color/',
  complexity: 'O(n + q log n) time: grouping the positions is one pass, and each query is a binary search over one color list.',
  examples: [
    { label: 'Mixed', input: '{"colors":[1,1,2,1,3,2,2,3,3],"queries":[[1,3],[2,2],[6,1],[4,2]]}' },
    { label: 'Missing', input: '{"colors":[1,1,1],"queries":[[0,2],[2,1]]}' },
    { label: 'Single', input: '{"colors":[3],"queries":[[0,3]]}' },
    { label: 'Single position', input: '{"colors":[2],"queries":[[0,1]]}' },
    { label: 'Same color already', input: '{"colors":[3,3,3],"queries":[[1,3]]}' },
    { label: 'Equal colors at the ends', input: '{"colors":[1,2,3,1],"queries":[[0,2],[3,3]]}' },
    { label: 'Long run: 30 positions', input: '{"colors":[3,2,1,2,2,3,3,2,1,1,3,1,3,3,3,2,2,2,1,2,1,1,3,3,3,1,3,3,1,2],"queries":[[16,1],[14,3],[3,3],[21,3],[18,3],[12,3],[20,2],[8,1],[17,3],[22,3]]}' },
  ],
}

export default function ShortestDistanceToTargetColor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { colors, arr, lo, hi, mid, index, color, best, answers } = step.snapshot
    const list = arr ?? []
    const roleAt = i => {
      if (lo === null) return ''
      const parts = []
      if (i === lo) parts.push('lo')
      if (i === hi) parts.push('hi')
      if (mid !== null && i === mid) parts.push('mid')
      return parts.join(', ')
    }
    return <>
      <div role="img" aria-label="Colors" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {colors.map((c, i) => {
          const isCandidate = list.includes(i)
          return <div key={i} data-index={i} style={{
            width: 40, height: 40, boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontFamily: 'monospace',
            border: index === i ? '2px solid var(--text)' : '1px solid var(--border)',
            background: isCandidate && color === c ? 'color-mix(in srgb, var(--primary) 28%, transparent)' : 'var(--surface2)',
            color: color === c ? 'var(--text)' : 'var(--text-dim)',
          }}>{c}</div>
        })}
      </div>
      {arr && <IndexedSequence label={`Positions of color ${color} (sorted)`} length={list.length} valueAt={i => list[i]} active={mid ?? -1} roleAt={roleAt} />}
      {arr && hi === list.length && lo !== null && <p>hi sits just past the last position, so every position is before it.</p>}
      <output aria-label="Query state">{index === null
        ? 'Positions are being grouped.'
        : `Query index ${index}, color ${color} · best so far ${best ?? '-'}`}</output>
      <output aria-label="Answers">{`Answers: [${answers.join(', ')}]`}</output>
    </>
  }} renderReasoning={() => <>
    <p><strong>Sorted positions:</strong> each color's indices are already in increasing order, so one binary search finds the first one at or after the query index. lo and hi narrow to that boundary.</p>
    <p><strong>Two neighbors:</strong> the nearest match is either that entry or the one just before it. Compare both distances.</p>
  </>} />
}
