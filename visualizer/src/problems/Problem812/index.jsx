import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read the point set.' },
    { id: 'try', label: 'Try triple', description: 'Compute the area of one triple.' },
    { id: 'improve', label: 'New best', description: 'This triple beats the best so far.' },
    { id: 'done', label: 'Complete', description: 'Return the largest area.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Array points (JSON)',
  url: 'https://leetcode.com/problems/largest-triangle-area/',
  complexity: 'O(n^3) time and O(1) extra space; fine for n up to 50.',
  examples: [
    { label: 'Example 1', input: '[[0,0],[0,1],[1,0],[0,2],[2,0]]' },
    { label: 'Example 2', input: '[[1,0],[0,0],[0,1]]' },
    { label: 'Mixed signs', input: '[[-3,4],[5,-2],[0,0],[2,7],[-6,-5],[4,4]]' },
  ],
}
const S = 4, OFF = 54
const sx = v => (v + 50) * S / 1 * 0.9 + OFF / 6
const sy = v => (50 - v) * S * 0.9 + OFF / 6
export default function LargestTriangleArea() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const poly = t => t ? t.map(i => `${sx(run.input[i][0])},${sy(run.input[i][1])}`).join(' ') : ''
    return <>
      <svg viewBox="0 0 380 380" role="img" aria-label="Point plane" style={{ maxWidth: 360, width: '100%' }}>
        <rect x="1" y="1" width="378" height="378" fill="none" stroke="currentColor" opacity="0.25" />
        {step.bestTriple && <polygon points={poly(step.bestTriple)} fill="#16a34a" fillOpacity="0.2" stroke="#16a34a" strokeWidth="2" />}
        {step.triple && <polygon points={poly(step.triple)} fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="5 3" />}
        {run.input.map((p, i) => <g key={i}><circle cx={sx(p[0])} cy={sy(p[1])} r="4" fill={step.triple && step.triple.includes(i) ? '#f97316' : '#6366f1'} /><text x={sx(p[0]) + 6} y={sy(p[1]) - 6} fontSize="11" fill="currentColor">{i}</text></g>)}
      </svg>
      <IndexedSequence label="Points" length={run.input.length} active={-1} valueAt={i => `(${run.input[i].join(', ')})`} roleAt={i => step.triple && step.triple.includes(i) ? 'trying' : step.bestTriple && step.bestTriple.includes(i) ? 'best' : ''} />
      <output aria-label="Best area">Best area so far: {step.best}{step.area !== null ? `; current triple: ${step.area}` : ''}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Shoelace:</strong> the signed parallelogram spanned by two edge vectors has twice the triangle area, and the absolute value removes orientation. Collinear triples give 0 and never win.</p>
  </>} />
}
