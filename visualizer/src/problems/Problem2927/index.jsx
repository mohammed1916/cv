import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BandWindowView from './BandWindowView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a zero total.' },
    { id: 'window', label: 'Band', description: 'Find the second amounts that fit.' },
    { id: 'add', label: 'Add', description: 'Add the band size to the total.' },
    { id: 'done', label: 'Result', description: 'Report the number of splits.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and limit, e.g. {"n":5,"limit":2}',
  url: 'https://leetcode.com/problems/distribute-candies-among-children-iii/',
  complexity: 'O(min(n, limit)) time and O(1) space: one band per value of the first child. The visualization caps n and limit at 30.',
  examples: [
    { label: 'Tight limit', input: '{"n":5,"limit":2}' },
    { label: 'Loose limit', input: '{"n":3,"limit":3}' },
  ],
}

export default function DistributeCandiesAmongChildrenIII() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <BandWindowView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>For each first-child amount the valid second amounts form one contiguous range, so its size is a subtraction instead of a loop.</p>
    </>} />
}
