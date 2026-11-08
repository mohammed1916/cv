import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Flatten', description: 'Read the grid row by row and reduce values modulo 12345.' },
    { id: 'prefix', label: 'Prefix', description: 'Build running products of the cells before each position.' },
    { id: 'suffix', label: 'Suffix', description: 'Walk backwards, combining the prefix with the running suffix.' },
    { id: 'done', label: 'Result', description: 'Every cell holds the product of all other cells.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid, a rectangular list of integers from 1 to 1000000000',
  url: 'https://leetcode.com/problems/construct-product-matrix/',
  complexity: 'O(n * m) time and space. The visualization caps the grid at 12 cells.',
  examples: [
    { label: 'Two by two', input: '{"grid":[[2,5],[7,3]]}' },
    { label: 'Modulus hit', input: '{"grid":[[12345,6]]}' },
    { label: "Single cell", input: "{\"grid\":[[1]]}" },
    { label: "Equal cells", input: "{\"grid\":[[5,5],[5,5]]}" },
    { label: "Largest values, 12 cells", input: "{\"grid\":[[1000000000,1000000000,1000000000,1000000000],[1000000000,1000000000,1000000000,1000000000],[1000000000,1,1,1000000000]]}" },
    { label: "Long run: 3 by 4 grid", input: "{\"grid\":[[362295327,863708473,581773180,237426233],[135022444,469587241,937341731,980542556],[833955808,527119802,323459585,801730907]]}" },
  ],
}

export default function ConstructProductMatrix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="cells, row by row" length={run.input.grid.flat().length}
      valueAt={i => run.input.grid.flat()[i]} active={step.at >= 0 ? step.at : 0}
      roleAt={i => (step.row >= 0 && i === step.row * run.input.grid[0].length + step.col ? 'window' : '')} />
    <output aria-label="Product matrix">{step.matrix ? step.matrix.map(r => r.join(' ')).join(' / ') : 'building prefix products'}</output>
  </>} renderReasoning={() => <>
    <p>A cell's product is the product of everything before it times the product of everything after it.</p>
    <p>One forward pass stores prefix products, and one backward pass carries the suffix product, so no division is needed.</p>
  </>} />
}
