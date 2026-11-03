import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
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
    return <>
      <div aria-label="Array elements" role="img" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, fontFamily: 'monospace' }}>
        {run.input.arr.map((v, i) => <div key={i} data-index={i} style={{
          minWidth: 40, padding: '6px 4px', boxSizing: 'border-box', textAlign: 'center',
          borderWidth: i === s.index ? 2 : 1, borderStyle: 'solid', borderColor: i === s.index ? 'var(--text)' : 'var(--border)',
          background: i < s.index && s.index >= 0 && s.closed > 0 && i <= s.index ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
        }}><div>{v}</div><small style={{ color: 'var(--text-dim)' }}>{i}</small></div>)}
      </div>
      <output aria-label="Partition state">{`Target ${s.target ?? '-'} · running ${s.running} · parts closed ${s.closed}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Target:</strong> three equal parts of the total each sum to one third of it, so the total must be divisible by three.</p>
    <p><strong>Greedy cuts:</strong> closing each part at the first possible point leaves the most room. The last element is never a cut, so the third part is always nonempty.</p>
  </>} />
}
