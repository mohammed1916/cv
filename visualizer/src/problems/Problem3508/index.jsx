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
    { label: 'Single packet and count', input: '{"memory_limit":1,"operations":[["addPacket",0,1,0],["getCount",1,0,0]]}' },
    { label: 'Equal timestamps tie', input: '{"memory_limit":2,"operations":[["addPacket",1,2,5],["addPacket",3,2,5],["getCount",2,5,5]]}' },
    { label: 'Largest ids and times', input: '{"memory_limit":5,"operations":[["addPacket",9,0,50],["addPacket",9,0,50],["addPacket",8,9,50],["addPacket",7,9,50],["addPacket",6,9,50],["addPacket",5,9,50],["forwardPacket"],["getCount",9,0,50]]}' },
    { label: 'No packets for destination', input: '{"memory_limit":2,"operations":[["addPacket",0,1,3],["getCount",4,0,50]]}' },
    { label: 'Long run: 16 operations', input: '{"memory_limit":5,"operations":[["addPacket",9,0,2],["addPacket",0,2,4],["addPacket",7,4,7],["forwardPacket"],["addPacket",6,5,8],["addPacket",7,7,9],["addPacket",5,8,9],["forwardPacket"],["addPacket",8,8,10],["addPacket",3,7,13],["addPacket",2,8,13],["forwardPacket"],["addPacket",8,3,15],["addPacket",4,4,17],["getCount",6,0,17],["getCount",8,0,50]]}' },
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
