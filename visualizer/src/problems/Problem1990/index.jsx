import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1990',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Experiment rows [id, platform, name] (JSON)',
  url: 'https://leetcode.com/problems/count-the-number-of-experiments/',
  complexity: 'SQL: a 9-row cross join, one left join on two columns, then a grouped count.',
  examples: [
    { label: 'Two platforms used', input: '[[4,"IOS","Programming"],[7,"Web","Reading"],[9,"IOS","Programming"]]' },
    { label: 'One experiment', input: '[[1,"Android","Sports"]]' },
    { label: 'Empty table', input: '[]' },
  ],
}

const PLATFORMS = ['Android', 'IOS', 'Web']
const NAMES = ['Reading', 'Sports', 'Programming']

export default function CountTheNumberOfExperiments() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { rows, matched, counts } = step.snapshot
    const countAt = (p, n) => {
      const row = counts.find(([cp, cn]) => cp === p && cn === n)
      return row ? row[2] : null
    }
    return <>
      <table aria-label="Counts per platform and experiment name" style={{ borderCollapse: 'collapse', fontFamily: 'monospace', color: 'var(--text)' }}>
        <thead><tr><th style={{ padding: '4px 8px' }} /> {NAMES.map(n => <th key={n} style={{ border: '1px solid var(--border)', padding: '4px 8px' }}>{n}</th>)}</tr></thead>
        <tbody>{PLATFORMS.map(p => <tr key={p}>
          <th style={{ border: '1px solid var(--border)', padding: '4px 8px', textAlign: 'left' }}>{p}</th>
          {NAMES.map(n => <td key={n} style={{ border: '1px solid var(--border)', padding: '4px 8px', textAlign: 'center', background: countAt(p, n) === 0 ? 'var(--surface2)' : 'transparent' }}>{countAt(p, n) ?? '·'}</td>)}
        </tr>)}</tbody>
      </table>
      <p>Stage: {matched.length ? 'the join has matched every combination' : 'cross join of platforms and names'}. Stage counts show <strong>{rows.length}</strong> experiment rows; combinations with no rows show 0.</p>
    </>
  }} renderReasoning={() => <p>The cross join makes every combination exist first. The left join then attaches experiments, so a combination without experiments still appears and counts 0.</p>} />
}
