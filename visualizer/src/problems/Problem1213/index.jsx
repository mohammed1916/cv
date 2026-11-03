import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: 'https://leetcode.com/problems/intersection-of-three-sorted-arrays/',
}

const cell = { display: 'inline-block', minWidth: 34, padding: '4px 6px', textAlign: 'center', border: '1px solid var(--border)', borderRadius: 4, fontFamily: 'monospace', marginRight: 4 }

export default function IntersectionOfThreeSortedArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const arrays = [['a', run.input.a], ['b', run.input.b], ['c', run.input.c]]
    const { common, pos, low } = step.snapshot
    return <>
      {arrays.map(([name, values], row) => <div key={name} aria-label={`Array ${name}`} style={{ marginBottom: 8 }}>
        <strong style={{ display: 'inline-block', width: 24 }}>{name}</strong>
        {values.map((value, i) => <span key={i} data-value={value} style={{
          ...cell,
          background: pos[row] === i ? '#facc15' : i < pos[row] ? 'var(--surface2)' : 'transparent',
          color: pos[row] === i ? '#1c1917' : 'var(--text)',
          outline: low !== undefined && step.snapshot.moved?.includes(name) && pos[row] === i + 1 ? '2px solid #0891b2' : 'none',
        }}>{value}</span>)}
      </div>)}
      <p aria-label="Common values">Common so far: [{common.join(', ')}]</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Why only the smallest moves:</strong> every array is strictly increasing, so once a head is the smallest, every later value in the other arrays is larger than the current heads. The smallest value cannot be shared with them.</p>
    {step.snapshot.found !== undefined && <p>Value {step.snapshot.found} is common to all three arrays.</p>}
  </>} />
}
