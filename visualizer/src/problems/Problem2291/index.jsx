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
    { label: 'Three stocks', input: '{"present":[2,3,4],"future":[5,4,9],"budget":6}' },
    { label: 'Nothing worth buying', input: '{"present":[5],"future":[1],"budget":5}' },
    { label: 'Two stocks', input: '{"present":[2,2],"future":[5,6],"budget":4}' },
    { label: 'Single stock affordable', input: '{"present":[3],"future":[7],"budget":3}' },
    { label: 'Zero budget', input: '{"present":[4,6],"future":[9,9],"budget":0}' },
    { label: 'Equal stocks', input: '{"present":[5,5],"future":[8,8],"budget":5}' },
    { label: 'Long run: 6 stocks', input: '{"present":[13,14,11,20,16,15],"future":[5,1,14,20,14,1],"budget":15}' },
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
