import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2498',
  phases: [
    { id: 'setup', label: 'Setup', description: 'The first jump is between the first two stones.' },
    { id: 'gap', label: 'Gap', description: 'Measure the jump that skips one stone.' },
    { id: 'update', label: 'Update', description: 'Keep the largest jump so far.' },
    { id: 'done', label: 'Result', description: 'Return the largest jump.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"stones": [0,2,5,6,7]}',
  url: 'https://leetcode.com/problems/frog-jump-ii/',
  complexity: 'O(n) time and O(1) extra space for n stones. The visualization caps stones at 12.',
  examples: [
    { label: 'Example 1', input: '{"stones":[0,2,5,6,7]}' },
    { label: 'Example 2', input: '{"stones":[0,3,9]}' },
    { label: 'Two stones', input: '{"stones":[0,1]}' },
    { label: 'Equal gaps', input: '{"stones":[0,2,4,6]}' },
    { label: 'Largest position', input: '{"stones":[0,1,3,6,10,15,21,28,36,45,55,1000]}' },
    { label: 'Long run: 12 stones', input: '{"stones":[0,70,144,234,317,368,456,504,529,540,566,568]}' },
  ],
}

const cell = { display: 'inline-block', minWidth: 44, padding: '6px 8px', margin: 2, borderRadius: 6, border: '1px solid var(--border, #888)', background: 'var(--surface2, transparent)', color: 'var(--text)', textAlign: 'center' }

// Two routes: the frog goes out on even stones and returns on odd stones, so each jump skips one stone.
function Routes({ stones, from, at }) {
  const row = (label, parity) => <div aria-label={label}>
    <strong style={{ color: 'var(--text)' }}>{label}</strong>
    <div>{stones.map((v, i) => {
      if (i % 2 !== parity && i !== stones.length - 1 && i !== 0) return null
      const active = i === at || i === from
      return <span key={i} style={{ ...cell, background: active ? 'var(--primary)' : cell.background, color: active ? 'var(--on-primary, #fff)' : 'var(--text)' }} data-index={i}>[{i}] {v}</span>
    })}</div>
  </div>
  return <section aria-label="Two routes"><h3 style={{ color: 'var(--text)' }}>Two routes across the stones</h3>{row('Out (even stones)', 0)}{row('Back (odd stones)', 1)}</section>
}

export default function FrogJumpII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="stones" length={run.input.stones.length} valueAt={i => run.input.stones[i]} active={step.at}
      roleAt={i => (step.from !== null && step.from >= 0 && (i === step.from || i === step.at) ? 'jump' : '')} />
    <Routes stones={run.input.stones} from={step.from} at={step.at} />
    <output aria-label="Largest jump">{`best ${step.best}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>The frog visits the even-indexed stones on the way out and the odd-indexed stones on the way back, so the jumps that matter skip exactly one stone.</p>
    <p>The largest such gap, together with the first jump, is the smallest possible maximum jump.</p>
  </>} />
}
