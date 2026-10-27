import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort by remainder', description: 'Groups that fill whole batches are always happy; the rest are counted by remainder.' },
    { id: 'state', label: 'Remaining groups', description: 'Serve one group of some remainder from the current counts.' },
    { id: 'done', label: 'Complete', description: 'Report the happy groups.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Batches (JSON object with batchSize and groups as sizes)',
  url: 'https://leetcode.com/problems/maximum-number-of-groups-getting-fresh-donuts/',
  complexity: 'O(b^(b-1)) memoized states in the worst case for batch size b. The visualization caps batchSize at 4 and groups at 8.',
  examples: [
    { label: 'Six groups', input: '{"batchSize":3,"groups":[1,2,3,4,5,6]}' },
    { label: 'Eight groups', input: '{"batchSize":4,"groups":[1,3,2,5,2,2,1,6]}' },
  ],
}

export default function FreshDonuts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Remaining groups by remainder" length={step.cnt.length}
      valueAt={i => step.cnt[i]} roleAt={i => `remainder ${i}`} active={step.cur} />
    <output aria-label="Status">{`Donuts used in this batch: ${step.cur}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>A group is happy exactly when the donuts already handed out are a multiple of the batch size, so only remainders matter.</p>
    <p>Whichever group is served next determines the next leftover count; the search tries every remainder and remembers each state it has solved.</p>
  </>} />
}
