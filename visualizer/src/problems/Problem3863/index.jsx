import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

const definition = {
  phases: [
    { id: 'setup', label: 'Target', description: 'Sort the letters to get the target.' },
    { id: 'level', label: 'Level', description: 'Strings reachable after each operation.' },
    { id: 'done', label: 'Result', description: 'Report the number of operations.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters, up to 8)',
  url: 'https://leetcode.com/problems/minimum-operations-to-sort-a-string/',
  complexity: 'The search visits reachable orders of the letters, so its cost grows fast. The visual caps s at 8 letters.',
  examples: [
    { label: 'One step', input: '{"s":"abdc"}' },
    { label: 'Reversed', input: '{"s":"cba"}' },
    { label: 'Single letter', input: '{"s":"a"}' },
    { label: 'Equal letters', input: '{"s":"aa"}' },
    { label: 'Reverse of an alphabet run', input: '{"s":"hgfedcba"}' },
    { label: 'Long run: 7 letters', input: '{"s":"bbddfdg"}' },
  ],
}

// Each reachable string as letter cells; a cell is green when its letter already sits where the sorted target has it.
function LevelStrings({ target, level, count }) {
  return <div aria-label="Reachable strings">
    <p>Target: {[...target].map((ch, i) => <span key={i} style={{ display: 'inline-block', minWidth: 20, textAlign: 'center', margin: 1, padding: '1px 3px', border: '1px solid var(--text-muted)', background: 'var(--surface2)', color: 'var(--text)' }}>{ch}</span>)}</p>
    {level.map((text, row) => <div key={row} style={{ marginBottom: 4 }}>
      {[...text].map((ch, i) => <span key={i} data-role={ch === target[i] ? 'target' : ''} style={{ display: 'inline-block', minWidth: 20, textAlign: 'center', margin: 1, padding: '1px 3px', border: '1px solid var(--text-muted)', background: ch === target[i] ? 'var(--primary)' : 'var(--surface2)', color: ch === target[i] ? 'var(--surface)' : 'var(--text)' }}>{ch}</span>)}
    </div>)}
    {count > level.length && <p>{count - level.length} more strings not shown</p>}
  </div>
}

export default function MinimumOperationsToSortAString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const target = [...run.input.s].sort().join('')
    return <>
      <IndexedSequence label="input string" length={run.input.s.length} valueAt={i => run.input.s[i]} roleAt={i => run.input.s[i] !== target[i] ? 'misplaced' : ''} />
      <LevelStrings target={target} level={step.level} count={step.count} />
      <output aria-label="Operation count">{`Operations so far: ${step.ops} · strings in this level: ${step.count}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A move re-sorts a stretch of letters, as long as that stretch is not the whole word. The search keeps every string reachable after the same number of operations and stops at the first level that contains the sorted string.</p>
    <p>Strings already seen are skipped, so each string is expanded once.</p>
  </>} />
}
