import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

function Clusters({ snapshot }) {
  return <ul aria-label="Friendship groups" style={{ display: 'flex', gap: 10, listStyle: 'none', padding: 0, flexWrap: 'wrap' }}>
    {snapshot.clusters.map((members, index) => <li key={index} style={{ border: '2px solid #0891b2', borderRadius: 10, padding: '8px 12px' }}>
      <strong>Group {index + 1}</strong>: {members.join(', ')}
    </li>)}
  </ul>
}

export default function UnionFindVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <Clusters snapshot={step.snapshot} />
      <p>Groups remaining: {step.snapshot.groups}{step.snapshot.time !== undefined ? ` · Time ${step.snapshot.time}` : ''}</p>
      <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result}` : step.message}</output>
    </>}
    renderReasoning={() => <p>Logs are processed in time order. Each log asks whether two people already share a group; only a merge of two different groups reduces the count, so the first moment the count reaches one is the answer.</p>} />
}
