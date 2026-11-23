import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BagsView from './BagsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2171',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Bag sizes as JSON, e.g. [4,1,6,5]',
  url: 'https://leetcode.com/problems/removing-minimum-number-of-magic-beans/',
  complexity: 'O(n log n) time for the sort and O(n) for the scan. The visualization caps the bags at 12, each from 1 to 20.',
  question: "Remove the fewest magic beans so that every remaining non-empty bag holds the same number of beans.",
  approaches: [
    { name: "Sort and try each bag as the target", intuition: "Sort the bags; if the target is a bag's count, remove the smaller bags entirely and trim the larger ones to match.", time: "O(n log n)", space: "O(1) extra" },
  ],
  examples: [
    { label: 'Four bags', input: '[4,1,6,5]' },
    { label: 'Repeated size', input: '[2,10,3,2]' },
    { label: 'Equal bags', input: '[3,3,3]' },
    { label: 'Single bag', input: '[7]' },
    { label: 'Pairs of equal bags', input: '[2,2,9,9]' },
    { label: 'Largest bags, twelve', input: '[20,1,20,1,20,1,20,1,20,1,20,1]' },
    { label: 'Long run: 12 bags', input: '[7,3,7,10,17,2,7,4,13,16,15,1]' },
  ],
}

export default function Problem2171Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BagsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
