import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'All on', description: 'Begin with every bulb lit.' },
    { id: 'press', label: 'Press buttons', description: 'Apply each of the four buttons to every state.' },
    { id: 'done', label: 'Complete', description: 'Count the distinct states.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Bulbs and presses (JSON object with n and presses)',
  url: 'https://leetcode.com/problems/bulb-switcher-ii/',
  complexity: 'O(presses · 4 · 2ⁿ) for this visualization; the official problem has a closed form that depends only on min(n, 3) and min(presses, 3).',
  examples: [
    { label: 'One bulb, one press', input: '{"n":1,"presses":1}' },
    { label: 'Two bulbs, one press', input: '{"n":2,"presses":1}' },
    { label: 'Three bulbs, two presses', input: '{"n":3,"presses":2}' },
  ],
}

export default function BulbSwitcherII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Distinct states">{step.depth} press{step.depth === 1 ? '' : 'es'} · {step.states.length} distinct state{step.states.length === 1 ? '' : 's'}</output>
    <ul aria-label="States" style={{ fontFamily: 'monospace', columns: 4 }}>{step.states.map(s => <li key={s}>{s}</li>)}</ul>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Buttons:</strong> flip all; flip odd-numbered bulbs; flip even-numbered bulbs; flip bulbs 1, 4, 7, …. Only the set of states matters, so duplicates are merged at each depth.</p>
  </>} />
}
