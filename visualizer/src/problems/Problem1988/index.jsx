import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1988',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Schools as [id, capacity] and exam rows as [score, student_count] (JSON)',
  url: 'https://leetcode.com/problems/find-cutoff-score-for-each-school/',
  complexity: 'SQL: one join on the capacity condition and one grouping per school; O(schools * exam rows) in this stage model.',
  examples: [
    { label: 'Two schools', input: '{"schools":[[5,40],[8,0]],"exam":[[700,10],[650,25],[600,60]]}' },
    { label: 'Capacity covers all', input: '{"schools":[[1,100]],"exam":[[9,10],[5,100]]}' },
    { label: 'Nothing fits', input: '{"schools":[[7,3]],"exam":[[90,10],[60,20]]}' },
  ],
}

export default function FindCutoffScoreForEachSchool() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { schools, exam, pairs, groups, result } = step.snapshot
    const table = (title, head, rows) => <section style={{ flex: '1 1 180px' }}>
      <h3 style={{ color: 'var(--text)', fontSize: '0.95rem' }}>{title}</h3>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'monospace', color: 'var(--text)' }}>
        <thead><tr>{head.map(h => <th key={h} style={{ border: '1px solid var(--border)', padding: '2px 6px', textAlign: 'left' }}>{h}</th>)}</tr></thead>
        <tbody>{rows.length ? rows.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j} style={{ border: '1px solid var(--border)', padding: '2px 6px' }}>{v}</td>)}</tr>)
          : <tr><td colSpan={head.length} style={{ padding: '2px 6px' }}>not yet</td></tr>}</tbody>
      </table>
    </section>
    return <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {table('Stage 1: Schools', ['school_id', 'capacity'], schools)}
        {table('Stage 2: Join', ['school_id', 'score'], pairs)}
        {table('Stage 3: Group', ['school_id', 'score'], groups)}
      </div>
      <p>Exam rows (score, cumulative students): {exam.map(([s, c]) => `${s}:${c}`).join(' · ')}</p>
      {result.length > 0 && <p>Each school's answer is the smallest score in the join; -1 means the join is empty for that school.</p>}
    </>
  }} renderReasoning={() => <p>A cutoff is usable when the number of students who scored at least that score fits the school's capacity. The smallest such score is the answer; the LEFT JOIN keeps schools with no fitting score so they can report -1.</p>} />
}
