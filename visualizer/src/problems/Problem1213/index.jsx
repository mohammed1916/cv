import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: 'https://leetcode.com/problems/intersection-of-three-sorted-arrays/',
}

const POINTER = ['i', 'j', 'k']
const cell = { display: 'inline-grid', justifyItems: 'center', minWidth: 40, padding: '2px 6px', marginRight: 4, border: '1px solid var(--border)', borderRadius: 4, fontFamily: 'monospace' }

export default function IntersectionOfThreeSortedArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const arrays = [['a', run.input.a], ['b', run.input.b], ['c', run.input.c]]
    const { common, pos, low, moved = [] } = step.snapshot
    return <>
      {arrays.map(([name, values], row) => <div key={name} aria-label={`Array ${name}`} style={{ marginBottom: 10 }}>
        <strong style={{ display: 'inline-block', width: 24 }}>{name}</strong>
        {values.map((value, i) => {
          const here = pos[row] === i
          const isMoved = here === false && moved.includes(name) && pos[row] === i + 1
          return <span key={i} data-value={value} style={{
            ...cell,
            background: here ? 'color-mix(in srgb, var(--primary) 30%, transparent)' : i < pos[row] ? 'var(--surface2)' : 'transparent',
            color: 'var(--text)',
            outline: isMoved ? '2px solid var(--primary)' : 'none',
            opacity: i < pos[row] ? 0.55 : 1,
          }}>
            <small style={{ color: 'var(--text-dim)', minHeight: '1em' }}>{here ? POINTER[row] : ''}</small>
            <strong>{value}</strong>
          </span>
        })}
      </div>)}
      <p aria-label="Common values">Common so far: [{common.join(', ')}]</p>
      {low !== undefined && <p>Smallest head {low} moves forward. The pointers i, j and k sit on the current heads.</p>}
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Why only the smallest moves:</strong> every array is strictly increasing, so once a head is the smallest, every later value in the other arrays is larger than the current heads. The smallest value cannot appear in the other two arrays any more.</p>
    {step.snapshot.found !== undefined && <p>Value {step.snapshot.found} is common to all three arrays.</p>}
  </>} />
}
