import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const cell = { border: '1px solid currentColor', padding: '4px 8px', textAlign: 'left' }

function RowTable({ label, columns = [], rows = [] }) {
  return <div>
    <p><strong>{label}</strong></p>
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
      <thead><tr>{columns.map(column => <th key={column} style={cell}>{column}</th>)}</tr></thead>
      <tbody>{rows.length ? rows.map((row, index) => <tr key={index}>
        {columns.map(column => <td key={column} style={cell}>{String(row[column] ?? 'NULL')}</td>)}
      </tr>) : <tr><td style={cell} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>}</tbody>
    </table>
  </div>
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with submissions (sub_id, parent_id); parent_id null marks a post',
  url: 'https://leetcode.com/problems/number-of-comments-per-post/',
  complexity: 'O(n) after removing duplicates for n rows. The visualization caps the table at 12 rows.',
  examples: [
    { label: 'Posts and replies', input: '{"submissions":[{"sub_id":21,"parent_id":null},{"sub_id":22,"parent_id":null},{"sub_id":23,"parent_id":21},{"sub_id":24,"parent_id":21},{"sub_id":23,"parent_id":21},{"sub_id":25,"parent_id":22},{"sub_id":26,"parent_id":null}]}' },
    { label: 'Single post', input: '{"submissions":[{"sub_id":9,"parent_id":null}]}' },
    { label: 'Lone post with no replies', input: '{\"submissions\":[{\"sub_id\":1,\"parent_id\":null}]}' },
    { label: 'Two posts, each with a comment', input: '{\"submissions\":[{\"sub_id\":5,\"parent_id\":null},{\"sub_id\":6,\"parent_id\":null},{\"sub_id\":7,\"parent_id\":5},{\"sub_id\":8,\"parent_id\":6}]}' },
    { label: 'Largest allowed id', input: '{\"submissions\":[{\"sub_id\":999,\"parent_id\":null},{\"sub_id\":998,\"parent_id\":999}]}' },
    { label: 'Long run: four posts, eight comments', input: '{\"submissions\":[{\"sub_id\":10,\"parent_id\":null},{\"sub_id\":20,\"parent_id\":null},{\"sub_id\":30,\"parent_id\":null},{\"sub_id\":40,\"parent_id\":null},{\"sub_id\":100,\"parent_id\":30},{\"sub_id\":101,\"parent_id\":40},{\"sub_id\":102,\"parent_id\":30},{\"sub_id\":103,\"parent_id\":30},{\"sub_id\":104,\"parent_id\":20},{\"sub_id\":105,\"parent_id\":30},{\"sub_id\":106,\"parent_id\":20},{\"sub_id\":107,\"parent_id\":30}]}' },
  ],
}

function StageStrip({ phases, current }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map(stage => <li key={stage.id} data-stage={stage.id} aria-current={stage.id === current ? 'step' : undefined} style={{
      padding: '4px 10px', border: stage.id === current ? '2px solid var(--text)' : '1px solid var(--border)',
      background: stage.id === current ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'var(--surface2)', color: 'var(--text)',
    }}>{stage.label}</li>)}
  </ol>
}

export default function NumberOfCommentsPerPost() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip phases={phases} current={step.phase} />
    <RowTable label={`Working table (${step.phase})`} columns={step.columns} rows={step.rows} />
    {step.phase === 'done' && <RowTable label="Result" columns={run.columns} rows={run.result} />}
  </>} renderReasoning={() => <>
    <p>A post is a row with no parent. Each reply is matched to its post by parent_id, and a reply that appears twice is counted once.</p>
    <p>Starting every post at zero and then adding matched replies keeps posts with no comments in the output.</p>
  </>} />
}
