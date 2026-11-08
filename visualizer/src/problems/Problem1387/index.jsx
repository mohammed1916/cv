import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare the power table for the range.' },
    { id: 'visit', label: 'Power', description: 'Count the steps this integer needs to reach 1.' },
    { id: 'sort', label: 'Sort', description: 'Order the integers by power, then by value.' },
    { id: 'done', label: 'Complete', description: 'Report the k-th integer in that order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with lo, hi (at most 60 integers apart), and k',
  url: 'https://leetcode.com/problems/sort-integers-by-the-power-value/',
  complexity: 'Each power is memoized, so the work is close to linear in the number of values computed, plus a sort of the range.',
  examples: [
    { label: 'Own case 1', input: '{"lo":13,"hi":16,"k":3}' },
    { label: 'Own case 2', input: '{"lo":8,"hi":12,"k":5}' },
    { label: "Single integer", input: "{\"lo\":1,\"hi\":1,\"k\":1}" },
    { label: "Equal powers use the smaller number", input: "{\"lo\":3,\"hi\":20,\"k\":2}" },
    { label: "Largest range, k at the top", input: "{\"lo\":941,\"hi\":1000,\"k\":60}" },
    { label: "Long run: sixty integers", input: "{\"lo\":697,\"hi\":756,\"k\":30}" },
  ],
}

export default function SortByPower() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { lo, hi, k } = run.input
    const known = new Map(step.powers.map(e => [e.value, e.power]))
    return <>
      <IndexedSequence label="Power of each integer" length={hi - lo + 1} indexOffset={lo}
        valueAt={i => (known.has(lo + i) ? known.get(lo + i) : '?')}
        active={step.x === null ? -1 : step.x - lo} />
      {step.order.length > 0 && <table aria-label="Sorted order">
        <thead><tr><th>Rank</th><th>Integer</th><th>Power</th></tr></thead>
        <tbody>{step.order.map((e, i) => <tr key={e.value} className={i === k - 1 ? 'is-kth' : ''}>
          <td>{i + 1}</td><td>{e.value}</td><td>{e.power}</td>
        </tr>)}</tbody>
      </table>}
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>The power of a number is the number of steps to reach 1, where an even number halves and an odd number becomes three times it plus one.</p>
    <p>Powers are computed once and memoized, then the range is sorted by power with ties going to the smaller integer.</p>
  </>} />
}
