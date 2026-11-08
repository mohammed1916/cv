import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'All on', description: 'Begin with every bulb lit.' },
    { id: 'press', label: 'Press buttons', description: 'Apply each of the four buttons to every state.' },
    { id: 'done', label: 'Complete', description: 'Count the distinct states.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Bulbs and presses (JSON object with n and presses)',
  url: 'https://leetcode.com/problems/bulb-switcher-ii/',
  complexity: 'O(presses · 4 · 2ⁿ) for this visualization; the official problem has a closed form that depends only on min(n, 3) and min(presses, 3).',
  examples: [
    { label: 'One bulb, one press', input: '{"n":1,"presses":1}' },
    { label: 'Two bulbs, one press', input: '{"n":2,"presses":1}' },
    { label: 'Three bulbs, two presses', input: '{"n":3,"presses":2}' },
    { label: 'No presses', input: '{"n":1,"presses":0}' },
    { label: 'Three bulbs, no presses', input: '{"n":3,"presses":0}' },
    { label: 'Largest n and presses', input: '{"n":6,"presses":6}' },
    { label: 'Long run: six bulbs, four presses', input: '{"n":6,"presses":4}' },
  ],
}

export default function BulbSwitcherII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Distinct states">{step.depth} press{step.depth === 1 ? '' : 'es'} · {step.states.length} distinct state{step.states.length === 1 ? '' : 's'}</output>
    <div aria-label="States as bulbs" style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
      {step.states.map(s => <div key={s} style={{ border: '1px solid var(--border)', padding: 6, color: 'var(--text)' }}>
        <div style={{ display: 'flex', gap: 4 }} aria-label={`bulbs ${s}`}>
          {[...s].map((b, i) => <span key={i} title={`bulb ${i + 1} ${b === '1' ? 'on' : 'off'}`} style={{
            width: 18, height: 18, borderRadius: '50%', boxSizing: 'border-box', border: '1px solid var(--text)',
            background: b === '1' ? 'var(--primary)' : 'transparent' }} />)}
        </div>
        <small style={{ fontFamily: 'monospace' }}>{s}</small>
      </div>)}
    </div>
    <p style={{ color: 'var(--text)' }}>Filled bulbs are on. Each state is one distinct pattern reachable after exactly the given presses.</p>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Buttons:</strong> flip all; flip odd-numbered bulbs; flip even-numbered bulbs; flip bulbs 1, 4, 7, …. Only the set of states matters, so duplicates are merged at each depth.</p>
  </>} />
}
