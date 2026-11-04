import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CacheTreeView from './CacheTreeView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2630',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with fn ("add", "merge" or "list"), calls, and optional objects. "@name" is the one shared object called name; every literal {} or [] is a new object.',
  url: 'https://leetcode.com/problems/memoize-ii/',
  complexity: 'Each call costs O(a) map lookups for a arguments, and the cache holds at most one node per argument passed overall. The visualization caps input at 14 calls of 4 arguments.',
  examples: [
    { label: 'Order and length matter', input: '{"fn":"add","calls":[[3,4],[4,3],[3,4],[3],[3,4,0]]}' },
    { label: 'Shared vs new objects', input: '{"fn":"merge","objects":{"cart":{"apples":2}},"calls":[["@cart",{"pears":1}],["@cart",{"pears":1}],["@cart","@cart"],["@cart","@cart"]]}' },
    { label: 'No arguments, 1 vs "1"', input: '{"fn":"list","calls":[[],[],[1],["1"],[1]]}' },
  ],
}

export default function MemoizeII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <CacheTreeView run={run} step={step} />} renderReasoning={() => <>
    <p>Turning arguments into a string breaks here: two separate objects would serialize alike and wrongly share an answer, and 1 and "1" could collide.</p>
    <p>A tree of maps avoids serializing at all. Each level reads one argument and each map compares keys the way === does, apart from NaN, which the task rules out. A path from the root therefore names one exact argument sequence.</p>
    <p>The value sits on the node where the path ends, not on the leaves only. That is why (3) and (3, 4) can both be cached, even though one path is a prefix of the other, and why a call with no arguments stores its value on the root.</p>
  </>} />
}
