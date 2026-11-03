import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sampleText } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read every query observation.' },
    { id: 'filter', label: 'Filter', description: 'Set aside rows without a query name.' },
    { id: 'group', label: 'Group', description: 'Average the ratios and count the poor ratings.' },
    { id: 'order', label: 'Order', description: 'Sort the groups by name.' },
    { id: 'done', label: 'Result', description: 'Report the rows.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a queries list of query_name, result, position and rating',
  url: 'https://leetcode.com/problems/queries-quality-and-percentage/',
  complexity: 'O(q) to scan q observations, plus a sort of the group names.',
  examples: [{ label: 'Sample', input: sampleText }],
}

function CurrentTable({ table }) {
  return <div style={{ overflowX: 'auto' }} role="region" aria-label="Current rows">
    <table>
      <thead><tr>{table.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{table.rows.length
        ? table.rows.map((row, index) => <tr key={index}>{table.columns.map(column => <td key={column}>{String(row[column])}</td>)}</tr>)
        : <tr><td colSpan={table.columns.length}>No rows yet</td></tr>}</tbody>
    </table>
  </div>
}

export default function QueriesQualityAndPercentage() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <CurrentTable table={step.table} />} renderReasoning={() => <>
    <p>Each observation contributes its rating divided by its position to the quality of its query name.</p>
    <p>The poor share counts the observations whose rating is below 3, then expresses that count as a percentage of all observations for the name.</p>
  </>} />
}
