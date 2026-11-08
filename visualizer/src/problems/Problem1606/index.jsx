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
    { label: "Single request", input: "{\"k\":1,\"arrival\":[1],\"load\":[2]}" },
    { label: "Equal loads, three requests", input: "{\"k\":2,\"arrival\":[1,2,3],\"load\":[5,5,5]}" },
    { label: "Twelve requests, six servers", input: "{\"k\":6,\"arrival\":[1,6,11,16,21,26,31,36,41,46,51,56],\"load\":[20,20,20,20,20,20,20,20,20,20,20,20]}" },
    { label: "Long run: 12 requests, 3 servers", input: "{\"k\":3,\"arrival\":[1,5,9,13,15,17,19,20,23,25,30,31],\"load\":[9,13,4,2,6,14,4,9,17,17,3,19]}" },
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
