import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1319', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with n and links (JSON)',
  url: 'https://leetcode.com/problems/number-of-operations-to-make-network-connected/',
  complexity: 'O(n + m α(n)) time with union-find, where m is the number of cables, and O(n) space.',
}

export default function NetworkGroupsVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const rows = s.roots.map((root, computer) => ({ computer, group: root }))
    return <>
      <RecordStateTable label="Group of each computer (its group label)" columns={['computer', 'group']} rows={rows}
        activeRow={s.a ?? -1} />
      <StackLane title="Groups remaining" items={[String(s.groups)]} note={s.a !== undefined ? `current cable ${s.a}-${s.b}` : undefined} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Groups, not cables:</strong> connecting k groups needs k - 1 cables. A spare cable inside a group can be moved to link one more group.</p>
    <p>{step.message}</p>
  </>} />
}
