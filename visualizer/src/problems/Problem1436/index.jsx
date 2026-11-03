import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, phases, code, python, pythonLineMap } from './algorithm'

const definition = {
  number: '1436',
  inputLabel: 'Roads as a JSON array of [from, to] pairs',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  examples: [
    { label: 'Chain', input: '[["Lima","Oslo"],["Oslo","Quito"],["Quito","Rome"]]' },
    { label: 'Shuffled', input: '[["A","B"],["C","A"],["B","D"]]' },
    { label: 'Single', input: '[["Tokyo","Kyiv"]]' },
  ],
  complexity: 'Time O(n) · Space O(n) for the set of departing cities.',
  url: 'https://leetcode.com/problems/destination-city/',
}

const chip = (active, tone) => ({
  display: 'inline-block', margin: '2px 4px', padding: '2px 8px', borderRadius: 6,
  border: '1px solid currentColor', opacity: active ? 1 : 0.55,
  background: tone ? 'rgba(8,145,178,0.18)' : 'transparent',
})

function DestinationVisual({ step }) {
  const { roads, outgoing, checking, answer } = step.snapshot
  return <div style={{ padding: 8 }}>
    <h4>Roads</h4>
    <div>{roads.map(([from, to], i) => <span key={i} style={chip(i === checking, i === checking)}>
      {from} → {to}
    </span>)}</div>
    <h4>Cities marked as departing</h4>
    <div>{outgoing.length ? outgoing.map(city => <span key={city} style={chip(true, true)}>{city}</span>)
      : <em>none yet</em>}</div>
    {answer && <p><strong>Destination: {answer}</strong></p>}
  </div>
}

export default function DestinationCity() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <DestinationVisual step={step} />}
    renderReasoning={({ step }) => <p>{step.snapshot.answer ? `Answer so far: ${step.snapshot.answer}.` : 'Each city that starts a road is marked; the first arrival city never marked is the answer.'}</p>} />
}
