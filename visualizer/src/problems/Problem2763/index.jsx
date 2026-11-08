import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
  {
    "id": "setup",
    "label": "Setup",
    "description": "Set up the running total."
  },
  {
    "id": "start",
    "label": "Start",
    "description": "Begin subarrays at one start index."
  },
  {
    "id": "extend",
    "label": "Extend",
    "description": "Extend the subarray to the next end index."
  },
  {
    "id": "add",
    "label": "Add",
    "description": "Insert a new distinct value and update adjacent pairs."
  },
  {
    "id": "count",
    "label": "Count",
    "description": "Add the imbalance of the current subarray."
  },
  {
    "id": "done",
    "label": "Result",
    "description": "Report the total."
  }
],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with nums (JSON), e.g. {\"nums\":[3,1,2,4]}",
  url: "https://leetcode.com/problems/sum-of-imbalance-numbers-of-all-subarrays/",
  complexity: "O(n^2) distinct-count enumeration with set lookups. The visualization caps input at 20 values; the official limit is 1000.",
  examples: [
  {
    "label": "Four values",
    "input": "{\"nums\":[3,1,2,4]}"
  },
  {
    "label": "Repeats",
    "input": "{\"nums\":[2,2,4,1,4]}"
  },
    { label: 'Single value', input: '{"nums":[1]}' },
    { label: 'Equal values', input: '{"nums":[2,2,2]}' },
    { label: 'Boundary: values up to the length 20', input: '{"nums":[20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1]}' },
    { label: 'Long run: 20 values', input: '{"nums":[9,17,20,7,14,1,1,14,16,19,4,10,8,3,8,2,7,17,17,13]}' },
  ],
}

export default function SumImbalanceNumbersVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const [a, b] = step.window.length ? step.window : [-1, -1]
    const sorted = [...new Set(a >= 0 ? run.input.nums.slice(a, b + 1) : [])].sort((x, y) => x - y)
    return <>
      <IndexedSequence label="Array" length={run.input.nums.length} valueAt={k => run.input.nums[k]} active={step.j}
        roleAt={k => (k === a ? 'l' : k === b ? 'r' : a >= 0 && k > a && k < b ? 'window' : '')} />
      <section aria-label="Sorted distinct values in the window" style={{ color: 'var(--text)' }}>
        <h3>Sorted distinct values in the window</h3>
        <ol style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0 }}>
          {sorted.map((v, k) => <li key={v} style={{ padding: '4px 8px', borderRadius: 6, background: 'var(--surface2)' }}>
            {v}{k + 1 < sorted.length && sorted[k + 1] - v > 1 ? <span style={{ color: 'var(--primary)' }}> &nbsp;gap</span> : ''}
          </li>)}
        </ol>
      </section>
      <output aria-label="Running total">{`Subarray ${step.i}-${step.j}, distinct ${step.distinct}, adjacent pairs ${step.adjacent}, total ${step.total}`}</output>
      <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p>l is the start of the subarray and r is its end. A subarray's imbalance counts the gaps between consecutive sorted distinct values, which equals distinct minus one minus the consecutive pairs already present.</p>
    <p>{step.message}</p>
  </>} />
}
