import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BudgetTableView from './BudgetTableView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2291',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with present, future and budget (e.g. {"present":[1,2,3],"future":[4,3,2],"budget":3})',
  url: 'https://leetcode.com/problems/maximum-profit-from-trading-stocks/',
  complexity: 'O(n * budget) time and O(budget) space for n stocks. The visualization caps the input at 6 stocks, budget 20 and prices 1 to 20; the draft does not verify the official bounds. Profit is read as future minus present per chosen stock; that reading is flagged for source verification.',
  examples: [
    { label: 'Three stocks', input: '{"present":[1,2,3],"future":[4,3,2],"budget":3}' },
    { label: 'Nothing worth buying', input: '{"present":[5],"future":[1],"budget":5}' },
    { label: 'Two stocks', input: '{"present":[2,2],"future":[5,6],"budget":4}' },
  ],
}

export default function Problem2291Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BudgetTableView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
