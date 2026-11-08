import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ChainBlocksView from './ChainBlocksView'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const definition = {
  number: '1474',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with list (node values in order), m and n (positive integers)',
  url: 'https://leetcode.com/problems/delete-n-nodes-after-m-nodes-of-a-linked-list/description/',
  complexity: 'O(L) time and O(1) extra pointers for a list of L nodes; the Python export builds nodes first. The visualization caps the list at 20 nodes, values at 0 to 99, and m and n at 10.',
  examples: [
    { label: 'Keep 2, delete 3', input: '{"list":[4,8,15,16,23,42,7,9],"m":2,"n":3}' },
    { label: 'Alternate', input: '{"list":[1,2,3,4,5,6,7,8,9,10],"m":1,"n":1}' },
    { label: 'Short list', input: '{"list":[5],"m":3,"n":2}' },
    { label: 'Single value', input: '{"list":[0],"m":1,"n":1}' },
    { label: 'Repeated values', input: '{"list":[99,99,99,99],"m":10,"n":10}' },
    { label: 'Value limits', input: '{"list":[0,99,0,99,50],"m":2,"n":2}' },
    { label: 'Long run: 20 values', input: '{"list":[3,33,39,23,76,60,7,66,52,93,99,1,20,30,48,26,15,75,43,78],"m":3,"n":4}' },
  ],
}

export default function Problem1474Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ChainBlocksView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
