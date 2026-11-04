import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'candidate', label: 'Candidates', description: 'Try one set of non-adjacent peaks.' },
    { id: 'done', label: 'Result', description: 'Report the cheapest set.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (circular, 3 to 10 values) and k',
  url: 'https://leetcode.com/problems/minimum-operations-to-achieve-at-least-k-peaks/',
  complexity: 'This visual enumerates subsets of positions: O(2^n * n). A dynamic programme around the circle would be needed for large inputs. The visual caps nums at 10 values.',
  examples: [
    { label: 'Example A', input: '{"nums":[3,1,3],"k":1}' },
    { label: 'Example B', input: '{"nums":[1,5,2,6,3],"k":2}' },
  ],
}

// The array drawn as a ring, because the neighbours wrap around. Peaks in the current set are filled.
function Ring({ nums, peaks, best }) {
  const size = 260, r = 95, c = size / 2, n = nums.length
  const pos = i => ({ x: c + r * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), y: c + r * Math.sin((2 * Math.PI * i) / n - Math.PI / 2) })
  return <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }} role="img" aria-label="Circular array with the current set of peaks">
    <circle cx={c} cy={c} r={r} fill="none" stroke="var(--text-muted)" />
    {nums.map((v, i) => { const p = pos(i); const isPeak = peaks.includes(i); const isBest = best.includes(i); return <g key={i}>
      <circle cx={p.x} cy={p.y} r="20" fill={isPeak ? 'var(--primary)' : 'var(--surface2)'} stroke={isBest ? 'var(--text)' : 'var(--text-muted)'} strokeWidth={isBest ? 3 : 1} />
      <text x={p.x} y={p.y - 2} textAnchor="middle" fontSize="11" fill={isPeak ? 'var(--surface)' : 'var(--text)'}>{i}</text>
      <text x={p.x} y={p.y + 10} textAnchor="middle" fontSize="11" fill={isPeak ? 'var(--surface)' : 'var(--text)'}>{v}</text>
    </g> })}
  </svg>
}

export default function MinimumOperationsToAchieveAtLeastKPeaks() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Ring nums={run.input.nums} peaks={step.set ?? []} best={step.phase === 'done' ? (step.set ?? []) : []} />
    <p>Target: at least {run.input.k} peaks. Index labels are inside the circle; values are below them.</p>
    <output aria-label="Best cost so far">{step.best === null || step.best === undefined ? step.message : `Best cost ${step.best}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>Two neighbours on the circle cannot both be strict peaks, so the peaks form a set of spaced positions around the ring.</p>
    <p>A chosen peak only needs to beat its larger neighbour, and raising other positions never helps it, so each set's cost is a plain sum.</p>
  </>} />
}
