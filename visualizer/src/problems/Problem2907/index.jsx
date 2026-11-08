import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TripletScanView from './TripletScanView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No triplet has been found yet.' },
    { id: 'middle', label: 'Middle', description: 'Fix the middle index.' },
    { id: 'left', label: 'Left', description: 'Scan the indices before the middle.' },
    { id: 'right', label: 'Right', description: 'Scan the indices after the middle.' },
    { id: 'combine', label: 'Combine', description: 'Both partners exist; add their profits.' },
    { id: 'best', label: 'Best', description: 'This triplet beats the previous best.' },
    { id: 'skip', label: 'Skip', description: 'No triplet uses this middle index.' },
    { id: 'done', label: 'Result', description: 'Report the best total or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with prices and profits lists, e.g. {"prices":[2,5,3,6,4],"profits":[5,1,8,4,2]}',
  url: 'https://leetcode.com/problems/maximum-profitable-triplets-with-increasing-prices-i/',
  complexity: 'O(n^2) time and O(1) extra space: each middle index scans the left and right sides. The visualization caps the list at 8 entries with values from -30 to 30.',
  examples: [
    { label: 'Best middle', input: '{"prices":[2,5,3,6,4],"profits":[5,1,8,4,2]}' },
    { label: 'Decreasing', input: '{"prices":[4,3,2,1],"profits":[1,2,3,4]}' },
    { label: "Single price and profit", input: "{\"prices\":[1],\"profits\":[1]}" },
    { label: "Equal prices and profits", input: "{\"prices\":[2,2,2],\"profits\":[5,5,5]}" },
    { label: "Extreme values, 8 entries", input: "{\"prices\":[-30,30,-30,30,-30,30,-30,30],\"profits\":[30,-30,30,-30,30,-30,30,-30]}" },
    { label: "Long run: 8 entries", input: "{\"prices\":[-8,28,-14,-14,18,-17,-8,24],\"profits\":[-10,5,17,-1,-9,19,15,-3]}" },
  ],
}

export default function MaximumProfitableTripletsI() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <TripletScanView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Each middle index is tried once; the best partner on each side is the largest profit among the valid indices.</p>
    </>} />
}
