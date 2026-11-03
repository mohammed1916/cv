import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

export default function UniqueOccurrencesVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { counts, claimed, value, count } = step.snapshot
    return <>
      <table aria-label="Value counts">
        <thead><tr><th scope="col">Value</th><th scope="col">Occurrences</th></tr></thead>
        <tbody>{counts.map(row => <tr key={row.value} style={{ background: row.value === value ? 'var(--surface2)' : undefined }}>
          <td>{row.value}</td><td>{row.count}</td>
        </tr>)}</tbody>
      </table>
      <p>Claimed occurrence counts: {claimed.map(row => `${row.count} (value ${row.value})`).join(', ') || 'none yet'}</p>
      {count !== undefined && <output aria-label="Count being checked">{`Checking count ${count}`}</output>}
    </>
  }} renderReasoning={() => <p><strong>Two passes:</strong> first count each value, then check that no occurrence count is claimed by two different values.</p>} />
}
