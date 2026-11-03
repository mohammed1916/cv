import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ChocolateSplitView from './ChocolateSplitView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with prices and queries ([k, m] pairs)',
  url: 'https://leetcode.com/problems/minimum-relative-loss-after-buying-chocolates/',
  complexity: 'O(q * n log n) time and O(n) extra space for q queries over n prices, since each query sorts its per-chocolate values. The visualization caps prices at 10 and queries at 5; the official bounds are not verified here.',
  examples: [
    { label: 'Mixed prices', input: '{"prices":[2,5,9],"queries":[[4,2]]}' },
    { label: 'Two budgets', input: '{"prices":[10,2,7],"queries":[[3,1],[8,2]]}' },
  ],
}

export default function Problem2819Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <ChocolateSplitView run={run} step={step} />}
    renderReasoning={({ run, step }) => <>
      <p>Bob&apos;s share per chocolate is min(price, k) and Alice&apos;s is the remainder. Their difference is independent for each chocolate, so the best m chocolates are the m smallest differences.</p>
      <p>{run ? `Answers: ${run.result.join(', ')}.` : ''}</p>
    </>} />
}
