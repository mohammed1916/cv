import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BuildTreeView from './BuildTreeView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2196',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON descriptions as [parent, child, isLeft], e.g. [[1,2,1],[1,3,0],[2,4,1]]',
  url: 'https://leetcode.com/problems/create-binary-tree-from-descriptions/',
  complexity: 'O(n) time and O(n) space for n descriptions. The page caps descriptions at 9 and values at 15.',
  examples: [
    { label: 'Three levels', input: '[[1,2,1],[1,3,0],[2,4,1]]' },
    { label: 'Single link', input: '[[5,6,0]]' },
    { label: 'Chain up', input: '[[3,1,1],[1,2,0]]' },
    { label: 'Long run: nine descriptions', input: '[[8,3,1],[8,10,0],[3,1,1],[3,2,0],[10,15,1],[15,12,0],[12,9,1],[9,4,0],[4,6,1]]' },
    { label: 'Two children of root', input: '[[7,3,1],[7,9,0]]' },
    { label: 'Right-leaning chain', input: '[[2,4,0],[4,6,0],[6,8,0]]' },
  ],
}

export default function Problem2196Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BuildTreeView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
