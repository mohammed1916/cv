import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty router', description: 'Start with no stored packets.' },
    { id: 'add', label: 'Add packet', description: 'Reject duplicates, evict the oldest packet when memory is full, then store the packet.' },
    { id: 'forward', label: 'Forward', description: 'Remove and return the oldest stored packet.' },
    { id: 'count', label: 'Count', description: 'Count stored packets for a destination within a timestamp range.' },
    { id: 'done', label: 'Complete', description: 'Every operation has run.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Router operations (JSON object with memory_limit and an operations list)',
  url: 'https://leetcode.com/problems/implement-router/',
  complexity: 'O(n) per call in this simple version, where n is the number of stored packets. The visualization caps input at 16 operations.',
  examples: [
    { label: 'Eviction', input: '{"memory_limit":2,"operations":[["addPacket",1,2,3],["addPacket",1,2,3],["addPacket",4,5,6],["addPacket",7,8,9],["forwardPacket"],["getCount",8,0,10],["addPacket",7,8,9]]}' },
    { label: 'Empty forward', input: '{"memory_limit":1,"operations":[["forwardPacket"],["addPacket",2,3,1],["getCount",3,0,1]]}' },
  ],
}

export default function ImplementRouter() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const ops = run.ops.map(o => ({ name: o.name, args: o.args, returned: o.returned }))
    return <>
      <OperationLog title={`Operations (memory ${run.memory_limit})`} ops={ops} current={step.op} through={step.op} />
      <output aria-label="Stored packets">{`Stored, oldest first: ${step.queue.length ? step.queue.join(' | ') : 'none'}`}</output>
      <output aria-label="Status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>A packet is identified by its source, destination and timestamp. The router keeps stored packets in arrival order and a set of their identities.</p>
    <p>When memory is full, the oldest packet is removed before the new one is stored, so a removed packet no longer blocks a duplicate.</p>
  </>} />
}
