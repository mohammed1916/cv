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
