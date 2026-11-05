import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2013',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Operations as ["add" or "count", [x, y]] (JSON)',
  url: 'https://leetcode.com/problems/detect-squares/',
  complexity: 'add is O(1); count is O(distinct stored points) with map lookups.',
  examples: [
    { label: 'Corner query', input: '[["add",[1,1]],["add",[4,1]],["add",[1,4]],["count",[4,4]]]' },
    { label: 'Duplicates', input: '[["add",[2,2]],["add",[2,2]],["add",[5,2]],["add",[5,5]],["count",[2,5]]]' },
  ],
}

export default function DetectSquares() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { ops, counts, extra, results } = step.snapshot
    const size = 20
    const cells = []
    counts.forEach(([key, c]) => { const [x, y] = key.split(',').map(Number); cells.push({ x, y, c }) })
    return <>
      <svg viewBox={`-1 -1 ${size + 2} ${size + 2}`} width="100%" style={{ maxWidth: 320, display: 'block', margin: '0 auto' }} role="img" aria-label="Stored points and the query">
        {Array.from({ length: size + 1 }, (_, i) => <line key={`v${i}`} x1={i} y1={0} x2={i} y2={size} stroke="var(--border)" strokeWidth={0.05} />)}
        {Array.from({ length: size + 1 }, (_, i) => <line key={`h${i}`} x1={0} y1={i} x2={size} y2={i} stroke="var(--border)" strokeWidth={0.05} />)}
        {cells.map(({ x, y, c }) => <circle key={`${x},${y}`} cx={x} cy={size - y} r={0.45} fill="var(--surface2)" stroke="var(--text)" strokeWidth={0.1}><title>{`(${x}, ${y}) x${c}`}</title></circle>)}
        {extra.query && <circle cx={extra.query[0]} cy={size - extra.query[1]} r={0.5} fill="none" stroke="var(--primary)" strokeWidth={0.2} />}
      </svg>
      <p>Points stored: <strong>{cells.reduce((s, c) => s + c.c, 0)}</strong>. {extra.query ? <>Query <strong>({extra.query[0]}, {extra.query[1]})</strong> forms <strong>{extra.found}</strong> square(s).</> : 'Adding points.'}</p>
      <p>Answers so far: <strong>{results.length ? results.join(', ') : 'none'}</strong></p>
    </>
  }} renderReasoning={() => <p>A square with a query corner is fixed by one stored point on a diagonal: the other two corners must be stored with their counts multiplied together.</p>} />
}
