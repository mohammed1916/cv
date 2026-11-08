import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ProductTreeView from './ProductTreeView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, k (1 to 5) and queries ([index, value, start, x])',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(k log n) per query after an O(k n) build, with O(k n) space. The official limits allow 100000 values and 20000 queries; the visualization caps these at 12 values and 6 queries.',
  examples: [
    { label: 'Two queries', input: '{"nums":[6,7,2,5,3],"k":4,"queries":[[1,3,0,2],[4,6,2,1]]}' },
    { label: 'Start past the middle', input: '{"nums":[2,3,4,5,6,7],"k":5,"queries":[[5,9,3,4]]}' },
    { label: 'k = 1', input: '{"nums":[8,9],"k":1,"queries":[[0,3,1,0]]}' },
    { label: 'One value', input: '{"nums":[10],"k":3,"queries":[[0,7,0,1]]}' },
    { label: 'Single entry', input: '{"nums":[8],"k":1,"queries":[[0,3,0,0]]}' },
    { label: 'Equal values', input: '{"nums":[2,2,2],"k":2,"queries":[[1,2,0,1],[2,2,2,0]]}' },
    { label: 'Largest value', input: '{"nums":[1000000000,1000000000],"k":5,"queries":[[0,1000000000,1,4]]}' },
    { label: 'Long run: 12 entries, 6 queries', input: '{"nums":[170155276,587813398,649125158,996626552,94165962,409706380,622298221,103607032,598228654,892774136,408508971,804226851],"k":5,"queries":[[3,551455335,11,4],[3,445323822,6,1],[3,780622979,10,3],[6,868034018,2,2],[11,949564884,9,3],[2,142095693,5,4]]}' },
  ],
}

export default function FindXValueOfArrayII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <ProductTreeView run={run} step={step} />} renderReasoning={() => <>
    <p>Removing a prefix and then a suffix leaves a subarray from start to some end, so each query counts end positions by the remainder of that product. Only remainders matter, and k is at most 5, so a node needs just a few counters.</p>
    <p>A node stores the product of its range and how many of its prefixes reach each remainder. When two ranges join, the left prefixes are unchanged, while a right prefix gets multiplied by the whole left product. That is the shift shown in the table.</p>
    <p>A query combines the O(log n) nodes covering start onward, left to right, using the same shift with the product so far as the multiplier. An update only rebuilds the path from one leaf to the root.</p>
  </>} />
}
