import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Column letters', description: 'Count the letters in each column of the words.' },
    { id: 'base', label: 'Empty prefix', description: 'Set up the row for an empty target.' },
    { id: 'fill', label: 'Fill table', description: 'Fill each cell from the cell above and the cell diagonally above-left.' },
    { id: 'done', label: 'Complete', description: 'Report the number of ways.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with words (equal length) and target (JSON)',
  url: 'https://leetcode.com/problems/number-of-ways-to-form-a-target-string-given-a-dictionary/',
  complexity: 'O(m * L + w * L) time for m target letters, L columns and w words. The visualization caps each side at 6.',
  examples: [
    { label: 'Four columns', input: '{"words":["xy","yx"],"target":"xyx"}' },
    { label: 'Repeated letters', input: '{"words":["abc","cba"],"target":"bca"}' },
  ],
}

export default function TargetWays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { target, words } = run.input
    const length = words[0].length
    return <>
      <section aria-label="Column letters">
        <h3>Column letters</h3>
        <table>
          <thead><tr><th scope="col">Column</th>{Array.from({ length }, (_, k) => <th key={k} scope="col">{k}</th>)}</tr></thead>
          <tbody>
            {Array.from({ length: words.length }, (_, w) => <tr key={w}><th scope="row">word {w}</th>{Array.from({ length }, (_, k) => <td key={k}>{words[w][k]}</td>)}</tr>)}
          </tbody>
        </table>
      </section>
      <section aria-label="Ways table">
        <h3>Ways table</h3>
        <table className="ways-table">
          <caption>Rows: target prefix length. Columns: words columns used.</caption>
          <thead><tr><th scope="col">i</th>{Array.from({ length: length + 1 }, (_, k) => <th key={k} scope="col">{k}</th>)}</tr></thead>
          <tbody>
            {step.dp.map((row, i) => <tr key={i}>
              <th scope="row">{i === 0 ? '0 (empty)' : `${i} (${target.slice(0, i)})`}</th>
              {row.map((value, k) => {
                const current = i === step.i && k === step.k
                const active = step.i >= 1 && step.k >= 1
                const role = current ? 'current'
                  : active && i === step.i && k === step.k - 1 ? 'skip'
                  : active && i === step.i - 1 && k === step.k - 1 ? 'use' : undefined
                const background = role === 'current' ? 'color-mix(in srgb, var(--primary) 26%, transparent)'
                  : role === 'skip' ? 'color-mix(in srgb, var(--info) 22%, transparent)'
                  : role === 'use' ? 'color-mix(in srgb, var(--success) 22%, transparent)' : 'transparent'
                return <td key={k} data-role={role} style={{ color: 'var(--text)', fontWeight: current ? 700 : 400, background }}>{value}</td>
              })}
            </tr>)}
          </tbody>
        </table>
      </section>
      <p style={{ color: 'var(--text-muted)' }}>Outlined cell: the cell being filled. Blue: the cell to its left, meaning skip this column. Green: the cell diagonally up-left, meaning use this column for the newest target letter.</p>
      <output aria-label="Current step" style={{ display: 'block', color: 'var(--text)' }}>{step.result !== undefined ? `Answer: ${step.result}` : step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>The characters of the target are taken from increasing columns, so a cell can either skip the newest column or use it for the newest target letter.</p>
    <p>Each use multiplies by the number of words that have that letter in that column, since any such word can supply it.</p>
  </>} />
}
