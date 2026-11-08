import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BudgetRowView from './BudgetRowView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3946',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with factors, prices (equal-length lists) and budget',
  url: 'https://leetcode.com/problems/maximum-number-of-items-from-sale-i/',
  complexity: 'O(n * budget) time and O(budget) space for n types. The visualization caps types at 8 and budget at 60.',
  examples: [
    { label: 'Divisor chain', input: '{"factors":[2,4,3,8],"prices":[3,5,2,4],"budget":12}' },
    { label: 'Tight budget', input: '{"factors":[1,6,2],"prices":[4,1,3],"budget":7}' },
    { label: 'Single item', input: '{"factors":[5],"prices":[4],"budget":4}' },
    { label: 'Equal items', input: '{"factors":[2,2,2],"prices":[3,3,3],"budget":6}' },
    { label: 'Largest factors and budget', input: '{"factors":[30,30,30,30,30,30,30,30],"prices":[1,1,1,1,1,1,1,1],"budget":60}' },
    { label: 'Long run: 8 items', input: '{"factors":[12,15,12,26,8,21,9,13],"prices":[19,21,21,1,28,21,23,3],"budget":60}' },
  ],
}

export default function Problem3946Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BudgetRowView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
