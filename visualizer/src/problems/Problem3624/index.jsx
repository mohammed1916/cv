import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DepthForestView from './DepthForestView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3624',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and queries ([1, l, r, k] counts, [2, idx, val] updates, positions from 0)',
  url: 'https://leetcode.com/problems/number-of-integers-with-popcount-depth-equal-to-k-ii/',
  complexity: 'O((n + q) log n) time, since a depth takes a few popcounts and each tree touch is logarithmic, and O(n) space for the six trees. The official limit is 100000 entries and queries; the visualization caps these at 12 entries and 8 queries.',
  examples: [
    { label: 'Update changes depth', input: '{"nums":[7,8,3,1,15,6],"queries":[[1,0,5,2],[2,3,31],[1,1,4,3],[1,2,2,0]]}' },
    { label: 'Update keeps depth', input: '{"nums":[5,9,12],"queries":[[1,0,2,2],[2,1,6],[1,1,2,2]]}' },
    { label: 'Largest value, one entry', input: '{"nums":[1000000000000000],"queries":[[1,0,0,3],[2,0,1],[1,0,0,0]]}' },
  ],
}

export default function NumberOfIntegersWithPopcountDepthEqualToKII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <DepthForestView step={step} />} renderReasoning={() => <>
    <p>Popcount shrinks numbers drastically: anything up to 10^15 has at most 50 bits, so one step leaves a number no larger than 50, and only a handful of depths are possible. That small set means one counting structure per depth is affordable.</p>
    <p>A count for depth k over l..r is then just a question to tree k: positions up to r, minus positions before l. Other depths are never looked at.</p>
    <p>An update can move a position from one tree to another, so it subtracts one from the tree of the old depth and adds one to the tree of the new depth, each in logarithmic time. Rescanning the range would be far too slow when both n and q are large.</p>
  </>} />
}
