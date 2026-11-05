import { Fragment } from 'react'
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: 'https://leetcode.com/problems/valid-palindrome-iii/',
}

const cell = { width: 34, height: 34, boxSizing: 'border-box', display: 'grid', placeItems: 'center', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '.8rem' }

export default function ValidPalindromeIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s } = run.input
    const n = s.length
    const { table, i, j } = step.snapshot
    return <>
      <div aria-label="Interval table" role="img" style={{ display: 'grid', gridTemplateColumns: `34px repeat(${n}, 34px)`, gap: 3, width: 'max-content' }}>
        <span />
        {[...s].map((ch, col) => <span key={`h${col}`} style={{ textAlign: 'center', fontFamily: 'monospace' }}>{ch}</span>)}
        {table.map((row, r) => <Fragment key={`row${r}`}>
          <span style={{ fontFamily: 'monospace', alignSelf: 'center' }}>{s[r]}</span>
          {row.map((value, col) => {
            const current = r === i && col === j
            const filled = col >= r
            return <span key={`${r}-${col}`} data-cell={`${r},${col}`} style={{
              ...cell,
              background: current ? 'var(--primary)' : filled ? 'var(--surface2)' : 'transparent',
              color: 'var(--text)', outline: current ? '2px solid var(--text)' : undefined,
              visibility: filled ? 'visible' : 'hidden',
            }}>{filled ? value : ''}</span>
          })}
        </Fragment>)}
      </div>
      {i !== null && i !== undefined && i >= 0 && <p>{`Current window: l = ${i} (start) and r = ${j} (end), the substring ${s.slice(i, j + 1)}.`}</p>}
      <p>Rows are start positions, columns are end positions. A cell holds the fewest deletions that make that substring a palindrome.</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Why intervals:</strong> the cost of an interval depends only on the cost of smaller intervals inside it. Filling by increasing length guarantees those are ready.</p>
    {step.snapshot.cost !== undefined && <p>Cost for the whole string: {step.snapshot.cost}.</p>}
  </>} />
}
