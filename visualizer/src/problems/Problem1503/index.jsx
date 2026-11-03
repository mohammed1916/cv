import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1503',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with length, left and right ant positions (JSON)',
  url: 'https://leetcode.com/problems/last-moment-before-all-ants-fall-out-of-a-plank/',
  complexity: 'O(n) time and O(1) extra space: one pass over the ants, keeping the largest fall time.',
  examples: [
    { label: 'Mixed', input: '{"length":8,"left":[1,3],"right":[5,7]}' },
    { label: 'Only right', input: '{"length":10,"left":[],"right":[2,6,9]}' },
    { label: 'Edge ants', input: '{"length":6,"left":[0,4],"right":[2]}' },
  ],
}

export default function LastMomentPlank() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { length, side, position, fall, answer } = step.snapshot
    const scale = 40
    return <>
      <svg role="img" aria-label="Plank with ants and their fall times" viewBox={`-10 -10 ${length * scale + 20} 60`} width="100%" style={{ maxWidth: length * scale + 20 }}>
        <line x1={0} y1={20} x2={length * scale} y2={20} stroke="var(--border)" strokeWidth={4} />
        {run.input.left.map(p => <circle key={`l${p}`} cx={p * scale} cy={20} r={6} fill={side === 'left' && p === position ? '#0891b2' : 'var(--muted, #a8a29e)'} />)}
        {run.input.right.map(p => <circle key={`r${p}`} cx={p * scale} cy={20} r={6} fill={side === 'right' && p === position ? '#f59e0b' : 'var(--muted, #a8a29e)'} />)}
      </svg>
      <p>{fall === null ? `Largest fall time so far: ${answer}` : `This ant falls at moment ${fall}. Largest so far: ${answer}`}</p>
      <p>Left walkers are drawn in blue and right walkers in amber while they are being counted.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Collisions do not change the answer:</strong> when two ants meet and turn around, it is the same as them passing through. Ant identities swap, but the fall times do not.</p>
    <p><strong>Fall times:</strong> a left walker falls after its position, and a right walker falls after length minus its position. The last fall is the largest of these.</p>
  </>} />
}
