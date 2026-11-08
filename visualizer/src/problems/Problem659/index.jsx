import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Counts', description: 'Count every value.' },
    { id: 'extend', label: 'Extend run', description: 'Append to a run that ends just before the value.' },
    { id: 'start-new', label: 'New run', description: 'Start a run that needs the next two values.' },
    { id: 'reject', label: 'Reject', description: 'The value fits no run.' },
    { id: 'done', label: 'Complete', description: 'Report whether every value was placed.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Sorted array nums (JSON)',
  url: 'https://leetcode.com/problems/split-array-into-consecutive-subsequences/',
  complexity: 'O(n) expected time with hash maps for counts and run tails.',
  examples: [
    { label: 'Two runs', input: '[1,2,3,3,4,5]' },
    { label: 'Extend', input: '[1,2,3,3,4,4,5,5]' },
    { label: 'Fails', input: '[1,2,3,4,4,5]' },
    { label: 'One value fails', input: '[1]' },
    { label: 'Repeated runs', input: '[1,1,2,2,3,3]' },
    { label: 'Extreme values', input: '[-10000,-9999,-9998,9998,9999,10000]' },
    { label: 'Long run: 300 values', input: '[1,3,4,4,4,6,6,7,8,9,9,9,10,11,11,11,12,12,13,13,13,14,14,14,15,16,16,17,17,18,18,18,19,20,20,21,22,22,23,23,24,25,25,26,27,27,28,28,29,29,30,32,33,33,33,34,36,37,37,38,38,38,40,41,43,43,44,44,45,45,45,46,46,46,47,47,47,48,48,48,49,50,50,51,51,53,53,54,54,54,56,56,57,58,59,59,60,60,61,63,63,64,65,65,65,66,66,66,67,67,67,68,69,69,69,71,72,73,74,74,75,75,76,76,76,77,78,78,78,79,79,80,80,81,81,81,82,82,82,83,83,83,84,84,85,86,86,87,87,87,88,88,88,89,89,90,90,92,92,94,94,95,95,96,96,97,97,99,99,99,100,100,101,101,101,102,102,103,104,105,105,105,106,106,107,107,108,108,108,109,111,112,112,113,113,114,115,116,117,117,117,118,120,120,120,121,121,122,122,123,123,123,124,124,124,125,125,127,127,127,128,128,129,130,131,131,131,132,132,133,133,133,135,135,135,136,137,137,138,139,139,141,141,141,142,142,143,143,144,144,144,145,145,146,147,148,149,149,150,150,152,152,152,153,153,153,154,154,154,155,155,155,156,157,157,158,158,158,159,160,160,160,161,162,162,163,163,164,164,164,165,165,166,166,167,167,167,168,168,168]' },
  ],
}

export default function ConsecutiveSubsequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted values" length={run.input.length} active={run.input.indexOf(step.value)} valueAt={i => run.input[i]} />
    <output aria-label="Runs">Run tails: {Object.entries(step.tails).filter(([, c]) => c > 0).map(([end, c]) => `…${end} ×${c}`).join(', ') || 'none'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Greedy choice:</strong> extending an existing run is always at least as good as starting a new one, because it keeps the values needed later.</p>
  </>} />
}
