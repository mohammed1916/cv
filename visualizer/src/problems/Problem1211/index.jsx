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
  examples: [
    { label: 'Sample', input: sampleText },
    { label: 'Single query', input: '{\"queries\":[{\"query_name\":\"Dog\",\"result\":\"Rex\",\"position\":1,\"rating\":5}]}' },
    { label: 'Missing query name is kept', input: '{\"queries\":[{\"query_name\":null,\"result\":\"Cat\",\"position\":2,\"rating\":0},{\"query_name\":\"Cat\",\"result\":\"Tom\",\"position\":1,\"rating\":4}]}' },
    { label: 'Long run: forty query rows', input: '{\"queries\":[{\"query_name\":\"Q01\",\"result\":\"miss\",\"position\":2,\"rating\":0},{\"query_name\":\"Q02\",\"result\":\"ok\",\"position\":5,\"rating\":0},{\"query_name\":\"Q03\",\"result\":\"ok\",\"position\":1,\"rating\":3},{\"query_name\":\"Q04\",\"result\":\"ok\",\"position\":3,\"rating\":0},{\"query_name\":\"Q05\",\"result\":\"miss\",\"position\":5,\"rating\":3},{\"query_name\":\"Q06\",\"result\":\"miss\",\"position\":2,\"rating\":4},{\"query_name\":\"Q07\",\"result\":\"miss\",\"position\":5,\"rating\":2},{\"query_name\":\"Q08\",\"result\":\"ok\",\"position\":1,\"rating\":0},{\"query_name\":\"Q09\",\"result\":\"ok\",\"position\":3,\"rating\":4},{\"query_name\":\"Q10\",\"result\":\"miss\",\"position\":2,\"rating\":4},{\"query_name\":\"Q11\",\"result\":\"miss\",\"position\":8,\"rating\":5},{\"query_name\":\"Q12\",\"result\":\"miss\",\"position\":2,\"rating\":0},{\"query_name\":\"Q13\",\"result\":\"miss\",\"position\":6,\"rating\":5},{\"query_name\":\"Q14\",\"result\":\"miss\",\"position\":3,\"rating\":2},{\"query_name\":\"Q15\",\"result\":\"ok\",\"position\":8,\"rating\":2},{\"query_name\":\"Q16\",\"result\":\"ok\",\"position\":8,\"rating\":5},{\"query_name\":\"Q17\",\"result\":\"ok\",\"position\":3,\"rating\":0},{\"query_name\":\"Q18\",\"result\":\"ok\",\"position\":9,\"rating\":0},{\"query_name\":\"Q19\",\"result\":\"ok\",\"position\":5,\"rating\":1},{\"query_name\":\"Q20\",\"result\":\"ok\",\"position\":1,\"rating\":4},{\"query_name\":\"Q21\",\"result\":\"miss\",\"position\":4,\"rating\":3},{\"query_name\":\"Q22\",\"result\":\"miss\",\"position\":6,\"rating\":2},{\"query_name\":\"Q23\",\"result\":\"ok\",\"position\":5,\"rating\":5},{\"query_name\":\"Q24\",\"result\":\"ok\",\"position\":8,\"rating\":3},{\"query_name\":\"Q25\",\"result\":\"miss\",\"position\":1,\"rating\":3},{\"query_name\":\"Q26\",\"result\":\"ok\",\"position\":4,\"rating\":5},{\"query_name\":\"Q27\",\"result\":\"ok\",\"position\":6,\"rating\":4},{\"query_name\":\"Q28\",\"result\":\"ok\",\"position\":7,\"rating\":0},{\"query_name\":\"Q29\",\"result\":\"ok\",\"position\":4,\"rating\":0},{\"query_name\":\"Q30\",\"result\":\"miss\",\"position\":8,\"rating\":0},{\"query_name\":\"Q31\",\"result\":\"miss\",\"position\":3,\"rating\":5},{\"query_name\":\"Q32\",\"result\":\"miss\",\"position\":9,\"rating\":1},{\"query_name\":\"Q33\",\"result\":\"miss\",\"position\":5,\"rating\":1},{\"query_name\":\"Q34\",\"result\":\"miss\",\"position\":6,\"rating\":0},{\"query_name\":\"Q35\",\"result\":\"miss\",\"position\":6,\"rating\":2},{\"query_name\":\"Q36\",\"result\":\"miss\",\"position\":9,\"rating\":4},{\"query_name\":\"Q37\",\"result\":\"miss\",\"position\":3,\"rating\":0},{\"query_name\":\"Q38\",\"result\":\"ok\",\"position\":5,\"rating\":5},{\"query_name\":\"Q39\",\"result\":\"ok\",\"position\":6,\"rating\":2},{\"query_name\":\"Q40\",\"result\":\"ok\",\"position\":2,\"rating\":3}]}' },
  ],
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

function StageStrip({ phases, current }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map(stage => <li key={stage.id} data-stage={stage.id} aria-current={stage.id === current ? 'step' : undefined} style={{
      padding: '4px 10px', border: stage.id === current ? '2px solid var(--text)' : '1px solid var(--border)',
      background: stage.id === current ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'var(--surface2)', color: 'var(--text)',
    }}>{stage.label}</li>)}
  </ol>
}

export default function QueriesQualityAndPercentage() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageStrip phases={definition.phases} current={step.phase} />
    <CurrentTable table={step.table} />
  </>} renderReasoning={() => <>
    <p>Each observation contributes its rating divided by its position to the quality of its query name.</p>
    <p>The poor share counts the observations whose rating is below 3, then expresses that count as a percentage of all observations for the name.</p>
  </>} />
}
