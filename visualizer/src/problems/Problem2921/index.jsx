import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FenwickTripletView from './FenwickTripletView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Ranks', description: 'Compress the prices to ranks.' },
    { id: 'sweep', label: 'Sweep', description: 'Start a left or right pass.' },
    { id: 'query', label: 'Query', description: 'Ask for the best profit on one side.' },
    { id: 'insert', label: 'Insert', description: 'Store this index in the tree.' },
    { id: 'query-right', label: 'Query right', description: 'Ask for the best profit with a larger price.' },
    { id: 'insert-right', label: 'Insert right', description: 'Store this index at its mirrored rank.' },
    { id: 'combine', label: 'Combine', description: 'Both partners exist for this middle index.' },
    { id: 'best', label: 'Best', description: 'This middle index gives the best total.' },
    { id: 'skip', label: 'Skip', description: 'No triplet uses this middle index.' },
    { id: 'done', label: 'Result', description: 'Report the best total or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with prices and profits lists, e.g. {"prices":[9,1,5,3,8,7],"profits":[2,6,4,7,1,5]}',
  url: 'https://leetcode.com/problems/maximum-profitable-triplets-with-increasing-prices-ii/',
  complexity: 'O(n log n) time and O(n) space with two Fenwick max trees over compressed prices. The visualization caps the list at 12 entries with values from -30 to 30; the official variant is larger.',
  examples: [
    { label: 'Interior peak', input: '{"prices":[9,1,5,3,8,7],"profits":[2,6,4,7,1,5]}' },
    { label: 'No increase', input: '{"prices":[6,6,6],"profits":[1,2,3]}' },
  ],
}

export default function MaximumProfitableTripletsII() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <FenwickTripletView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Each sweep replaces the nested scan with a prefix-maximum query over price ranks, so each index costs O(log n).</p>
    </>} />
}
