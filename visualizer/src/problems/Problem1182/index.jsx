import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with colors and queries (JSON)',
  url: 'https://leetcode.com/problems/shortest-distance-to-target-color/',
  complexity: 'O(n + q log n) time: grouping the positions is one pass, and each query is a binary search over one color list.',
  examples: [
    { label: 'Mixed', input: '{"colors":[1,1,2,1,3,2,2,3,3],"queries":[[1,3],[2,2],[6,1],[4,2]]}' },
    { label: 'Missing', input: '{"colors":[1,1,1],"queries":[[0,2],[2,1]]}' },
    { label: 'Single', input: '{"colors":[3],"queries":[[0,3]]}' },
  ],
}

export default function ShortestDistanceToTargetColor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { colors, arr, lo, hi, mid, index, color, best, answers } = step.snapshot
    const midPosition = arr && mid !== null ? arr[mid] : null
    return <>
      <div role="img" aria-label="Colors" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {colors.map((c, i) => {
          const isCandidate = arr?.includes(i)
          const inRange = arr && lo !== null && hi !== null && arr.indexOf(i) >= lo && arr.indexOf(i) < hi
          return <div key={i} data-index={i} style={{
            width: 40, height: 40, boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontFamily: 'monospace',
            border: index === i ? '2px solid var(--text)' : midPosition === i ? '2px dashed var(--text)' : '1px solid var(--border)',
            background: isCandidate ? (inRange ? '#a5f3fc' : 'var(--surface2)') : 'transparent',
            color: color === c ? 'var(--text)' : 'var(--text-dim)',
          }}>{c}</div>
        })}
      </div>
      <output aria-label="Query state">{index === null
        ? 'Positions are being grouped.'
        : `Query index ${index}, color ${color} · search range [${lo}, ${hi}) · middle ${midPosition ?? '-'} · best ${best ?? '-'}`}</output>
      <output aria-label="Answers">{`Answers: [${answers.join(', ')}]`}</output>
    </>
  }} renderReasoning={() => <>
    <p><strong>Sorted positions:</strong> each color's indices are already in increasing order, so one binary search finds the first one at or after the query index.</p>
    <p><strong>Two neighbors:</strong> the nearest match is either that entry or the one just before it. Compare both distances.</p>
  </>} />
}
