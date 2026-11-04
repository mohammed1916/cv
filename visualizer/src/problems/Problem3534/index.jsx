import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PathLiftingView from './PathLiftingView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3534',
  phases: [
    { id: 'sort', label: 'Sort', description: 'Line the nodes up by value.' },
    { id: 'window', label: 'Longest hop', description: 'Two pointers find the furthest node one edge can reach.' },
    { id: 'lift', label: 'Double', description: 'Combine two jumps of 2^(k-1) hops into one of 2^k.' },
    { id: 'query', label: 'Query', description: 'Place a and b on the sorted line.' },
    { id: 'test', label: 'Try jump', description: 'Try the largest jump that still stops before b.' },
    { id: 'jump', label: 'Jump', description: 'Take a safe jump and count its hops.' },
    { id: 'answer', label: 'Answer', description: 'One final hop reaches b, or the path is blocked.' },
    { id: 'done', label: 'Result', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, maxDiff and queries',
  url: 'https://leetcode.com/problems/path-existence-queries-in-a-graph-ii/',
  complexity: 'O((n + q) log n) time after an O(n log n) sort, and O(n log n) space. The official limits reach 100000 nodes and queries; this page caps them at 12 nodes and 6 queries so the graph stays readable.',
  examples: [
    { label: 'Chain with a blocked node', input: '{"nums":[14,2,9,5,18,11,30],"maxDiff":5,"queries":[[1,4],[0,2],[1,6],[3,3]]}' },
    { label: 'Long chain', input: '{"nums":[0,3,6,9,12,15,18,21,24],"maxDiff":4,"queries":[[0,8],[5,1],[2,3]]}' },
    { label: 'Equal values, no other edges', input: '{"nums":[6,6,40],"maxDiff":0,"queries":[[0,1],[1,2],[2,2]]}' },
  ],
}

export default function PathExistenceQueriesInAGraphII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PathLiftingView run={run} step={step} />} renderReasoning={() => <>
    <p>Moving toward a larger value, the best hop is always the furthest one allowed. Anything a shorter hop could reach next, the further hop can reach too, because it sits closer in value.</p>
    <p>So each sorted position has one best move, and those moves form a chain. Walking it one hop at a time is too slow for many queries, so the table stores where 1, 2, 4, 8 hops land.</p>
    <p>Taking the largest jumps that stop short of b, from big to small, lands on the last position before b can be reached. One more hop then finishes the path, or shows a gap wider than maxDiff blocks it.</p>
    <p>Sorted positions make equal values simple: they all sit inside one another's window, so they are one hop apart.</p>
  </>} />
}
