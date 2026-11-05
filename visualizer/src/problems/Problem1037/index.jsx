import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Three points as JSON, such as [[0,0],[1,2],[2,5]]',
  url: 'https://leetcode.com/problems/valid-boomerang/',
  complexity: 'O(1) time and O(1) space: one cross product of two edge vectors.',
  examples: [
    { label: 'Triangle', input: '[[0,0],[1,2],[2,5]]' },
    { label: 'Horizontal line', input: '[[0,1],[3,1],[7,1]]' },
    { label: 'Repeated point', input: '[[4,4],[4,4],[9,0]]' },
  ],
}

function Plot({ points }) {
  const map = ([x, y]) => [120 + x * 1.1, 120 - y * 1.1]
  const pts = points.map(map)
  return <svg viewBox="0 0 240 240" role="img" aria-label="Three points" style={{ width: 240, maxWidth: '100%' }}>
    <polygon points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke="var(--text-dim)" strokeDasharray="4 3" />
    {pts.map(([x, y], i) => <g key={i}>
      <circle cx={x} cy={y} r={5} fill="var(--primary)" />
      <text x={x + 7} y={y - 7} fontSize="12" fill="var(--text)">P{i}</text>
    </g>)}
  </svg>
}

export default function BoomerangWorkspace() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <Plot points={run.input} />
      {step.snapshot.cross !== null && <output aria-label="Cross product">{`Cross product = ${step.snapshot.cross}`}</output>}
    </>}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Two edge vectors from the same corner are parallel exactly when their cross product is zero. That single test also rejects repeated points, because a zero vector makes the product zero.</p>
    </>}
  />
}
