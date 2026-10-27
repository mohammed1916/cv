import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count', description: 'Count each barcode and order the counts in a max heap.' },
    { id: 'place', label: 'Place', description: 'Place the most frequent barcode that differs from the last one.' },
    { id: 'swap', label: 'Swap', description: 'The top barcode would repeat, so place the next one instead.' },
    { id: 'done', label: 'Complete', description: 'No two neighbours match.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"barcodes": [...]} with values 1 to 6',
  url: 'https://leetcode.com/problems/distant-barcodes/',
  complexity: 'O(n log k) time for n barcodes and k distinct values. The visualization caps input at 12 barcodes.',
  examples: [
    { label: 'Example 1', input: '{"barcodes":[1,1,1,2,2,2]}' },
    { label: 'Example 2', input: '{"barcodes":[1,1,1,1,2,2,3,3]}' },
  ],
}

export default function DistantBarcodes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Arrangement so far" length={step.result.length} valueAt={i => step.result[i]} active={step.result.length - 1} />
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>The most frequent barcode must be spread out first, so the heap always offers the largest remaining count.</p>
    <p>If the barcode on top equals the last one placed, the next most frequent barcode goes in its place and the top is put back.</p>
  </>} />
}
