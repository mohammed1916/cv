import withProblemStory from '../../components/shared/withProblemStory'
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import storyGuide from './storyGuide.json'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Points as a JSON array of [x, y] pairs',
  url: 'https://leetcode.com/problems/widest-vertical-area-between-two-points-containing-no-points/',
  complexity: 'O(n log n) time for the sort, O(n) extra space for the sorted x-values.',
  examples: [
    { label: 'Scattered', input: '[[3,1],[9,4],[1,7],[6,2]]' },
    { label: 'Clustered', input: '[[0,0],[4,0],[10,0],[11,5]]' },
    { label: 'Same x', input: '[[2,9],[2,1],[2,4]]' },
  ],
}

function NumberLine({ snapshot }) {
  const { xs, sorted, current } = snapshot
  const lo = Math.min(...xs), hi = Math.max(...xs), span = Math.max(1, hi - lo)
  const X = v => 40 + ((v - lo) / span) * 480
  const gapStart = current !== null && current !== undefined ? sorted[current] : null
  const gapEnd = gapStart === null ? null : sorted[current + 1]
  return <svg width={560} height={110} role="img" aria-label="Point x-coordinates on a number line">
    <line x1={40} y1={55} x2={520} y2={55} stroke="currentColor" />
    {gapStart !== null && gapEnd !== undefined && <rect x={X(gapStart)} y={30} width={Math.max(2, X(gapEnd) - X(gapStart))} height={50} fill="#0891b2" opacity={0.25} />}
    {xs.map((v, i) => <g key={i}><circle cx={X(v)} cy={55} r={6} fill="#0891b2" /><text x={X(v)} y={85} textAnchor="middle" fontSize={11} fill="currentColor">{v}</text></g>)}
  </svg>
}

function WidestStrip() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <NumberLine snapshot={step.snapshot} />
    <p>Gaps found so far: {step.snapshot.gaps.length ? step.snapshot.gaps.join(', ') : 'none yet'}. Widest: {step.snapshot.best}.</p>
  </>} renderReasoning={() => <>
    <p>Only the x-coordinates decide the strips. Sorting them puts every empty strip between two neighbours.</p>
    <p>The shaded band is the strip being measured. Points on its edges are not inside it, so its width is a valid candidate.</p>
  </>} />
}

export default withProblemStory(WidestStrip, storyGuide)
