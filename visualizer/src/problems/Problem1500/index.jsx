import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1500',
  phases: [
    { id: 'start', label: 'Empty', description: 'No users have joined.' },
    { id: 'join', label: 'Join', description: 'Hand out the smallest free id.' },
    { id: 'leave', label: 'Leave', description: 'Remove a user and free its id.' },
    { id: 'request', label: 'Request', description: 'List the owners of the chunk, then the requester receives it when another owner exists.' },
    { id: 'done', label: 'Result', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with ops: ["join", [chunks]], ["leave", id] or ["request", id, chunk]',
  url: 'https://leetcode.com/problems/design-a-file-sharing-system/',
  complexity: 'O(U) per join for U users in this scan version, and O(U) per request. A heap of free ids would make join faster.',
  examples: [
    { label: 'Example', input: '{"ops":[["join",[5,6]],["join",[6]],["request",2,5],["leave",1],["join",[8]],["request",2,6]]}' },
  ],
}

const HOLDER = 'color-mix(in srgb, var(--success) 35%, var(--surface2))'
const REQUESTER = 'color-mix(in srgb, var(--primary) 30%, var(--surface2))'
const FREED = 'color-mix(in srgb, var(--warning) 35%, var(--surface2))'

const chip = (text, background) => <span key={text} style={{
  display: 'inline-block', margin: 2, padding: '2px 8px', fontFamily: 'monospace', color: 'var(--text)', background,
  border: '1px solid var(--border)',
}}>{text}</span>

export default function DesignAFileSharingSystem() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { owners, uid, chunks, freed, chunk, holders, gives } = step.snapshot
    const phase = step.phase
    const ids = owners.map(([id]) => id)
    const rowTone = id => {
      if (phase === 'join' && id === uid) return HOLDER
      if (phase === 'leave' && id === freed) return FREED
      if (phase === 'request' && id === uid) return REQUESTER
      if (phase === 'request' && holders?.includes(id)) return HOLDER
      return undefined
    }
    const opList = run.input.ops.map((op, i) => ({
      name: op[0],
      args: op[0] === 'join' ? [op[1]] : op.slice(1),
      returned: run.result[i],
    }))
    return <>
      <OperationLog title="Operation timeline" ops={opList} current={step.op ?? -1} through={step.op ?? -1} />
      <section aria-label="Users and chunks">
        <h3>Users in the system, by id (smallest free id is reused first)</h3>
        {owners.length === 0 ? <p>No users are in the system.</p> : (
          <table>
            <thead><tr><th scope="col">user id</th><th scope="col">chunks owned</th></tr></thead>
            <tbody>{owners.map(([id, owned]) => <tr key={id} data-user={id} style={{ background: rowTone(id) }}>
              <td style={{ fontFamily: 'monospace' }}>{id}</td>
              <td>{owned.length ? owned.map(c => chip(c, 'transparent')) : <em>none</em>}</td>
            </tr>)}</tbody>
          </table>
        )}
      </section>
      {phase === 'join' && <p>Ids in use: {ids.join(', ') || 'none'}. The new user takes id {uid}, the smallest positive id not in use, and owns chunks {chunks.length ? chunks.join(', ') : 'none'}.</p>}
      {phase === 'leave' && <p>User {freed} is removed; its chunks are no longer offered by anyone.</p>}
      {phase === 'request' && <section aria-label="Request answer">
        <h3>Request for chunk {chunk}</h3>
        <p>Owners returned, in ascending order: {holders.length ? holders.map(h => chip(h, HOLDER)) : 'none'}</p>
        <p>{gives ? `User ${uid} is an owner of another copy, so the chunk is added to user ${uid}.` : `No other user owns chunk ${chunk}, so user ${uid} receives nothing.`}</p>
      </section>}
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Freed ids are reused, so the next join always takes the smallest id that no user is holding.</p>
    <p>A request reports every owner of the chunk, the requester included, and only then records the chunk for the requester when another owner exists.</p>
  </>} />
}
