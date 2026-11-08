import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageStrip from './SqlStageStrip'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Activities', description: 'Start from the raw sale rows.' },
    { id: 'dedupe', label: 'Distinct', description: 'A product repeated on one day counts once.' },
    { id: 'group', label: 'Group', description: 'Count and join the products for one date.' },
    { id: 'output', label: 'Order', description: 'Dates are listed in ascending order.' },
    { id: 'done', label: 'Result', description: 'One row per date.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with an activities list of sell_date and product',
  url: 'https://leetcode.com/problems/group-sold-products-by-the-date/',
  complexity: 'O(n log n) time for sorting the rows; n is the number of activity rows.',
  examples: [
    { label: 'Example', input: '{"activities":[{"sell_date":"2021-03-04","product":"Lamp"},{"sell_date":"2021-03-04","product":"Kettle"},{"sell_date":"2021-03-04","product":"Lamp"},{"sell_date":"2021-03-07","product":"Rope"},{"sell_date":"2021-03-07","product":"Canvas"},{"sell_date":"2021-03-09","product":"Tent"},{"sell_date":"2021-03-09","product":"Tent"}]}' },
    { label: 'Single sale', input: '{"activities":[{"sell_date":"2022-01-05","product":"Pen"}]}' },
    { label: 'Repeated product, one day', input: '{"activities":[{"sell_date":"2022-02-01","product":"Ink"},{"sell_date":"2022-02-01","product":"Ink"},{"sell_date":"2022-02-01","product":"Pad"}]}' },
    { label: 'Longest product name', input: '{"activities":[{"sell_date":"2022-02-02","product":"abcdefghijklmnopqrst"}]}' },
    { label: 'Long run: 30 rows', input: '{"activities":[{"sell_date":"2022-03-01","product":"Pen"},{"sell_date":"2022-03-04","product":"Pen"},{"sell_date":"2022-03-05","product":"Pad"},{"sell_date":"2022-03-03","product":"Clip"},{"sell_date":"2022-03-02","product":"Ink"},{"sell_date":"2022-03-09","product":"Clip"},{"sell_date":"2022-03-01","product":"Ink"},{"sell_date":"2022-03-04","product":"Ink"},{"sell_date":"2022-03-09","product":"Clip"},{"sell_date":"2022-03-07","product":"Pad"},{"sell_date":"2022-03-09","product":"Ink"},{"sell_date":"2022-03-08","product":"Pen"},{"sell_date":"2022-03-08","product":"Tape"},{"sell_date":"2022-03-04","product":"Ink"},{"sell_date":"2022-03-07","product":"Ink"},{"sell_date":"2022-03-04","product":"Ink"},{"sell_date":"2022-03-07","product":"Pen"},{"sell_date":"2022-03-08","product":"Pen"},{"sell_date":"2022-03-07","product":"Clip"},{"sell_date":"2022-03-02","product":"Tape"},{"sell_date":"2022-03-05","product":"Pad"},{"sell_date":"2022-03-07","product":"Tape"},{"sell_date":"2022-03-07","product":"Tape"},{"sell_date":"2022-03-04","product":"Clip"},{"sell_date":"2022-03-08","product":"Pen"},{"sell_date":"2022-03-06","product":"Pen"},{"sell_date":"2022-03-02","product":"Pad"},{"sell_date":"2022-03-02","product":"Pen"},{"sell_date":"2022-03-03","product":"Ink"},{"sell_date":"2022-03-08","product":"Pad"}]}' },
  ],
}

function RowTable({ caption, rows, current = null, stage }) {
  const columns = rows.length ? Object.keys(rows[0]) : []
  return (
    <section aria-label={caption}>
      <h3>{caption}</h3>
      {stage && <p>{stage}</p>}
      {columns.length === 0 ? <p>No rows yet.</p> : (
        <table>
          <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => {
            const isCurrent = current !== null && row.sell_date === current
            return <tr key={index} data-current={isCurrent ? 'yes' : undefined}
              style={isCurrent ? { background: 'var(--surface2)', color: 'var(--text)', fontWeight: 600 } : undefined}>
              {columns.map(column => <td key={column}>{String(row[column])}</td>)}
            </tr>
          })}</tbody>
        </table>
      )}
    </section>
  )
}

export default function GroupSoldProducts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const current = step.phase === 'group' ? step.date : null
    const stage = {
      load: 'FROM Activities: every sale row, repeats included.',
      dedupe: 'SELECT DISTINCT: a product sold twice on one date is kept once.',
      group: `GROUP BY sell_date: the highlighted date is being counted (${current ?? ''}).`,
      output: 'ORDER BY sell_date: the groups are already in date order.',
      done: 'The result has one row per date.',
    }[step.phase]
    return <>
      <SqlStageStrip phases={definition.phases} current={step.phase} />
      <RowTable caption="Working rows" rows={step.rows} current={current} stage={stage} />
      <RowTable caption="Result" rows={run.result} current={current} stage="Each date's row appears once its group is counted." />
    </>
  }} renderReasoning={() => <>
    <p>Each date is handled as its own group. Repeated product rows on one day are removed first, so the count is the number of distinct products.</p>
    <p>The product names for a date are sorted and joined with commas, which gives the output text.</p>
  </>} />
}
