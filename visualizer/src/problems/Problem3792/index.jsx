import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BlockProductView from './BlockProductView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Blocks', description: 'Block k takes the next k integers.' },
    { id: 'multiply', label: 'Multiply', description: 'Fold the next integer into the block product.' },
    { id: 'add', label: 'Add', description: 'Add the finished block product to the total.' },
    { id: 'done', label: 'Result', description: 'Report the sum modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (1 to 8 in this visualization)',
  url: 'https://leetcode.com/problems/sum-of-increasing-product-blocks/',
  complexity: 'O(n^2) time and O(1) extra space: block k has k integers, and n blocks hold about n squared over two integers in total.',
  examples: [
    { label: 'Four blocks', input: '{"n":4}' },
    { label: 'Six blocks', input: '{"n":6}' },
  ],
}

export default function SumOfIncreasingProductBlocks() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <BlockProductView run={run} step={step} />} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p>Products are reduced modulo 1000000007 after every multiplication, so the running values stay small.</p>
    {run ? <p>Final answer: {run.result}.</p> : null}
  </>} />
}
