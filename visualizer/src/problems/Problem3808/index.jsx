import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sampleText } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read every reaction row.' },
    { id: 'group', label: 'Group', description: 'Count each user reactions and the most common one.' },
    { id: 'filter', label: 'Filter', description: 'Keep users with five items and a 60 percent share.' },
    { id: 'order', label: 'Order', description: 'Sort by ratio, then by user.' },
    { id: 'done', label: 'Result', description: 'Report the rows.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a reactions list of user_id, content_id and reaction',
  url: 'https://leetcode.com/problems/find-emotionally-consistent-users/',
  complexity: 'O(r) to count r reaction rows, plus a sort of the kept users.',
  examples: [
    { label: 'Sample', input: sampleText },
    { label: 'One reaction', input: '{"reactions":[{"user_id":1,"content_id":1,"reaction":"like"}]}' },
    { label: 'Same reaction, two users', input: '{"reactions":[{"user_id":1,"content_id":7,"reaction":"like"},{"user_id":2,"content_id":7,"reaction":"like"}]}' },
    { label: 'Sixty rows, one content', input: '{"reactions":[{"user_id":1,"content_id":9,"reaction":"like"},{"user_id":2,"content_id":9,"reaction":"wow"},{"user_id":3,"content_id":9,"reaction":"like"},{"user_id":4,"content_id":9,"reaction":"wow"},{"user_id":5,"content_id":9,"reaction":"like"},{"user_id":6,"content_id":9,"reaction":"wow"},{"user_id":7,"content_id":9,"reaction":"like"},{"user_id":8,"content_id":9,"reaction":"wow"},{"user_id":9,"content_id":9,"reaction":"like"},{"user_id":10,"content_id":9,"reaction":"wow"},{"user_id":11,"content_id":9,"reaction":"like"},{"user_id":12,"content_id":9,"reaction":"wow"},{"user_id":13,"content_id":9,"reaction":"like"},{"user_id":14,"content_id":9,"reaction":"wow"},{"user_id":15,"content_id":9,"reaction":"like"},{"user_id":16,"content_id":9,"reaction":"wow"},{"user_id":17,"content_id":9,"reaction":"like"},{"user_id":18,"content_id":9,"reaction":"wow"},{"user_id":19,"content_id":9,"reaction":"like"},{"user_id":20,"content_id":9,"reaction":"wow"},{"user_id":21,"content_id":9,"reaction":"like"},{"user_id":22,"content_id":9,"reaction":"wow"},{"user_id":23,"content_id":9,"reaction":"like"},{"user_id":24,"content_id":9,"reaction":"wow"},{"user_id":25,"content_id":9,"reaction":"like"},{"user_id":26,"content_id":9,"reaction":"wow"},{"user_id":27,"content_id":9,"reaction":"like"},{"user_id":28,"content_id":9,"reaction":"wow"},{"user_id":29,"content_id":9,"reaction":"like"},{"user_id":30,"content_id":9,"reaction":"wow"},{"user_id":31,"content_id":9,"reaction":"like"},{"user_id":32,"content_id":9,"reaction":"wow"},{"user_id":33,"content_id":9,"reaction":"like"},{"user_id":34,"content_id":9,"reaction":"wow"},{"user_id":35,"content_id":9,"reaction":"like"},{"user_id":36,"content_id":9,"reaction":"wow"},{"user_id":37,"content_id":9,"reaction":"like"},{"user_id":38,"content_id":9,"reaction":"wow"},{"user_id":39,"content_id":9,"reaction":"like"},{"user_id":40,"content_id":9,"reaction":"wow"},{"user_id":41,"content_id":9,"reaction":"like"},{"user_id":42,"content_id":9,"reaction":"wow"},{"user_id":43,"content_id":9,"reaction":"like"},{"user_id":44,"content_id":9,"reaction":"wow"},{"user_id":45,"content_id":9,"reaction":"like"},{"user_id":46,"content_id":9,"reaction":"wow"},{"user_id":47,"content_id":9,"reaction":"like"},{"user_id":48,"content_id":9,"reaction":"wow"},{"user_id":49,"content_id":9,"reaction":"like"},{"user_id":50,"content_id":9,"reaction":"wow"},{"user_id":51,"content_id":9,"reaction":"like"},{"user_id":52,"content_id":9,"reaction":"wow"},{"user_id":53,"content_id":9,"reaction":"like"},{"user_id":54,"content_id":9,"reaction":"wow"},{"user_id":55,"content_id":9,"reaction":"like"},{"user_id":56,"content_id":9,"reaction":"wow"},{"user_id":57,"content_id":9,"reaction":"like"},{"user_id":58,"content_id":9,"reaction":"wow"},{"user_id":59,"content_id":9,"reaction":"like"},{"user_id":60,"content_id":9,"reaction":"wow"}]}' },
    { label: 'Long run: 60 rows', input: '{"reactions":[{"user_id":29,"content_id":8,"reaction":"like"},{"user_id":12,"content_id":10,"reaction":"like"},{"user_id":22,"content_id":12,"reaction":"like"},{"user_id":22,"content_id":1,"reaction":"laugh"},{"user_id":28,"content_id":3,"reaction":"laugh"},{"user_id":27,"content_id":7,"reaction":"laugh"},{"user_id":10,"content_id":5,"reaction":"like"},{"user_id":7,"content_id":10,"reaction":"like"},{"user_id":6,"content_id":10,"reaction":"like"},{"user_id":22,"content_id":10,"reaction":"laugh"},{"user_id":30,"content_id":3,"reaction":"laugh"},{"user_id":3,"content_id":6,"reaction":"laugh"},{"user_id":21,"content_id":5,"reaction":"like"},{"user_id":19,"content_id":1,"reaction":"like"},{"user_id":6,"content_id":6,"reaction":"love"},{"user_id":1,"content_id":9,"reaction":"like"},{"user_id":12,"content_id":8,"reaction":"like"},{"user_id":29,"content_id":1,"reaction":"like"},{"user_id":8,"content_id":5,"reaction":"laugh"},{"user_id":19,"content_id":2,"reaction":"laugh"},{"user_id":14,"content_id":9,"reaction":"like"},{"user_id":28,"content_id":4,"reaction":"like"},{"user_id":25,"content_id":9,"reaction":"love"},{"user_id":5,"content_id":4,"reaction":"laugh"},{"user_id":23,"content_id":4,"reaction":"laugh"},{"user_id":5,"content_id":11,"reaction":"like"},{"user_id":7,"content_id":2,"reaction":"love"},{"user_id":15,"content_id":9,"reaction":"laugh"},{"user_id":2,"content_id":2,"reaction":"laugh"},{"user_id":26,"content_id":11,"reaction":"like"},{"user_id":9,"content_id":7,"reaction":"laugh"},{"user_id":27,"content_id":2,"reaction":"love"},{"user_id":20,"content_id":10,"reaction":"like"},{"user_id":1,"content_id":1,"reaction":"like"},{"user_id":17,"content_id":2,"reaction":"love"},{"user_id":17,"content_id":7,"reaction":"like"},{"user_id":20,"content_id":5,"reaction":"like"},{"user_id":25,"content_id":2,"reaction":"love"},{"user_id":8,"content_id":10,"reaction":"like"},{"user_id":30,"content_id":6,"reaction":"like"},{"user_id":22,"content_id":6,"reaction":"laugh"},{"user_id":23,"content_id":11,"reaction":"love"},{"user_id":4,"content_id":2,"reaction":"laugh"},{"user_id":17,"content_id":1,"reaction":"laugh"},{"user_id":29,"content_id":3,"reaction":"love"},{"user_id":4,"content_id":3,"reaction":"like"},{"user_id":12,"content_id":12,"reaction":"laugh"},{"user_id":9,"content_id":10,"reaction":"like"},{"user_id":5,"content_id":5,"reaction":"like"},{"user_id":11,"content_id":2,"reaction":"love"},{"user_id":6,"content_id":3,"reaction":"love"},{"user_id":13,"content_id":10,"reaction":"like"},{"user_id":5,"content_id":2,"reaction":"love"},{"user_id":9,"content_id":11,"reaction":"love"},{"user_id":29,"content_id":10,"reaction":"love"},{"user_id":19,"content_id":4,"reaction":"like"},{"user_id":6,"content_id":8,"reaction":"laugh"},{"user_id":22,"content_id":7,"reaction":"love"},{"user_id":11,"content_id":9,"reaction":"love"},{"user_id":12,"content_id":6,"reaction":"laugh"}]}' },
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

function StageRail({ phases, active }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
    {phases.map(phase => <li key={phase.id} aria-current={phase.id === active ? 'step' : undefined}
      style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 10px', background: phase.id === active ? 'var(--primary)' : 'var(--surface2)', color: phase.id === active ? 'var(--on-primary, #fff)' : 'var(--text)' }}>
      <strong>{phase.label}</strong>
    </li>)}
  </ol>
}

export default function FindEmotionallyConsistentUsers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageRail phases={definition.phases} active={step.phase} />
    <CurrentTable table={step.table} />
  </>} renderReasoning={() => <>
    <p>Count how many times each user used each reaction, then the total and the largest count.</p>
    <p>A user stays only when the total is at least five and the largest count is at least three fifths of the total, which also rules out a tie for the dominant reaction.</p>
  </>} />
}
