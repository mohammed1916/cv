import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort the houses along the street.' },
    { id: 'cost', label: 'Run cost', description: 'Price one run of neighbouring houses served by a single mailbox at its median.' },
    { id: 'base', label: 'Base case', description: 'Zero mailboxes cover only zero houses.' },
    { id: 'cell', label: 'Best cover', description: 'Take the cheapest split for this many mailboxes and prefix length.' },
    { id: 'done', label: 'Complete', description: 'Report the best cost with k mailboxes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Houses (JSON object with houses as positions and k mailboxes)',
  url: 'https://leetcode.com/problems/allocate-mailboxes/',
  complexity: 'O(n^3 + k * n^2) time and O(n^2) space. The visualization caps input at 8 houses.',
  examples: [
    { label: 'Five houses', input: '{"houses":[1,4,8,10,20],"k":3}' },
    { label: 'Five houses, two boxes', input: '{"houses":[2,3,5,12,18],"k":2}' },
  ],
}

export default function Mailboxes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const inRange = i => step.range !== null && i >= step.range[0] && i <= step.range[1]
    const roleAt = i => (step.median !== null && i === step.median ? 'mailbox' : inRange(i) ? 'run' : '')
    return <>
      <IndexedSequence label="Houses (sorted)" length={run.sorted.length} valueAt={i => run.sorted[i]} roleAt={roleAt} />
      {step.table && <DPTable title="best[m][i]: m mailboxes cover the first i houses" values={step.table}
        rowLabels={step.table.map((_, m) => m)} columnLabels={step.table[0].map((_, i) => i)}
        activeCell={step.cell ? { row: step.cell[0], column: step.cell[1] } : null} />}
      <output aria-label="Status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>One mailbox serving a run of neighbouring houses is cheapest at the median house of that run.</p>
    <p>The layered table adds one mailbox at a time: the last run starts after some prefix that the earlier mailboxes already cover.</p>
  </>} />
}
