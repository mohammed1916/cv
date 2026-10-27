import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Servers', description: 'Every server starts free with no requests.' },
    { id: 'assign', label: 'Assign', description: 'Route the request to the next free server from its index modulo k.' },
    { id: 'drop', label: 'Drop', description: 'Every server is busy, so the request is dropped.' },
    { id: 'done', label: 'Complete', description: 'Report the busiest servers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"k": servers, "arrival": [...], "load": [...]}',
  url: 'https://leetcode.com/problems/find-servers-that-handled-most-number-of-requests/',
  complexity: 'O(m log k) time with a min heap of busy servers and a sorted free list. The visualization caps input at 6 servers and 12 requests.',
  examples: [
    { label: 'Example 1', input: '{"k":3,"arrival":[1,2,3,4,5],"load":[5,2,3,3,3]}' },
    { label: 'Example 2', input: '{"k":3,"arrival":[1,2,3],"load":[10,12,11]}' },
  ],
}

export default function BusiestServers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Requests handled per server" length={step.handled.length} valueAt={i => step.handled[i]} active={step.server} />
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A request tries servers in circular order starting at its index modulo k, so the busiest servers depend on that order.</p>
    <p>A server is free again once its last request ends, which is why a heap of finish times tells us when each server returns to the pool.</p>
  </>} />
}
