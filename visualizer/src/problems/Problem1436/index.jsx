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
    { label: 'One road', input: '[["Lima","Oslo"]]' },
    { label: 'Roads given out of order', input: '[["Oslo","Quito"],["Lima","Oslo"]]' },
    { label: 'Longest chain: 20 roads', input: '[["Town0","Town1"],["Town1","Town2"],["Town2","Town3"],["Town3","Town4"],["Town4","Town5"],["Town5","Town6"],["Town6","Town7"],["Town7","Town8"],["Town8","Town9"],["Town9","Town10"],["Town10","Town11"],["Town11","Town12"],["Town12","Town13"],["Town13","Town14"],["Town14","Town15"],["Town15","Town16"],["Town16","Town17"],["Town17","Town18"],["Town18","Town19"],["Town19","Town20"]]' },
    { label: 'Long run: 20 roads, shuffled', input: '[["Town6","Town7"],["Town4","Town5"],["Town17","Town18"],["Town14","Town15"],["Town15","Town16"],["Town5","Town6"],["Town1","Town2"],["Town16","Town17"],["Town7","Town8"],["Town8","Town9"],["Town12","Town13"],["Town9","Town10"],["Town11","Town12"],["Town2","Town3"],["Town3","Town4"],["Town10","Town11"],["Town0","Town1"],["Town13","Town14"],["Town18","Town19"],["Town19","Town20"]]' },
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
