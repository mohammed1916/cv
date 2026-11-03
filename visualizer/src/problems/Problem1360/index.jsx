import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, phases, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two dates (JSON object with first and second, as YYYY-MM-DD)',
  complexity: 'O(1) time and O(1) space. Each date is converted with a fixed arithmetic formula.',
  examples: [
    { label: 'One day', input: '{"first":"2019-06-29","second":"2019-06-30"}' },
    { label: 'Across year', input: '{"first":"2020-01-15","second":"2019-12-31"}' },
    { label: 'Leap February', input: '{"first":"2024-02-28","second":"2024-03-01"}' },
  ],
}

function DateRow({ label, date, number }) {
  return <tr>
    <th scope="row">{label}</th>
    <td>{date.text}</td>
    <td>{number ?? '…'}</td>
  </tr>
}

export default function NumberOfDaysBetweenDates() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => {
      const { first, second, a, b, gap } = step.snapshot
      return <>
        <table className="algorithm-count-table">
          <thead><tr><th>Date</th><th>Written</th><th>Day number</th></tr></thead>
          <tbody>
            <DateRow label="first" date={first} number={a} />
            <DateRow label="second" date={second} number={b} />
          </tbody>
        </table>
        {gap !== undefined && <p>Difference: <strong>{gap}</strong> days</p>}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
