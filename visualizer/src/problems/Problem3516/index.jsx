import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'distance', label: 'Distances', description: 'Measure how far each person is from person 3.' },
    { id: 'check', label: 'Compare', description: 'Compare the two distances.' },
    { id: 'done', label: 'Result', description: 'Report who arrives first.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with x, y and z (integers from 1 to 100)',
  url: 'https://leetcode.com/problems/find-closest-person/',
  complexity: 'O(1) time and O(1) space.',
  examples: [
    { label: 'Example 1', input: '{"x":2,"y":7,"z":4}' },
    { label: 'Example 2', input: '{"x":2,"y":5,"z":6}' },
    { label: 'Example 3', input: '{"x":1,"y":5,"z":3}' },
  ],
}

function NumberLine({ run, step }) {
  const W = 620, H = 150, pad = 40
  const x = v => pad + ((v - 1) / 99) * (W - pad * 2)
  const people = [['Person 1', run.input.x, step.d1, 'var(--primary)'], ['Person 2', run.input.y, step.d2, 'var(--accent, var(--primary))'], ['Person 3', run.input.z, null, 'var(--text)']]
  return <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Number line with the three people" style={{ width: '100%', maxWidth: W }}>
    <line x1={pad} y1={90} x2={W - pad} y2={90} stroke="var(--text)" strokeOpacity="0.5" />
    {people.map(([label, at, , color]) => <g key={label}>
      <circle cx={x(at)} cy={90} r={9} fill={color} />
      <text x={x(at)} y={70} textAnchor="middle" fill="var(--text)" fontSize="13">{label}</text>
      <text x={x(at)} y={118} textAnchor="middle" fill="var(--text)" fontSize="12">{at}</text>
    </g>)}
    {step.d1 !== null && step.d1 !== undefined && <line x1={x(run.input.x)} y1={135} x2={x(run.input.z)} y2={135} stroke="var(--primary)" strokeWidth="2" />}
    {step.d2 !== null && step.d2 !== undefined && <line x1={x(run.input.y)} y1={145} x2={x(run.input.z)} y2={145} stroke="var(--accent, var(--primary))" strokeWidth="2" strokeDasharray="4 3" />}
  </svg>
}

export default function FindClosestPerson() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <NumberLine run={run} step={step} />
    <ol aria-label="Positions on a line">
      {[['Person 1', run.input.x, step.d1], ['Person 2', run.input.y, step.d2], ['Person 3', run.input.z, null]].map(([label, at, distance]) =>
        <li key={label} data-role={label}><strong>{label}</strong> at {at}{distance !== null && distance !== undefined ? `, distance ${distance}` : ''}</li>)}
    </ol>
    <output aria-label="Closest person">{step.phase === 'done' ? `answer ${step.result}` : 'comparing distances'}</output>
  </>} renderReasoning={() => <>
    <p>Both people walk toward person 3 at the same speed, so the one with the shorter distance arrives first. Equal distances mean they arrive together.</p>
    <p>Only the two absolute differences matter, so the answer takes constant time.</p>
  </>} />
}
