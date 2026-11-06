import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'
import authoredExamples from '../../config/examples/collection--1013.js'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Add up the array to fix the size of each part.' },
    { id: 'scan', label: 'Scan', description: 'Add elements to the running sum, leaving the last element for the third part.' },
    { id: 'close', label: 'Close part', description: 'When the running sum hits the target, close a part and start the next one.' },
    { id: 'done', label: 'Complete', description: 'Two closed parts mean the remainder is a valid third part.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr (JSON)',
  url: 'https://leetcode.com/problems/partition-array-into-three-parts-with-equal-sum/',
  complexity: 'O(n) time and O(1) auxiliary space: one total pass and one scan.',
  examples: authoredExamples,
}

export default function PartitionThreeEqualParts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.state
    const arr = run.input.arr
    const current = run.frames.indexOf(step)
    const cuts = run.frames.slice(0, current + 1).filter(f => f.phase === 'close').map(f => f.state.index)
    // Segment index for each element: parts closed so far separate the array into segments.
    const segmentOf = i => cuts.filter(c => c < i).length
    const segmentColors = ['#bfdbfe', '#bbf7d0', '#fde68a']
    return <>
      <IndexedSequence label="Array" length={arr.length} valueAt={k => arr[k]} active={s.index} />
      <div aria-label="Array elements split into parts" role="img" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, fontFamily: 'monospace' }}>
        {arr.map((v, i) => <div key={i} data-index={i} style={{
          minWidth: 40, padding: '6px 4px', boxSizing: 'border-box', textAlign: 'center', color: 'var(--text)',
          borderWidth: i === s.index ? 2 : 1, borderStyle: 'solid', borderColor: i === s.index ? 'var(--text)' : 'var(--border)',
          background: cuts.length && segmentOf(i) < 3 ? segmentColors[Math.min(segmentOf(i), 2)] : 'transparent',
          borderRight: cuts.includes(i) ? '4px solid var(--text)' : undefined,
        }}><div>{v}</div><small style={{ color: 'var(--text)' }}>{i}</small></div>)}
      </div>
      <p style={{ color: 'var(--text)' }}>
        Cut positions: {cuts.length ? cuts.map((c, k) => `after ${c}${k === 0 ? ' (left part ends)' : ' (middle part ends)'}`).join(', ') : 'none yet'}.
        {s.target !== null && s.target !== undefined ? ` Each part should sum to ${s.target}.` : ''}
      </p>
      <output aria-label="Partition state" style={{ display: 'block', color: 'var(--text)' }}>{`Target ${s.target ?? '-'} · running ${s.running} · parts closed ${s.closed}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Target:</strong> three equal parts of the total each sum to one third of it, so the total must be divisible by three.</p>
    <p><strong>Greedy cuts:</strong> closing each part at the first possible point leaves the most room. The last element is never a cut, so the third part is always nonempty.</p>
  </>} />
}
