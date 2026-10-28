import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty table', description: 'No digit sum has been seen yet.' },
    { id: 'scan', label: 'New digit sum', description: 'Store this number as the largest for its digit sum.' },
    { id: 'pair', label: 'Pair found', description: 'Pair this number with the largest earlier partner.' },
    { id: 'done', label: 'Answer', description: 'Report the best pair sum, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers as JSON: {"nums": [...]}',
  url: 'https://leetcode.com/problems/max-sum-of-a-pair-with-equal-sum-of-digits/',
  complexity: 'O(n * d) time for n numbers of at most d digits, and O(n) space. The visualization caps input at 20 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[18,43,36,13,7]}' },
    { label: 'Example 2', input: '{"nums":[10,12,19,14]}' },
  ],
}

export default function MaxDigitSumPair() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Best pair so far">{`Best pair so far: ${step.result === -1 ? 'none' : step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Two numbers can only pair when their digit sums match, so the table is keyed by digit sum.</p>
    <p>For each digit sum, only the largest number matters: any other partner with that sum gives a smaller pair.</p>
  </>} />
}
