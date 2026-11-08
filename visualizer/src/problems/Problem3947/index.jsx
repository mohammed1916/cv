import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Problem3947View from './Problem3947View'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Budget table', description: 'Start with zero value for every budget.' },
    { id: 'type', label: 'Type', description: 'Read a type\'s price and how many grants it can make.' },
    { id: 'granted', label: 'Granted copies', description: 'Copies that receive a grant are worth two.' },
    { id: 'plain', label: 'Plain copies', description: 'Further copies are worth one.' },
    { id: 'done', label: 'Result', description: 'Report the best value for the full budget.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with budget (0 to 30) and types ([price, factor] pairs)',
  url: 'https://leetcode.com/problems/maximum-number-of-items-from-sale-ii/',
  complexity: 'O(types * budget * d) time with d grants per type, and O(budget) space. The reading follows the draft: a grant needs a purchased copy and each ordered type pair grants once. The visualization caps types at 6 and budget at 30.',
  examples: [
    { label: 'Four types', input: '{"budget":10,"types":[[2,1],[3,2],[4,4],[5,3]]}' },
    { label: 'Tight budget', input: '{"budget":4,"types":[[3,2],[2,4],[5,6]]}' },
    { label: 'Zero budget', input: '{"budget":0,"types":[[1,1]]}' },
    { label: 'Equal types', input: '{"budget":6,"types":[[3,2],[3,2],[3,2]]}' },
    { label: 'Largest budget and types', input: '{"budget":30,"types":[[9,12],[9,12],[9,12],[9,12],[9,12],[9,12]]}' },
    { label: 'Long run: 6 types', input: '{"budget":25,"types":[[4,5],[3,4],[4,2],[1,9],[9,5],[3,12]]}' },
  ],
}

export default function Problem3947Visualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <Problem3947View run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A type that can grant d times contributes two per copy up to d copies and one per copy after that, so a knapsack over the budget picks the best mix.</p>
  </>} />
}
